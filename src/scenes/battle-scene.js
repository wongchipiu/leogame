// Boss 战场景
import { Scene } from '../core/scene.js';
import { el, sleep } from '../core/utils.js';
import { audio } from '../core/audio.js';
import { pickQuestions } from '../data/questions.js';
import { mountQuestion } from '../ui/question-view.js';
import { avatarSVG, monsterSVG } from '../core/avatar.js';
import { ResultScene } from './result-scene.js';

export class BattleScene extends Scene {
  mount(payload) {
    this.run = payload.run;
    this.level = this.run.level;
    this.ultraman = this.run.ultraman;
    this.attempts = 0;
    this.maxAttempts = 3;
    this.bossHp = 100;
    this.bossQuestion = this.pickBoss();
    this.render();
  }

  pickBoss() {
    const exclude = this.run.history.map(h => h.id);
    const picked = pickQuestions({
      subject: this.level.subject === 'mixed' ? null : this.level.subject,
      topics: this.level.topics.length ? this.level.topics : null,
      minDiff: this.level.bossDiff, maxDiff: 5, count: 1, exclude,
      extra: this.store.get().customQuestions,
      grade: this.store.get().grade,
    });
    return picked[0] || pickQuestions({ count: 1, exclude })[0] || pickQuestions({ count: 1 })[0];
  }

  render() {
    this.root.className = 'scene scene-battle';
    this.root.style.setProperty('--uc', this.ultraman.color);
    this.root.innerHTML = '';

    this.root.appendChild(el('div', { class: 'battle-stage' }, [
      el('div', { class: 'hero-side' }, [
        el('div', { class: 'hero-avatar', style: `--uc:${this.ultraman.color}`, html: avatarSVG(this.ultraman, { size: 100 }) }),
        el('div', { class: 'hero-skill', text: this.ultraman.skill }),
      ]),
      el('div', { class: 'vs', text: 'VS' }),
      el('div', { class: 'boss-side' }, [
        el('div', { class: 'boss-avatar', html: monsterSVG({ size: 100 }) }),
        el('div', { class: 'boss-hp-bar' }, [el('div', { class: 'boss-hp-fill', id: 'bossHpFill' })]),
      ]),
    ]));

    this.root.appendChild(el('h3', { class: 'boss-prompt', text: '答对必杀题，释放光线！' }));
    this.attemptsBox = el('div', { class: 'attempts', text: `剩余机会：${this.maxAttempts - this.attempts}` });
    this.root.appendChild(this.attemptsBox);

    this.qBox = el('div', { class: 'question-box' });
    this.root.appendChild(this.qBox);
    this.mountQ();
  }

  mountQ() {
    this.qc = mountQuestion(this.qBox, this.bossQuestion, {
      engine: this.engine,
      onAnswered: (correct) => {
        this.run.history.push({ id: this.bossQuestion.id, correct, subject: this.bossQuestion.subject, topic: this.bossQuestion.topic, boss: true, question: this.bossQuestion.question, answer: this.bossQuestion.answer, explain: this.bossQuestion.explain, topicName: this.bossQuestion.topicName });
        this.engine.adaptive.update(this.bossQuestion.topic, correct);
        if (correct) {
          this.bossHp = 0;
          this.run.bossCorrect = (this.run.bossCorrect || 0) + 1;
          const fill = this.root.querySelector('#bossHpFill');
          if (fill) fill.style.width = '0%';
        }
      },
      onContinue: (correct) => {
        if (correct) this.victory();
        else {
          this.attempts++;
          this.bossHp = Math.max(20, this.bossHp - 30);
          const fill = this.root.querySelector('#bossHpFill');
          if (fill) fill.style.width = this.bossHp + '%';
          this.attemptsBox.textContent = `剩余机会：${this.maxAttempts - this.attempts}`;
          if (this.attempts >= this.maxAttempts) this.defeat();
          else {
            this.bossQuestion = this.pickBoss();
            this.qBox.innerHTML = '';
            this.mountQ();
          }
        }
      },
    });
  }

  async victory() {
    audio.beam();
    this.engine.flash('#ffffff', 120);
    this.root.querySelector('.hero-avatar')?.classList.add('beam');
    await sleep(1200);
    audio.win();
    this.go(ResultScene, { run: this.run, win: true });
  }

  async defeat() {
    audio.lose();
    await sleep(800);
    // 即使失败也进入结算（鼓励为主，低星）
    this.go(ResultScene, { run: this.run, win: false });
  }
}
