// 结算场景：星级、奖励、解锁
import { Scene } from '../core/scene.js';
import { el, sleep } from '../core/utils.js';
import { audio } from '../core/audio.js';
import { ULTRAMAN_MAP, RARITY_INFO } from '../data/ultraman.js';
import { LEVELS, LEVEL_MAP } from '../data/levels.js';
import { todayKey } from '../core/storage.js';
import { checkAchievements } from '../data/achievements.js';
import { LevelSelectScene } from './level-select-scene.js';
import { MenuScene } from './menu-scene.js';

export class ResultScene extends Scene {
  mount(payload) {
    this.run = payload.run;
    this.win = payload.win;
    this.compute();
    this.applyRewards();
    this.render();
  }

  compute() {
    const total = this.run.history.length;
    const correct = this.run.history.filter(h => h.correct).length;
    this.correctCount = correct;
    this.totalCount = total;
    // 星级：正确率 + 胜利
    if (!this.win) this.stars = 0;
    else {
      const rate = correct / Math.max(1, total);
      this.stars = rate >= 0.9 ? 3 : rate >= 0.6 ? 2 : 1;
    }
  }

  applyRewards() {
    const s = this.store.get();
    const level = this.run.level;
    const prev = s.levelProgress[level.id] || { completed: false, stars: 0, bestScore: 0 };
    const isFirst = !prev.completed;
    const betterStars = Math.max(prev.stars || 0, this.stars);

    // 更新关卡进度
    s.levelProgress[level.id] = {
      completed: prev.completed || this.win,
      stars: betterStars,
      bestScore: Math.max(prev.bestScore || 0, this.correctCount),
    };

    // 奖励光能币（首通更高）
    const coinReward = this.win ? (isFirst ? level.rewardCoins : Math.floor(level.rewardCoins / 2)) : 0;
    this.coinReward = coinReward;
    s.coins += coinReward;

    // 光之经验
    const exp = this.correctCount * 10 + (this.win ? 30 : 5);
    s.lightExp += exp;
    while (s.lightExp >= s.lightLevel * 100) {
      s.lightExp -= s.lightLevel * 100;
      s.lightLevel++;
    }

    // 解锁奥特曼（首通解锁）
    this.unlockedUltraman = null;
    if (this.win && isFirst) {
      const uid = level.ultramanId;
      if (!s.unlockedUltramen.includes(uid)) {
        s.unlockedUltramen.push(uid);
        this.unlockedUltraman = ULTRAMAN_MAP[uid];
      }
    }

    // 掉落变身卡（随机）
    this.dropCard = null;
    if (this.win && Math.random() < 0.6) {
      this.dropCard = ULTRAMAN_MAP[level.ultramanId];
      const existing = s.collectedCards.find(c => c.id === this.dropCard.id);
      if (existing) existing.count++;
      else s.collectedCards.push({ id: this.dropCard.id, count: 1 });
    }

    // 更新学习统计
    this.run.history.forEach(h => {
      if (h.subject === 'math') { h.correct ? s.stats.mathCorrect++ : s.stats.mathWrong++; }
      else if (h.subject === 'english') { h.correct ? s.stats.englishCorrect++ : s.stats.englishWrong++; }
    });

    // 知识点掌握度统计
    s.topicStats = s.topicStats || {};
    this.run.history.forEach(h => {
      s.topicStats[h.topic] = s.topicStats[h.topic] || { correct: 0, total: 0 };
      s.topicStats[h.topic].total++;
      if (h.correct) s.topicStats[h.topic].correct++;
    });

    // 每日任务
    const tk = todayKey();
    if (s.stats.dailyDone.date !== tk) {
      s.stats.dailyDone = { date: tk, math: 0, english: 0 };
    }
    this.run.history.forEach(h => {
      if (h.correct) {
        if (h.subject === 'math') s.stats.dailyDone.math++;
        else if (h.subject === 'english') s.stats.dailyDone.english++;
      }
    });

    // 每日连续打卡：数学+英语各满3题
    const done = s.stats.dailyDone;
    if (done.math >= 3 && done.english >= 3) {
      s.stats.lastFullDailyDate = s.stats.lastFullDailyDate || null;
      if (s.stats.lastFullDailyDate !== tk) {
        const yd = new Date(); yd.setDate(yd.getDate() - 1);
        const yk = `${yd.getFullYear()}-${yd.getMonth() + 1}-${yd.getDate()}`;
        s.stats.dailyStreak = (s.stats.lastFullDailyDate === yk) ? (s.stats.dailyStreak || 0) + 1 : 1;
        s.stats.lastFullDailyDate = tk;
      }
    }

    // 成就检查
    this.newAchievements = checkAchievements(this.store);

    this.store.save();
  }

