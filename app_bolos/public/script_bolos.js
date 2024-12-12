import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let camera, controls, scene, renderer;
let textureLoader;
const clock = new THREE.Clock();

const mouseCoords = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const ballMaterial = new THREE.MeshPhongMaterial({ color: 0x202020 });
const pinMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff }); // Material para los bolos

let play = false;
let throwBall = false;
let selectedBall = 0;
let selectedLane = 0;

let currentTurn = 1; // Indica el turno actual (1 o 2)
let launchCount = 0; // Contador de lanzamientos por turno
const maxLaunches = 2; // Límite de lanzamientos por turno


const lanes = {
    firstLane : {x: 0, z: 0, pins: []},
    secondLane : {x: 0, z: 0, pins: []},
    thirdLane : {x: 0, z: 0, pins: []},
    fourthLane : {x: 0, z: 0, pins: []},
    fifthLane : {x: 0, z: 0, pins: []}
}


const balls = {
    blueBall: {
        mass: 60,
        radius: 0.35,
        texture: new THREE.TextureLoader().load(
        "https://cdn.glitch.global/8d9e1079-91ec-4cb0-bc1a-9622e9043e1b/blue_ball.jpg?v=1733240230423"
      )
    },
    redBall: {
        mass: 80,
        radius: 0.4,
        texture: new THREE.TextureLoader().load(
        "https://cdn.glitch.global/8d9e1079-91ec-4cb0-bc1a-9622e9043e1b/red_ball.jpg?v=1733241624606"
      )
    },

    greenBall: {
        mass: 100,
        radius: 0.45,
        texture: new THREE.TextureLoader().load(
        "https://cdn.glitch.global/8d9e1079-91ec-4cb0-bc1a-9622e9043e1b/green_ball.jpg?v=1733241662322"
      )
    },
}


const cameras = {
    views: { 
        start: {x: 40, y: 25, z: 55}, 
        firstLane: {x: -12, y: 4, z: 31}, 
        secondLane: {x: -6, y: 4, z: 31}, 
        thirdLane: {x: 0, y: 4, z: 31}, 
        fourthLane: {x: 6, y: 4, z: 31}, 
        fifthLane: {x: 12, y: 4, z: 31}
    },

    targets: { 
        firstLane: {x: -12, y: 2, z: 0}, 
        secondLane: {x: -6, y: 2, z: 0}, 
        thirdLane: {x: 0, y: 2, z: 0}, 
        fourthLane: {x: 6, y: 2, z: 0}, 
        fifthLane: {x: 12, y: 2, z: 0}
    }
}


// Mundo físico con Ammo
let physicsWorld;
const gravityConstant = 7.8;
let collisionConfiguration;
let dispatcher;
let broadphase;
let solver;
const margin = 0.05; //margen colisiones

// Objetos rígidos
const rigidBodies = [];

const pos = new THREE.Vector3();
const quat = new THREE.Quaternion();
//Variables temporales para actualizar transformación en el bucle
let transformAux1;
let tempBtVec3_1;

//Inicialización ammo
Ammo().then(function (AmmoLib) {
  Ammo = AmmoLib;

  init();
  animationLoop();
});

function init() {
  //Elementos gráficos
  initGraphics();
  //Elementos del mundo físico
  initPhysics();
  //Objetos
  //createObjects();
  createBowlingLanes();
  //Eventos
  initInput();
  // Botones
  buttonConfig();
  buttonEvents();
}


