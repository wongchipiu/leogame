// 游戏引擎：主循环、场景栈、粒子、输入
import { Scene } from './scene.js';
import { Particle, Star } from './particle.js';
import { audio } from './audio.js';
import { storage } from './storage.js';
import { clamp } from './utils.js';

export class GameEngine {
  constructor(canvas, uiLayer) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.uiLayer = uiLayer;
    this.audio = audio;
    this.store = storage;
    this.scenes = [];
    this.particles = [];
    this.stars = [];
    this.last = 0;
    this.running = false;
    this.version = '1.0';
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.initStars();
  }
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  initStars() {
    this.stars = [];
    for (let i = 0; i < 80; i++) this.stars.push(new Star(this.canvas.width, this.canvas.height));
  }
  current() { return this.scenes[this.scenes.length - 1]; }

  async replace(SceneClass, payload) {
    if (this.current()) this.current().exit();
    this.scenes.pop();
    const s = new SceneClass(this);
    this.scenes.push(s);
    await s.enter(payload);
  }
  async push(SceneClass, payload) {
    if (this.current()) this.current().exit();
    const s = new SceneClass(this);
    this.scenes.push(s);
    await s.enter(payload);
  }
  async pop() {
    if (this.current()) this.current().exit();
    this.scenes.pop();
    const s = this.current();
    if (s) { s.root.classList.add('scene-in'); this.uiLayer.appendChild(s.root); }
  }

  burst(x, y, color, n = 24, opts = {}) {
    for (let i = 0; i < n; i++) {
      this.particles.push(new Particle(x, y, { color, ...opts, angle: (Math.PI * 2 * i) / n + Math.random() * 0.3 }));
    }
  }
  // 全屏光芒（变身用）
  flash(color = '#fbbf24', n = 80) {
    const cx = this.canvas.width / 2, cy = this.canvas.height / 2;
    for (let i = 0; i < n; i++) {
      this.particles.push(new Particle(cx, cy, {
        color, speed: Math.random() * 8 + 3, life: 90, size: Math.random() * 5 + 2,
      }));
    }
  }

  start() {
    this.running = true;
    this.last = performance.now();
    requestAnimationFrame(this.loop);
  }
  loop = (now) => {
    if (!this.running) return;
    const dt = Math.min(50, now - this.last);
    this.last = now;
    this.update(dt);
    this.render();
    requestAnimationFrame(this.loop);
  };
  update(dt) {
    this.current()?.update?.(dt);
    this.stars.forEach(s => s.update(dt));
    this.particles = this.particles.filter(p => { p.update(dt); return p.life > 0; });
  }
  render() {
    const ctx = this.ctx, w = this.canvas.width, h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);
    // 背景渐变
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#0a0e27');
    g.addColorStop(1, '#1a1a3e');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // 星空
    this.stars.forEach(s => s.draw(ctx));
    // 场景 canvas 层
    this.current()?.render?.(ctx);
    // 粒子
    this.particles.forEach(p => p.draw(ctx));
  }
}
