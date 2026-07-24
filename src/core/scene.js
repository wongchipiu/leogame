// 场景基类：管理 DOM root 与生命周期
import { el } from './utils.js';

export class Scene {
  constructor(engine) {
    this.engine = engine;
    this.root = el('div', { class: 'scene' });
    this.payload = null;
  }
  get ui() { return this.engine.uiLayer; }
  get audio() { return this.engine.audio; }
  get store() { return this.engine.store; }

  async enter(payload) {
    this.payload = payload;
    this.mount(payload);
    this.ui.appendChild(this.root);
    // 入场动画
    requestAnimationFrame(() => this.root.classList.add('scene-in'));
  }
  exit() {
    this.root.classList.remove('scene-in');
    this.root.classList.add('scene-out');
    this.onExit?.();
    setTimeout(() => this.root.remove(), 300);
  }
  // 子类重写：构建 UI
  mount(_payload) {}
  // 子类重写：每帧更新
  update(_dt) {}
  // 子类重写：canvas 渲染
  render(_ctx) {}

  // 导航
  go(SceneClass, payload) { this.engine.replace(SceneClass, payload); }
  push(SceneClass, payload) { this.engine.push(SceneClass, payload); }
  back() { this.engine.pop(); }

  // 粒子辅助
  burst(x, y, color, n = 24, opts = {}) {
    this.engine.burst(x, y, color, n, opts);
  }
}