function buttonConfig() {
    if (play) {
        document.getElementById('lane1').style.display = 'none';
        document.getElementById('lane2').style.display = 'none';
        document.getElementById('lane3').style.display = 'none';
        document.getElementById('lane4').style.display = 'none';
        document.getElementById('lane5').style.display = 'none';
        document.getElementById('title').style.display = 'none';
        document.getElementById('back').style.display = 'block';
        document.getElementById('blueBallButton').style.display = 'block';
        document.getElementById('redBallButton').style.display = 'block';
        document.getElementById('greenBallButton').style.display = 'block';
        document.getElementById('throwButton').style.display = 'block';
        document.getElementById('endButton').style.display = 'block';
    }
    else {
        document.getElementById('lane1').style.display = 'block';
        document.getElementById('lane2').style.display = 'block';
        document.getElementById('lane3').style.display = 'block';
        document.getElementById('lane4').style.display = 'block';
        document.getElementById('lane5').style.display = 'block';
        document.getElementById('title').style.display = 'block';
        document.getElementById('back').style.display = 'none';
        document.getElementById('blueBallButton').style.display = 'none';
        document.getElementById('redBallButton').style.display = 'none';
        document.getElementById('greenBallButton').style.display = 'none';
        document.getElementById('throwButton').style.display = 'none';
        document.getElementById('endButton').style.display = 'none';
        document.getElementById('playerChangeWarning').style.display = 'none';
    }
}


function buttonEvents() {
    
    document.getElementById('lane1').addEventListener('click', function() {
        camera.position.set(cameras.views.firstLane.x, cameras.views.firstLane.y, cameras.views.firstLane.z);  
        controls.target.set(cameras.targets.firstLane.x, cameras.targets.firstLane.y, cameras.targets.firstLane.z);
        controls.update();
        selectedLane = 1;
        play = true;
        buttonConfig();          
      });
    
    document.getElementById('lane2').addEventListener('click', function() {
        camera.position.set(cameras.views.secondLane.x, cameras.views.secondLane.y, cameras.views.secondLane.z);  
        controls.target.set(cameras.targets.secondLane.x, cameras.targets.secondLane.y, cameras.targets.secondLane.z);
        controls.update();
        selectedLane = 2;
        play = true;
        buttonConfig();
    });

    document.getElementById('lane3').addEventListener('click', function() {
        camera.position.set(cameras.views.thirdLane.x, cameras.views.thirdLane.y, cameras.views.thirdLane.z);  
        controls.target.set(cameras.targets.thirdLane.x, cameras.targets.thirdLane.y, cameras.targets.thirdLane.z);
        controls.update();
        selectedLane = 3;
        play = true;
        buttonConfig();
    });
    
    document.getElementById('lane4').addEventListener('click', function() {
        camera.position.set(cameras.views.fourthLane.x, cameras.views.fourthLane.y, cameras.views.fourthLane.z);  
        controls.target.set(cameras.targets.fourthLane.x, cameras.targets.fourthLane.y, cameras.targets.fourthLane.z);
        controls.update();
        selectedLane = 4;
        play = true;
        buttonConfig();
    });

    document.getElementById('lane5').addEventListener('click', function() {
        camera.position.set(cameras.views.fifthLane.x, cameras.views.fifthLane.y, cameras.views.fifthLane.z);  
        controls.target.set(cameras.targets.fifthLane.x, cameras.targets.fifthLane.y, cameras.targets.fifthLane.z);
        controls.update();
        selectedLane = 5;
        play = true;
        buttonConfig();
    });

    document.getElementById('back').addEventListener('click', function() {
        camera.position.set(cameras.views.start.x, cameras.views.start.y, cameras.views.start.z);  
        controls.target.set(cameras.targets.thirdLane.x, cameras.targets.thirdLane.y, cameras.targets.thirdLane.z);
        controls.update();
        selectedLane = 0;
        play = false;
        buttonConfig();
    });

    document.getElementById('blueBallButton').addEventListener('click', function() {
        selectedBall = 0;
    });

    document.getElementById('redBallButton').addEventListener('click', function() {
        selectedBall = 1;
    });

    document.getElementById('greenBallButton').addEventListener('click', function() {
        selectedBall = 2;
    });

    document.getElementById('throwButton').addEventListener('click', function() {
        throwBall = true;
    });

    document.getElementById('endButton').addEventListener('click', function() {
        throwBall = false;
    });
}


