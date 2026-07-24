// UGC 出题场景：家长/老师创建自定义题目，自动加入密室与对战
import { Scene } from '../core/scene.js';
import { el } from '../core/utils.js';
import { audio } from '../core/audio.js';
import { SUBJECTS } from '../data/questions.js';
import { MenuScene } from './menu-scene.js';

const TOPICS = {
  math: ['addition', 'subtraction', 'multiplication', 'division', 'fractions', 'geometry', 'algebra', 'word_problem', 'pattern'],
  english: ['vocab_animals', 'vocab_colors', 'vocab_numbers', 'vocab_body', 'vocab_actions', 'vocab_directions', 'sentences', 'grammar_be', 'command'],
  chinese: ['idiom', 'poem', 'synonym', 'typo', 'collocation'],
  science: ['biology', 'astronomy', 'physics', 'earth', 'life'],
};
const TOPIC_NAMES = {
  addition: '加法', subtraction: '减法', multiplication: '乘法', division: '除法', fractions: '分数', geometry: '几何', algebra: '代数', word_problem: '应用题', pattern: '规律',
  vocab_animals: '动物', vocab_colors: '颜色', vocab_numbers: '数字', vocab_body: '身体', vocab_actions: '动作', vocab_directions: '方向', sentences: '句型', grammar_be: 'be动词', command: '指令',
  idiom: '成语', poem: '古诗', synonym: '近反义词', typo: '错别字', collocation: '词语搭配',
  biology: '生物', astronomy: '天文', physics: '物理', earth: '地球', life: '生活科学',
};

export class UGCScene extends Scene {
  mount() { this.renderList(); }

  renderList() {
    const s = this.store.get();
    this.root.className = 'scene scene-ugc';
    this.root.innerHTML = '';
    this.root.appendChild(el('h2', { class: 'page-title', text: '我的题库' }));
    this.root.appendChild(el('div', { class: 'ugc-sub', text: `已创建 ${s.customQuestions.length} 道题，将自动混入密室解谜与双人对战` }));
    this.root.appendChild(el('button', { class: 'btn btn-primary', text: '+ 创建新题', onclick: () => { audio.click(); this.renderForm(); } }));

    const list = el('div', { class: 'ugc-list' });
    if (!s.customQuestions.length) {
      list.appendChild(el('div', { class: 'ugc-empty', text: '还没有自定义题目，点击上方按钮为孩子出一道专属题吧！' }));
    } else {
      s.customQuestions.forEach((q, i) => {
        list.appendChild(el('div', { class: 'ugc-item' }, [
          el('div', { class: 'ugc-item-head' }, [
            el('span', { class: 'ugc-subj', text: SUBJECTS[q.subject]?.name || q.subject, style: `color:${SUBJECTS[q.subject]?.color || '#888'}` }),
            el('span', { class: 'ugc-diff', html: '★'.repeat(q.difficulty) }),
            el('span', { class: 'ugc-type-tag', text: q.type === 'choice' ? '选择' : '填空' }),
          ]),
          el('div', { class: 'ugc-q', text: q.question }),
          el('div', { class: 'ugc-ans', text: '答案：' + q.answer }),
          el('button', { class: 'btn btn-danger small', text: '删除', onclick: () => {
            s.customQuestions.splice(i, 1); this.store.save(); audio.wrong(); this.renderList();
          } }),
        ]));
      });
    }
    this.root.appendChild(list);
    this.root.appendChild(el('button', { class: 'btn btn-back', text: '◀ 返回', onclick: () => { audio.click(); this.go(MenuScene); } }));
  }

