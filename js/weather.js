import * as THREE from 'three';
import { state } from './config.js';

const RAIN_COUNT = 4000;
const SNOW_COUNT = 1200;
const RAIN_CLOUDS = 60;
const SNOW_CLOUDS = 40;
let rainCloudGroup, snowCloudGroup;

let weatherType = 'none'; // 'none' | 'rain' | 'snow'
let rainParticles, snowParticles;
let cloudBaseY = 30;

// 创建云朵
function createCloudGroup(count, color, opacity) {
    const group = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color: color, transparent: true, opacity: opacity });
    for (let i = 0; i < count; i++) {
        const g = new THREE.Group();
        const segs = 3 + Math.floor(Math.random() * 4);
        for (let j = 0; j < segs; j++) {
            const r = 2 + Math.random() * 4;
            const m = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), mat);
            m.position.set((Math.random()-0.5)*6, (Math.random()-0.5)*2, (Math.random()-0.5)*6);
            m.castShadow=false; m.receiveShadow=false;
            g.add(m);
        }
        g.position.set((Math.random()-0.5)*100, cloudBaseY+Math.random()*10, (Math.random()-0.5)*100);
        g.userData = { speed: 0.02+Math.random()*0.04 };
        group.add(g);
    }
    return group;
}

function moveCloudGroup(group) {
    if (!group) return;
    group.children.forEach(c => {
        c.position.x += c.userData.speed;
        if (c.position.x > 80) c.position.x = -80;
    });
}

// 创建雨
function createRain() {
    const geom = new THREE.BufferGeometry();
    const pos = new Float32Array(RAIN_COUNT * 3);
    for (let i = 0; i < RAIN_COUNT * 3; i += 3) {
        pos[i] = (Math.random() - 0.5) * 120;
        pos[i + 1] = Math.random() * 60;
        pos[i + 2] = (Math.random() - 0.5) * 120;
    }
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0xAAAAFF, size: 0.15, transparent: true, opacity: 0.6, depthWrite: false });
    rainParticles = new THREE.Points(geom, mat);
}

// 创建雪
function createSnow() {
    const geom = new THREE.BufferGeometry();
    const pos = new Float32Array(SNOW_COUNT * 3);
    for (let i = 0; i < SNOW_COUNT * 3; i += 3) {
        pos[i] = (Math.random() - 0.5) * 120;
        pos[i + 1] = Math.random() * 60;
        pos[i + 2] = (Math.random() - 0.5) * 120;
    }
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.5, transparent: true, opacity: 0.8, depthWrite: false });
    snowParticles = new THREE.Points(geom, mat);
}

// 初始化
function initWeather() {
    createRain();
    createSnow();
    rainCloudGroup = createCloudGroup(RAIN_CLOUDS, 0x666666, 0.9);
    snowCloudGroup = createCloudGroup(SNOW_CLOUDS, 0xBBBBBB, 0.75);
}

// 更新
function updateWeather() {
    if (weatherType === 'rain' && rainParticles) {
        const p = rainParticles.geometry.attributes.position.array;
        for (let i = 0; i < RAIN_COUNT * 3; i += 3) {
            p[i + 1] -= 0.8;
            if (p[i + 1] < 0) {
                p[i] = (Math.random() - 0.5) * 120;
                p[i + 1] = 60;
                p[i + 2] = (Math.random() - 0.5) * 120;
            }
        }
        rainParticles.geometry.attributes.position.needsUpdate = true;
    }

    if (weatherType === 'snow' && snowParticles) {
        const p = snowParticles.geometry.attributes.position.array;
        for (let i = 0; i < SNOW_COUNT * 3; i += 3) {
            p[i + 1] -= 0.08;
            p[i] += Math.sin(Date.now() * 0.001 + i) * 0.02;
            if (p[i + 1] < 0) {
                p[i] = (Math.random() - 0.5) * 120;
                p[i + 1] = 60;
                p[i + 2] = (Math.random() - 0.5) * 120;
            }
        }
        snowParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 云层移动
    if (weatherType === 'rain') moveCloudGroup(rainCloudGroup);
    if (weatherType === 'snow') moveCloudGroup(snowCloudGroup);
}

// 切换天气
function setWeather(type) {
    weatherType = type;

    if (rainParticles) {
        if (type === 'rain') state.scene.add(rainParticles);
        else rainParticles.removeFromParent();
    }
    if (snowParticles) {
        if (type === 'snow') state.scene.add(snowParticles);
        else snowParticles.removeFromParent();
    }
    // 云层
    if (rainCloudGroup) { if (type === 'rain') state.scene.add(rainCloudGroup); else rainCloudGroup.removeFromParent(); }
    if (snowCloudGroup) { if (type === 'snow') state.scene.add(snowCloudGroup); else snowCloudGroup.removeFromParent(); }

    // 天气影响天空颜色
    if (type === 'rain') {
        state.sky.material.uniforms.topColor.value = new THREE.Color(0x444455);
        state.sky.material.uniforms.bottomColor.value = new THREE.Color(0x666677);
        state.scene.fog = new THREE.Fog(0x555566, 80, 200);
        state.ambientLight.intensity = 0.5;
    } else if (type === 'snow') {
        state.sky.material.uniforms.topColor.value = new THREE.Color(0x777788);
        state.sky.material.uniforms.bottomColor.value = new THREE.Color(0x9999AA);
        state.scene.fog = new THREE.Fog(0x888899, 80, 200);
        state.ambientLight.intensity = 0.5;
    } else {
        const dt = new THREE.Color(0x87CEEB), db = new THREE.Color(0xFFFFFF);
        if (state.isDaytime) {
            state.sky.material.uniforms.topColor.value = dt;
            state.sky.material.uniforms.bottomColor.value = db;
            state.scene.fog = new THREE.Fog(0x87CEEB, 80, 200);
            state.ambientLight.intensity = 1.0;
        }
    }

    // 更新按钮
    const btn = document.getElementById('weather-toggle');
    if (btn) {
        btn.textContent = type === 'rain' ? '🌧️' : type === 'snow' ? '❄️' : '☀️';
        if (type === 'none') btn.classList.remove('active');
        else btn.classList.add('active');
    }
}

function getWeather() { return weatherType; }

export { initWeather, updateWeather, setWeather, getWeather };