function initGraphics() {
  //Cámara, escena, renderer y control de cámara
  camera = new THREE.PerspectiveCamera(
    30,
    window.innerWidth / window.innerHeight,
    0.2,
    2000
  );
  
  textureLoader = new THREE.TextureLoader();
  scene = new THREE.Scene();
  textureLoader.load(
    "https://cdn.glitch.global/8d9e1079-91ec-4cb0-bc1a-9622e9043e1b/fondo.png?v=1733181375346",
    function (texture) {
      scene.background = texture; // Establece la textura como fondo
    }
  );
  camera.position.set(cameras.views.start.x, cameras.views.start.y, cameras.views.start.z);  
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(cameras.targets.thirdLane.x, cameras.targets.thirdLane.y, cameras.targets.thirdLane.z);
  controls.update();

  //Luces
  const ambientLight = new THREE.AmbientLight(0x707070);
  scene.add(ambientLight);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 40, 5);
  light.castShadow = true;
  const d = 14;
  light.shadow.camera.left = -d;
  light.shadow.camera.right = d;
  light.shadow.camera.top = d;
  light.shadow.camera.bottom = -d;

  light.shadow.camera.near = 2;
  light.shadow.camera.far = 50;

  light.shadow.mapSize.x = 1024;
  light.shadow.mapSize.y = 1024;

  scene.add(light);
  //Redimensión de la ventana
  window.addEventListener("resize", onWindowResize);
}

function initPhysics() {
  // Configuración Ammo
  // Colisiones
  collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
  // Gestor de colisiones convexas y cóncavas
  dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
  // Colisión fase amplia
  broadphase = new Ammo.btDbvtBroadphase();
  // Resuelve resricciones de reglas físicas como fuerzas, gravedad, etc.
  solver = new Ammo.btSequentialImpulseConstraintSolver();
  // Crea en mundo físico
  physicsWorld = new Ammo.btDiscreteDynamicsWorld(
    dispatcher,
    broadphase,
    solver,
    collisionConfiguration
  );
  // Establece gravedad
  physicsWorld.setGravity(new Ammo.btVector3(0, -gravityConstant, 0));

  transformAux1 = new Ammo.btTransform();
  tempBtVec3_1 = new Ammo.btVector3(0, 0, 0);
}

  
function createBowlingLanes() {
    const laneWidth = 6; // Ancho de cada calle
    const laneLength = 40; // Longitud de las calles
    const totalWidth = laneWidth * 5; // Ancho total del suelo
  
    pos.set(0, -0.5, 0);
    quat.set(0, 0, 0, 1);
  
    // Suelo general
    const suelo = createBoxWithPhysics(
      totalWidth, 
      1, 
      laneLength, 
      0, 
      pos, 
      quat, 
      new THREE.MeshPhongMaterial({ color: 0xffffff })
    );
    suelo.receiveShadow = true;
  
    // Textura del suelo
    textureLoader.load(
        "https://cdn.glitch.global/8d9e1079-91ec-4cb0-bc1a-9622e9043e1b/wood_texture.jpg?v=1733158044140",
      function (texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(10, 40); // Repetir la textura en el suelo
        suelo.material.map = texture;
        suelo.material.needsUpdate = true;
      }
    );
  
    // Crear las líneas que dividen las calles
    for (let i = 0; i <= 5; i++) {
      const dividerWidth = 0.25; // Ancho de la línea divisoria
      const dividerLength = laneLength;
  
      const dividerPos = new THREE.Vector3(
        i * laneWidth - totalWidth / 2, // Coloca las líneas de separación
        0,
        0
      );
  
      createBoxWithPhysics(
        dividerWidth,
        0.1, // Altura mínima para ser visual
        dividerLength,
        0, // Sin masa, objeto estático
        dividerPos,
        quat,
        new THREE.MeshPhongMaterial({ color: 0x00000f }) // Negro para las líneas
      );
    }

    initLanes([-laneWidth*2, -laneWidth, 0, laneWidth, laneWidth*2], -17);
    return suelo;
}


