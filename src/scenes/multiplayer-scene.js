// 双人对战场景：两位玩家轮流答题 PK
import { Scene } from '../core/scene.js';
import { el } from '../core/utils.js';
import { audio } from '../core/audio.js';
import { pickQuestions } from '../data/questions.js';
import { ULTRAMEN } from '../data/ultraman.js';
import { avatarSVG } from '../core/avatar.js';
import { mountQuestion } from '../ui/question-view.js';
import { MenuScene } from './menu-scene.js';

export class MultiplayerScene extends Scene {
  mount() {
    const s = this.store.get();
    this.available = ULTRAMEN.filter(u => s.unlockedUltramen.includes(u.id));
    if (this.available.length < 2) this.available = ULTRAMEN.slice(0, 2);
    this.p1 = { ultraman: null, score: 0 };
    this.p2 = { ultraman: null, score: 0 };
    this.selecting = 1;
    this.rounds = 5;
    this.phase = 'setup';
    this.renderSetup();
  }

  renderSetup() {
    this.root.className = 'scene scene-multiplayer';
    this.root.innerHTML = '';
    this.root.appendChild(el('h2', { class: 'page-title', text: '双人对战' }));
    this.root.appendChild(el('div', { class: 'mp-status', text: `玩家${this.selecting}：选择你的奥特曼` }));

    const picked = el('div', { class: 'mp-picked' });
    picked.appendChild(playerCard(this.p1, '玩家1'));
    picked.appendChild(el('div', { class: 'mp-vs', text: 'VS' }));
    picked.appendChild(playerCard(this.p2, '玩家2'));
    this.root.appendChild(picked);

    const grid = el('div', { class: 'mp-pick-grid' });
    this.available.forEach(u => {
      const card = el('div', { class: 'mp-pick-card', style: `--uc:${u.color}`, onclick: () => this.pick(u) });
      card.appendChild(el('div', { class: 'mpc-avatar', html: avatarSVG(u, { size: 70, glow: false }) }));
      card.appendChild(el('div', { class: 'mpc-name', text: u.name, style: `color:${u.color}` }));
      card.appendChild(el('div', { class: 'mpc-form', text: u.form }));
      grid.appendChild(card);
    });
    this.root.appendChild(grid);
    this.root.appendChild(el('button', { class: 'btn btn-back', text: '◀ 返回', onclick: () => { audio.click(); this.go(MenuScene); } }));
  }

  pick(u) {
    audio.click();
    audio.unlock();
    if (this.selecting === 1) {
      this.p1.ultraman = u; this.selecting = 2; this.renderSetup();
    } else {
      this.p2.ultraman = u;
      audio.beam();
      this.engine.flash(u.color, 40);
      setTimeout(() => this.startBattle(), 600);
    }
  }

  startBattle() {
    this.questions = pickQuestions({ minDiff: 2, maxDiff: 4, count: this.rounds * 2, extra: this.store.get().customQuestions, grade: this.store.get().grade });
    this.qIndex = 0;
    this.activePlayer = 1;
    this.phase = 'battle';
    this.renderBattle();
  }

  renderBattle() {
    this.root.className = 'scene scene-multiplayer battle';
    this.root.innerHTML = '';

    const bar = el('div', { class: 'mp-score-bar' });
    bar.appendChild(scoreBox(this.p1, this.activePlayer === 1, '玩家1'));
    bar.appendChild(el('div', { class: 'mp-round', text: `第 ${Math.floor(this.qIndex / 2) + 1}/${this.rounds} 轮` }));
    bar.appendChild(scoreBox(this.p2, this.activePlayer === 2, '玩家2'));
    this.root.appendChild(bar);

    this.root.appendChild(el('div', { class: 'mp-turn ' + (this.activePlayer === 1 ? 'p1' : 'p2'), text: `${this.activePlayer === 1 ? '玩家1' : '玩家2'} 的回合` }));

    this.qBox = el('div', { class: 'question-box' });
    this.root.appendChild(this.qBox);
    const q = this.questions[this.qIndex];
    mountQuestion(this.qBox, q, {
      engine: this.engine,
      onAnswered: (correct) => {
        if (correct) {
          if (this.activePlayer === 1) this.p1.score++; else this.p2.score++;
          this.engine.adaptive.update(q.topic, true);
        } else {
          this.engine.adaptive.update(q.topic, false);
        }
      },
      onContinue: () => {
        this.qIndex++;
        this.activePlayer = this.activePlayer === 1 ? 2 : 1;
        if (this.qIndex >= this.questions.length) this.finishBattle();
        else this.renderBattle();
      },
    });
  }

  finishBattle() {
    this.phase = 'result';
    const s = this.store.get();
    s.multiplayerStats = s.multiplayerStats || { wins: 0, plays: 0 };
    s.multiplayerStats.plays++;
    this.store.save();

    this.root.className = 'scene scene-multiplayer result';
    this.root.innerHTML = '';
    this.root.appendChild(el('h2', { class: 'page-title', text: '对战结束' }));

    let winnerText, winClass;
    if (this.p1.score > this.p2.score) { winnerText = '🏆 玩家1 胜利！'; winClass = 'p1'; }
    else if (this.p2.score > this.p1.score) { winnerText = '🏆 玩家2 胜利！'; winClass = 'p2'; }
    else { winnerText = '🤝 平局！'; winClass = 'draw'; }
    this.root.appendChild(el('div', { class: 'mp-result ' + winClass, text: winnerText }));

    const scoreRow = el('div', { class: 'mp-final-scores' });
    scoreRow.appendChild(finalScore(this.p1, '玩家1'));
    scoreRow.appendChild(finalScore(this.p2, '玩家2'));
    this.root.appendChild(scoreRow);

    audio.win();
    this.root.appendChild(el('button', { class: 'btn btn-primary', text: '再来一局', onclick: () => { audio.click(); this.mount(); } }));
    this.root.appendChild(el('button', { class: 'btn btn-back', text: '◀ 返回菜单', onclick: () => { audio.click(); this.go(MenuScene); } }));
  }
}

function playerCard(p, name) {
  if (p.ultraman) {
    return el('div', { class: 'mp-player picked', style: `--uc:${p.ultraman.color}` }, [
      el('div', { class: 'mpp-name', text: name }),
      el('div', { class: 'mpp-avatar', html: avatarSVG(p.ultraman, { size: 60, glow: false }) }),
      el('div', { class: 'mpp-u', text: p.ultraman.name, style: `color:${p.ultraman.color}` }),
      el('div', { class: 'mpp-form', text: p.ultraman.form }),
    ]);
  }
  return el('div', { class: 'mp-player empty' }, [el('div', { class: 'mpp-name', text: name }), el('div', { class: 'mpp-u', text: '待选择' })]);
}
function scoreBox(p, active, name) {
  return el('div', { class: 'mp-score ' + (active ? 'active' : ''), style: `--uc:${p.ultraman?.color || '#888'}` }, [
    el('div', { class: 'mps-name', text: name }),
    el('div', { class: 'mps-avatar', html: p.ultraman ? avatarSVG(p.ultraman, { size: 50, glow: false }) : '?' }),
    el('div', { class: 'mps-score', text: p.score }),
  ]);
}
function finalScore(p, name) {
  return el('div', { class: 'mp-final', style: `--uc:${p.ultraman?.color || '#888'}` }, [
    el('div', { class: 'mpf-name', text: name }),
    el('div', { class: 'mpf-avatar', html: p.ultraman ? avatarSVG(p.ultraman, { size: 60, glow: false }) : '?' }),
    el('div', { class: 'mpf-score', text: p.score + ' 分' }),
  ]);
}
