// 主菜单场景
import { Scene } from '../core/scene.js';
import { el } from '../core/utils.js';
import { audio } from '../core/audio.js';
import { LevelSelectScene } from './level-select-scene.js';
import { CollectionScene } from './collection-scene.js';
import { SettingsScene } from './settings-scene.js';
import { ReportScene } from './report-scene.js';

export class MenuScene extends Scene {
  mount() {
    const s = this.store.get();
    this.root.className = 'scene scene-menu';
    this.root.appendChild(el('div', { class: 'logo' }, [
      el('h1', { class: 'title', text: '奥特曼' }),
      el('h2', { class: 'subtitle', text: '光之密室' }),
      el('div', { class: 'title-en', text: 'CHAMBER OF LIGHT' }),
    ]));

    const menu = el('div', { class: 'menu-buttons' });
    const mk = (text, sub, cls, onClick) => {
      const b = el('button', { class: 'btn btn-menu ' + cls, onclick: () => { audio.click(); onClick(); } });
      b.appendChild(el('div', { class: 'btn-main', text }));
      if (sub) b.appendChild(el('div', { class: 'btn-sub', text: sub }));
      menu.appendChild(b);
    };
    mk('开始游戏', `光之等级 Lv.${s.lightLevel}`, 'primary', () => this.go(LevelSelectScene));
    mk('变身图鉴', `${s.collectedCards.length} 张卡片`, '', () => this.go(CollectionScene));
    mk('家长报告', '查看学习情况', '', () => this.go(ReportScene));
    mk('设置', '音效·关于', '', () => this.go(SettingsScene));

    this.root.appendChild(menu);
    this.root.appendChild(el('div', { class: 'version-tag', text: 'v1.0' }));

    // 装饰光球
    this.root.appendChild(el('div', { class: 'light-orb orb1' }));
    this.root.appendChild(el('div', { class: 'light-orb orb2' }));
  }
  render(ctx) {
    // 菜单底部光晕
    const w = this.engine.canvas.width, h = this.engine.canvas.height;
    const g = ctx.createRadialGradient(w / 2, h, 0, w / 2, h, h * 0.6);
    g.addColorStop(0, 'rgba(99,179,237,0.25)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
}