function initLanes(xPos, zPos){
    lanes.firstLane.x = xPos[0];
    lanes.firstLane.z = zPos;
    lanes.firstLane.pins = createBowlingPins(xPos[0], zPos, pinMaterial, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 1); // Coloca los bolos en el 1 carril

    lanes.secondLane.x = xPos[1];
    lanes.secondLane.z = zPos;
    lanes.secondLane.pins = createBowlingPins(xPos[1], zPos, pinMaterial, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 2); // Coloca los bolos en el 2 carril

    lanes.thirdLane.x = xPos[2];
    lanes.thirdLane.z = zPos;
    lanes.thirdLane.pins = createBowlingPins(xPos[2], zPos, pinMaterial, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3); // Coloca los bolos en el 3 carril

    lanes.fourthLane.x = xPos[3];
    lanes.fourthLane.z = zPos;
    lanes.fourthLane.pins = createBowlingPins(xPos[3], zPos, pinMaterial, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 4); // Coloca los bolos en el 4 carril

    lanes.fifthLane.x = xPos[4];
    lanes.fifthLane.z = zPos;
    lanes.fifthLane.pins = createBowlingPins(xPos[4], zPos, pinMaterial, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5); // Coloca los bolos en el 5 carril
}
  
  
function createBowlingPins(baseX, baseZ, material, pinsToGenerate, lane) {
    const spacing = 0.8; // Separación entre bolos
    const pinHeight = 1.2;
    const createdPins = []; // Array para almacenar los bolos creados

    // Define el patrón triangular para los bolos
    const positions = [
        { xOffset: 0, zOffset: 0 }, // Bolo 1
        { xOffset: -spacing / 2, zOffset: -spacing }, // Bolo 2
        { xOffset: spacing / 2, zOffset: -spacing }, // Bolo 3
        { xOffset: -spacing, zOffset: -2 * spacing }, // Bolo 4
        { xOffset: 0, zOffset: -2 * spacing }, // Bolo 5
        { xOffset: spacing, zOffset: -2 * spacing }, // Bolo 6
        { xOffset: -1.5 * spacing, zOffset: -3 * spacing }, // Bolo 7
        { xOffset: -0.5 * spacing, zOffset: -3 * spacing }, // Bolo 8
        { xOffset: 0.5 * spacing, zOffset: -3 * spacing }, // Bolo 9
        { xOffset: 1.5 * spacing, zOffset: -3 * spacing }, // Bolo 10
    ];

    // Crear solo los bolos indicados en el arreglo `pinsToGenerate`
    pinsToGenerate.forEach((pinIndex) => {
        if (pinIndex >= 1 && pinIndex <= positions.length) {
            const offset = positions[pinIndex - 1]; // -1 para convertir índice humano (1-10) al índice de arreglo (0-9)
            const pos = new THREE.Vector3(
                baseX + offset.xOffset, // Ajusta con el desplazamiento en X
                pinHeight / 2, // Altura del bolo para colocarlo sobre el suelo
                baseZ + offset.zOffset // Ajusta con el desplazamiento en Z
            );
            const quat = new THREE.Quaternion(0, 0, 0, 1);

            // Crear bolo y almacenar referencia
            const pin = createBowlingPin(pos, quat, material, pinIndex, lane);
            createdPins.push(pin);
        }
    });

    return createdPins; // Devuelve el array con los bolos creados
}

    


function createBoxWithPhysics(sx, sy, sz, mass, pos, quat, material) {
  const object = new THREE.Mesh(
    new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1),
    material
  );
  //Estructura geométrica de colisión
  //Crea caja orientada en el espacio, especificando dimensiones
  const shape = new Ammo.btBoxShape(
    new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5)
  );
  //Margen para colisione
  shape.setMargin(margin);

  createRigidBody(object, shape, mass, pos, quat);

  return object;
}

