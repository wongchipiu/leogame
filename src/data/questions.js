// 题库聚合：数学 + 英语，提供选题与自适应接口
import { MATH_QUESTIONS } from './questions-math.js';
import { ENGLISH_QUESTIONS } from './questions-english.js';
import { CHINESE_QUESTIONS } from './questions-chinese.js';
import { SCIENCE_QUESTIONS } from './questions-science.js';
import { shuffle } from '../core/utils.js';

export const QUESTIONS = [...MATH_QUESTIONS, ...ENGLISH_QUESTIONS, ...CHINESE_QUESTIONS, ...SCIENCE_QUESTIONS];
export const QUESTION_MAP = Object.fromEntries(QUESTIONS.map(q => [q.id, q]));

export const SUBJECTS = {
  math: { name: '数学', icon: '➗', color: '#3b82f6' },
  english: { name: '英语', icon: '🔤', color: '#10b981' },
  chinese: { name: '语文', icon: '📖', color: '#ef4444' },
  science: { name: '科学', icon: '🔬', color: '#8b5cf6' },
};

// 年级到难度范围映射（覆盖小学1-6年级）
export const GRADES = [
  { grade: 1, name: '一年级', minDiff: 1, maxDiff: 2, desc: '基础启蒙' },
  { grade: 2, name: '二年级', minDiff: 1, maxDiff: 3, desc: '巩固提升' },
  { grade: 3, name: '三年级', minDiff: 1, maxDiff: 4, desc: '课标核心' },
  { grade: 4, name: '四年级', minDiff: 2, maxDiff: 4, desc: '进阶拓展' },
  { grade: 5, name: '五年级', minDiff: 3, maxDiff: 5, desc: '挑战冲刺' },
  { grade: 6, name: '六年级', minDiff: 3, maxDiff: 5, desc: '小升初' },
];

export function gradeRange(grade) {
  const g = GRADES.find(g => g.grade === grade) || GRADES[2];
  return { minDiff: g.minDiff, maxDiff: g.maxDiff };
}

// 按条件选题
export function pickQuestions({
  subject = null, topic = null, topics = null,
  minDiff = 1, maxDiff = 5, count = 1, exclude = [], extra = [], grade = null,
} = {}) {
  // 年级覆盖难度范围
  if (grade) {
    const r = gradeRange(grade);
    minDiff = Math.max(minDiff, r.minDiff);
    maxDiff = Math.min(maxDiff, r.maxDiff);
  }
  const pool = [...QUESTIONS, ...extra].filter(q => {
    if (exclude.includes(q.id)) return false;
    if (subject && q.subject !== subject) return false;
    if (topic && q.topic !== topic) return false;
    if (topics && !topics.includes(q.topic)) return false;
    if (q.difficulty < minDiff || q.difficulty > maxDiff) return false;
    return true;
  });
  return shuffle(pool).slice(0, count);
}

// UGC 自定义题库合并查询（V3.0 用）
export function allQuestions(extra = []) {
  return [...QUESTIONS, ...extra];
}
