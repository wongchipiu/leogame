// 题库聚合：数学 + 英语，提供选题与自适应接口
import { MATH_QUESTIONS } from './questions-math.js';
import { ENGLISH_QUESTIONS } from './questions-english.js';
import { shuffle } from '../core/utils.js';

export const QUESTIONS = [...MATH_QUESTIONS, ...ENGLISH_QUESTIONS];
export const QUESTION_MAP = Object.fromEntries(QUESTIONS.map(q => [q.id, q]));

export const SUBJECTS = {
  math: { name: '数学', icon: '➗', color: '#3b82f6' },
  english: { name: '英语', icon: '🔤', color: '#10b981' },
  chinese: { name: '语文', icon: '📖', color: '#ef4444' },
  science: { name: '科学', icon: '🔬', color: '#8b5cf6' },
};

// 按条件选题
export function pickQuestions({
  subject = null, topic = null, topics = null,
  minDiff = 1, maxDiff = 5, count = 1, exclude = [],
} = {}) {
  const pool = QUESTIONS.filter(q => {
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
