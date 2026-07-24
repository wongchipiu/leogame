// 变身仪式场景
import { Scene } from '../core/scene.js';
import { el, sleep } from '../core/utils.js';
import { audio } from '../core/audio.js';
import { ULTRAMAN_MAP } from '../data/ultraman.js';
import { avatarSVG } from '../core/avatar.js';
import { ChamberScene } from './chamber-scene.js';
import { LevelSelectScene } from './level-select-scene.js';

export class TransformScene extends Scene {
  mount(payload) {
    const level = payload.level;
    const u = ULTRAMAN_MAP[level.ultramanId];
    this.level = level;
    this.u = u;
    this.root.className = 'scene scene-transform';
    this.root.style.setProperty('--uc', u.color);
    this.root.style.setProperty('--ua', u.accent);

    this.phase = el('div', { class: 'transform-phase', text: '0' });
    this.root.appendChild(this.phase);

    this.dialog = el('div', { class: 'transform-dialog' });
    this.root.appendChild(this.dialog);

    this.silhouette = el('div', { class: 'transform-silhouette' });
    this.root.appendChild(this.silhouette);

    this.runSequence();
  }

  async runSequence() {
    const { u, level } = this;
    await sleep(300);
    this.setDialog(level.story);
    await sleep(2200);
    this.setDialog('被选中的光之继承者，举起变身器——');
    await sleep(1600);
    this.phase.textContent = '变身！';
    this.silhouette.classList.add('charging');
    audio.transform();
    this.engine.flash(u.color, 60);
    await sleep(800);
    this.setDialog(u.transformLine);
    await sleep(900);
    this.silhouette.classList.add('transformed');
    this.engine.flash('#ffffff', 100);
    audio.unlock();
    await sleep(600);
    this.showCard();
  }

  showCard() {
    const { u } = this;
    this.dialog.innerHTML = '';
    const card = el('div', { class: 'ultraman-card show', style: `--uc:${u.color};--ua:${u.accent}` });
    card.appendChild(el('div', { class: 'uc-name', text: u.name }));
    card.appendChild(el('div', { class: 'uc-form', text: u.form }));
    card.appendChild(el('div', { class: 'uc-avatar', html: avatarSVG(u, { size: 140 }) }));
    card.appendChild(el('div', { class: 'uc-skill', text: '必杀：' + u.skill }));
    card.appendChild(el('div', { class: 'uc-stats' }, [
      statBar('力量', u.stats.power, u.color),
      statBar('速度', u.stats.speed, u.accent),
      statBar('防御', u.stats.defense, '#94a3b8'),
    ]));
    card.appendChild(el('div', { class: 'uc-desc', text: u.desc }));
    this.root.appendChild(card);

    const go = el('button', { class: 'btn btn-go', text: '进入密室 ▶', onclick: () => {
      audio.click();
      this.go(ChamberScene, { level: this.level, ultraman: this.u });
    }});
    this.root.appendChild(go);
  }

  setDialog(text) {
    this.dialog.innerHTML = '';
    this.dialog.appendChild(el('p', { text }));
  }

  render(ctx) {
    // 变身光柱
    if (this.phase?.textContent === '变身！') {
      const w = this.engine.canvas.width, h = this.engine.canvas.height;
      const g = ctx.createLinearGradient(w / 2, 0, w / 2, h);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(0.5, this.u.color + 'aa');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(w / 2 - 60, 0, 120, h);
    }
  }
}

function statBar(label, val, color) {
  return el('div', { class: 'stat-row' }, [
    el('span', { class: 'stat-label', text: label }),
    el('div', { class: 'stat-bar' }, [el('div', { class: 'stat-fill', style: `width:${val}%;background:${color}` })]),
    el('span', { class: 'stat-val', text: val }),
  ]);
}
