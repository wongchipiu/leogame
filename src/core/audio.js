// WebAudio 音效与背景音乐合成（无外部音频文件）
// 提供短音效（click/hover/correct/wrong/unlock/transform/beam/win/lose）
// 与循环背景音乐（menu/chamber/battle/result 四种场景）。
// 音效与音乐共享同一个 AudioContext 与 masterGain(0.25)，
// 音乐额外走独立 gain 节点(0.12) 以保证音量低于音效。
// 音乐用 setTimeout 递归调度实现循环，可随时切换/停止。

let ctx = null;
let masterGain = null;
let musicGain = null;
let enabled = true;        // 音效总开关
let musicEnabled = true;   // 音乐总开关（不影响音效）
let currentMusicType = null;
let musicTimerId = null;
let activeMusicOscillators = [];

// 各场景音乐配置：旋律(C大调频率) / 节奏 / 波形 / 循环间隔
const MUSIC_PROFILES = {
  menu: {
    melody: [262, 330, 392, 523, 440, 392, 330, 294],
    rhythm: 0.4,
    waves: ['triangle'],
    gap: 0.8,
  },
  chamber: {
    melody: [196, 220, 262, 294, 262, 220, 196, 165],
    rhythm: 0.35,
    waves: ['sine', 'triangle'],
    gap: 0.8,
  },
  battle: {
    melody: [330, 392, 494, 392, 330, 392, 494, 587],
    rhythm: 0.25,
    waves: ['square', 'sawtooth'],
    gap: 0.8,
  },
  result: {
    melody: [523, 659, 784, 1047, 784, 659, 523, 659],
    rhythm: 0.3,
    waves: ['triangle'],
    gap: 0.8,
  },
};

function ensure() {
  if (ctx) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  ctx = new AC();
  masterGain = ctx.createGain();
  masterGain.gain.value = 0.25;
  masterGain.connect(ctx.destination);
  musicGain = ctx.createGain();
  musicGain.gain.value = 0.12;
  musicGain.connect(masterGain);
}

// ---- 音效底层 ----

// 单音
function tone(freq, dur = 0.15, type = 'sine', vol = 1, when = 0) {
  if (!enabled) return;
  ensure();
  const t = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol * 0.5, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(g); g.connect(masterGain);
  osc.start(t); osc.stop(t + dur + 0.02);
}

// 滑音
function slide(f1, f2, dur = 0.3, type = 'sawtooth', vol = 0.6) {
  if (!enabled) return;
  ensure();
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(f1, t);
  osc.frequency.exponentialRampToValueAtTime(f2, t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol * 0.5, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(g); g.connect(masterGain);
  osc.start(t); osc.stop(t + dur + 0.02);
}

// 噪声爆破（光线/爆炸）
function noise(dur = 0.4, vol = 0.5) {
  if (!enabled) return;
  ensure();
  const t = ctx.currentTime;
  const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol * 0.5, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  const filt = ctx.createBiquadFilter();
  filt.type = 'bandpass'; filt.frequency.value = 1200; filt.Q.value = 1;
  src.connect(filt); filt.connect(g); g.connect(masterGain);
  src.start(t); src.stop(t + dur);
}

// ---- 背景音乐底层 ----

// 单个音乐音符（可叠加多波形），走 musicGain 以保持低音量
function musicTone(freq, dur, waves, when = 0, vol = 1) {
  if (!ctx || !musicGain) return;
  const t = ctx.currentTime + when;
  waves.forEach(wave => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol * 0.5, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g); g.connect(musicGain);
    osc.start(t); osc.stop(t + dur + 0.02);
    activeMusicOscillators.push(osc);
    osc.onended = () => {
      const idx = activeMusicOscillators.indexOf(osc);
      if (idx >= 0) activeMusicOscillators.splice(idx, 1);
    };
  });
}

// 调度一整段旋律并递归安排下一次循环
function scheduleMusic() {
  if (!currentMusicType || !musicEnabled || !ctx) return;
  const profile = MUSIC_PROFILES[currentMusicType];
  if (!profile) return;
  const { melody, rhythm, waves, gap } = profile;
  melody.forEach((f, i) => {
    musicTone(f, rhythm, waves, i * rhythm);
  });
  const loopDurationMs = (melody.length * rhythm + gap) * 1000;
  musicTimerId = setTimeout(scheduleMusic, loopDurationMs);
}

// 开始循环背景音乐（切换场景时可反复调用，会先停止当前音乐）
function startMusic(type) {
  // 切换场景：先停止当前音乐再启动新循环
  stopMusic();
  if (!musicEnabled) return;
  if (!MUSIC_PROFILES[type]) return;
  ensure();
  currentMusicType = type;
  scheduleMusic();
}

// 停止背景音乐并清理 setTimeout
function stopMusic() {
  if (musicTimerId) {
    clearTimeout(musicTimerId);
    musicTimerId = null;
  }
  currentMusicType = null;
  // 立即停止正在响起的音乐音符
  activeMusicOscillators.forEach(osc => {
    try { osc.stop(); } catch (e) { /* 已停止则忽略 */ }
  });
  activeMusicOscillators = [];
}

// 开关音乐（不影响音效）
function setMusicEnabled(v) {
  musicEnabled = v;
  if (!v) {
    stopMusic();
  }
}

export const audio = {
  setEnabled(v) { enabled = v; },
  resume() { ensure(); if (ctx.state === 'suspended') ctx.resume(); },
  // 音效集（实现保持不变）
  click() { tone(660, 0.06, 'square', 0.5); },
  hover() { tone(880, 0.03, 'sine', 0.3); },
  correct() {
    tone(523, 0.1, 'sine', 0.8, 0);
    tone(659, 0.1, 'sine', 0.8, 0.1);
    tone(784, 0.18, 'sine', 0.8, 0.2);
  },
  wrong() {
    tone(330, 0.12, 'sawtooth', 0.5, 0);
    tone(247, 0.18, 'sawtooth', 0.5, 0.12);
  },
  unlock() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.15, 'triangle', 0.8, i * 0.1));
  },
  transform() {
    slide(220, 880, 0.6, 'sawtooth', 0.6);
    setTimeout(() => noise(0.5, 0.3), 600);
  },
  beam() {
    slide(880, 220, 0.4, 'sawtooth', 0.7);
    noise(0.5, 0.5);
  },
  win() {
    [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.2, 'triangle', 0.9, i * 0.12));
  },
  lose() {
    [440, 392, 349, 294].forEach((f, i) => tone(f, 0.25, 'sine', 0.7, i * 0.15));
  },
  // 循环背景音乐
  startMusic,
  stopMusic,
  setMusicEnabled,
};
