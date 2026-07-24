// 工具函数
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'text') node.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else node.setAttribute(k, v);
  }
  const kids = Array.isArray(children) ? children : [children];
  for (const c of kids) {
    if (c == null) continue;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return node;
}

export const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// 简单事件总线
export class EventBus {
  constructor() { this.map = new Map(); }
  on(evt, cb) { (this.map.get(evt) || this.map.set(evt, []).get(evt)).push(cb); return () => this.off(evt, cb); }
  off(evt, cb) { const arr = this.map.get(evt); if (arr) this.map.set(evt, arr.filter(c => c !== cb)); }
  emit(evt, payload) { (this.map.get(evt) || []).forEach(cb => cb(payload)); }
}

export const sleep = (ms) => new Promise(r => setTimeout(r, ms));