//Creación de cuerpo rígido, con masa, sujeto a fuerzas, colisiones...
function createRigidBody(object, physicsShape, mass, pos, quat, vel, angVel) {
  //Posición
  if (pos) {
    object.position.copy(pos);
  } else {
    pos = object.position;
  }
  //Cuaternión, es decir orientación
  if (quat) {
    object.quaternion.copy(quat);
  } else {
    quat = object.quaternion;
  }
  //Matriz de transformación
  const transform = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
  transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
  const motionState = new Ammo.btDefaultMotionState(transform);
  //Inercia inicial y parámetros de rozamiento, velocidad
  const localInertia = new Ammo.btVector3(0, 0, 0);
  physicsShape.calculateLocalInertia(mass, localInertia);
  //Crea el cuerpo
  const rbInfo = new Ammo.btRigidBodyConstructionInfo(
    mass,
    motionState,
    physicsShape,
    localInertia
  );
  const body = new Ammo.btRigidBody(rbInfo);

  body.setFriction(0.5);

  if (vel) {
    body.setLinearVelocity(new Ammo.btVector3(vel.x, vel.y, vel.z));
  }

  if (angVel) {
    body.setAngularVelocity(new Ammo.btVector3(angVel.x, angVel.y, angVel.z));
  }

  //Enlaza primitiva gráfica con física
  object.userData.physicsBody = body;
  object.userData.collided = false;

  scene.add(object);
  //Si tiene masa
  if (mass > 0) {
    rigidBodies.push(object);
    // Disable deactivation
    body.setActivationState(4);
  }
  //Añadido al universo físico
  physicsWorld.addRigidBody(body);
  return body;
}


function createBowlingPin(pos, quat, material, index, lane) {
    const pinHeight = 1.2;
    const baseRadius = 0.2;
    const neckRadius = 0.1;
    const headRadius = 0.15;

    const pinGroup = new THREE.Group();

    // Crear geometría del bolo
    const baseHeight = pinHeight * 0.5;
    const baseGeometry = new THREE.CylinderGeometry(baseRadius, baseRadius * 0.7, baseHeight, 32);
    const base = new THREE.Mesh(baseGeometry, material);
    base.position.y = baseHeight / 2;
    base.castShadow = true;
    pinGroup.add(base);

    const neckHeight = pinHeight * 0.3;
    const neckGeometry = new THREE.CylinderGeometry(neckRadius, baseRadius, neckHeight, 32);
    const neck = new THREE.Mesh(neckGeometry, material);
    neck.position.y = baseHeight + neckHeight / 2;
    neck.castShadow = true;
    pinGroup.add(neck);

    const headGeometry = new THREE.SphereGeometry(headRadius, 32, 32);
    const head = new THREE.Mesh(headGeometry, material);
    head.position.y = baseHeight + neckHeight + headRadius;
    head.castShadow = true;
    pinGroup.add(head);

    pinGroup.position.copy(pos);
    pinGroup.quaternion.copy(quat);

    // Física del bolo
    const shape = new Ammo.btCompoundShape();
    const baseTransform = new Ammo.btTransform();
    baseTransform.setIdentity();
    baseTransform.setOrigin(new Ammo.btVector3(0, baseHeight / 2, 0));
    const baseShape = new Ammo.btCylinderShape(new Ammo.btVector3(baseRadius, baseHeight / 2, baseRadius));
    shape.addChildShape(baseTransform, baseShape);

    const mass = 1.5;
    shape.setMargin(0.02);
    const body = createRigidBody(pinGroup, shape, mass, pos, quat);

    body.setFriction(0.6);
    body.setRestitution(0.05);

    // Asociar datos adicionales al bolo
    pinGroup.userData = {
        isPin: true,
        pinIndex: index,
        lane: lane,
        physicsBody: body, // Almacenar referencia al cuerpo físico
    };

    scene.add(pinGroup); // Añadir bolo a la escena
    return pinGroup;
}


