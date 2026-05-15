import * as THREE from 'three';
import { state } from './config.js';

// ============ 飞鸟 ============
let birdGroup;

function createBirds() {
    birdGroup = new THREE.Group();
    const darkColors = [0x3D2B1F, 0x4A3728, 0x5C4033, 0x2F3B3B, 0x3A3A3A, 0x4B3621, 0x2E2E2E, 0x3D3530, 0x333333, 0x42382C];

    for (let i = 0; i < 20; i++) {
        const color = darkColors[i % darkColors.length];
        const bird = new THREE.Group();
        const body = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.8, 4), new THREE.MeshStandardMaterial({ color: color, roughness: 0.4 }));
        body.rotation.x = Math.PI / 2; bird.add(body);
        const lw = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.25), new THREE.MeshStandardMaterial({ color: color, roughness: 0.4, side: THREE.DoubleSide }));
        lw.position.set(0.3, 0, 0); lw.rotation.y = Math.PI / 2; bird.add(lw);
        const rw = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.25), new THREE.MeshStandardMaterial({ color: color, roughness: 0.4, side: THREE.DoubleSide }));
        rw.position.set(-0.3, 0, 0); rw.rotation.y = Math.PI / 2; bird.add(rw);

        bird.position.set((Math.random() - 0.5) * 70, 22 + Math.random() * 20, (Math.random() - 0.5) * 70);
        bird.userData = {
            speed: 0.15 + Math.random() * 0.3,
            radius: 25 + Math.random() * 45,
            centerX: (Math.random() - 0.5) * 30,
            centerZ: (Math.random() - 0.5) * 30,
            offset: Math.random() * Math.PI * 2,
            heightBase: 22 + Math.random() * 15,
            flapSpeed: 6 + Math.random() * 3
        };
        bird.castShadow = false; bird.receiveShadow = false;
        birdGroup.add(bird);
    }
    state.scene.add(birdGroup);
}

function updateBirds() {
    if (!birdGroup) return;
    const t = Date.now() * 0.0004;
    birdGroup.children.forEach(b => {
        const u = b.userData;
        const angle = u.offset + t * u.speed * 3;
        b.position.x = u.centerX + Math.cos(angle) * u.radius;
        b.position.z = u.centerZ + Math.sin(angle) * u.radius * 0.7;
        b.position.y = u.heightBase + Math.sin(angle * 2.5) * 5;
        b.rotation.y = -angle + Math.PI / 2;
        b.children[0].rotation.z = Math.sin(t * u.flapSpeed + u.offset) * 0.4;
        b.children[1].rotation.x = Math.sin(t * u.flapSpeed * 4) * 0.8;
        b.children[2].rotation.x = -Math.sin(t * u.flapSpeed * 4) * 0.8;
    });
}

const flowerPositions = [];

