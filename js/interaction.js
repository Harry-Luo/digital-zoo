import * as THREE from 'three';
import { state } from './config.js';
import { easeInOutCubic, animateCameraTo } from './utils.js';
import { currentLang, setLang, tA, updateAllUI } from './language.js';
import { animalData } from './config.js';

// ============ 视角切换 ============
function switchView(view) {
    state.targetView = view;
    document.querySelectorAll('.control-btn').forEach(function(b) {
        if (b.id === 'view-perspective' || b.id === 'view-bird') b.classList.remove('active');
    });
    if (view === 'perspective') {
        document.getElementById('view-perspective').classList.add('active');
        animateCameraTo(new THREE.Vector3(0, 20, 65), new THREE.Vector3(0, 3, 0));
    } else {
        document.getElementById('view-bird').classList.add('active');
        animateCameraTo(new THREE.Vector3(0, 80, 60), new THREE.Vector3(0, 0, 0));
    }
}

function resetCamera() { switchView(state.targetView); }

// ============ 昼夜切换 ============
function toggleDayNight() {
    state.isDaytime = !state.isDaytime;
    const b = document.getElementById('day-night-toggle');
    if (state.isDaytime) { b.innerHTML='🌙'; b.classList.remove('active'); animateDayToNight(false); }
    else { b.innerHTML='☀️'; b.classList.add('active'); animateDayToNight(true); }
}

function animateDayToNight(toNight) {
    let p=0;
    const dT=new THREE.Color(0x87CEEB), dB=new THREE.Color(0xFFFFFF), nT=new THREE.Color(0x0a0a1a), nB=new THREE.Color(0x1a1a2e);
    const u=()=>{
        p+=0.02;
        if(p>=1){
            if(toNight){
                state.sky.material.uniforms.topColor.value=nT; state.sky.material.uniforms.bottomColor.value=nB;
                state.sunLight.intensity=0; state.moonLight.intensity=0.5; state.ambientLight.intensity=0.3;
                state.scene.fog.color=new THREE.Color(0x1a1a2e);
                state.lanternPointLights.forEach(l => l.intensity = 2);
                state.lanternMeshes.forEach(l => l.material.emissiveIntensity = 1);
                state.animalLights.forEach(l => l.intensity = 1.5);
                state.streetLights.forEach(l => l.intensity = 50);
                state.shrubLights.forEach(l => l.intensity = 1.5);
                state.shrubSprites.forEach(s => s.material.opacity = 0.6);
                state.fenceLights.forEach(l => l.intensity = 2.5);
                if (state.fireflySprites) state.fireflySprites.forEach(s => s.material.opacity = 1);
            } else {
                state.sky.material.uniforms.topColor.value=dT; state.sky.material.uniforms.bottomColor.value=dB;
                state.sunLight.intensity=2; state.moonLight.intensity=0; state.ambientLight.intensity=1.0;
                state.scene.fog.color=new THREE.Color(0x87CEEB);
                state.lanternPointLights.forEach(l => l.intensity = 0);
                state.lanternMeshes.forEach(l => l.material.emissiveIntensity = 0);
                state.animalLights.forEach(l => l.intensity = 0);
                state.streetLights.forEach(l => l.intensity = 0);
                state.shrubLights.forEach(l => l.intensity = 0);
                state.shrubSprites.forEach(s => s.material.opacity = 0);
                state.fenceLights.forEach(l => l.intensity = 0);
                if (state.fireflySprites) state.fireflySprites.forEach(s => s.material.opacity = 0);
            }
            return;
        }
        const t=easeInOutCubic(p);
        if(toNight){
            state.sky.material.uniforms.topColor.value.lerpColors(dT,nT,t); state.sky.material.uniforms.bottomColor.value.lerpColors(dB,nB,t);
            state.sunLight.intensity=2-t*2; state.moonLight.intensity=t*0.5; state.ambientLight.intensity=1.0-t*0.7;
            state.scene.fog.color.lerpColors(new THREE.Color(0x87CEEB),new THREE.Color(0x1a1a2e),t);
            state.lanternPointLights.forEach(l => l.intensity = t * 2);
            state.lanternMeshes.forEach(l => l.material.emissiveIntensity = t);
            state.animalLights.forEach(l => l.intensity = t * 1.5);
            state.streetLights.forEach(l => l.intensity = t * 10);
            state.shrubLights.forEach(l => l.intensity = t * 0.3);
            state.shrubSprites.forEach(s => s.material.opacity = t * 0.6);
            state.fenceLights.forEach(l => l.intensity = t * 2.5);
            if (state.fireflySprites) state.fireflySprites.forEach(s => s.material.opacity = t);
        } else {
            state.sky.material.uniforms.topColor.value.lerpColors(nT,dT,t); state.sky.material.uniforms.bottomColor.value.lerpColors(nB,dB,t);
            state.sunLight.intensity=t*2; state.moonLight.intensity=0.5*(1-t); state.ambientLight.intensity=0.3+t*0.7;
            state.scene.fog.color.lerpColors(new THREE.Color(0x1a1a2e),new THREE.Color(0x87CEEB),t);
            state.lanternPointLights.forEach(l => l.intensity = (1 - t) * 2);
            state.lanternMeshes.forEach(l => l.material.emissiveIntensity = (1 - t));
            state.animalLights.forEach(l => l.intensity = (1 - t) * 1.5);
            state.streetLights.forEach(l => l.intensity = (1 - t) * 10);
            state.shrubLights.forEach(l => l.intensity = (1 - t) * 0.3);
            state.shrubSprites.forEach(s => s.material.opacity = (1 - t) * 0.6);
            state.fenceLights.forEach(l => l.intensity = (1 - t) * 2.5);
            if (state.fireflySprites) state.fireflySprites.forEach(s => s.material.opacity = (1 - t));
        }
        requestAnimationFrame(u);
    };
    u();
}