  async render() {
    this.root.className = 'scene scene-result';
    this.root.style.setProperty('--uc', this.run.ultraman.color);
    await sleep(300);

    const head = el('div', { class: 'result-head' });
    head.appendChild(el('h2', { class: 'result-title ' + (this.win ? 'win' : 'lose'), text: this.win ? '胜利！' : '再接再厉' }));
    head.appendChild(el('div', { class: 'result-sub', text: this.win ? '光之能量已回收！' : '黑暗暂时占上风，再来一次！' }));
    this.root.appendChild(head);

    // 星级
    const stars = el('div', { class: 'result-stars' });
    for (let i = 0; i < 3; i++) {
      const st = el('span', { class: 'star ' + (i < this.stars ? 'on' : '') });
      stars.appendChild(st);
      setTimeout(() => { if (i < this.stars) { audio.unlock(); this.engine.flash('#fbbf24', 20); } }, 400 + i * 300);
    }
    this.root.appendChild(stars);

    // 统计
    this.root.appendChild(el('div', { class: 'result-stats' }, [
      stat('答题', `${this.correctCount}/${this.totalCount}`),
      stat('光能币', `+${this.coinReward}`),
      stat('经验', `+${this.correctCount * 10 + (this.win ? 30 : 5)}`),
    ]));

    // 解锁展示
    if (this.unlockedUltraman) {
      const u = this.unlockedUltraman;
      const r = RARITY_INFO[u.rarity];
      this.root.appendChild(el('div', { class: 'unlock-banner' }, [
        el('div', { class: 'ub-label', text: '🎉 解锁奥特曼' }),
        el('div', { class: 'ub-name', text: `${u.name}·${u.form}`, style: `color:${r.color}` }),
      ]));
      audio.unlock();
    }
    if (this.dropCard) {
      const u = this.dropCard;
      this.root.appendChild(el('div', { class: 'drop-card', style: `--uc:${u.color}` }, [
        el('div', { text: '🃏 获得变身卡' }),
        el('div', { class: 'dc-name', text: u.name, style: `color:${u.color}` }),
      ]));
    }

    // 新成就展示
    if (this.newAchievements && this.newAchievements.length) {
      audio.unlock();
      const aBox = el('div', { class: 'ach-banners' });
      this.newAchievements.forEach(a => {
        aBox.appendChild(el('div', { class: 'ach-banner' }, [
          el('span', { class: 'ach-icon', text: a.icon }),
          el('div', { class: 'ach-info' }, [
            el('div', { class: 'ach-name', text: a.name }),
            el('div', { class: 'ach-desc', text: a.desc }),
          ]),
        ]));
      });
      this.root.appendChild(aBox);
    }

    // 按钮
    const btns = el('div', { class: 'result-buttons' });
    const nextLevel = this.nextLevel();
    if (this.win && nextLevel) {
      btns.appendChild(el('button', { class: 'btn btn-primary', text: '下一关 ▶', onclick: () => { audio.click(); this.go(LevelSelectScene); } }));
    } else if (this.win) {
      btns.appendChild(el('button', { class: 'btn btn-primary', text: '全部通关！', onclick: () => { audio.click(); this.go(MenuScene); } }));
    } else {
      btns.appendChild(el('button', { class: 'btn btn-primary', text: '再战', onclick: () => { audio.click(); this.go(LevelSelectScene); } }));
    }
    btns.appendChild(el('button', { class: 'btn', text: '返回菜单', onclick: () => { audio.click(); this.go(MenuScene); } }));
    this.root.appendChild(btns);
  }

  nextLevel() {
    const idx = LEVELS.findIndex(l => l.id === this.run.level.id);
    return LEVELS[idx + 1];
  }
}

function stat(label, val) {
  return el('div', { class: 'r-stat' }, [el('div', { class: 'r-stat-v', text: val }), el('div', { class: 'r-stat-l', text: label })]);
}
