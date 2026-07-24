// 自适应难度：贝叶斯知识追踪（BKT）简化版
// 维护每个知识点的掌握概率 p，答题后更新；选题时按 p 推荐难度
export class Adaptive {
  constructor(store) { this.store = store; }
  getState() {
    const s = this.store.get();
    if (!s.adaptive) { s.adaptive = {}; this.store.save(); }
    return s.adaptive;
  }
  mastery(topic) {
    if (!topic) return 0.5;
    return this.getState()[topic]?.p ?? 0.5;
  }
  // 答题后更新掌握度
  update(topic, correct) {
    if (!topic) return;
    const a = this.getState();
    const cur = a[topic] || { p: 0.5, attempts: 0 };
    const prior = cur.p;
    const pKnown = 0.9, pSlip = 0.1, pGuess = 0.25;
    let posterior;
    if (correct) {
      posterior = (pKnown * (1 - pSlip) * prior) /
        ((pKnown * (1 - pSlip) * prior) + (pGuess * (1 - prior)));
    } else {
      posterior = (pKnown * pSlip * prior) /
        ((pKnown * pSlip * prior) + ((1 - pGuess) * (1 - prior)));
    }
    posterior = Math.min(0.99, posterior + 0.03); // 学习增长
    cur.p = posterior;
    cur.attempts++;
    a[topic] = cur;
    this.store.save();
  }
  // 推荐难度
  recommendDiff(topic, minD, maxD) {
    const p = this.mastery(topic);
    const range = maxD - minD;
    const d = Math.round(minD + range * p);
    return Math.max(minD, Math.min(maxD, d));
  }
  // 选掌握度最低的 topic（用于综合关）
  weakestTopic(topics) {
    if (!topics || !topics.length) return null;
    return topics.reduce((min, t) => this.mastery(t) < this.mastery(min) ? t : min, topics[0]);
  }
}
