// ============ 动物创建 ============
import * as THREE from 'three';
import { animalData, ANIMAL_POSITIONS, MODEL_ADJUST, state } from './config.js';
import { fitModelToGround } from './utils.js';

// 创建所有动物
function createAnimals() {
    ANIMAL_POSITIONS.forEach(function(pos) {
        createAnimal(pos.type, pos.x, pos.z);
        // 每个动物四盏区域灯
        [[5,0],[0,5],[-5,0],[0,-5]].forEach(function(offset) {
            var light = new THREE.PointLight(0xFFD700, 0, 6);
            light.position.set(pos.x + offset[0], 0.5, pos.z + offset[1]);
            state.scene.add(light);
            state.animalLights.push(light);
        });
    });
}

// 创建单个动物（优先GLB，失败用几何体）
function createAnimal(type, x, z) {
    var group = new THREE.Group();
    group.userData = { type: type };

    if (state.modelCache[type]) {
        var clone = state.modelCache[type].clone(true);
        fitModelToGround(clone, MODEL_ADJUST[type]);
        clone.traverse(function(c) {
            if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; c.userData = { type: type }; }
            if (c.material) {
                var mats = Array.isArray(c.material) ? c.material : [c.material];
                mats.forEach(function(m) { m.needsUpdate = true; });
            }
        });
        group.add(clone);
    } else {
        group.add(createAnimalGeom(type));
    }

    var base = new THREE.Mesh(
        new THREE.CylinderGeometry(5, 5.3, 0.3, 16),
        new THREE.MeshLambertMaterial({ color: 0x556B2F })
    );
    base.position.set(x, 0.15, z); base.receiveShadow = true; state.scene.add(base);

    group.position.set(x, 0, z);
    state.scene.add(group);
    state.animals.push(group);
}

// 几何体后备模型
function createAnimalGeom(type) {
    var data = animalData[type], g = new THREE.Group();
    if (type === 'lion') {
        var b = new THREE.Mesh(new THREE.SphereGeometry(1.2,16,16), new THREE.MeshLambertMaterial({color:data.color}));
        b.position.y = 1; b.castShadow = true; g.add(b);
        var h = new THREE.Mesh(new THREE.SphereGeometry(0.8,16,16), new THREE.MeshLambertMaterial({color:data.color}));
        h.position.set(0,1.8,0.9); h.castShadow = true; g.add(h);
        var m = new THREE.Mesh(new THREE.SphereGeometry(0.9,16,16), new THREE.MeshLambertMaterial({color:0x8B4513}));
        m.position.set(0,2,0.7); g.add(m);
    } else if (type === 'elephant') {
        var b2 = new THREE.Mesh(new THREE.SphereGeometry(1.5,16,16), new THREE.MeshLambertMaterial({color:data.color}));
        b2.scale.set(1.5,1,1); b2.position.y = 1.8; b2.castShadow = true; g.add(b2);
        var h2 = new THREE.Mesh(new THREE.SphereGeometry(1,16,16), new THREE.MeshLambertMaterial({color:data.color}));
        h2.position.set(2,1.5,0); h2.castShadow = true; g.add(h2);
        var t = new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.3,2,8), new THREE.MeshLambertMaterial({color:data.color}));
        t.position.set(3,0.8,0); t.rotation.z = Math.PI/2; g.add(t);
    } else if (type === 'giraffe') {
        var b3 = new THREE.Mesh(new THREE.CapsuleGeometry(0.8,2,8,16), new THREE.MeshLambertMaterial({color:data.color}));
        b3.rotation.z = Math.PI/2; b3.position.y = 2; b3.castShadow = true; g.add(b3);
        var n = new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.4,2.5,8), new THREE.MeshLambertMaterial({color:data.color}));
        n.position.set(1.5,3.5,0); n.rotation.z = -Math.PI/6; g.add(n);
        var h3 = new THREE.Mesh(new THREE.SphereGeometry(0.5,16,16), new THREE.MeshLambertMaterial({color:data.color}));
        h3.position.set(2.2,4.5,0); g.add(h3);
    } else if (type === 'zebra') {
        var b4 = new THREE.Mesh(new THREE.BoxGeometry(2,1,0.8), new THREE.MeshLambertMaterial({color:0xFFFFFF}));
        b4.position.y = 1; b4.castShadow = true; g.add(b4);
        var h4 = new THREE.Mesh(new THREE.BoxGeometry(0.6,0.7,0.5), new THREE.MeshLambertMaterial({color:0xFFFFFF}));
        h4.position.set(1.2,1.4,0); g.add(h4);
        for (var i=0; i<4; i++) {
            var s = new THREE.Mesh(new THREE.BoxGeometry(0.1,1.1,0.85), new THREE.MeshLambertMaterial({color:0x222222}));
            s.position.set(-0.6+i*0.4, 1, 0); g.add(s);
        }
    } else if (type === 'panda') {
        var b5 = new THREE.Mesh(new THREE.SphereGeometry(1,16,16), new THREE.MeshLambertMaterial({color:0xFFFFFF}));
        b5.scale.set(1.2,1,0.8); b5.position.y = 0.8; b5.castShadow = true; g.add(b5);
        var h5 = new THREE.Mesh(new THREE.SphereGeometry(0.7,16,16), new THREE.MeshLambertMaterial({color:0xFFFFFF}));
        h5.position.y = 1.8; g.add(h5);
        var e1 = new THREE.Mesh(new THREE.CircleGeometry(0.15,16), new THREE.MeshLambertMaterial({color:0x222222}));
        e1.position.set(0.25,1.9,0.6); g.add(e1);
        var e2 = new THREE.Mesh(new THREE.CircleGeometry(0.15,16), new THREE.MeshLambertMaterial({color:0x222222}));
        e2.position.set(0.25,1.9,-0.6); g.add(e2);
    }
    return g;
}

export { createAnimals };