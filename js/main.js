/**
 * 动物园数字孪生系统 - 入口
 * 负责初始化和主循环
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { state } from './config.js';
import { updateAllUI } from './language.js';
import { loadGLBModels, waitForAllTextures } from './utils.js';
import { createSky, createGround, createGroundInner, createRivers, createGate, createFences, createStones, createLighting, createLamps } from './scene.js';
import { createAnimals } from './animals.js';
import { createVegetation } from './vegetation.js';
import { switchView, resetCamera, toggleDayNight, onMouseMove, onMouseClick, showInfoPanel, closeInfoPanel, toggleLanguage } from './interaction.js';
import { updateMinimap, initMinimap } from './minimap.js';
import { initWeather, updateWeather, setWeather, getWeather } from './weather.js';
import { initAnimations, updateBirds, updateButterflies, updateWindSway, updateAnimalRotation, updatePetals, updateFireflies } from './effects.js';

// ============ 应用对象 ============
const ZooApp = {
    init: async function() {
        try {
            updateAllUI();

            // 基础设置
            state.scene = new THREE.Scene();
            state.scene.fog = new THREE.Fog(0x87CEEB, 80, 200);

            state.camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1000);
            state.camera.position.set(0, 20, 65);

            state.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
            state.renderer.setSize(innerWidth, innerHeight);
            state.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
            state.renderer.shadowMap.enabled = true;
            state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            state.renderer.outputColorSpace = THREE.SRGBColorSpace;
            state.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            state.renderer.toneMappingExposure = 1.0;
            document.getElementById('canvas-container').appendChild(state.renderer.domElement);

            state.controls = new OrbitControls(state.camera, state.renderer.domElement);
            state.controls.enableDamping = true;
            state.controls.dampingFactor = 0.08;
            state.controls.minDistance = 20;
            state.controls.maxDistance = 120;
            state.controls.maxPolarAngle = Math.PI / 2.1;
            state.controls.target.set(0, 3, 0);

            state.raycaster = new THREE.Raycaster();
            state.mouse = new THREE.Vector2();

            // 加载模型
            await loadGLBModels();

            // 创建场景对象
            createSky();
            createGround();
            createGroundInner();
            createRivers();
            createGate();
            createFences();
            createAnimals();
            createLamps();
            createVegetation();
            createStones();
            createLighting();

            // 事件监听
            window.addEventListener('resize', ZooApp.onWindowResize);
            state.renderer.domElement.addEventListener('mousemove', ZooApp.onMouseMove);
            state.renderer.domElement.addEventListener('click', ZooApp.onMouseClick);

            initWeather();
            initAnimations();
            initMinimap();
            // 检测所有纹理上传状态，未就绪则重试，全部就绪后再显示场景
            waitForAllTextures(function() {
                document.getElementById('loading').classList.add('hidden');
                ZooApp.animate();
            }, 20);
        } catch(e) {
            console.error('初始化错误:', e);
            document.getElementById('loading').innerHTML = '<p style="color:#ff6b6b;">加载失败: ' + e.message + '</p>';
        }
    },

    // 主循环
    animate: function() {
        requestAnimationFrame(ZooApp.animate);
        state.controls.update();
        if (state.river) state.river.material.opacity = 0.7 + Math.sin(Date.now() * 0.002) * 0.1;
        state.animals.forEach((a, i) => { a.position.y = Math.sin(Date.now() * 0.001 + i) * 0.1; });
        updateWeather();
        updateBirds();
        updateButterflies();
        updateAnimalRotation();
        updateWindSway();
        updatePetals();
        updateFireflies();
        state.renderer.render(state.scene, state.camera);
        updateMinimap();
    },

    onWindowResize: function() { state.camera.aspect = innerWidth / innerHeight; state.camera.updateProjectionMatrix(); state.renderer.setSize(innerWidth, innerHeight); },
    onMouseMove: onMouseMove,
    onMouseClick: onMouseClick,
    switchView: switchView,
    resetCamera: resetCamera,
    toggleDayNight: toggleDayNight,
    showInfoPanel: showInfoPanel,
    closeInfoPanel: closeInfoPanel,
    toggleLanguage: toggleLanguage,
    toggleWeather: function() {
        var cur = getWeather();
        if (cur === 'none') setWeather('rain');
        else if (cur === 'rain') setWeather('snow');
        else setWeather('none');
    }
};

// 暴露到全局
window.ZooApp = ZooApp;
window.onload = () => ZooApp.init();
