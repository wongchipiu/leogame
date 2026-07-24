// 应用入口
import { GameEngine } from './core/engine.js';
import { audio } from './core/audio.js';
import { MenuScene } from './scenes/menu-scene.js';

const canvas = document.getElementById('fx-canvas');
const uiLayer = document.getElementById('ui-layer');
const engine = new GameEngine(canvas, uiLayer);
window.__engine = engine;

// 首次交互激活音频（浏览器策略）
const activate = () => {
  audio.resume();
  audio.setEnabled(engine.store.get().settings.sound);
  if (engine.store.get().settings.music) audio.bgm();
  window.removeEventListener('pointerdown', activate);
};
window.addEventListener('pointerdown', activate);

engine.push(MenuScene).then(() => engine.start());