  renderForm() {
    this.f = {};
    this.root.innerHTML = '';
    this.root.appendChild(el('h2', { class: 'page-title', text: '创建题目' }));
    const form = el('div', { class: 'ugc-form' });

    // 学科
    const subjSel = el('select', {});
    Object.entries(SUBJECTS).forEach(([k, v]) => subjSel.appendChild(el('option', { value: k, text: v.name })));
    form.appendChild(field('学科', subjSel));
    this.f.subject = subjSel;

    // 知识点
    const topicSel = el('select', {});
    form.appendChild(field('知识点', topicSel));
    this.f.topic = topicSel;
    const updateTopics = () => {
      topicSel.innerHTML = '';
      (TOPICS[subjSel.value] || []).forEach(t => topicSel.appendChild(el('option', { value: t, text: TOPIC_NAMES[t] || t })));
    };
    subjSel.addEventListener('change', updateTopics);
    updateTopics();

    // 难度
    const diffSel = el('select', {});
    [1, 2, 3, 4, 5].forEach(d => diffSel.appendChild(el('option', { value: d, text: d + ' 星' })));
    form.appendChild(field('难度', diffSel));
    this.f.diff = diffSel;

    // 题型
    const typeSel = el('select', {});
    typeSel.appendChild(el('option', { value: 'choice', text: '选择题' }));
    typeSel.appendChild(el('option', { value: 'input', text: '填空题' }));
    form.appendChild(field('题型', typeSel));
    this.f.type = typeSel;

    // 题干
    const qInp = el('input', { placeholder: '输入题目，例如：7 × 8 = ?' });
    form.appendChild(field('题干', qInp));
    this.f.question = qInp;

    // 选项
    const optWrap = el('div', { class: 'ugc-options' });
    optWrap.appendChild(el('label', { text: '选项（选择题必填，答案需在其中）' }));
    const opts = [];
    for (let i = 0; i < 4; i++) {
      const o = el('input', { placeholder: '选项' + 'ABCD'[i] });
      opts.push(o); optWrap.appendChild(o);
    }
    form.appendChild(optWrap);
    this.f.opts = opts;
    this.f.optWrap = optWrap;
    typeSel.addEventListener('change', () => { optWrap.style.display = typeSel.value === 'choice' ? '' : 'none'; });

    // 答案
    const aInp = el('input', { placeholder: '正确答案' });
    form.appendChild(field('答案', aInp));
    this.f.answer = aInp;

    // 提示
    const hInp = el('input', { placeholder: '解题提示（选填）' });
    form.appendChild(field('提示', hInp));
    this.f.hint = hInp;

    // 解析
    const eInp = el('input', { placeholder: '答案解析（选填）' });
    form.appendChild(field('解析', eInp));
    this.f.explain = eInp;

    this.f.err = el('div', { class: 'ugc-err' });
    form.appendChild(this.f.err);

    const btns = el('div', { class: 'ugc-form-btns' });
    btns.appendChild(el('button', { class: 'btn btn-primary', text: '保存题目', onclick: () => this.save() }));
    btns.appendChild(el('button', { class: 'btn', text: '取消', onclick: () => { audio.click(); this.renderList(); } }));
    form.appendChild(btns);

    this.root.appendChild(form);
  }

  save() {
    const subject = this.f.subject.value;
    const topic = this.f.topic.value;
    const topicName = TOPIC_NAMES[topic] || topic;
    const difficulty = parseInt(this.f.diff.value);
    const type = this.f.type.value;
    const question = this.f.question.value.trim();
    const answer = this.f.answer.value.trim();
    const hint = this.f.hint.value.trim() || '再想一想';
    const explain = this.f.explain.value.trim() || '继续加油，你能行！';
    this.f.err.textContent = '';

    if (!question) { this.f.err.textContent = '请输入题干'; return; }
    if (!answer) { this.f.err.textContent = '请输入答案'; return; }

    let options;
    if (type === 'choice') {
      options = this.f.opts.map(o => o.value.trim()).filter(Boolean);
      if (options.length < 2) { this.f.err.textContent = '选择题至少填写 2 个选项'; return; }
      if (!options.includes(answer)) { this.f.err.textContent = '答案必须出现在选项中'; return; }
      while (options.length < 4) options.push('（干扰项）');
    }

    const q = { id: 'custom_' + Date.now(), subject, topic, topicName, difficulty, type, question, answer, hint, explain };
    if (type === 'choice') q.options = options;

    const s = this.store.get();
    s.customQuestions.push(q);
    this.store.save();
    audio.unlock();
    this.engine.flash('#10b981', 30);
    setTimeout(() => this.renderList(), 400);
  }
}

function field(label, input) {
  return el('div', { class: 'ugc-field' }, [el('label', { text: label }), input]);
}
