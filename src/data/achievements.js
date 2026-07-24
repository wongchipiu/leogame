// 成就系统
export const ACHIEVEMENTS = [
  { id: 'first_win', name: '初战告捷', desc: '首次通关密室', icon: '🎉' },
  { id: 'math_light', name: '数学之光', desc: '完成数之回廊', icon: '➗' },
  { id: 'lang_key', name: '语言之钥', desc: '完成语之剧场', icon: '🔤' },
  { id: 'shape_master', name: '形态之主', desc: '完成形之圣殿', icon: '📐' },
  { id: 'pattern_seer', name: '规律之眼', desc: '完成律之钟塔', icon: '⏰' },
  { id: 'final_guardian', name: '终极守护者', desc: '完成终焉之渊', icon: '🌌' },
  { id: 'collector3', name: '小收藏家', desc: '收集 3 张变身卡', icon: '🃏' },
  { id: 'collector6', name: '图鉴大师', desc: '收集全部 6 张变身卡', icon: '📖' },
  { id: 'perfect_star', name: '完美三星', desc: '获得一次 3 星评价', icon: '⭐' },
  { id: 'streak3', name: '连战连胜', desc: '连续 3 天完成每日任务', icon: '🔥' },
  { id: 'level5', name: '光之传说', desc: '光之等级达到 5', icon: '👑' },
  { id: 'all_clear', name: '光之国的英雄', desc: '通关全部密室', icon: '🌟' },
  { id: 'chinese_sage', name: '文字大师', desc: '完成文心书阁', icon: '📚' },
  { id: 'science_explorer', name: '科学探索者', desc: '完成穹苍之塔', icon: '🔭' },
];

const CHECK = {
  first_win: (s) => Object.values(s.levelProgress).some(l => l.completed),
  math_light: (s) => s.levelProgress['level_1']?.completed,
  lang_key: (s) => s.levelProgress['level_4']?.completed,
  shape_master: (s) => s.levelProgress['level_2']?.completed,
  pattern_seer: (s) => s.levelProgress['level_3']?.completed,
  final_guardian: (s) => s.levelProgress['level_5']?.completed,
  collector3: (s) => s.collectedCards.length >= 3,
  collector6: (s) => s.collectedCards.length >= 6,
  perfect_star: (s) => Object.values(s.levelProgress).some(l => l.stars >= 3),
  streak3: (s) => s.stats.dailyStreak >= 3,
  level5: (s) => s.lightLevel >= 5,
  all_clear: (s) => ['level_1','level_2','level_3','level_4','level_5','level_chinese','level_science'].every(id => s.levelProgress[id]?.completed),
  chinese_sage: (s) => s.levelProgress['level_chinese']?.completed,
  science_explorer: (s) => s.levelProgress['level_science']?.completed,
};

export function checkAchievements(store) {
  const s = store.get();
  const newly = [];
  ACHIEVEMENTS.forEach(a => {
    if (!s.achievements.includes(a.id) && CHECK[a.id]?.(s)) {
      s.achievements.push(a.id);
      newly.push(a);
    }
  });
  if (newly.length) store.save();
  return newly;
}