// ============ 蝴蝶 ============
function createButterflies() {
    const butterflyGroup = new THREE.Group();
    try {
        state.scene.traverse(function(child) {
            if (child.isMesh && child.material && child.material.color) {
                const c = child.material.color.getHex();
                if (c === 0xFF69B4 || c === 0xFF6347 || c === 0xFFD700 || c === 0x9370DB || c === 0x00CED1) {
                    flowerPositions.push(child.getWorldPosition(new THREE.Vector3()));
                }
            }
        });
    } catch(e) {}
    if (flowerPositions.length === 0) {
        for (let i = 0; i < 20; i++) flowerPositions.push(new THREE.Vector3((Math.random()-0.5)*50, 0.3, (Math.random()-0.5)*50));
    }

    const wc = document.createElement('canvas'); wc.width=32; wc.height=32;
    const wctx = wc.getContext('2d');
    const wg = wctx.createRadialGradient(16,16,0,16,16,16);
    wg.addColorStop(0,'rgba(255,255,255,0.9)'); wg.addColorStop(0.5,'rgba(255,200,50,0.6)'); wg.addColorStop(1,'rgba(255,100,0,0)');
    wctx.fillStyle=wg; wctx.fillRect(0,0,32,32);
    const wingTex = new THREE.CanvasTexture(wc);
    wingTex.colorSpace = THREE.SRGBColorSpace;
    const colors = [0xFF6600, 0xFFCC00, 0xFF3366, 0x66CCFF, 0x9933FF];

    for (let i=0; i<20; i++) {
        const g = new THREE.Group();
        const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.05,0.15,4,8), new THREE.MeshLambertMaterial({color:0x333333}));
        body.rotation.x=Math.PI/2; g.add(body);
        const lw = new THREE.Sprite(new THREE.SpriteMaterial({map:wingTex, blending:THREE.AdditiveBlending, depthWrite:false, transparent:true, color:colors[i%5], opacity:0.8}));
        lw.position.set(0.15,0.05,0); lw.scale.set(0.4,0.3,1); g.add(lw);
        const rw = new THREE.Sprite(new THREE.SpriteMaterial({map:wingTex, blending:THREE.AdditiveBlending, depthWrite:false, transparent:true, color:colors[i%5], opacity:0.8}));
        rw.position.set(-0.15,0.05,0); rw.scale.set(0.4,0.3,1); g.add(rw);
        g.position.set((Math.random()-0.5)*50, 1+Math.random()*4, (Math.random()-0.5)*50);
        g.userData = { targetX:g.position.x, targetZ:g.position.z, targetY:g.position.y, phase:Math.random()*Math.PI*2, speed:0.3+Math.random()*0.5, restTimer:0 };
        g.castShadow=false; g.receiveShadow=false;
        butterflyGroup.add(g);
    }
    state.scene.add(butterflyGroup);
    if (!state.butterflyGroup) state.butterflyGroup = butterflyGroup;
}

function updateButterflies() {
    if (!state.butterflyGroup) return;
    const t = Date.now()*0.001;
    state.butterflyGroup.children.forEach(b => {
        const u = b.userData;
        const dx = u.targetX-b.position.x, dz = u.targetZ-b.position.z, dy = u.targetY-b.position.y;
        const dist = Math.sqrt(dx*dx+dz*dz+dy*dy);
        if (dist<0.3) {
            u.restTimer++;
            if (u.restTimer>60+Math.random()*120) {
                u.restTimer=0;
                if (flowerPositions.length>0 && Math.random()<0.6) {
                    const f = flowerPositions[Math.floor(Math.random()*flowerPositions.length)];
                    u.targetX = f.x+(Math.random()-0.5)*3; u.targetY = f.y+0.3+Math.random(); u.targetZ = f.z+(Math.random()-0.5)*3;
                } else { u.targetX=(Math.random()-0.5)*50; u.targetY=1+Math.random()*4; u.targetZ=(Math.random()-0.5)*50; }
            }
        } else { u.restTimer=0; b.position.x+=dx*0.02*u.speed; b.position.z+=dz*0.02*u.speed; b.position.y+=dy*0.02*u.speed; }
        b.rotation.y += Math.sin(t*5+u.phase)*0.05;
        if (b.children[1]) b.children[1].rotation.z = Math.sin(t*15+u.phase)*1.5;
        if (b.children[2]) b.children[2].rotation.z = -Math.sin(t*15+u.phase)*1.5;
    });
}

// ============ 风吹草木 ============
function updateWindSway() {
    const t = Date.now() * 0.001;
    state.scene.traverse(function(child) {
        if (child.userData && child.userData.isTree) {
            child.rotation.z = Math.sin(t * 1.5 + child.position.x * 0.3) * 0.02;
            child.rotation.x = Math.cos(t * 1.3 + child.position.z * 0.3) * 0.02;
        }
        if (child.userData && child.userData.isShrub) {
            child.rotation.z = Math.sin(t * 2 + child.position.x * 0.5) * 0.03;
        }
    });
}

// ============ 花瓣飘落 ============
let petalGroup;

