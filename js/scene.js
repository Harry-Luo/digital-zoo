import * as THREE from 'three';
import { state, MODEL_ADJUST } from './config.js';
import { fitModelToGround } from './utils.js';

// ============ 天空 ============
function createSky() {
    state.sky = new THREE.Mesh(
        new THREE.SphereGeometry(200, 32, 32),
        new THREE.ShaderMaterial({
            uniforms: { topColor:{value:new THREE.Color(0x87CEEB)}, bottomColor:{value:new THREE.Color(0xFFFFFF)}, offset:{value:20}, exponent:{value:0.6} },
            vertexShader: 'varying vec3 vWorldPosition;void main(){vec4 wp=modelMatrix*vec4(position,1.0);vWorldPosition=wp.xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
            fragmentShader: 'uniform vec3 topColor,bottomColor;uniform float offset,exponent;varying vec3 vWorldPosition;void main(){float h=normalize(vWorldPosition+offset).y;gl_FragColor=vec4(mix(bottomColor,topColor,max(pow(max(h,0.),exponent),0.)),1.);}',
            side: THREE.BackSide
        })
    ); state.scene.add(state.sky);
}

// ============ 地面 ============
function createGround() {
    const g = new THREE.PlaneGeometry(200, 200, 80, 80);
    const v = g.attributes.position.array;
    for (let i = 0; i < v.length; i += 3) {
        const d = Math.sqrt(v[i]*v[i] + v[i+1]*v[i+1]);
        if (d > 50) v[i+2] = Math.sin(v[i]*0.05) * Math.cos(v[i+1]*0.05) * 4 + Math.random() * 2;
    }
    g.computeVertexNormals();
    state.ground = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color: 0x3d6b3d, side: THREE.DoubleSide }));
    state.ground.rotation.x = -Math.PI/2; state.ground.position.y = -0.5; state.ground.receiveShadow = true;
    state.scene.add(state.ground);
}

function createGroundInner() {
    const g = new THREE.PlaneGeometry(80, 80, 20, 20);
    const v = g.attributes.position.array;
    for (let i = 0; i < v.length; i += 3) v[i+2] = 0;
    g.computeVertexNormals();
    state.groundInner = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color: 0x228B22, side: THREE.DoubleSide }));
    state.groundInner.rotation.x = -Math.PI/2; state.groundInner.position.y = -0.3; state.groundInner.receiveShadow = true;
    state.scene.add(state.groundInner);
}

// ============ 河流 ============
function createRivers() {
    const rm = new THREE.MeshPhongMaterial({ color: 0x1E90FF, transparent: true, opacity: 0.8, shininess: 100 });
    function makeRiver(points, pos) {
        const s = new THREE.Shape();
        s.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) s.lineTo(points[i][0], points[i][1]);
        const m = new THREE.Mesh(new THREE.ShapeGeometry(s), rm);
        m.rotation.x = -Math.PI/2; m.position.set(pos[0], pos[1], pos[2]); state.scene.add(m);
        return m;
    }
    makeRiver([[-60,-50],[-45,-50],[-45,50],[-60,50],[-60,-50]], [6,0.05,0]);
    makeRiver([[45,-50],[60,-50],[60,50],[45,50],[45,-50]], [-6,0.05,0]);
    state.river = makeRiver([[-65,45],[-60,60],[65,60],[60,45],[-60,45]], [0,0.05,6]);
}

// ============ 大门 ============
function createGate() {
    const G = new THREE.Group();
    const p = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
    const g = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
    const d = new THREE.MeshLambertMaterial({ color: 0x2F2F2F });
    function post(x) { const m = new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.5,12,8), p); m.position.set(x,6,36); m.castShadow=true; G.add(m); }
    function top(x)  { const m = new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.2,2,8), g); m.position.set(x,13,36); G.add(m); }
    function base(x) { const m = new THREE.Mesh(new THREE.BoxGeometry(4,0.5,4), d); m.position.set(x,0.25,36); G.add(m); }
    post(-8); post(8); top(-8); top(8); base(-8); base(8);
    const b = new THREE.Mesh(new THREE.BoxGeometry(18,2,2), p); b.position.set(0,12,36); b.castShadow=true; G.add(b);
    const tb = new THREE.Mesh(new THREE.BoxGeometry(20,1,1), g); tb.position.set(0,13.5,36); G.add(tb);
    // 门牌(贴图)
    const sm = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
    const sb = new THREE.Mesh(new THREE.BoxGeometry(12,3,0.5), sm); sb.position.set(0,10,34.5); G.add(sb);
    new THREE.TextureLoader().load('./pictures/动物园.png', function(tex) { tex.colorSpace = THREE.SRGBColorSpace; sm.map = tex; sm.needsUpdate = true; });
    const sf = new THREE.Mesh(new THREE.BoxGeometry(13,4,0.3), g); sf.position.set(0,10,34.3); G.add(sf);
    // 灯笼（带发光材质）
    const lg = new THREE.MeshPhongMaterial({ color: 0xFFD700, emissive: 0xFF6600, emissiveIntensity: 0 });
    const ll = new THREE.Mesh(new THREE.SphereGeometry(0.6,16,16), lg); ll.position.set(-5,10,34.5); state.lanternMeshes.push(ll); G.add(ll);
    const rl = new THREE.Mesh(new THREE.SphereGeometry(0.6,16,16), lg.clone()); rl.position.set(5,10,34.5); state.lanternMeshes.push(rl); G.add(rl);
    // 灯笼 PointLight
    const lanternL = new THREE.PointLight(0xFFAA00, 0, 12); lanternL.position.set(-5, 10, 34.5); state.lanternPointLights.push(lanternL); G.add(lanternL);
    const lanternR = new THREE.PointLight(0xFFAA00, 0, 12); lanternR.position.set(5, 10, 34.5); state.lanternPointLights.push(lanternR); G.add(lanternR);
    const st = new THREE.Mesh(new THREE.BoxGeometry(12,0.3,2), d); st.position.set(0,0.2,36); G.add(st);
    state.scene.add(G);

    // 售票厅(左)两个挨着，保安厅(右)左转两次
    createBooth('ticket', -23, 34);
    createBooth('ticket', -16, 34);
    createBooth('security', 15, 34, Math.PI / 2);
}

