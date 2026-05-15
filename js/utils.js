// ============ 工具函数 ============
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GLB_FILE_MAP, state } from './config.js';
import { t } from './language.js';

// 遍历并修复材质纹理的色彩空间 + 强制上传到 GPU
function fixTextures(obj) {
    obj.traverse(function(node) {
        if (!node.isMesh || !node.material) return;
        var materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.forEach(function(mat) {
            ['map', 'emissiveMap', 'specularMap', 'bumpMap', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap'].forEach(function(key) {
                var tex = mat[key];
                if (!tex || !tex.isTexture) return;
                if (key === 'map' || key === 'emissiveMap' || key === 'specularMap') {
                    tex.colorSpace = THREE.SRGBColorSpace;
                } else {
                    tex.colorSpace = THREE.LinearSRGBColorSpace;
                }
                // needsUpdate=true 确保 renderer.initTexture 真正执行上传
                tex.needsUpdate = true;
                if (state.renderer) state.renderer.initTexture(tex);
            });
            mat.needsUpdate = true;
        });
    });
}

// 加载所有 GLB 模型
function loadGLBModels() {
    var loader = new GLTFLoader();
    var entries = Object.entries(GLB_FILE_MAP);
    var loaded = 0, total = entries.length;
    var textEl = document.querySelector('#loading p');
    return Promise.all(entries.map(function(entry) {
        var key = entry[0], url = entry[1];
        return new Promise(function(resolve) {
            loader.load(url,
                function(gltf) {
                    fixTextures(gltf.scene);
                    loaded++;
                    if (textEl) textEl.textContent = t('loadingModel') + ' ' + Math.round(loaded / total * 100) + '%';
                    state.modelCache[key] = gltf.scene;
                    resolve();
                },
                undefined,
                function(err) { console.error('模型加载失败:', key, err); loaded++; state.modelCache[key] = null; resolve(); }
            );
        });
    }));
}

// 模型缩放贴地
function fitModelToGround(clone, targetHeight) {
    const box = new THREE.Box3().setFromObject(clone);
    const h = box.max.y - box.min.y;
    if (h <= 0) return;
    const s = targetHeight / h;
    clone.scale.setScalar(s);
    clone.position.y = -box.min.y * s;
}

// 缓动函数
function easeInOutCubic(tVal) {
    return tVal < 0.5 ? 4 * tVal * tVal * tVal : 1 - Math.pow(-2 * tVal + 2, 3) / 2;
}

// 相机动画过渡（共享给 minimap 和 interaction 使用）
function animateCameraTo(targetPos, targetLook) {
    const startPos = state.camera.position.clone();
    const startLook = state.controls.target.clone();
    let progress = 0;
    const step = function() {
        progress += 0.02;
        if (progress >= 1) { state.camera.position.copy(targetPos); state.controls.target.copy(targetLook); return; }
        const t = easeInOutCubic(progress);
        state.camera.position.lerpVectors(startPos, targetPos, t);
        state.controls.target.lerpVectors(startLook, targetLook, t);
        requestAnimationFrame(step);
    };
    step();
}

// 检测所有纹理的 WebGL 上传状态，未就绪则重试，直到全部上传或超时
function waitForAllTextures(callback, maxRetries) {
    maxRetries = maxRetries || 20;
    var retries = 0;
    var TEXTURE_KEYS = ['map', 'emissiveMap', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'bumpMap', 'specularMap'];

    function checkAndRetry() {
        var allReady = true;

        state.scene.traverse(function(node) {
            if (!node.isMesh || !node.material) return;
            var mats = Array.isArray(node.material) ? node.material : [node.material];
            mats.forEach(function(mat) {
                TEXTURE_KEYS.forEach(function(key) {
                    var tex = mat[key];
                    if (!tex || !tex.isTexture) return;
                    var props = state.renderer.properties.get(tex);
                    if (!props || !props.__webglTexture) {
                        allReady = false;
                        tex.needsUpdate = true;
                        state.renderer.initTexture(tex);
                    }
                });
                if (!allReady) mat.needsUpdate = true;
            });
        });

        if (allReady || retries >= maxRetries) {
            callback();
        } else {
            retries++;
            state.renderer.render(state.scene, state.camera);
            requestAnimationFrame(checkAndRetry);
        }
    }

    checkAndRetry();
}

export { loadGLBModels, fitModelToGround, easeInOutCubic, animateCameraTo, waitForAllTextures };
