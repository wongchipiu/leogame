// 变身图鉴场景
import { Scene } from '../core/scene.js';
import { el } from '../core/utils.js';
import { audio } from '../core/audio.js';
import { ULTRAMEN, RARITY_INFO } from '../data/ultraman.js';
import { MenuScene } from './menu-scene.js';

export class CollectionScene extends Scene {
  mount() {
    const s = this.store.get();
    this.root.className = 'scene scene-collection';
    this.root.appendChild(el('h2', { class: 'page-title', text: '变身图鉴' }));
    this.root.appendChild(el('div', { class: 'col-summary', text: `已收集 ${s.collectedCards.length}/${ULTRAMEN.length} · 光能币 ${s.coins}` }));

    const grid = el('div', { class: 'collection-grid' });
    ULTRAMEN.forEach(u => {
      const owned = s.collectedCards.find(c => c.id === u.id);
      const r = RARITY_INFO[u.rarity];
      const card = el('div', { class: 'col-card ' + (owned ? '' : 'locked'), style: `--uc:${u.color};--ua:${u.accent}` });
      card.appendChild(el('div', { class: 'cc-rarity', text: r.name, style: `color:${r.color}` }));
      card.appendChild(el('div', { class: 'cc-name', text: owned ? u.name : '???' }));
      card.appendChild(el('div', { class: 'cc-form', text: owned ? u.form : '未解锁' }));
      if (owned) {
        card.appendChild(el('div', { class: 'cc-skill', text: '必杀：' + u.skill }));
        card.appendChild(el('div', { class: 'cc-stats' }, [
          miniStat('力', u.stats.power), miniStat('速', u.stats.speed), miniStat('防', u.stats.defense),
        ]));
        card.appendChild(el('div', { class: 'cc-count', text: '×' + owned.count }));
      } else {
        card.appendChild(el('div', { class: 'cc-lock', text: '🔒' }));
        card.appendChild(el('div', { class: 'cc-hint', text: u.unlockCondition }));
      }
      grid.appendChild(card);
    });
    this.root.appendChild(grid);
    this.root.appendChild(el('button', { class: 'btn btn-back', text: '◀ 返回', onclick: () => { audio.click(); this.go(MenuScene); } }));
  }
}

function miniStat(label, val) {
  return el('span', { class: 'mini-stat', text: `${label}${val}` });
}
