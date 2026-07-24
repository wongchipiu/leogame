// 题目渲染组件：被密室与 Boss 战复用
import { el } from '../core/utils.js';
import { audio } from '../core/audio.js';

export function mountQuestion(container, q, { onAnswered, onContinue, engine }) {
  container.innerHTML = '';
  const wrap = el('div', { class: 'question-view' });

  // 顶部：知识点 + 难度
  wrap.appendChild(el('div', { class: 'q-head' }, [
    el('span', { class: 'q-topic', text: q.topicName }),
    el('span', { class: 'q-diff', html: '★'.repeat(q.difficulty) }),
  ]));

  // 题干
  wrap.appendChild(el('div', { class: 'q-question', text: q.question }));

  const body = el('div', { class: 'q-body' });
  wrap.appendChild(body);

  let answered = false;
  const focusables = [];

  const submit = (value) => {
    if (answered) return;
    const correct = String(value).trim().toLowerCase() === String(q.answer).trim().toLowerCase();
    answered = true;
    wrap.querySelectorAll('button,input').forEach(b => { b.disabled = true; });
    if (correct) audio.correct(); else audio.wrong();

    const fb = el('div', { class: 'q-feedback ' + (correct ? 'correct' : 'wrong') });
    fb.appendChild(el('div', { text: correct ? '✅ 正确！光能充能成功！' : `❌ 答案是 ${q.answer}` }));
    fb.appendChild(el('div', { class: 'q-explain', text: '解析：' + q.explain }));
    const cont = el('button', { class: 'btn btn-continue', text: '继续 ▶', onclick: () => onContinue?.(correct) });
    fb.appendChild(cont);
    wrap.appendChild(fb);

    // 粒子反馈
    if (correct && engine) {
      const rect = wrap.getBoundingClientRect();
      engine.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, '#fbbf24', 30);
    }
    onAnswered?.(correct);
  };

  if (q.type === 'input') {
    const inp = el('input', { class: 'q-input', type: 'text', placeholder: '输入答案…', autocomplete: 'off' });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') submit(inp.value); });
    body.appendChild(inp);
    body.appendChild(el('button', { class: 'btn btn-submit', text: '确认', onclick: () => submit(inp.value) }));
    focusables.push(inp);
    setTimeout(() => inp.focus(), 100);
  } else {
    // choice / match，打乱选项顺序
    const opts = [...q.options].sort(() => Math.random() - 0.5);
    opts.forEach(opt => {
      body.appendChild(el('button', {
        class: 'btn q-option',
        text: opt,
        onclick: () => submit(opt),
      }));
    });
  }

  // 提示
  const hintWrap = el('div', { class: 'q-hint-wrap' });
  hintWrap.appendChild(el('button', {
    class: 'btn btn-hint', text: '💡 提示',
    onclick: () => {
      hintWrap.innerHTML = '';
      hintWrap.appendChild(el('div', { class: 'q-hint', text: '提示：' + q.hint }));
    },
  }));
  wrap.appendChild(hintWrap);

  container.appendChild(wrap);
  return { destroy() { wrap.remove(); } };
}
