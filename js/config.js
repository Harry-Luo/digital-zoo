// ============ 配置常量 ============

// 动物基本数据
const animalData = {
    lion:     { emoji: '🦁', color: 0xDAA520, pic: './pictures/非洲狮.png' },
    elephant: { emoji: '🐘', color: 0x808080, pic: './pictures/非洲象.jpg' },
    giraffe:  { emoji: '🦒', color: 0xFFD700, pic: './pictures/长颈鹿.png' },
    zebra:    { emoji: '🦓', color: 0xFFFFFF, pic: './pictures/斑马.jpg' },
    panda:    { emoji: '🐼', color: 0xFFFFFF, pic: './pictures/大熊猫.jpg' }
};

// GLB 模型文件路径
const GLB_FILE_MAP = {
    lion: './models/非洲狮.glb', elephant: './models/非洲象.glb', giraffe: './models/长颈鹿.glb',
    zebra: './models/斑马.glb', panda: './models/熊猫.glb', tree: './models/树.glb', shrub: './models/灌木丛.glb',
    security: './models/保安厅.glb', ticket: './models/售票厅.glb', lamp: './models/路灯.glb'
};

// 模型目标高度
const MODEL_ADJUST = {
    lion: 7.5, elephant: 9.0, giraffe: 11.0, zebra: 7.0, panda: 6.5,
    tree: 8.0, shrub: 2.5, security: 8.5, ticket: 9.0, lamp: 6.5
};

// 动物位置
const ANIMAL_POSITIONS = [
    { type: 'lion', x: -15, z: -15 }, { type: 'elephant', x: 15, z: -15 },
    { type: 'giraffe', x: -15, z: 15 }, { type: 'zebra', x: 15, z: 15 },
    { type: 'panda', x: 0, z: 0 }
];

// ============ 全局状态 ============
const state = {
    scene: null, camera: null, renderer: null, controls: null,
    animals: [],
    isDaytime: true, targetView: 'perspective',
    raycaster: null, mouse: null, hoveredAnimal: null,
    sky: null, ground: null, groundInner: null, river: null,
    sunLight: null, moonLight: null, ambientLight: null,
    modelCache: {},
    lastCamX: 0, lastCamZ: 0,
    lanternMeshes: [], lanternPointLights: [], animalLights: [],
    streetLights: [], shrubLights: [], shrubSprites: [], fenceLights: [],
    fireflySprites: [],
    butterflyGroup: null
};

export { animalData, GLB_FILE_MAP, MODEL_ADJUST, ANIMAL_POSITIONS, state };
