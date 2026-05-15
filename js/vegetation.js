import * as THREE from 'three';
import { MODEL_ADJUST, state } from './config.js';
import { fitModelToGround } from './utils.js';

// ============ 植被总调度 ============
let glowSpriteTexture = null;
function getGlowTexture() {
    if (glowSpriteTexture) return glowSpriteTexture;
    const c = document.createElement('canvas');
    c.width = 64; c.height = 64;
    const ctx = c.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(180, 255, 180, 1)');
    gradient.addColorStop(0.2, 'rgba(100, 255, 100, 0.8)');
    gradient.addColorStop(0.5, 'rgba(50, 200, 50, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    glowSpriteTexture = new THREE.CanvasTexture(c);
    glowSpriteTexture.colorSpace = THREE.SRGBColorSpace;
    return glowSpriteTexture;
}

function createVegetation() {
    function addShrub(x, y, z) {
        const s = createShrub(); s.position.set(x, y, z); s.userData = { isShrub: true }; state.scene.add(s);
        const light = new THREE.PointLight(0x88FF88, 0, 3);
        light.position.set(x, y + 1, z);
        state.scene.add(light);
        state.shrubLights.push(light);
        // 光晕精灵
        const mat = new THREE.SpriteMaterial({ map: getGlowTexture(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 });
        const sprite = new THREE.Sprite(mat);
        sprite.position.set(x, y + 0.8, z);
        sprite.scale.set(1.5, 1.5, 1);
        state.scene.add(sprite);
        if (!state.shrubSprites) state.shrubSprites = [];
        state.shrubSprites.push(sprite);
    }
    // 西边河流 — 灌木丛
    for (let z = -36; z <= 28; z += 4) { addShrub(-38, -1, z); }
    // 东边河流 — 灌木丛
    for (let z = -36; z <= 28; z += 4) { addShrub(38, -1, z); }
    // 北边河流 — 灌木丛
    for (let x = -37; x <= 37; x += 4) { addShrub(x, -1, -38); }
    // 大门前 — 树
    for (let z = 38; z <= 45; z += 8) {
        const L = createTree(); L.position.set(-35, -1, z); L.userData = { isTree: true }; state.scene.add(L);
        const R = createTree(); R.position.set(35, -1, z); R.userData = { isTree: true }; state.scene.add(R);
    }
    // 园区内点缀 — 树
    [{x:-25,z:-25},{x:25,z:-25},{x:-25,z:25},{x:25,z:25},{x:-25,z:0},{x:25,z:0},{x:0,z:-25}].forEach(p => {
        const t = createTree(); t.position.set(p.x, -1, p.z); t.userData = { isTree: true }; state.scene.add(t);
    });
    // 花朵
    const fc = [0xFF69B4,0xFF6347,0xFFD700,0x9370DB,0x00CED1];
    for (let i=0; i<80; i++) {
        const x=(Math.random()-0.5)*60, z=(Math.random()-0.5)*60;
        if (x>-38&&x<38&&z<38&&z>-38) { const f=createFlower(fc[Math.floor(Math.random()*fc.length)]); f.position.set(x,0,z); state.scene.add(f); }
    }
}

// ============ 树 ============
function createTree() {
    const g = new THREE.Group();
    if (state.modelCache['tree']) {
        const c = state.modelCache['tree'].clone(true);
        fitModelToGround(c, MODEL_ADJUST['tree']);
        c.traverse(ch => {
            if (ch.isMesh) { ch.castShadow=true; ch.receiveShadow=true; }
            if (ch.material) {
                var mats = Array.isArray(ch.material) ? ch.material : [ch.material];
                mats.forEach(function(m) { m.needsUpdate = true; });
            }
        });
        g.add(c);
    } else {
        g.add(createTreeGeom());
    }
    return g;
}
function createTreeGeom() {
    const g=new THREE.Group();
    const t=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.5,3,8),new THREE.MeshLambertMaterial({color:0x8B4513}));t.position.y=1.5;t.castShadow=true;g.add(t);
    const c=new THREE.Mesh(new THREE.ConeGeometry(2,4,8),new THREE.MeshLambertMaterial({color:0x228B22}));c.position.y=4.5;c.castShadow=true;g.add(c);
    return g;
}

// ============ 灌木丛 ============
function createShrub() {
    const g = new THREE.Group();
    if (state.modelCache['shrub']) {
        const c = state.modelCache['shrub'].clone(true);
        fitModelToGround(c, MODEL_ADJUST['shrub']);
        c.traverse(ch => {
            if (ch.isMesh) { ch.castShadow=true; ch.receiveShadow=true; }
            if (ch.material) {
                var mats = Array.isArray(ch.material) ? ch.material : [ch.material];
                mats.forEach(function(m) { m.needsUpdate = true; });
            }
        });
        g.add(c);
    } else {
        const b1=new THREE.Mesh(new THREE.SphereGeometry(0.8,8,8),new THREE.MeshLambertMaterial({color:0x2E8B57}));b1.position.set(0,0.6,0);b1.castShadow=true;g.add(b1);
        const b2=new THREE.Mesh(new THREE.SphereGeometry(0.6,8,8),new THREE.MeshLambertMaterial({color:0x3CB371}));b2.position.set(0.5,0.4,0.3);b2.castShadow=true;g.add(b2);
        const b3=new THREE.Mesh(new THREE.SphereGeometry(0.6,8,8),new THREE.MeshLambertMaterial({color:0x228B22}));b3.position.set(-0.4,0.4,-0.2);b3.castShadow=true;g.add(b3);
    }
    return g;
}

// ============ 花 ============
function createFlower(color) {
    const g=new THREE.Group();
    const s=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,0.4,4),new THREE.MeshLambertMaterial({color:0x228B22}));s.position.y=0.2;g.add(s);
    const p=new THREE.Mesh(new THREE.SphereGeometry(0.15,8,8),new THREE.MeshLambertMaterial({color:color}));p.position.y=0.4;g.add(p);
    return g;
}

export { createVegetation };
