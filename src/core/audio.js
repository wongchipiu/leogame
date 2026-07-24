// WebAudio 音效合成（无外部音频文件）
let ctx = null;
let masterGain = null;
let enabled = true;

function ensure() {
  if (ctx) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  ctx = new AC();
  masterGain = ctx.createGain();
  masterGain.gain.value = 0.25;
  masterGain.connect(ctx.destination);
}

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

export const audio = {
  setEnabled(v) { enabled = v; },
  resume() { ensure(); if (ctx.state === 'suspended') ctx.resume(); },
  // 音效集
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
  bgm() {
    // 简单循环旋律
    ensure();
    const melody = [262, 330, 392, 523, 392, 330, 262, 196];
    melody.forEach((f, i) => tone(f, 0.3, 'triangle', 0.25, i * 0.35));
  },
};