// ============ 围栏 ============
function createFences() {
    const fm = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const paths = [
        {sx:0,sz:38,ex:0,ez:0},{sx:0,sz:0,ex:-15,ez:-15},
        {sx:0,sz:0,ex:15,ez:-15},{sx:0,sz:0,ex:-15,ez:15},{sx:0,sz:0,ex:15,ez:15}
    ];
    const isNear = (x,z) => {
        for (let p of paths) {
            const dx = p.ex-p.sx, dz = p.ez-p.sz, len = Math.sqrt(dx*dx+dz*dz);
            if (!len) continue;
            const tt = Math.max(0, Math.min(1, ((x-p.sx)*dx+(z-p.sz)*dz)/(len*len)));
            if (Math.sqrt((x-(p.sx+tt*dx))**2 + (z-(p.sz+tt*dz))**2) < 2.5) return true;
        }
        return false;
    };
    const positions = [{x:-15,z:-15},{x:15,z:-15},{x:-15,z:15},{x:15,z:15},{x:0,z:0}];
    const ph = 2.5;
    positions.forEach(pos => {
        const posts = [];
        for (let i = 0; i < 16; i++) {
            const a = (i/16)*Math.PI*2;
            const px = pos.x + Math.cos(a)*8, pz = pos.z + Math.sin(a)*8;
            if (isNear(px,pz)) { posts.push(null); continue; }
            const p = new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.15,ph,8), fm);
            p.position.set(px, ph/2, pz); p.castShadow=true; state.scene.add(p); posts.push({x:px,z:pz});
            const fl = new THREE.PointLight(0xFFD700, 0, 4); fl.position.set(px, ph, pz); state.scene.add(fl); state.fenceLights.push(fl);
        }
        for (let j = 0; j < 2; j++) {
            const ry = 0.8 + j*1.2;
            for (let i = 0; i < 16; i++) {
                const p1 = posts[i], p2 = posts[(i+1)%16];
                if (!p1 || !p2) continue;
                const mx = (p1.x+p2.x)/2, mz = (p1.z+p2.z)/2;
                if (isNear(mx,mz)) continue;
                const len = Math.sqrt((p2.x-p1.x)**2 + (p2.z-p1.z)**2);
                const r = new THREE.Mesh(new THREE.BoxGeometry(len,0.1,0.1), fm);
                r.position.set(mx, ry, mz);
                r.rotation.y = -Math.atan2(p2.z-p1.z, p2.x-p1.x);
                state.scene.add(r);
            }
        }
    });

    // 大门到中心围栏
    const cx=0,cz=0; const gx=0,gz=34;
    const ang = Math.atan2(gz-cz, gx-cx), off = 3.5;
    function buildSide(sx,sz,ex,ez) {
        const len = Math.sqrt((ex-sx)**2 + (ez-sz)**2);
        const cnt = Math.floor(len/3);
        let px=sx, pz=sz;
        for (let i=1; i<=cnt; i++) {
            const t = i/cnt, nx = sx+(ex-sx)*t, nz = sz+(ez-sz)*t;
            const p = new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.15,ph,8), fm);
            p.position.set(nx, ph/2, nz); p.castShadow=true; state.scene.add(p);
            const fl = new THREE.PointLight(0xFFD700, 0, 4); fl.position.set(nx, ph, nz); state.scene.add(fl); state.fenceLights.push(fl);
            if (i>1) {
                const sl = Math.sqrt((nx-px)**2+(nz-pz)**2);
                for (let j=0; j<2; j++) {
                    const ry = 0.8+j*1.2;
                    const r = new THREE.Mesh(new THREE.BoxGeometry(sl,0.1,0.1), fm);
                    r.position.set((nx+px)/2, ry, (nz+pz)/2);
                    r.rotation.y = -Math.atan2(nz-pz, nx-px);
                    state.scene.add(r);
                }
            }
            px=nx; pz=nz;
        }
    }
    buildSide(cx+Math.cos(ang+Math.PI/2)*off+Math.cos(ang)*9, cz+Math.sin(ang+Math.PI/2)*off+Math.sin(ang)*9, gx+Math.cos(ang+Math.PI/2)*off, gz+Math.sin(ang+Math.PI/2)*off);
    buildSide(cx+Math.cos(ang-Math.PI/2)*off+Math.cos(ang)*9, cz+Math.sin(ang-Math.PI/2)*off+Math.sin(ang)*9, gx+Math.cos(ang-Math.PI/2)*off, gz+Math.sin(ang-Math.PI/2)*off);
}

