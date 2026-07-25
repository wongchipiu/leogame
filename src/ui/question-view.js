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
  let attempts = 0;
  const focusables = [];

  const submit = (value) => {
    if (answered) return;
    const correct = String(value).trim().toLowerCase() === String(q.answer).trim().toLowerCase();

    if (correct) {
      answered = true;
      wrap.querySelectorAll('button,input').forEach(b => { b.disabled = true; });
      audio.correct();
      showFeedback(true);
    } else {
      // 答错：不直接公布答案，给"再看提示重答"机会
      audio.wrong();
      attempts++;
      body.querySelectorAll('button, input').forEach(b => { b.disabled = false; });
      const retryBox = el('div', { class: 'q-retry' });
      retryBox.appendChild(el('div', { class: 'q-retry-msg', text: '❌ 不太对，再想想！' }));
      const retryBtn = el('button', { class: 'btn btn-hint', text: '💡 看提示，再答一次', onclick: () => {
        retryBox.remove();
        // 显示提示
        hintWrap.innerHTML = '';
        hintWrap.appendChild(el('div', { class: 'q-hint', text: '提示：' + q.hint }));
        // 重新启用输入/选项
        resetForRetry();
      }});
      const giveUpBtn = el('button', { class: 'btn btn-continue', text: '看答案 ▶', onclick: () => {
        retryBox.remove();
        answered = true;
        wrap.querySelectorAll('button,input').forEach(b => { b.disabled = true; });
        showFeedback(false);
        onAnswered?.(false);
      }});
      retryBox.appendChild(el('div', { class: 'q-retry-btns' }, [retryBtn, giveUpBtn]));
      wrap.appendChild(retryBox);
      // 禁用选项直到选择
      body.querySelectorAll('button, input').forEach(b => { b.disabled = true; });
    }
  };

  const showFeedback = (correct) => {
    const fb = el('div', { class: 'q-feedback ' + (correct ? 'correct' : 'wrong') });
    fb.appendChild(el('div', { text: correct ? '✅ 正确！光能充能成功！' : `❌ 答案是 ${q.answer}` }));
    fb.appendChild(el('div', { class: 'q-explain', text: '解析：' + q.explain }));
    const cont = el('button', { class: 'btn btn-continue', text: '继续 ▶', onclick: () => onContinue?.(correct) });
    fb.appendChild(cont);
    wrap.appendChild(fb);
    if (correct && engine) {
      const rect = wrap.getBoundingClientRect();
      engine.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, '#fbbf24', 30);
    }
    if (correct) onAnswered?.(true);
  };

  const resetForRetry = () => {
    if (q.type === 'input') {
      const inp = body.querySelector('.q-input');
      if (inp) { inp.disabled = false; inp.value = ''; inp.focus(); }
      const submitBtn = body.querySelector('.btn-submit');
      if (submitBtn) submitBtn.disabled = false;
    } else {
      // 重新打乱选项
      body.innerHTML = '';
      const opts = [...q.options].sort(() => Math.random() - 0.5);
      opts.forEach(opt => {
        body.appendChild(el('button', { class: 'btn q-option', text: opt, onclick: () => submit(opt) }));
      });
    }
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
