import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

// =============================
// 1️⃣ AI SERVER BAĞLANTISI
// =============================

// app.js içindeki eski askAI fonksiyonunu tamamen bununla değiştir:
async function askAI(question, modelName) {
    const API_KEY = 'AIzaSyDJq51SNPMn1kG_2ius5C9WhNZzC40m2oA'; 
    // Not: Model ismini stabil olan gemini-1.5-flash yaptım.
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Sen bir sanat tarihçisisin. '${modelName}' eseri hakkında şu soruyu yanıtla: ${question}`
                    }]
                }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Google API Hatası:", data);
            return `Hata: ${data.error?.message || "Yanıt alınamadı"}`;
        }

        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error("Bağlantı hatası:", error);
        return "Yapay zekaya ulaşılamadı. İnternet bağlantınızı kontrol edin.";
    }
}

// =============================
// 2️⃣ THREE.JS KURULUMU
// =============================

const viewerDiv = document.getElementById('viewer');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x121212);

const camera = new THREE.PerspectiveCamera(
    75,
    viewerDiv.clientWidth / viewerDiv.clientHeight,
    0.1,
    1000
);

camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(viewerDiv.clientWidth, viewerDiv.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
viewerDiv.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 2.5));

const sun = new THREE.DirectionalLight(0xffffff, 1.5);
sun.position.set(5, 10, 5);
scene.add(sun);

// =============================
// 3️⃣ MODEL YÜKLEME
// =============================

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

let currentModel;

function fitCameraToModel(model) {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);

    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    cameraZ *= 2.0;

    camera.position.set(center.x, center.y + (size.y / 4), cameraZ);
    camera.lookAt(center);

    if (controls) {
        controls.target.copy(center);
        controls.update();
    }
}

function loadModel(file) {
    if (currentModel) scene.remove(currentModel);

    loader.load(`assets/${file}`, (gltf) => {
        currentModel = gltf.scene;
        scene.add(currentModel);

        const box = new THREE.Box3().setFromObject(currentModel);
        const center = box.getCenter(new THREE.Vector3());
        currentModel.position.sub(center);

        fitCameraToModel(currentModel);
    });
}

// =============================
// 4️⃣ ARAYÜZ
// =============================

const modelList = document.getElementById('modelList');
const askBtn = document.getElementById('askBtn');
const userQuestion = document.getElementById('userQuestion');
const aiResponse = document.getElementById('aiResponse');

loadModel(modelList.value);

modelList.addEventListener('change', (e) => {
    loadModel(e.target.value);
});

askBtn.addEventListener('click', async () => {
    const q = userQuestion.value.trim();
    if (!q) return;

    aiResponse.style.display = 'block';
    aiResponse.innerText = "Yapay zeka yanıtlıyor...";

    const result = await askAI(
        q,
        modelList.selectedOptions[0].text
    );

    aiResponse.innerText = result;
});

// =============================
// 5️⃣ RESPONSIVE
// =============================

window.addEventListener('resize', () => {
    camera.aspect = viewerDiv.clientWidth / viewerDiv.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(viewerDiv.clientWidth, viewerDiv.clientHeight);
});

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();