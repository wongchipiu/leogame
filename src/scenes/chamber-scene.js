// 密室解谜场景：管理关卡内谜题序列 + 分段故事对话
import { Scene } from '../core/scene.js';
import { el, sleep } from '../core/utils.js';
import { audio } from '../core/audio.js';
import { pickQuestions } from '../data/questions.js';
import { MECHANISMS } from '../data/levels.js';
import { mountQuestion } from '../ui/question-view.js';
import { avatarSVG } from '../core/avatar.js';
import { BattleScene } from './battle-scene.js';
import { LevelSelectScene } from './level-select-scene.js';

export class ChamberScene extends Scene {
  mount(payload) {
    this.level = payload.level;
    this.ultraman = payload.ultraman;
    this.run = {
      level: this.level, ultraman: this.ultraman,
      chamberCorrect: 0, chamberTotal: 0, history: [], startTime: Date.now(),
    };
    this.buildPuzzles();
    this.index = 0;
    // 开场故事
    this.showStory();
  }

  buildPuzzles() {
    const level = this.level;
    const [minD, maxD] = level.diffRange;
    const adaptive = this.engine.adaptive;
    this.puzzles = [];
    const exclude = [];
    for (let i = 0; i < level.mechanisms.length; i++) {
      const mech = level.mechanisms[i];
      if (mech === 'boss') continue;
      let topic = null;
      if (level.topics.length) {
        topic = level.subject === 'mixed'
          ? adaptive.weakestTopic(level.topics)
          : level.topics[i % level.topics.length];
      }
      const recDiff = adaptive.recommendDiff(topic, minD, maxD);
      const picked = pickQuestions({
        subject: level.subject === 'mixed' ? null : level.subject,
        topics: level.topics.length ? level.topics : null,
        minDiff: Math.max(minD, recDiff - 1), maxDiff: Math.min(maxD, recDiff + 1),
        count: 1, exclude, extra: this.store.get().customQuestions,
      });
      if (!picked.length) continue;
      this.puzzles.push({ mechanism: mech, question: picked[0] });
      exclude.push(picked[0].id);
    }
  }

  // 显示当前阶段的故事对话，点击后进入题目
  showStory() {
    this.root.className = 'scene scene-chamber story-mode';
    this.root.style.setProperty('--uc', this.ultraman.color);
    this.root.innerHTML = '';

    const steps = this.level.storySteps || [];
    const step = steps[this.index] || '';

    // HUD
    const hud = el('div', { class: 'chamber-hud' }, [
      el('button', { class: 'btn-icon', text: '◀', title: '退出', onclick: () => {
        if (confirm('退出本关？进度不会保存。')) { audio.click(); this.go(LevelSelectScene); }
      } }),
      el('div', { class: 'chamber-title', text: this.level.name }),
      el('div', { class: 'chamber-progress', text: `${this.index + 1}/${this.puzzles.length}` }),
    ]);
    this.root.appendChild(hud);

    // 奥特曼立绘 + 对话气泡
    const storyWrap = el('div', { class: 'story-wrap' });
    storyWrap.appendChild(el('div', { class: 'story-avatar', html: avatarSVG(this.ultraman, { size: 130 }) }));
    const bubble = el('div', { class: 'story-bubble' });
    bubble.appendChild(el('p', { class: 'story-text', text: step }));
    storyWrap.appendChild(bubble);
    this.root.appendChild(storyWrap);

    // 继续按钮
    const isBoss = this.index >= this.puzzles.length;
    const cont = el('button', { class: 'btn btn-go story-continue', text: isBoss ? '迎战 Boss ▶' : '继续探索 ▶', onclick: () => {
      audio.click();
      if (isBoss) this.goBattle();
      else this.renderPuzzle();
    }});
    this.root.appendChild(cont);

    // 入场动画
    requestAnimationFrame(() => storyWrap.classList.add('show'));
  }

  // 渲染当前题目
  renderPuzzle() {
    this.root.className = 'scene scene-chamber';
    this.root.style.setProperty('--uc', this.ultraman.color);
    this.root.innerHTML = '';

    const hud = el('div', { class: 'chamber-hud' }, [
      el('button', { class: 'btn-icon', text: '◀', title: '退出', onclick: () => {
        if (confirm('退出本关？进度不会保存。')) { audio.click(); this.go(LevelSelectScene); }
      } }),
      el('div', { class: 'chamber-title', text: this.level.name }),
      el('div', { class: 'chamber-progress', text: `${this.index + 1}/${this.puzzles.length}` }),
    ]);
    this.root.appendChild(hud);

    this.root.appendChild(el('div', { class: 'chamber-banner' }, [
      el('span', { class: 'cb-ultraman', text: `${this.ultraman.name}·${this.ultraman.form}`, style: `color:${this.ultraman.color}` }),
    ]));

    const p = this.puzzles[this.index];
    const mech = MECHANISMS[p.mechanism];
    this.root.appendChild(el('div', { class: 'mechanism-banner' }, [
      el('span', { class: 'mech-icon', text: '🔐' }),
      el('span', { class: 'mech-name', text: mech.name }),
      el('span', { class: 'mech-desc', text: mech.desc }),
    ]));

    this.qBox = el('div', { class: 'question-box' });
    this.root.appendChild(this.qBox);
    this.mountQ();
  }

  mountQ() {
    const p = this.puzzles[this.index];
    this.qc = mountQuestion(this.qBox, p.question, {
      engine: this.engine,
      onAnswered: (correct) => {
        this.run.chamberTotal++;
        if (correct) this.run.chamberCorrect++;
        this.run.history.push({ id: p.question.id, correct, subject: p.question.subject, topic: p.question.topic, question: p.question.question, answer: p.question.answer, explain: p.question.explain, topicName: p.question.topicName });
        this.engine.adaptive.update(p.question.topic, correct);
      },
      onContinue: () => {
        this.index++;
        // 每答完一题，先显示下一段故事，再出题
        this.showStory();
      },
    });
  }

  goBattle() {
    audio.beam();
    this.engine.flash(this.ultraman.color, 40);
    audio.startMusic('battle');
    setTimeout(() => this.go(BattleScene, { run: this.run }), 600);
  }
}
