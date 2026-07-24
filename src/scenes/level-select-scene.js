// 关卡选择场景
import { Scene } from '../core/scene.js';
import { el } from '../core/utils.js';
import { audio } from '../core/audio.js';
import { LEVELS, isLevelUnlocked, levelUltraman } from '../data/levels.js';
import { ULTRAMAN_MAP, RARITY_INFO } from '../data/ultraman.js';
import { TransformScene } from './transform-scene.js';
import { MenuScene } from './menu-scene.js';

export class LevelSelectScene extends Scene {
  mount() {
    const store = this.store.get();
    this.root.className = 'scene scene-level-select';
    this.root.appendChild(el('h2', { class: 'page-title', text: '选择密室' }));

    const grid = el('div', { class: 'level-grid' });
    LEVELS.forEach(level => {
      const u = ULTRAMAN_MAP[level.ultramanId];
      const unlocked = isLevelUnlocked(level, this.engine.version) || store.levelProgress[level.id];
      const completed = store.levelProgress[level.id]?.completed;
      const stars = store.levelProgress[level.id]?.stars || 0;
      const secret = level.secret && !completed;

      const card = el('div', {
        class: 'level-card ' + (unlocked ? '' : 'locked') + (completed ? ' done' : ''),
        style: `--uc:${u.color};--ua:${u.accent}`,
        onclick: () => {
          if (!unlocked) { audio.wrong(); return; }
          if (secret) { audio.wrong(); return; }
          audio.click();
          this.go(TransformScene, { level });
        },
      });

      const rarity = RARITY_INFO[u.rarity];
      card.appendChild(el('div', { class: 'lc-rarity', text: rarity.name, style: `color:${rarity.color}` }));
      card.appendChild(el('div', { class: 'lc-num', text: String(level.order).padStart(2, '0') }));
      card.appendChild(el('div', { class: 'lc-name', text: level.name }));
      card.appendChild(el('div', { class: 'lc-ultraman' }, [
        el('div', { class: 'lc-u-name', text: u.name, style: `color:${u.color}` }),
        el('div', { class: 'lc-u-form', text: u.form }),
      ]));
      card.appendChild(el('div', { class: 'lc-stars', html: '★'.repeat(stars) + '☆'.repeat(3 - stars) }));
      if (!unlocked) card.appendChild(el('div', { class: 'lc-lock', text: '🔒 ' + (level.secret ? '隐藏' : '待解锁') }));

      grid.appendChild(card);
    });
    this.root.appendChild(grid);

    this.root.appendChild(el('button', { class: 'btn btn-back', text: '◀ 返回', onclick: () => { audio.click(); this.go(MenuScene); } }));
  }
}