// ============ 石子路 ============
function createStones() {
    const sm = new THREE.MeshLambertMaterial({ color: 0x808080 });
    [{sx:0,sz:34,ex:0,ez:0},{sx:0,sz:0,ex:-15,ez:-15},{sx:0,sz:0,ex:15,ez:-15},{sx:0,sz:0,ex:-15,ez:15},{sx:0,sz:0,ex:15,ez:15}].forEach(p => {
        const len = Math.sqrt((p.ex-p.sx)**2 + (p.ez-p.sz)**2);
        for (let i=0; i<len*3; i++) {
            const s = new THREE.Mesh(new THREE.SphereGeometry(0.18+Math.random()*0.12,6,6), sm);
            s.scale.y=0.5;
            s.position.set(p.sx+(p.ex-p.sx)*(i/(len*3))+(Math.random()-0.5)*1.4, 0.1, p.sz+(p.ez-p.sz)*(i/(len*3))+(Math.random()-0.5)*1.4);
            state.scene.add(s);
        }
    });
}

// ============ 光照 ============
function createLighting() {
    state.ambientLight = new THREE.AmbientLight(0xffffff, 1.0); state.scene.add(state.ambientLight);
    state.sunLight = new THREE.DirectionalLight(0xffffe0, 2); state.sunLight.position.set(30,50,30);
    state.sunLight.castShadow=true; state.sunLight.shadow.mapSize.width=1024; state.sunLight.shadow.mapSize.height=1024;
    state.sunLight.shadow.camera.near=0.5; state.sunLight.shadow.camera.far=200;
    state.sunLight.shadow.camera.left=-80; state.sunLight.shadow.camera.right=80;
    state.sunLight.shadow.camera.top=80; state.sunLight.shadow.camera.bottom=-80; state.scene.add(state.sunLight);
    state.moonLight = new THREE.DirectionalLight(0x6666ff, 0); state.moonLight.position.set(-30,40,-30); state.scene.add(state.moonLight);
}

// ============ 门房建筑 ============
function createBooth(type, x, z, rotY) {
    if (!state.modelCache[type]) return;
    const clone = state.modelCache[type].clone(true);
    fitModelToGround(clone, MODEL_ADJUST[type]);
    clone.traverse(function(c) {
        if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; }
        if (c.material) {
            var mats = Array.isArray(c.material) ? c.material : [c.material];
            mats.forEach(function(m) { m.needsUpdate = true; });
        }
    });
    clone.position.set(x, 0, z);
    if (rotY) clone.rotation.y = rotY;
    state.scene.add(clone);
}

// ============ 路灯 ============
function createLamps() {
    if (!state.modelCache['lamp']) return;
    const positions = [
        { x: -13, z: -28 }, { x: 13, z: -28 },
        { x: -32, z: 17 }, { x: 32, z: -9 }, { x: -32, z: -9 }, { x: 32, z: 17 },
        { x: 0, z: -11 }, { x: -15, z: 4 }, { x: 15, z: 4 }
    ];
    positions.forEach(p => {
        const clone = state.modelCache['lamp'].clone(true);
        fitModelToGround(clone, MODEL_ADJUST['lamp']);
        clone.traverse(function(c) {
            if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; }
            if (c.material) {
                var mats = Array.isArray(c.material) ? c.material : [c.material];
                mats.forEach(function(m) { m.needsUpdate = true; });
            }
        });
        clone.position.set(p.x, -0.5, p.z);
        state.scene.add(clone);
        const light = new THREE.PointLight(0xFFFFFF, 0, 15);
        light.position.set(p.x, 3.5, p.z);
        state.scene.add(light);
        state.streetLights.push(light);
    });
}

export { createSky, createGround, createGroundInner, createRivers, createGate, createFences, createStones, createLighting, createLamps };
