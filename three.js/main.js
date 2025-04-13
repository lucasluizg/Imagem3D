// Importa as bibliotecas necessárias para renderização 3D, carregamento de modelos e controle do usuário
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

// Cria a cena
const scene = new THREE.Scene();

// Configura a câmera com projeção em perspectiva
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0.1, 0.01, 0.1); // Posiciona a câmera

// Cria e configura o renderizador
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.physicallyCorrectLights = true;
renderer.setClearColor(0x000000, 0);
document.body.appendChild(renderer.domElement);

// Adiciona luzes à cena
const ambientLight = new THREE.AmbientLight(0xffffff, 2); // Luz ambiente para iluminação geral
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Luz direcional simulando luz do sol
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Configura o OrbitControls para permitir interação (rotação, zoom) do usuário
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Habilita a suavização das interações
controls.dampingFactor = 0.05;
controls.minDistance = 0.5;
controls.maxDistance = 1;

// Variável para armazenar o objeto 3D carregado
let object3D;

// Carrega os materiais e o objeto utilizando MTLLoader e OBJLoader
const mtlLoader = new MTLLoader();
mtlLoader.setPath('./');

mtlLoader.load(
    './apple_final.mtl',
    (materials) => {
        materials.preload();
        
        // Aplica configurações diferentes aos materiais com base no nome
        Object.values(materials.materials).forEach(material => {
            material.side = THREE.DoubleSide; // Renderiza ambos os lados das faces
            material.transparent = false;
            
            if (material.name === 'Material') {
                // Para "Material": aparência de metal polido
                material.roughness = 0;
                material.metalness = 1.0;
                material.shininess = 500;
                material.opacity = 1.0;
            } else if (material.name === 'texture_bake') {
                // Para "texture_bake": aparência natural e opaca (como uma maçã)
                material.roughness = 0.8;
                material.metalness = 0.0;
                material.shininess = 30;
                material.opacity = 1.0;
            } else {
                // Configurações padrão para outros materiais
                material.roughness = 0;
                material.metalness = 1;
                material.shininess = 100;
                material.opacity = 1.0;
            }
        });
        
        // Inicializa o OBJLoader e aplica os materiais carregados ao modelo
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        
        // Carrega o objeto 3D (arquivo OBJ)
        objLoader.load(
            'apple_final.obj',
            (object) => {
                object3D = object;

                // Percorre todas as partes (meshes) do objeto e atualiza suas propriedades
                object.traverse((child) => {
                    if (child.isMesh) {
                        if (child.material) {
                            child.material.needsUpdate = true;
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    }
                });
                
                // Centraliza o objeto na cena utilizando o centro da caixa delimitadora
                const box = new THREE.Box3().setFromObject(object);
                const center = box.getCenter(new THREE.Vector3());
                object.position.sub(center);
                
                // Redimensiona o objeto proporcionalmente se seu tamanho for maior que um limite
                const size = box.getSize(new THREE.Vector3());
                const maxSize = Math.max(size.x, size.y, size.z);
                if (maxSize > 2) {
                    const scale = 2 / maxSize;
                    object.scale.set(scale, scale, scale);
                }
                
                // Adiciona o objeto carregado à cena
                scene.add(object);
            },
            (xhr) => {
                // Exibe no console o progresso do carregamento do arquivo OBJ
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                // Exibe no console qualquer erro ocorrido durante o carregamento do OBJ
                console.error('Error loading OBJ:', error);
            }
        );
    },
    (xhr) => {
        // Exibe no console o progresso do carregamento do arquivo MTL
        console.log((xhr.loaded / xhr.total * 100) + '% MTL loaded');
    },
    (error) => {
        // Exibe no console qualquer erro ocorrido durante o carregamento do MTL
        console.error('Error loading MTL:', error);
    }
);

// Atualiza as configurações do renderizador e da câmera quando a janela for redimensionada
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Loop de animação para atualizar os controles e renderizar a cena continuamente
function animate() {
    controls.update(); // Atualiza o OrbitControls para suavizar as interações do usuário
    
    if (object3D) {
        object3D.rotation.y += 0.01; // Rotaciona continuamente o objeto para uma visão dinâmica
    }
    
    renderer.render(scene, camera); // Renderiza a cena a partir da perspectiva da câmera
}

// Inicia o loop de animação
renderer.setAnimationLoop(animate);

