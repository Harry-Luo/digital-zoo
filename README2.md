# 🦁 动物园数字孪生交互系统

基于 Three.js 的浏览器端 3D 虚拟动物园，支持自由漫游、动物交互、昼夜天气切换。

## 项目概述

- **技术栈**：Three.js r179 + ES Modules + Web Speech API
- **运行方式**：纯前端，本地静态服务器打开即用，无网络依赖
- **场景规模**：5 种动物、11 个 GLB 模型、80 朵花、30+ 灌木、8 棵树、3 条河流

## 快速开始

```
# 用 VS Code Live Server 打开 index.html
# 或
npx serve E:/zoo
```

## 项目结构

```
zoo/
├── index.html              # 入口页面（HTML + CSS + import map）
├── js/
│   ├── main.js             # 入口 ZooApp 初始化与主循环
│   ├── config.js           # 动物数据、GLB 路径、缩放参数、全局状态
│   ├── language.js         # 中英文多语言字典与 UI 刷新
│   ├── utils.js            # GLB 加载、模型贴地、缓动、相机动画
│   ├── scene.js            # 天空、地面、河流、光照
│   ├── animals.js          # 动物创建（GLB 优先，几何体后备）
│   ├── vegetation.js       # 树、灌木丛、花
│   ├── weather.js          # 天气粒子（雨/雪）与云层
│   ├── effects.js          # 飞鸟、蝴蝶、萤火虫、花瓣、风吹草木
│   ├── interaction.js      # 视角、昼夜、鼠标、面板、语音、语言
│   └── minimap.js          # 小地图绘制与点击跳转
├── models/                 # 11 个 GLB 模型
├── pictures/               # 动物照片与门牌图片
└── three.js-r179/          # Three.js r179 本地库
```

## 系统架构

```
入口层    main.js ──▶ 初始化 + 60fps 渲染循环

配置层    config.js  ◀──▶  state 全局状态  ◀──▶  所有模块读写共享
工具层    utils.js   ──▶  模型加载 / 贴地缩放 / 相机动画

场景层    scene.js   ──▶  天空 地面 河流 光照
对象层    animals.js ──▶  动物创建  vegetation.js ──▶ 树 灌木 花

交互层    interaction.js ──▶ 视角 昼夜 鼠标 面板 语音 语言
          minimap.js    ──▶ 小地图 点击跳转

效果层    effects.js  ──▶ 飞鸟 蝴蝶 萤火虫 花瓣 风
          weather.js  ──▶ 雨 雪 云层
```



## 技术栈

| 技术 | 用途 |
|------|------|
| Three.js r179 | WebGL 3D 渲染引擎 |
| ES Modules | 模块化架构 |
| Import Map | 本地路径映射（无 CDN 依赖） |
| Web Speech API | 浏览器内置中文 TTS |
| Canvas 2D | 小地图绘制 |
| GLTFLoader | GLB 模型加载 |
| OrbitControls | 鼠标旋转/缩放/平移 |
| Raycaster | 鼠标拾取检测 |

## 运行环境

| 项目 | 要求 |
|------|------|
| 浏览器 | Chrome / Edge / Firefox（WebGL 2.0） |
| 服务 | 本地静态服务器 |
| 内存 | 建议 8 GB+ |
| 显卡 | 建议独立显卡 |
