// 奥特曼原创卡通半身像 SVG 生成器
// 借鉴通用设计元素（流线头盔、发光眼、胸口计时器、红银花纹），按各角色配色与头冠特征差异化
// 规避官方图片版权：纯代码绘制原创形象

// 各角色头像特征配置
const AVATAR_CFG = {
  tiga_composite: { headType: 'crystal', eyeColor: '#fff7cc', pattern: 'v' },
  zero_miracle: { headType: 'slugger', eyeColor: '#ffe066', pattern: 'lines' },
  orb_spcz: { headType: 'gem', eyeColor: '#ffe066', pattern: 'o' },
  zeta_alpha: { headType: 'crystal', eyeColor: '#fff', pattern: 'armor' },
  taro_base: { headType: 'horns', eyeColor: '#ffe066', pattern: 'classic' },
  mebius_phoenix: { headType: 'diamond', eyeColor: '#ffe066', pattern: 'phoenix' },
  jack_brain: { headType: 'gem', eyeColor: '#a7f3d0', pattern: 'scroll' },
  x_cross: { headType: 'slugger', eyeColor: '#fff', pattern: 'circuit' },
};

const SILVER = '#d4d4d8';
const SILVER_DARK = '#a1a1aa';

// 生成奥特曼半身像 SVG
export function avatarSVG(u, { size = 120, glow = true } = {}) {
  const cfg = AVATAR_CFG[u.id] || { headType: 'simple', eyeColor: '#ffe066', pattern: 'classic' };
  const main = u.color;
  const accent = u.accent;
  const eye = cfg.eyeColor;
  const timer = '#3b82f6';
  const gid = 'g' + u.id.replace(/[^a-z0-9]/gi, '');

  return `<svg viewBox="0 0 120 140" width="${size}" height="${size * 140 / 120}" xmlns="http://www.w3.org/2000/svg" class="ultraman-svg">
  <defs>
    <radialGradient id="bg${gid}" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="${main}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${main}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="body${gid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${main}"/>
      <stop offset="100%" stop-color="${shade(main, -25)}"/>
    </linearGradient>
    <linearGradient id="silver${gid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${SILVER}"/>
      <stop offset="100%" stop-color="${SILVER_DARK}"/>
    </linearGradient>
    <radialGradient id="eye${gid}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fff"/>
      <stop offset="40%" stop-color="${eye}"/>
      <stop offset="100%" stop-color="${shade(eye, -30)}"/>
    </radialGradient>
    <radialGradient id="timer${gid}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#bff"/>
      <stop offset="60%" stop-color="${timer}"/>
      <stop offset="100%" stop-color="${shade(timer, -40)}"/>
    </radialGradient>
    ${glow ? `<filter id="glow${gid}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` : ''}
  </defs>

  <!-- 背景光晕 -->
  <circle cx="60" cy="56" r="54" fill="url(#bg${gid})"/>

  <!-- 肩膀 / 胸甲 -->
  <path d="M20 130 Q22 104 38 96 L48 92 L72 92 L82 96 Q98 104 100 130 Z" fill="url(#silver${gid})"/>
  <!-- 胸口主色花纹 -->
  ${bodyPattern(cfg.pattern, main, accent, gid)}

  <!-- 颈部 -->
  <rect x="52" y="84" width="16" height="12" fill="url(#silver${gid})"/>

  <!-- 头部主体（流线型头盔） -->
  <path d="M60 18 Q40 20 34 44 Q32 62 40 76 Q48 86 60 88 Q72 86 80 76 Q88 62 86 44 Q80 20 60 18 Z" fill="url(#body${gid})"/>
  <!-- 头部银色侧条 -->
  <path d="M34 44 Q32 62 40 76 Q44 80 48 82 L46 64 Q42 52 40 44 Z" fill="url(#silver${gid})" opacity="0.85"/>
  <path d="M86 44 Q88 62 80 76 Q76 80 72 82 L74 64 Q78 52 80 44 Z" fill="url(#silver${gid})" opacity="0.85"/>

  <!-- 头冠特征 -->
  ${headFeature(cfg.headType, main, accent, gid)}

  <!-- 眼睛（斜椭圆，发光） -->
  <g filter="${glow ? `url(#glow${gid})` : ''}">
    <ellipse cx="48" cy="54" rx="7" ry="4.5" fill="url(#eye${gid})" transform="rotate(-12 48 54)"/>
    <ellipse cx="72" cy="54" rx="7" ry="4.5" fill="url(#eye${gid})" transform="rotate(12 72 54)"/>
  </g>
  <!-- 嘴部微笑线 -->
  <path d="M54 70 Q60 74 66 70" stroke="${shade(main, -35)}" stroke-width="1.5" fill="none" stroke-linecap="round"/>

  <!-- 胸口彩色计时器 -->
  <g filter="${glow ? `url(#glow${gid})` : ''}">
    <circle cx="60" cy="108" r="7" fill="url(#timer${gid})" stroke="#fff" stroke-width="1.2"/>
    <circle cx="60" cy="108" r="7" fill="none" stroke="${timer}" stroke-width="1">
      <animate attributeName="r" values="7;9;7" dur="1.6s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.8;0.1;0.8" dur="1.6s" repeatCount="indefinite"/>
    </circle>
  </g>
</svg>`;
}

// 头冠特征
function headFeature(type, main, accent, gid) {
  switch (type) {
    case 'crystal': // 额头水晶（迪迦/泽塔）
      return `<path d="M60 16 L52 34 L60 38 L68 34 Z" fill="${accent}" opacity="0.9" stroke="#fff" stroke-width="0.5"/>
              <path d="M60 16 L56 28 L60 30 L64 28 Z" fill="#fff" opacity="0.6"/>`;
    case 'slugger': // 头镖/冰斧（赛罗/艾克斯）
      return `<path d="M60 14 L46 8 L44 22 Q52 18 60 20 Q68 18 76 22 L74 8 Z" fill="${accent}" opacity="0.95" stroke="#fff" stroke-width="0.5"/>
              <path d="M60 14 L60 22" stroke="#fff" stroke-width="0.8" opacity="0.7"/>`;
    case 'horns': // 双角（泰罗）
      return `<path d="M44 20 Q36 10 30 6 Q38 12 42 24 Z" fill="${accent}" opacity="0.9"/>
              <path d="M76 20 Q84 10 90 6 Q82 12 78 24 Z" fill="${accent}" opacity="0.9"/>`;
    case 'diamond': // 菱形头冠（梦比优斯）
      return `<path d="M60 14 L50 30 L60 36 L70 30 Z" fill="${accent}" opacity="0.9" stroke="#fff" stroke-width="0.5"/>`;
    case 'gem': // 圆形宝石（欧布/杰克）
      return `<circle cx="60" cy="26" r="6" fill="${accent}" opacity="0.9" stroke="#fff" stroke-width="0.5"/>
              <circle cx="58" cy="24" r="2" fill="#fff" opacity="0.7"/>`;
    default: // simple
      return `<path d="M60 16 L54 28 L60 30 L66 28 Z" fill="${accent}" opacity="0.8"/>`;
  }
}

// 胸口花纹
function bodyPattern(type, main, accent, gid) {
  switch (type) {
    case 'v': // V形（迪迦）
      return `<path d="M44 96 L60 114 L76 96 L70 96 L60 106 L50 96 Z" fill="${main}" opacity="0.9"/>
              <path d="M48 100 L60 110 L72 100" stroke="${accent}" stroke-width="1.5" fill="none" opacity="0.8"/>`;
    case 'lines': // 线条（赛罗）
      return `<path d="M44 96 L56 110 M76 96 L64 110" stroke="${main}" stroke-width="3" fill="none" opacity="0.9" stroke-linecap="round"/>
              <path d="M52 100 L60 106 L68 100" stroke="${accent}" stroke-width="1.5" fill="none" opacity="0.8"/>`;
    case 'o': // O形（欧布）
      return `<circle cx="60" cy="104" r="6" fill="none" stroke="${main}" stroke-width="2.5" opacity="0.9"/>`;
    case 'armor': // 装甲（泽塔）
      return `<path d="M42 98 L50 92 L70 92 L78 98 L74 108 L66 112 L54 112 L46 108 Z" fill="${main}" opacity="0.85"/>
              <path d="M52 98 L60 104 L68 98" stroke="${accent}" stroke-width="1.2" fill="none" opacity="0.8"/>`;
    case 'phoenix': // 凤凰（梦比优斯）
      return `<path d="M60 96 L52 108 L60 104 L68 108 Z" fill="${accent}" opacity="0.9"/>
              <path d="M48 100 L60 112 L72 100" stroke="${main}" stroke-width="2" fill="none" opacity="0.8"/>`;
    case 'scroll': // 卷轴（杰克·文心）
      return `<rect x="48" y="100" width="24" height="8" rx="2" fill="${main}" opacity="0.85"/>
              <line x1="52" y1="104" x2="68" y2="104" stroke="${accent}" stroke-width="1" opacity="0.8"/>`;
    case 'circuit': // 电路（艾克斯）
      return `<path d="M48 98 L56 104 L48 110 M72 98 L64 104 L72 110 M56 104 L64 104" stroke="${main}" stroke-width="1.8" fill="none" opacity="0.9"/>
              <circle cx="60" cy="104" r="2" fill="${accent}" opacity="0.9"/>`;
    default: // classic 经典红银
      return `<path d="M48 96 L60 112 L72 96" stroke="${main}" stroke-width="3" fill="none" opacity="0.9" stroke-linecap="round"/>`;
  }
}

// 颜色加深/变亮
function shade(hex, percent) {
  const h = hex.replace('#', '');
  const num = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  let r = (num >> 16) + percent;
  let g = ((num >> 8) & 0xff) + percent;
  let b = (num & 0xff) + percent;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

// 怪兽头像（Boss 用）
export function monsterSVG({ size = 120 } = {}) {
  return `<svg viewBox="0 0 120 140" width="${size}" height="${size * 140 / 120}" xmlns="http://www.w3.org/2000/svg" class="monster-svg">
  <defs>
    <radialGradient id="mbg" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#7c3aed" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#7c3aed" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="mbody" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4c1d95"/>
      <stop offset="100%" stop-color="#1f2937"/>
    </linearGradient>
    <radialGradient id="meye" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fff"/>
      <stop offset="40%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#7f1d1d"/>
    </radialGradient>
    <filter id="mglow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <circle cx="60" cy="56" r="54" fill="url(#mbg)"/>
  <!-- 肩膀 -->
  <path d="M18 130 Q20 100 36 94 L48 90 L72 90 L84 94 Q100 100 102 130 Z" fill="url(#mbody)"/>
  <!-- 角 -->
  <path d="M40 30 Q30 10 22 4 Q34 14 44 34 Z" fill="#6b21a8"/>
  <path d="M80 30 Q90 10 98 4 Q86 14 76 34 Z" fill="#6b21a8"/>
  <!-- 头部 -->
  <path d="M60 16 Q38 18 32 44 Q30 64 40 78 Q50 88 60 88 Q70 88 80 78 Q90 64 88 44 Q82 18 60 16 Z" fill="url(#mbody)"/>
  <!-- 眼睛（凶狠斜眼） -->
  <g filter="url(#mglow)">
    <path d="M42 52 L54 50 L52 58 L44 60 Z" fill="url(#meye)"/>
    <path d="M78 52 L66 50 L68 58 L76 60 Z" fill="url(#meye)"/>
  </g>
  <!-- 嘴/獠牙 -->
  <path d="M50 72 L56 80 L60 74 L64 80 L70 72" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <!-- 胸口暗核 -->
  <circle cx="60" cy="106" r="8" fill="#7c3aed" stroke="#ef4444" stroke-width="1.5" filter="url(#mglow)"/>
  <circle cx="60" cy="106" r="8" fill="none" stroke="#ef4444" stroke-width="1">
    <animate attributeName="r" values="8;11;8" dur="1.2s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.9;0.1;0.9" dur="1.2s" repeatCount="indefinite"/>
  </circle>
</svg>`;
}