//Evento de ratón
function initInput() {
  window.addEventListener("pointerdown", function (event) {

    if (play && throwBall) {

        if (launchCount >= maxLaunches) {
            document.getElementById('playerChangeWarning').style.display = 'block';
            return;
        }
        document.getElementById('playerChangeWarning').style.display = 'none';
        
        //Coordenadas del puntero
        mouseCoords.set(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );
        raycaster.setFromCamera(mouseCoords, camera);
    
        const ballSelected = getSelectedBall();
        const ball = new THREE.Mesh(
            new THREE.SphereGeometry(ballSelected.radius, 32, 32),
            new THREE.MeshStandardMaterial({
                map: ballSelected.texture, // Textura al material
                roughness: 0.5,   // Nivel de aspereza 
                metalness: 0.3,   // Apariencia metálica
            })
        );
        ball.castShadow = true;
        ball.receiveShadow = true;
        //Ammo
        //Estructura geométrica de colisión esférica
        const ballShape = new Ammo.btSphereShape(ballSelected.radius);
        ballShape.setMargin(margin);
        pos.copy(raycaster.ray.direction);
        pos.add(raycaster.ray.origin);
        quat.set(0, 0, 0, 1);
        const ballBody = createRigidBody(ball, ballShape, ballSelected.mass, pos, quat);
    
        pos.copy(raycaster.ray.direction);
        pos.multiplyScalar(24);
        ballBody.setLinearVelocity(new Ammo.btVector3(pos.x, pos.y, pos.z));

        // Incrementar contador de lanzamientos
        launchCount++;
        throwBall = false;

        // Verificar si el turno ha terminado
        if (launchCount >= maxLaunches) {
            nextTurn();
        }
    }        
  });
}


// Cambiar al siguiente turno
function nextTurn() {
    setTimeout(() => {
        document.getElementById('playerChangeWarning').style.display = 'block';
        launchCount = 0; // Reiniciar contador de lanzamientos
        currentTurn = currentTurn === 1 ? 2 : 1; // Alternar entre los turnos 1 y 2
        refillLane(selectedLane, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        }, 5000);
}


function getSelectedBall() {
    if (selectedBall == 1) {
        return balls.redBall;
    }
    else if (selectedBall == 2) {
        return balls.greenBall;
    }
    return balls.blueBall;
}





function refillLane(lane, pins) {
    // Identificar los bolos del carril
    let lanePins;
    if (lane == 1) {
        lanePins = lanes.firstLane.pins;
    } else if (lane == 2) {
        lanePins = lanes.secondLane.pins;
    } else if (lane == 3) {
        lanePins = lanes.thirdLane.pins;
    } else if (lane == 4) {
        lanePins = lanes.fourthLane.pins;
    } else if (lane == 5) {
        lanePins = lanes.fifthLane.pins;
    } else {
        return; // Si el carril no es válido, salir
    }

    // Eliminar cuerpos rígidos existentes
    if (lanePins && lanePins.length > 0) {
        lanePins.forEach(pin => {
            if (pin.userData && pin.userData.physicsBody) {
                // Eliminar del mundo físico
                physicsWorld.removeRigidBody(pin.userData.physicsBody);

                // Eliminar del arreglo de cuerpos rígidos
                const index = rigidBodies.indexOf(pin);
                if (index > -1) {
                    rigidBodies.splice(index, 1);
                }

                // Eliminar el bolo de la escena
                scene.remove(pin);
            }
        });
    }

    // Reponer los bolos del carril
    let laneData;
    if (lane == 1) laneData = lanes.firstLane;
    else if (lane == 2) laneData = lanes.secondLane;
    else if (lane == 3) laneData = lanes.thirdLane;
    else if (lane == 4) laneData = lanes.fourthLane;
    else if (lane == 5) laneData = lanes.fifthLane;

    if (laneData) {
        laneData.pins = createBowlingPins(laneData.x, laneData.z, pinMaterial, pins);
    }
}


function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animationLoop() {
  requestAnimationFrame(animationLoop);

  const deltaTime = clock.getDelta();
  updatePhysics(deltaTime);

  renderer.render(scene, camera);
}

function updatePhysics(deltaTime) {
  // Avanza la simulación en función del tiempo
  physicsWorld.stepSimulation(deltaTime, 10);

  // Actualiza cuerpos rígidos
  for (let i = 0, il = rigidBodies.length; i < il; i++) {
    const objThree = rigidBodies[i];
    const objPhys = objThree.userData.physicsBody;
    //Obtiene posición y rotación
    const ms = objPhys.getMotionState();
    //Actualiza la correspondiente primitiva gráfica asociada
    if (ms) {
      ms.getWorldTransform(transformAux1);
      const p = transformAux1.getOrigin();
      const q = transformAux1.getRotation();
      objThree.position.set(p.x(), p.y(), p.z());
      objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());

      objThree.userData.collided = false;
    }
  }
}

