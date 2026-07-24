// 粒子系统：用于变身光效、答题反馈、背景星空
export class Particle {
  constructor(x, y, opts = {}) {
    this.x = x;
    this.y = y;
    const ang = opts.angle ?? Math.random() * Math.PI * 2;
    const spd = opts.speed ?? (Math.random() * 4 + 1);
    this.vx = Math.cos(ang) * spd;
    this.vy = Math.sin(ang) * spd;
    this.life = opts.life ?? 60;
    this.maxLife = this.life;
    this.size = opts.size ?? (Math.random() * 4 + 2);
    this.color = opts.color ?? '#fbbf24';
    this.gravity = opts.gravity ?? 0;
    this.shrink = opts.shrink ?? true;
    this.glow = opts.glow ?? true;
    this.shape = opts.shape ?? 'circle';
  }
  update(dt) {
    this.x += this.vx * (dt / 16);
    this.y += this.vy * (dt / 16);
    this.vy += this.gravity * (dt / 16);
    this.vx *= 0.98;
    this.vy *= 0.98;
    this.life -= dt / 16;
  }
  draw(ctx) {
    const a = Math.max(0, this.life / this.maxLife);
    const r = this.shrink ? this.size * a : this.size;
    ctx.save();
    ctx.globalAlpha = a;
    if (this.glow) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = this.color;
    }
    ctx.fillStyle = this.color;
    if (this.shape === 'star') {
      drawStar(ctx, this.x, this.y, r, 5);
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(0.1, r), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawStar(ctx, cx, cy, r, spikes) {
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const ang = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(ang) * rad;
    const y = cy + Math.sin(ang) * rad;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

// 星空背景粒子（常驻）
export class Star {
  constructor(w, h) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.r = Math.random() * 1.5 + 0.3;
    this.tw = Math.random() * Math.PI * 2;
    this.sp = Math.random() * 0.04 + 0.01;
  }
  update(dt) { this.tw += this.sp * (dt / 16); }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = 0.4 + Math.sin(this.tw) * 0.4;
    ctx.fillStyle = '#cfe8ff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
