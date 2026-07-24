// 设置场景
import { Scene } from '../core/scene.js';
import { el } from '../core/utils.js';
import { audio } from '../core/audio.js';
import { MenuScene } from './menu-scene.js';

export class SettingsScene extends Scene {
  mount() {
    const s = this.store.get();
    this.root.className = 'scene scene-settings';
    this.root.appendChild(el('h2', { class: 'page-title', text: '设置' }));

    const toggle = (label, key) => {
      const row = el('div', { class: 'setting-row' }, [el('span', { text: label })]);
      const btn = el('button', { class: 'toggle ' + (s.settings[key] ? 'on' : 'off'), text: s.settings[key] ? '开' : '关' });
      btn.onclick = () => {
        s.settings[key] = !s.settings[key];
        this.store.save();
        btn.className = 'toggle ' + (s.settings[key] ? 'on' : 'off');
        btn.textContent = s.settings[key] ? '开' : '关';
        audio.setEnabled(s.settings.sound);
        audio.setMusicEnabled(s.settings.music);
        if (s.settings[key]) audio.click();
      };
      row.appendChild(btn);
      return row;
    };

    const list = el('div', { class: 'settings-list' });
    list.appendChild(toggle('音效', 'sound'));
    list.appendChild(toggle('背景音乐', 'music'));
    this.root.appendChild(list);

    this.root.appendChild(el('div', { class: 'about-box' }, [
      el('h3', { text: '关于' }),
      el('p', { text: '奥特曼：光之密室 v' + this.engine.version }),
      el('p', { text: '面向 7-10 岁儿童的密室逃脱解密游戏，融合数学与英语学习。' }),
      el('p', { class: 'tip', text: '玩法：选择密室 → 变身 → 解谜（答数学/英语题）→ Boss 战 → 回收光之能量。' }),
    ]));

    this.root.appendChild(el('button', { class: 'btn btn-danger', text: '⚠ 重置进度', onclick: () => {
      if (confirm('确定重置所有进度？此操作不可恢复！')) { this.store.reset(); audio.click(); this.go(MenuScene); }
    } }));
    this.root.appendChild(el('button', { class: 'btn btn-back', text: '◀ 返回', onclick: () => { audio.click(); this.go(MenuScene); } }));
  }
}
