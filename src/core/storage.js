// 本地存储封装：进度、图鉴、设置
const KEY = 'ultraman_col_v1';

const defaults = {
  lightLevel: 1,            // 光之等级
  lightExp: 0,              // 光之经验
  coins: 0,                 // 光能币
  unlockedUltramen: ['tiga_composite'], // 已解锁奥特曼
  collectedCards: [],        // 已收集变身卡 [{id, count}]
  achievements: [],          // 成就
  levelProgress: {},         // 关卡进度 {levelId: {completed, stars, bestScore}}
  stats: {                   // 学习统计
    mathCorrect: 0, mathWrong: 0,
    englishCorrect: 0, englishWrong: 0,
    totalPlayTime: 0,
    lastPlayDate: null,
    dailyStreak: 0,
    dailyDone: { date: null, math: 0, english: 0 },
  },
  settings: { sound: true, music: true },
  adaptive: {},              // 自适应掌握度 {topic: {p: 0.5, attempts: 0}}
  customQuestions: [],       // UGC题库 (V3.0)
  multiplayerStats: { wins: 0, plays: 0 }, // V2.5
};

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(defaults);
    return { ...structuredClone(defaults), ...JSON.parse(raw) };
  } catch {
    return structuredClone(defaults);
  }
}

export const storage = {
  get() { return state; },
  save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  },
  reset() { state = structuredClone(defaults); this.save(); },
  // 便捷更新
  update(patch) { state = { ...state, ...patch }; this.save(); return state; },
  // 更新嵌套对象
  updatePath(path, value) {
    const keys = path.split('.');
    let obj = state;
    for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
    obj[keys[keys.length - 1]] = value;
    this.save();
    return state;
  },
};

// 每日任务奖励：每日3数学+3英语
export const DAILY_GOAL = { math: 3, english: 3 };

export function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