function createPetals() {
    petalGroup = new THREE.Group();
    const colors = [0xFF9999, 0xFFCC99, 0xFFB6C1, 0xFFD700, 0xFFA07A];
    for (let i = 0; i < 50; i++) {
        const geo = new THREE.PlaneGeometry(0.15, 0.1);
        const mat = new THREE.MeshLambertMaterial({
            color: colors[Math.floor(Math.random() * colors.length)],
            side: THREE.DoubleSide, transparent: true, opacity: 0.8, depthWrite: false
        });
        const petal = new THREE.Mesh(geo, mat);
        petal.position.set((Math.random() - 0.5) * 60, 5 + Math.random() * 20, (Math.random() - 0.5) * 60);
        petal.userData = {
            fallSpeed: 0.01 + Math.random() * 0.03,
            swaySpeed: 0.5 + Math.random(),
            swayAmp: 0.3 + Math.random() * 0.5,
            phase: Math.random() * Math.PI * 2,
            maxY: petal.position.y,
            minY: 0.2
        };
        petal.receiveShadow = false;
        petal.castShadow = false;
        petalGroup.add(petal);
    }
    state.scene.add(petalGroup);
}

function updatePetals() {
    if (!petalGroup) return;
    const t = Date.now() * 0.001;
    petalGroup.children.forEach(p => {
        const u = p.userData;
        p.position.y -= u.fallSpeed;
        p.position.x += Math.sin(t * u.swaySpeed + u.phase) * u.swayAmp * 0.02;
        p.rotation.z += 0.01;
        p.rotation.x = Math.sin(t + u.phase) * 0.5;
        if (p.position.y < u.minY) {
            p.position.y = u.maxY;
            p.position.x = (Math.random() - 0.5) * 60;
            p.position.z = (Math.random() - 0.5) * 60;
        }
    });
}

// ============ 萤火虫 ============
let fireflyGroup;

function createFireflies() {
    fireflyGroup = new THREE.Group();
    const cc = document.createElement('canvas');
    cc.width = 32; cc.height = 32;
    const cx = cc.getContext('2d');
    const gx = cx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gx.addColorStop(0, 'rgba(255,255,150,1)');
    gx.addColorStop(0.3, 'rgba(200,255,50,0.6)');
    gx.addColorStop(1, 'rgba(0,0,0,0)');
    cx.fillStyle = gx;
    cx.fillRect(0, 0, 32, 32);
    const gt = new THREE.CanvasTexture(cc);
    gt.colorSpace = THREE.SRGBColorSpace;

    for (let i = 0; i < 40; i++) {
        const mat = new THREE.SpriteMaterial({
            map: gt, blending: THREE.AdditiveBlending,
            depthWrite: false, transparent: true, opacity: 0
        });
        const sp = new THREE.Sprite(mat);
        sp.position.set((Math.random() - 0.5) * 60, 0.5 + Math.random() * 3, (Math.random() - 0.5) * 60);
        sp.scale.set(0.6, 0.6, 1);
        sp.userData = {
            baseX: sp.position.x, baseZ: sp.position.z, baseY: sp.position.y,
            phase: Math.random() * Math.PI * 2, speed: 0.3 + Math.random() * 0.7
        };
        fireflyGroup.add(sp);
        if (!state.fireflySprites) state.fireflySprites = [];
        state.fireflySprites.push(sp);
    }
    state.scene.add(fireflyGroup);
}

function updateFireflies() {
    if (!fireflyGroup) return;
    const t = Date.now() * 0.001;
    fireflyGroup.children.forEach(f => {
        const u = f.userData;
        f.position.x = u.baseX + Math.sin(t * u.speed + u.phase) * 2;
        f.position.z = u.baseZ + Math.cos(t * u.speed * 1.3 + u.phase) * 2;
        f.position.y = u.baseY + Math.sin(t * u.speed * 2) * 1.5;
    });
}

// ============ 动物微旋转 ============
function updateAnimalRotation() {
    const t = Date.now() * 0.0003;
    state.animals.forEach((a, i) => {
        a.rotation.y += (Math.sin(t + i * 1.7) * 0.002);
    });
}

// ============ 初始化 ============
function initAnimations() {
    state.scene.updateMatrixWorld();
    createBirds();
    createButterflies();
    createPetals();
    createFireflies();
}

export { initAnimations, updateBirds, updateButterflies, updateWindSway, updateAnimalRotation, updatePetals, updateFireflies };