// ============ 鼠标交互 ============
function onMouseMove(e) {
    state.mouse.x=(e.clientX/innerWidth)*2-1; state.mouse.y=-(e.clientY/innerHeight)*2+1;
    state.raycaster.setFromCamera(state.mouse, state.camera);
    const is = state.raycaster.intersectObjects(state.animals, true);
    const tt = document.getElementById('tooltip');
    if (is.length>0) {
        let o=is[0].object; while(o.parent&&!o.userData.type) o=o.parent;
        if (o.userData.type) { state.hoveredAnimal=o; document.body.style.cursor='pointer'; tt.textContent=tA(o.userData.type).name; tt.style.left=e.clientX+15+'px'; tt.style.top=e.clientY+15+'px'; tt.classList.add('visible'); }
        else { state.hoveredAnimal=null; document.body.style.cursor='default'; tt.classList.remove('visible'); }
    } else { state.hoveredAnimal=null; document.body.style.cursor='default'; tt.classList.remove('visible'); }
}

function onMouseClick(e) {
    if (state.hoveredAnimal&&state.hoveredAnimal.userData.type) showInfoPanel(state.hoveredAnimal.userData.type);
}

// ============ 信息面板 ============
function showInfoPanel(type) {
    currentAnimalType = type;
    var a = tA(type);
    document.getElementById('animal-name').textContent = a.name;
    document.getElementById('animal-scientific').textContent = a.scientific;
    document.getElementById('animal-habitat').textContent = a.habitat;
    document.getElementById('animal-description').textContent = a.description;
    var imgEl = document.getElementById('animal-image');
    imgEl.innerHTML = '<img src="' + animalData[type].pic + '" style="width:100%;height:100%;object-fit:cover;border-radius:10px;">';
    document.getElementById('info-panel').classList.add('active');
    speakAnimalInfo(type);
}

function closeInfoPanel() {
    document.getElementById('info-panel').classList.remove('active');
    window.speechSynthesis.cancel();
}

// ============ 语音播报 ============
function speakAnimalInfo(type) {
    window.speechSynthesis.cancel();
    var a = tA(type);
    var u = new SpeechSynthesisUtterance(a.name + '。' + a.description);
    u.lang = currentLang === 'zh' ? 'zh-CN' : 'en-US';
    u.rate = 0.9; u.volume = 0.8;
    window.speechSynthesis.speak(u);
}

// ============ 语言切换 ============
let currentAnimalType = null;

function toggleLanguage() {
    window.speechSynthesis.cancel();
    setLang(currentLang === 'zh' ? 'en' : 'zh'); updateAllUI();
    var panel = document.getElementById('info-panel');
    if (panel.classList.contains('active') && currentAnimalType) {
        var a = tA(currentAnimalType);
        document.getElementById('animal-name').textContent=a.name;
        document.getElementById('animal-scientific').textContent=a.scientific;
        document.getElementById('animal-habitat').textContent=a.habitat;
        document.getElementById('animal-description').textContent=a.description;
        speakAnimalInfo(currentAnimalType);
    }
}

export { switchView, resetCamera, toggleDayNight, onMouseMove, onMouseClick, showInfoPanel, closeInfoPanel, toggleLanguage };
