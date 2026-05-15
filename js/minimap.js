import * as THREE from 'three';
import { state } from './config.js';
import { animateCameraTo } from './utils.js';

const MAP_ITEMS = [
    { e: '🦁', x: -15, z: -15, name: 'lion' },
    { e: '🐘', x: 15, z: -15, name: 'elephant' },
    { e: '🦒', x: -15, z: 15, name: 'giraffe' },
    { e: '🦓', x: 15, z: 15, name: 'zebra' },
    { e: '🐼', x: 0, z: 0, name: 'panda' }
];
let minimapBounds = null;

// ============ 小地图绘制 ============
function updateMinimap() {
    const cx = state.camera.position.x.toFixed(1), cz = state.camera.position.z.toFixed(1);
    const moved = (cx !== state.lastCamX || cz !== state.lastCamZ);
    state.lastCamX = cx; state.lastCamZ = cz;

    const cv = document.getElementById('minimap-canvas');
    if (!cv) return;

    // 只在相机移动或首次时重绘
    if (!moved && minimapBounds) return;

    const ctx = cv.getContext('2d'), w = cv.width, h = cv.height;
    const xMin = -25, xMax = 25, zMin = -25, zMax = 36, pad = 8;
    const tX = (x) => pad + (x - xMin) / (xMax - xMin) * (w - pad * 2);
    const tZ = (z) => pad + (z - zMin) / (zMax - zMin) * (h - pad * 2);

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(34,139,34,0.25)'; ctx.fillRect(pad, pad, w - pad * 2, h - pad * 2);
    ctx.strokeStyle = 'rgba(255,215,0,0.3)'; ctx.lineWidth = 1; ctx.strokeRect(pad, pad, w - pad * 2, h - pad * 2);
    ctx.fillStyle = '#8B0000'; ctx.fillRect(tX(0) - 4, tZ(36) - 2, 9, 5);

    ctx.font = '13px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    MAP_ITEMS.forEach(a => ctx.fillText(a.e, tX(a.x), tZ(a.z)));

    // 红点
    const camXPx = tX(Math.max(xMin, Math.min(xMax, state.camera.position.x)));
    const camZPx = tZ(Math.max(zMin, Math.min(zMax, state.camera.position.z)));
    ctx.fillStyle = '#FF3333'; ctx.beginPath();
    ctx.arc(camXPx, camZPx, 3, 0, Math.PI * 2); ctx.fill();

    // 保存映射参数供点击检测
    minimapBounds = { tX, tZ, xMin, xMax, zMin, zMax, pad, w, h };
}

// ============ 小地图点击 ============
function onMinimapClick(event) {
    if (!minimapBounds) return;
    const cv = document.getElementById('minimap-canvas');
    if (!cv) return;
    const rect = cv.getBoundingClientRect();
    const scaleX = cv.width / rect.width;
    const scaleY = cv.height / rect.height;
    const mx = (event.clientX - rect.left) * scaleX;
    const mz = (event.clientY - rect.top) * scaleY;

    for (let a of MAP_ITEMS) {
        const sx = minimapBounds.tX(a.x);
        const sz = minimapBounds.tZ(a.z);
        if (Math.sqrt((mx - sx) ** 2 + (mz - sz) ** 2) < 10) {
            // 跳到动物位置
            animateCameraTo(new THREE.Vector3(a.x, 10, a.z), new THREE.Vector3(a.x, 2, a.z));
            break;
        }
    }
}

function initMinimap() {
    const cv = document.getElementById('minimap-canvas');
    if (cv) { cv.addEventListener('click', onMinimapClick); cv.style.cursor = 'pointer'; }
}

export { updateMinimap, initMinimap };
