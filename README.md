# 奥特曼：光之密室 (Ultraman: Chamber of Light)

面向 7-10 岁儿童的密室逃脱解密游戏，把数学、英语、语文、科学问题融入奥特曼变身、解谜、Boss 战的玩法循环中，让孩子在玩中学习。

## 运行

```bash
npm start
# 或 node server.js
```

浏览器打开 http://localhost:3000

## 核心玩法

```
主菜单 → 选关 → 变身仪式 → 密室解谜(6题+故事剧情) → Boss战 → 星级结算 → 知识回顾
```

- 每关 6 道密室题 + 1 道 Boss 题，每题前后有分段剧情对话
- 答对充能、答错不惩罚（可看提示再答），保护信心
- BKT 自适应难度，按掌握度动态推荐难度

## 内容规模

| 内容 | 数量 |
|------|------|
| 密室关卡 | 8 座（数/形/律/语/终焉/凤凰/文心/穹苍） |
| 奥特曼 | 8 位（迪迦/赛罗/欧布/泽塔/泰罗/梦比优斯/杰克/艾克斯） |
| 内置题库 | 240+ 题（数学64+英语72+语文54+科学50） |
| UGC 题库 | 无限（家长/老师可创建） |
| 成就 | 16 项 |
| 机关类型 | 10 种 |

## 功能特性

### 教育核心
- **4 学科**：数学（运算/几何/代数/规律）、英语（词汇/句型/语法/指令）、语文（成语/古诗/近反义词/错别字）、科学（生物/天文/物理/地球/生活）
- **自适应难度**：贝叶斯知识追踪（BKT），按每个知识点的掌握概率动态选题
- **知识回顾**：结算页展示答错题目与解析，方便家长辅导
- **家长报告**：学习统计、知识点掌握度、每日任务、连续打卡

### 游戏化
- **变身仪式**：三段式变身动画 + 奥特曼卡片展示
- **分段故事**：每关 7 段递进式剧情，配合奥特曼立绘对话
- **8 种机关**：能量锁/光线折射/变身卡合成/星座连线/翻译石碑/召唤咒语/能量配平/文字锁/科学实验
- **Boss 战**：答对必杀题释放光线，3 次机会
- **变身卡图鉴**：收集掉落、稀有度分级（N/R/SR/SSR）
- **成就系统**：16 项成就 + 结算时全屏展示

### 视听
- **原创 SVG 头像**：每位奥特曼差异化头冠（水晶/头镖/双角/菱形/宝石）、发光眼睛、脉冲计时器
- **首页背景图**：全屏背景 + Ken Burns 缓慢缩放 + 渐变遮罩
- **循环背景音乐**：4 场景 BGM（菜单/密室/Boss/结算），WebAudio 合成
- **粒子特效**：变身光爆、答题反馈、过关庆祝

### 多人 & UGC
- **双人对战**：本地两人轮流答题 PK，各选奥特曼
- **UGC 题库**：家长/老师创建题目（4 学科/知识点/难度/题型），自动混入密室与对战

## 项目结构

```
game/
├── index.html              # 入口 HTML
├── server.js                # 静态文件服务器
├── package.json
├── assets/css/style.css     # 全局样式
└── src/
    ├── main.js              # 应用入口
    ├── frontpage.jpeg       # 首页背景图
    ├── core/
    │   ├── engine.js        # 游戏引擎（主循环/场景栈/粒子）
    │   ├── scene.js         # 场景基类
    │   ├── particle.js      # 粒子系统
    │   ├── audio.js         # 音效 + 循环BGM
    │   ├── avatar.js        # 奥特曼 SVG 头像生成器
    │   ├── adaptive.js      # BKT 自适应难度
    │   ├── storage.js       # localStorage 存档
    │   └── utils.js         # 工具函数
    ├── data/
    │   ├── ultraman.js      # 8 位奥特曼数据
    │   ├── levels.js        # 8 座密室 + 机关 + 故事
    │   ├── questions.js     # 题库聚合 + 选题
    │   ├── questions-math.js     # 数学 64 题
    │   ├── questions-english.js  # 英语 72 题
    │   ├── questions-chinese.js   # 语文 54 题
    │   ├── questions-science.js   # 科学 50 题
    │   └── achievements.js  # 16 项成就
    ├── scenes/
    │   ├── menu-scene.js          # 主菜单
    │   ├── level-select-scene.js  # 选关
    │   ├── transform-scene.js     # 变身仪式
    │   ├── chamber-scene.js       # 密室解谜 + 故事
    │   ├── battle-scene.js        # Boss 战
    │   ├── result-scene.js        # 结算 + 知识回顾
    │   ├── collection-scene.js    # 变身图鉴 + 成就墙
    │   ├── report-scene.js        # 家长报告
    │   ├── multiplayer-scene.js   # 双人对战
    │   ├── ugc-scene.js           # UGC 出题
    │   └── settings-scene.js      # 设置
    └── ui/
        └── question-view.js       # 题目渲染组件
```

## 技术栈

- 纯原生 JS（ES Modules），无框架依赖
- Canvas 2D 粒子渲染
- WebAudio API 音效合成（无外部音频文件）
- SVG 矢量头像（纯代码生成）
- localStorage 本地存档
- Node.js 原生 http 静态服务器

## 版本历史

| 版本 | Commit | 内容 |
|------|--------|------|
| V1.0 | `948fa27` | 核心引擎 + 2密室 + 6奥特曼 + 136题库 + 完整玩法循环 |
| V1.5 | `fbb0d12` | 完整5密室 + BKT自适应难度 + 12项成就 + 连续打卡 |
| V2.0 | `f1b52ed` | 语文/科学密室 + 104题 + 杰克/艾克斯 |
| V2.5 | `7d99ffd` | 双人对战 PK |
| V3.0 | `8bc2288` | UGC 题库系统 |
| feat | `803de22` | 原创 SVG 奥特曼头像 |
| feat | `ac0b2b3` | 6题/关 + 分段故事 + 循环BGM |
| feat | `19fd7b0` | 首页背景图美化 |

## License

MIT
