// 家长报告场景
import { Scene } from '../core/scene.js';
import { el } from '../core/utils.js';
import { QUESTIONS } from '../data/questions.js';
import { audio } from '../core/audio.js';
import { MenuScene } from './menu-scene.js';
import { DAILY_GOAL, todayKey } from '../core/storage.js';

export class ReportScene extends Scene {
  mount() {
    const s = this.store.get();
    this.root.className = 'scene scene-report';
    this.root.appendChild(el('h2', { class: 'page-title', text: '家长报告' }));
    this.root.appendChild(el('div', { class: 'report-date', text: '截至 ' + new Date().toLocaleDateString('zh-CN') }));

    const st = s.stats;
    const mathTotal = st.mathCorrect + st.mathWrong;
    const engTotal = st.englishCorrect + st.englishWrong;
    const mathRate = mathTotal ? Math.round(st.mathCorrect / mathTotal * 100) : 0;
    const engRate = engTotal ? Math.round(st.englishCorrect / engTotal * 100) : 0;

    // 总览
    this.root.appendChild(el('div', { class: 'report-grid' }, [
      reportCard('数学', `${st.mathCorrect}/${mathTotal}`, mathRate + '%', '#3b82f6'),
      reportCard('英语', `${st.englishCorrect}/${engTotal}`, engRate + '%', '#10b981'),
      reportCard('光之等级', `Lv.${s.lightLevel}`, s.lightExp + '/'+(s.lightLevel*100)+' EXP', '#fbbf24'),
      reportCard('收集卡片', `${s.collectedCards.length}`, '张', '#a855f7'),
    ]));

    // 每日任务
    const tk = todayKey();
    const daily = st.dailyDone.date === tk ? st.dailyDone : { math: 0, english: 0 };
    this.root.appendChild(el('div', { class: 'report-section' }, [
      el('h3', { text: '今日任务' }),
      el('div', { class: 'daily-bars' }, [
        dailyBar('数学', daily.math, DAILY_GOAL.math),
        dailyBar('英语', daily.english, DAILY_GOAL.english),
      ]),
    ]));

    // 知识点掌握度
    s.topicStats = s.topicStats || {};
    const topicKeys = Object.keys(s.topicStats);
    if (topicKeys.length) {
      const weak = topicKeys
        .map(t => ({ topic: t, ...s.topicStats[t], rate: s.topicStats[t].total ? s.topicStats[t].correct / s.topicStats[t].total : 0 }))
        .sort((a, b) => a.rate - b.rate);
      const topicList = el('div', { class: 'report-section' }, [el('h3', { text: '知识点掌握度' })]);
      weak.forEach(t => {
        const q = QUESTIONS.find(x => x.topic === t.topic);
        const name = q ? q.topicName : t.topic;
        const color = t.rate >= 0.8 ? '#10b981' : t.rate >= 0.5 ? '#f59e0b' : '#ef4444';
        topicList.appendChild(el('div', { class: 'topic-row' }, [
          el('span', { class: 'topic-name', text: name }),
          el('div', { class: 'topic-bar' }, [el('div', { class: 'topic-fill', style: `width:${Math.round(t.rate * 100)}%;background:${color}` })]),
          el('span', { class: 'topic-rate', text: `${t.correct}/${t.total}`, style: `color:${color}` }),
        ]));
      });
      // 建议
      const weakest = weak[0];
      if (weakest && weakest.total >= 2) {
        const wq = QUESTIONS.find(x => x.topic === weakest.topic);
        topicList.appendChild(el('div', { class: 'tip-box', text: `💡 建议：${wq ? wq.topicName : weakest.topic} 掌握度较低（${Math.round(weakest.rate * 100)}%），可多练相关题目。` }));
      }
      this.root.appendChild(topicList);
    } else {
      this.root.appendChild(el('div', { class: 'report-section tip-box', text: '暂无学习数据，去玩一关看看吧！' }));
    }

    this.root.appendChild(el('button', { class: 'btn btn-back', text: '◀ 返回', onclick: () => { audio.click(); this.go(MenuScene); } }));
  }
}

function reportCard(label, val, sub, color) {
  return el('div', { class: 'report-card', style: `--c:${color}` }, [
    el('div', { class: 'rc-label', text: label }),
    el('div', { class: 'rc-val', text: val }),
    el('div', { class: 'rc-sub', text: sub }),
  ]);
}
function dailyBar(label, cur, goal) {
  const pct = Math.min(100, (cur / goal) * 100);
  return el('div', { class: 'daily-bar' }, [
    el('span', { class: 'db-label', text: `${label} ${cur}/${goal}` }),
    el('div', { class: 'db-track' }, [el('div', { class: 'db-fill', style: `width:${pct}%` })]),
  ]);
}
