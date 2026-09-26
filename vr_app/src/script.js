// Imports 
import * as THREE from 'three';
import * as NEXUS from './Nexus3D.js'
import { Monitor } from './Monitor.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BoxLineGeometry } from 'three/addons/geometries/BoxLineGeometry.js';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { createText } from 'three/addons/webxr/Text2D.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';

// https://github.com/felixmariotto/three-mesh-ui
// import VRControl from './utils/VRControl.js';
import ThreeMeshUI from 'three-mesh-ui';
import controlsImage from "/controls.jpeg";

import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { rotate } from 'three/tsl';

// models aïllats:
// https://threejs.org/examples/webgl_clipping.html

let scene, renderer, camera, controls, clock, delta, raycaster, controller1, controller2, helpersGroup, pointer, intersected = [];

let baseReferenceSpace, z_shift = 20, xrRotationY = 0, xrPosition = { x: 0, y: 0, z: -z_shift };

let prevA = false, prevB = false, prevX = false, prevY = false, prevJ = false, prevK = false, lockJ = true, lockK = true, button1Pressed = false, button2Pressed = false, joyPressed = false, lockSelect = false;

let altarpiece_text_material, altarpiece_solid_material, altarpiece_gold_material;

let lightsGroup, directionalLight, spotLight_right, spotLight_left, flashlight1, flashlight2, spotLight_cupula;

let mainModelsGroup, floor, grid, marker1, marker2;

let primaryModelsGroup, primaryTargetError, altarpiece_struct, altarpiece, altarpiece_gold, altarpieceC, altarpieceC_gold, church;

let secondaryModelsGroup, secondaryTargetError, model, model_gold, base, button, Clipping;

// PANELLS AFEGITS
let hotspotModelsGroup, panel_9, panel_12, panel_8, panel_2, panel_3, panel_13, panel_10, panel_11, panel_14, panel_6, panel_7, panel_15, panel_4, panel_1, door_1, door_2, square_1, square_2, panel_5;

// ---- PELS BOTONS I TEXT INICIAL ---- //
let meshContainer, meshes, currentMesh;
let closeButtonHiddenManually = false;
let selectState = false;
const objsToTest = [];

let clippingActive = false;

init();

function init() {

    // Scene

    scene = new THREE.Scene();
    //    window.scene = scene; //debugging

    //    scene.background = new THREE.Color( 0x505050 );
    //    scene.fog = new THREE.Fog( 0x050505, 100, 1000 );

    new THREE.TextureLoader().load('./adb_2k.jpg', function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;

        scene.background = texture;
        //        scene.environment = texture;

        scene.backgroundRotation.y += Math.PI / 2;
        scene.environmentRotation.y += Math.PI / 2;
    });

    // Renderer

    renderer = new THREE.WebGLRenderer({ antialias: true });
    //renderer.setClearColor( scene.fog.color );
    renderer.autoClear = false;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    //renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

    //renderer.toneMapping = THREE.ACESFilmicToneMapping;
    //renderer.toneMappingExposure = 1; //default

    //renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.xr.enabled = true;
    renderer.setAnimationLoop(animate);
    renderer.xr.setFoveation(0);

    document.body.appendChild(renderer.domElement);
    document.body.appendChild(VRButton.createButton(renderer));

    // Camera

    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.8, z_shift);

    // Controls 

    controls = new OrbitControls(camera, renderer.domElement);

    let controls_options = {
        rotateSpeed: 0.5,
        zoomSpeed: 4,
        panSpeed: 0.8,
        noZoom: false,
        noPan: false,
        enableDamping: true,
        staticMoving: true,
        dynamicDampingFactor: 0.3,
        target: new THREE.Vector3(0, 1, 0),
    }
    for (const [key, value] of Object.entries(controls_options))
        controls[key] = value;

    controls.update();

    // Lights. 
    // // ---- HE BORRAT TOTES MENYS AMBIENT LIGHT I LES DE LA CAPELLA PERQUÈ HE BAKED TEXTURA DE L'ESGLÉSIA AMB OBJECTIU DE NO UTILITZAR TANTA MEMORIA (Q IGUAL NO SÉ MIRAR JEJ) ---- //

    lightsGroup = new THREE.Group();
    lightsGroup.name = 'lightsGroup';
    scene.add(lightsGroup);
    helpersGroup = new THREE.Group();
    helpersGroup.name = 'helpersGroup';
    // scene.add( helpersGroup );

    scene.add(new THREE.AmbientLight(0xffffff, 0.2)); //0.2

    // const hemisphereLight = new THREE.HemisphereLight( 0xffffff, 0x080820, 0.2);
    // scene.add( hemisphereLight );


    //    const hemisphereHelper = new THREE.HemisphereLightHelper( hemisphereLight );  
    //    helpersGroup.add( hemisphereHelper );

    //     directionalLight = new THREE.DirectionalLight( 0xffffff, 5 );
    //     directionalLight.position.set( -15, 35, 0 );
    // 	directionalLight.target.position.x = -15;
    //     directionalLight.target.position.z = 25;
    //     directionalLight.target.updateMatrixWorld();
    //     directionalLight.castShadow = true;	
    //     directionalLight.shadow.mapSize.width = 8192;  // default
    //     directionalLight.shadow.mapSize.height = 8192; // default
    // //    directionalLight.shadow.camera.near = 0.5;       // default
    //     directionalLight.shadow.camera.far = 50;       
    //     directionalLight.shadow.camera.left = - 40;
    //     directionalLight.shadow.camera.right = 40;
    //     directionalLight.shadow.camera.top = 40;
    //     directionalLight.shadow.camera.bottom = - 40;
    // //    directionalLight.shadow.bias = - 0.01; 
    // //    directionalLight.shadow.radius = 10; 
    //     directionalLight.shadow.normalBias = 0.5; 
    // //    directionalLight.shadow.blurSamples = 16; 
    //     if (renderer.shadowMap.enabled) scene.add( directionalLight );
    // //    const directionalHelper = new THREE.DirectionalLightHelper( directionalLight );
    //    const directionalHelper = new THREE.CameraHelper( directionalLight.shadow.camera );
    //    helpersGroup.add( directionalHelper );

    spotLight_right = new THREE.SpotLight(0xffffdd, 75, 10.0, -Math.PI / 4.0, 0.5, 2);
    spotLight_right.position.set(4.0, 5.0, 4.5);
    spotLight_right.target.position.set(-1.5, 2.5, -4.5);
    spotLight_right.target.updateMatrixWorld();
    spotLight_right.castShadow = true;
    //    spotLight_right.shadow.mapSize.width = 512;  // default
    //    spotLight_right.shadow.mapSize.height = 512; // default
    //    spotLight_right.shadow.camera.near = 0.5;       // default
    spotLight_right.shadow.camera.far = 10;
    //    spotLight_right.shadow.camera.fov = 90;
    //    spotLight_right.shadow.bias = - 0.0001; 
    //    spotLight_right.shadow.radius = 10; 
    spotLight_right.shadow.normalBias = 0.1;
    //    spotLight_right.shadow.blurSamples = 16; 
    lightsGroup.add(spotLight_right);
    //	const spotrightHelper = new THREE.SpotLightHelper( spotLight_right );
    //	const spotrightHelper = new THREE.CameraHelper( spotLight_right.shadow.camera );
    //	helpersGroup.add( spotrightHelper );

    spotLight_left = new THREE.SpotLight(0xffffdd, 75, 10.0, -Math.PI / 4.0, 0.5, 2);
    spotLight_left.position.set(-3.5, 5.0, 4.5);
    spotLight_left.target.position.set(2.25, 2.5, -4.5);
    spotLight_left.target.updateMatrixWorld();
    spotLight_left.castShadow = true;
    //    spotLight_left.shadow.mapSize.width = 512;  // default
    //    spotLight_left.shadow.mapSize.height = 512; // default
    //    spotLight_left.shadow.camera.near = 0.5;       // default
    spotLight_left.shadow.camera.far = 10;
    //    spotLight_left.shadow.camera.fov = 90;
    //    spotLight_left.shadow.bias = - 0.0001; 
    //    spotLight_left.shadow.radius = 10; 
    spotLight_left.shadow.normalBias = 0.1;
    spotLight_left.shadow.blurSamples = 16;
    lightsGroup.add(spotLight_left);
    // const spotleftHelper = new THREE.SpotLightHelper( spotLight_left );
    // const spotleftHelper = new THREE.CameraHelper( spotLight_left.shadow.camera );
    // helpersGroup.add( spotleftHelper );

    // ---- AIXO HO VAIG POSAR JO? LLUMS CUPULA ---- //
    spotLight_cupula = new THREE.SpotLight(0xffffeb, 150, 0.0, -Math.PI / 3, 0.5, 2);
    spotLight_cupula.position.set(0.2, 14.5, 4.5);
    spotLight_cupula.target.position.set(0.2, 10.5, -30);
    spotLight_cupula.target.updateMatrixWorld();
    spotLight_cupula.castShadow = true;
    //    spotLight_left.shadow.mapSize.width = 512;  // default
    //    spotLight_left.shadow.mapSize.height = 512; // default
    //    spotLight_left.shadow.camera.near = 0.5;       // default
    spotLight_cupula.shadow.camera.far = 10;
    //    spotLight_left.shadow.camera.fov = 90;
    //    spotLight_left.shadow.bias = - 0.0001; 
    //    spotLight_left.shadow.radius = 10; 
    spotLight_cupula.shadow.normalBias = 0.1;
    //    spotLight_left.shadow.blurSamples = 16; 
    lightsGroup.add(spotLight_cupula);
    const spotcupulaHelper = new THREE.SpotLightHelper(spotLight_cupula);
    // const spotcupulaHelper = new THREE.CameraHelper( spotLight_cupula.shadow.camera );
    // helpersGroup.add( spotcupulaHelper );

    flashlight1 = new THREE.SpotLight(0xffffbb, 1.0, 10.0, Math.PI / 4.0, 0.5, 2);
    flashlight1.position.set(0.0, 0.0, 0.0);   //same position as controller
    flashlight1.target.position.z = -1.0;        //front
    flashlight1.target.updateMatrixWorld();
    flashlight1.power = 0; //default 1000
    //    flashlight1.castShadow = true;	
    //    flashlight1.shadow.mapSize.width = 512;  // default
    //    flashlight1.shadow.mapSize.height = 512; // default
    //    flashlight1.shadow.camera.near = 0.5;       // default
    flashlight1.shadow.camera.far = 1;
    //    flashlight1.shadow.camera.fov = 90;
    //    flashlight1.shadow.bias = - 0.0001; 
    //    flashlight1.shadow.radius = 10; 
    flashlight1.shadow.normalBias = 0.005;
    //    flashlight1.shadow.blurSamples = 16; 
    flashlight1.name = 'flashlight';
    //	const flashHelper = new THREE.SpotLightHelper( flashlight1 );
    //	const flashHelper = new THREE.CameraHelper( flashlight1.shadow.camera );
    //	helpersGroup.add( flashHelper );

    flashlight2 = flashlight1.clone();

    // addPointLight(   0.2, 13.5,  1.3, 0xffffff, 50, 0, 1.5 );   //altarpiece
    // // // addPointLight(   0.2, 13.5,  1.3, 0xffffff, 250, 16, 2.75 );   //altarpiece

    // addPointLight( -38.0, 20.0, 19.7, 0xffffff, 500, 21, 3 );   //abside
    // addPointLight( -34.7, 20.0, 19.7, 0xffffff, 250, 20, 2 );   //central nave
    // addPointLight( -26.5, 20.0, 19.7, 0xffffff, 250, 20, 2 );   //central nave
    // addPointLight( -17.6, 20.0, 19.7, 0xffffff, 250, 20, 2 );   //central nave
    // addPointLight(  -8.7, 20.0, 19.7, 0xffffff, 250, 20, 2 );   //central nave
    // addPointLight(   0.2, 20.0, 19.7, 0xffffff, 250, 20, 2 );   //central nave

    // addPointLight(  13.0,  3.0, 13.2, 0xffffff,  20,  5, 2 );   //right door
    // addPointLight(  13.0,  3.0, 19.7, 0xffffff,  30,  8, 2 );   //central door
    // addPointLight(  13.0,  3.0, 26.5, 0xffffff,  20,  5, 2 );   //left door

    // Models

    primaryTargetError = 5.0; //define error tolerance for nexus models in primary scene
    secondaryTargetError = 0.0; //define error tolerance for nexus models in secondary scene

    NEXUS.Cache.maxCacheSize = 1024 * 1000000; //set maximum cache size for nexus models  
    NEXUS.Cache.targetError = primaryTargetError; //set error tolerance for nexus models in primary scene

    // ALTARPIECE MATERIALS START (TEXTURED + SOLID + GILDING) /////////////////////////////////////////////

    // ---- CANVIAT COLORS RETAULE
    altarpiece_text_material = new THREE.MeshPhysicalMaterial({
        //        color: 0xffffff, //default
        //        emissive: 0x000000,
        roughness: 0.35,
        metalness: 0.0,
        ior: 1.4, //index-of-refraction for non-metallic materials
        //        reflectivity: 0.0,
        //        iridescence: 1.0,
        //        iridescenceIOR: 1.4,
        clearcoat: 0.7,
        clearcoatRoughness: 0.3,
        specularIntensity: 0.7,
        //        side: THREE.DoubleSide,
    });

    // ---- CANVIAT COLOR SOLID, POTSER SERIA MÉS INTERESSANT POSAR COLORS DIFERENCIATS PER MISTERIS? ARA COLOR FUSTA
    altarpiece_solid_material = new THREE.MeshStandardMaterial({
        map: false, //disable texture map        
        color: 0x63361c, //color fusta
        //        side: THREE.DoubleSide, 
    });

    // ---- CANVIAT COLOR OR            
    altarpiece_gold_material = new THREE.MeshPhysicalMaterial({
        color: 0xfcc200,//0xF8D755,//0xbd9b16, // he posat color en lloc del del map?
        //        emissive: 0xffffff,
        roughness: 0.25,
        metalness: 0.75,
        //        ior: 2.3, //index-of-refraction for non-metallic materials
        reflectivity: 0.75,
        //        iridescence: 1.0,
        //        iridescenceIOR: 1.0,
        clearcoat: 1.0,
        clearcoatRoughness: 1.0,
        transparent: true,
        opacity: 1,
        specularIntensity: 1,
        //        side: THREE.DoubleSide,
    });

    // ALTARPIECE MATERIALS END (TEXTURED + SOLID + GILDING) ///////////////////////////////////////////////


    // MAIN MODELS GROUP START (FLOOR + GRID + MARKER) /////////////////////////////////////////////////////

    mainModelsGroup = new THREE.Group();
    mainModelsGroup.name = 'mainModelsGroup';
    scene.add(mainModelsGroup);

    floor = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 40, 2, 2).rotateX(- Math.PI / 2).translate(-16, 0, 16),
        new THREE.MeshStandardMaterial({ color: 0xbcbcbc, transparent: false })
    );
    floor.name = 'floor';
    floor.receiveShadow = true;
    mainModelsGroup.add(floor);

    grid = new THREE.LineSegments(
        new BoxLineGeometry(60, 0, 40, 50, 50, 50).translate(-16, 0.01, 16),
        new THREE.LineBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.5,
            depthTest: true,
            linewidth: 2,
        })
    );
    grid.name = 'grid';
    mainModelsGroup.add(grid);

    marker1 = new THREE.Mesh(
        new THREE.CircleGeometry(0.25, 32).rotateX(- Math.PI / 2),
        //		new THREE.CylinderGeometry(.3, .3, 0.01, 32),
        new THREE.MeshBasicMaterial({ color: 0xFDC148 })
    );
    marker1.name = 'marker1';
    marker1.visible = false;
    mainModelsGroup.add(marker1);

    marker2 = marker1.clone();
    marker2.name = 'marker2';
    mainModelsGroup.add(marker2);


    // MAIN MODELS GROUP END (FLOOR + GRID + MARKER) ///////////////////////////////////////////////////////


    // PRIMARY MODELS GROUP START (CHURCH + ALTARPIECE) ////////////////////////////////////////////////////

    primaryModelsGroup = new THREE.Group();
    primaryModelsGroup.name = 'primaryModelsGroup';
    scene.add(primaryModelsGroup);

    altarpiece_struct = new NEXUS.Nexus3D('./models/estructura.nxs', renderer, {
        onLoad: (nexus) => {
            const p = nexus.boundingSphere.center.negate();
            //        const s = 1/nexus.boundingSphere.radius;
            const s = 1.0; //scale
            nexus.position.set(p.x * s, p.y * s, p.z * s);
            nexus.scale.set(s, s, s);

            nexus.rotation.x += -Math.PI / 2;

            nexus.position.x -= 0.05;
            nexus.position.z += 7.65;
            nexus.position.y += 3.42;

            nexus.castShadow = true;
            nexus.receiveShadow = true;

            primaryModelsGroup.add(nexus);
        }, onUpdate: (nexus) => {
            //        console.log(nexus);
        }, onProgress: (nexus) => {
            //        console.log(nexus);
        }, function(error) {
            console.error(error);
        }
    });
    altarpiece_struct.name = 'altarpiece_struct';
    //    altarpiece_struct.material.needsUpdate = true;
    //    altarpiece_struct.cache.targetError = 1.0;
    //    const monitor = new Monitor(altarpiece_struct.cache, altarpiece_struct);

    altarpiece = new NEXUS.Nexus3D('./models/relleusetc.nxz', renderer, {
        onLoad: (nexus) => {
            const p = nexus.boundingSphere.center.negate();
            //      const s = 1/nexus.boundingSphere.radius;
            const s = 1.0; //scale
            nexus.position.set(p.x * s, p.y * s, p.z * s);
            nexus.scale.set(s, s, s);

            nexus.rotation.x += -Math.PI / 2;

            nexus.position.x += 0 + 0.2;
            nexus.position.z += 6.75 + 0.7;
            nexus.position.y += 3.29 - 0.075;

            nexus.castShadow = true;
            nexus.receiveShadow = true;

            mainModelsGroup.add(nexus);

            // store original transform
            nexus.userData.originalPosition = nexus.position.clone();
            nexus.userData.originalRotation = nexus.rotation.clone();
            nexus.userData.originalScale = nexus.scale.clone();
        }, onUpdate: (nexus) => {
            //        console.log(nexus);
        }, onProgress: (nexus) => {
            //        console.log(nexus);
        }, function(error) {
            console.error(error);
        }
    });
    altarpiece.material = altarpiece_text_material;
    altarpiece.name = 'altarpiece';
    //    altarpiece.material.needsUpdate = true;
    //    altarpiece.cache.targetError = 1.0;
    //    const monitor = new Monitor(altarpiece.cache, altarpiece);   

    altarpieceC = new NEXUS.Nexus3D('./models/columnesetc.nxz', renderer, {
        onLoad: (nexus) => {
            const p = nexus.boundingSphere.center.negate();
            //      const s = 1/nexus.boundingSphere.radius;
            const s = 1.0; //scale
            nexus.position.set(p.x * s, p.y * s, p.z * s);
            nexus.scale.set(s, s, s);

            nexus.rotation.x += -Math.PI / 2;

            nexus.position.x += 0 + 0.265;
            nexus.position.z += 6.75 - 0.1;
            nexus.position.y += 3.29 - 0.405;

            nexus.castShadow = true;
            nexus.receiveShadow = true;

            primaryModelsGroup.add(nexus);

            // store original transform
            nexus.userData.originalPosition = nexus.position.clone();
            nexus.userData.originalRotation = nexus.rotation.clone();
            nexus.userData.originalScale = nexus.scale.clone();
        }, onUpdate: (nexus) => {
            //        console.log(nexus);
        }, onProgress: (nexus) => {
            //        console.log(nexus);
        }, function(error) {
            console.error(error);
        }
    });
    altarpieceC.material = altarpiece_text_material;
    altarpieceC.name = 'altarpiece';
    //    altarpiece.material.needsUpdate = true;
    //    altarpiece.cache.targetError = 1.0;
    //    const monitor = new Monitor(altarpiece.cache, altarpiece);   

    altarpiece_gold = new NEXUS.Nexus3D('./models/relleusetc_gold.nxz', renderer, {
        onLoad: (nexus) => {
            const p = nexus.boundingSphere.center.negate();
            //  const s = 1/nexus.boundingSphere.radius;
            const s = 1.0; //scale
            nexus.position.set(p.x * s, p.y * s, p.z * s);
            nexus.scale.set(s, s, s);

            nexus.rotation.x += -Math.PI / 2;

            nexus.position.x += 0.0 + 0.535 - 0.059;  // dreta      
            nexus.position.y += 3.29 - 0.065 - 0.0388; // alçada
            nexus.position.z += 6.75 + 0.5 + 0.226; //endavant

            nexus.castShadow = true;
            nexus.receiveShadow = true;

            mainModelsGroup.add(nexus);

            nexus.userData.originalPosition = nexus.position.clone();
            nexus.userData.originalRotation = nexus.rotation.clone();
            nexus.userData.originalScale = nexus.scale.clone();
        }, onUpdate: (nexus) => {
            //        console.log(nexus);
        }, onProgress: (nexus) => {
            //        console.log(nexus);
        }, function(error) {
            console.error(error);
        }
    });
    altarpiece_gold.material = altarpiece_gold_material;
    altarpiece_gold.name = 'altarpiece_gold';
    //    altarpiece_gold.material.needsUpdate = true;
    //    altarpiece_gold.cache.targetError = 1.0;
    //    const monitor = new Monitor(altarpiece_gold.cache, altarpiece_gold);   

    altarpieceC_gold = new NEXUS.Nexus3D('./models/columnesetc_gold.nxz', renderer, {
        onLoad: (nexus) => {
            const p = nexus.boundingSphere.center.negate();
            //  const s = 1/nexus.boundingSphere.radius;
            const s = 1.0; //scale
            nexus.position.set(p.x * s, p.y * s, p.z * s);
            nexus.scale.set(s, s, s);

            nexus.rotation.x += -Math.PI / 2;

            nexus.position.x += 0.0 + 0.535 - 0.6317;
            nexus.position.z += 6.75 + 0.45 + 0.3;
            nexus.position.y += 3.29 - 0.065 + 0.028;

            nexus.castShadow = true;
            nexus.receiveShadow = true;

            primaryModelsGroup.add(nexus);

            nexus.userData.originalPosition = nexus.position.clone();
            nexus.userData.originalRotation = nexus.rotation.clone();
            nexus.userData.originalScale = nexus.scale.clone();
        }, onUpdate: (nexus) => {
            //        console.log(nexus);
        }, onProgress: (nexus) => {
            //        console.log(nexus);
        }, function(error) {
            console.error(error);
        }
    });
    altarpieceC_gold.material = altarpiece_gold_material;
    altarpieceC_gold.name = 'altarpiece_gold';
    //    altarpiece_gold.material.needsUpdate = true;
    //    altarpiece_gold.cache.targetError = 1.0;
    //    const monitor = new Monitor(altarpiece_gold.cache, altarpiece_gold);   

    // ---- HE POSAT EL MODEL D'ESGLESIA QUE TOCA, ARREGLADA ---- //
    // ---- HE POSAT UNA TEXTURA AMB LLUMS BAKED ---- //
    church = new THREE.Mesh();
    const plyLoader = new PLYLoader();
    plyLoader.load('./models/esglesia_v3.ply', function (geometry) {
        geometry.computeVertexNormals();
        var textureEsglesia = new THREE.TextureLoader().load('./models/v5_areesSenseCapella.jpg');
        // var textureEsglesia = new THREE.TextureLoader().load('./models/v2_areesAmbCapella.jpg');
        // var textureEsglesia = new THREE.TextureLoader().load('./models/v2_exteriorAmbCapella.jpg');
        // var textureEsglesia = new THREE.TextureLoader().load('./models/v2_exteriorSenseCapella.jpg');

        const material = new THREE.MeshStandardMaterial({
            flatShading: false
            , map: textureEsglesia
            // , color: 0xE7E7E7
            // , transparent: true
            // , opacity: 1
        });
        material.side = THREE.DoubleSide;
        church = new THREE.Mesh(geometry, material);

        church.rotation.x = -Math.PI / 2;
        church.rotation.z = Math.PI / 2;

        var box = new THREE.Box3().setFromObject(church);
        var center = new THREE.Vector3();
        box.getCenter(center);
        church.position.sub(center);

        church.position.x -= 16 + 0.66;
        church.position.y += 17;
        church.position.z += 16 - 2;
        church.scale.set(0.889, 0.889, 0.889);

        church.castShadow = true;
        church.receiveShadow = true;

        primaryModelsGroup.add(church);
    }, undefined, function (error) {
        console.error(error);
    });
    church.name = 'church';

    // PRIMARY MODELS GROUP END (CHURCH + ALTARPIECE) //////////////////////////////////////////////////////


    // SECONDARY MODELS GROUP START (BASE + BUTTON + PANELS*) ///////////////////////////////////////////////

    secondaryModelsGroup = new THREE.Group();
    secondaryModelsGroup.name = 'secondaryModelsGroup';
    //    scene.add( secondaryModelsGroup ); 

    base = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 0.7, 0.5),
        new THREE.MeshPhongMaterial({
            color: 0xa0adaf,
            shininess: 150,
            specular: 0x111111
        })
    );
    base.position.set(0.0, 0.35, 0.0);
    base.castShadow = true;
    base.receiveShadow = true;
    base.name = 'base';
    secondaryModelsGroup.add(base);

    // button = new THREE.Mesh( 
    //     new THREE.BoxGeometry(0.5, 0.3, 0.5),
    //     new THREE.MeshStandardMaterial({ color: 0xFB8460 }) 
    // );  
    button = new THREE.Mesh(
        new RoundedBoxGeometry(0.5, 0.2, 0.4, 50, 2),  // w, h, d, segments, radius
        new THREE.MeshStandardMaterial({
            color: 0x3B3B3B,
            transparent: true,
            opacity: 0.3
        })
    );

    button.quaternion.setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0, 'YXZ'));
    button.position.set(-1, 2.3, 0.0);
    button.scale.set(1, 0.2, 1);
    button.name = 'button';
    button.castShadow = true;
    button.receiveShadow = true;
    // button.add( createTextMesh( 'EXIT', 0.15, { x: -Math.PI/2, y: 0.0, z: 0.0 }, { x: 0.0, y: 0.1, z: 0.0 } ) );  // y: 0.151
    const loader = new THREE.TextureLoader();
    const exitTexture = loader.load('exit.png'); // transparent PNG recommended

    // Create a plane with the icon
    const iconMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.15, 0.15), // adjust size to fit button
        new THREE.MeshBasicMaterial({
            map: exitTexture,
            transparent: true,
            opacity: 1.0
        })
    );

    // Rotate and position the icon on the button
    iconMesh.rotation.x = -Math.PI / 2; // align with button surface
    iconMesh.position.set(0, 0.13, -0.02);  // slightly above button surface

    // Add icon to button
    button.add(iconMesh);
    secondaryModelsGroup.add(button);

    // ---- clipping ---- //
    // enable clipping globally
    renderer.localClippingEnabled = true;
    // clipping management object
    Clipping = {
        planes: [
            new THREE.Plane(new THREE.Vector3(1, 0, 0), 0),   // left
            new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0),  // right
            new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),  // top
            new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),   // bottom
            new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),   // back
            new THREE.Plane(new THREE.Vector3(0, 0, -1), 0),   // front
        ],

        setConstants({ left, right, top, bottom, back, front }) {
            this.planes[0].constant = left;
            this.planes[1].constant = right;
            this.planes[2].constant = top;
            this.planes[3].constant = bottom;
            this.planes[4].constant = back;
            this.planes[5].constant = front;
        },

        // applyToMeshes(meshes) {
        //     meshes.forEach(mesh => {
        //         if (!mesh) return;
        //         if (Array.isArray(mesh.material)) {
        //             mesh.material.forEach(m => m.clippingPlanes = this.planes);
        //         } else {
        //             mesh.material.clippingPlanes = this.planes;
        //         }
        //     });
        // }
        applyToMeshes(meshes) {
            meshes.forEach(mesh => {
                if (!mesh || !mesh.material) return;

                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach(m => {
                        m.clippingPlanes = this.planes;
                        m.needsUpdate = true;
                    });
                } else {
                    mesh.material.clippingPlanes = this.planes;
                    mesh.material.needsUpdate = true;
                }
            });
        }
    };


    // SECONDARY MODELS GROUP END (BASE + BUTTON + PANELS*) ////////////////////////////////////////////////


    // HOTSPOT MODELS GROUP START  /////////////////////////////////////////////////////////////////////////

    hotspotModelsGroup = new THREE.Group();
    hotspotModelsGroup.name = 'hotspotModelsGroup';
    //    scene.add( hotspotModelsGroup );      

    // ---- AIXÒ SON HOTSPOTS, LA MAJORIA D'ELLS TRANSPARENTS PERQUÈ ÉS LA MANERA DE QUE SURTI EL NOM DEL RELLEU AL INTERSECCIONAR, NOMÉS NO TRANSPARETS ELS DOS PRIMERS (EN BLAU, Q ES VEUEN AILLATS AL SELECCIONAR-LOS) ---- //
    panel_9 = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 1.9, 0.1).rotateY(-Math.PI / 4).translate(1.9, 3.3, -0.9),
        new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.1
        })
    );
    panel_9.name = 'panel_9';
    panel_9.userData.description = 'Presentation of Jesus at the Temple';
    panel_9.userData.tooltip = createTextMesh(panel_9.userData.description, 0.03, { x: -Math.PI / 6, y: 0, z: 0 }, { x: 0, y: 0.04, z: -0.25 }, 0x000000);
    panel_9.userData.tooltip.name = 'tooltip';
    hotspotModelsGroup.add(panel_9);


    panel_12 = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 1.6, 0.1).rotateY(Math.PI / 3.9).translate(-1.25, 6.0, -0.9),
        new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.1
        })
    );
    panel_12.name = 'panel_12';
    panel_12.userData.description = 'Ascension of Christ';
    panel_12.userData.tooltip = createTextMesh(panel_12.userData.description, 0.03, { x: -Math.PI / 6, y: 0, z: 0 }, { x: 0, y: 0.04, z: -0.25 }, 0x000000);
    panel_12.userData.tooltip.name = 'tooltip';
    hotspotModelsGroup.add(panel_12);

    panel_15 = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 1.4, 0.1).rotateY(Math.PI / 3.9).translate(-1.25, 8.2, -1.0),
        new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.1
        })
    );
    panel_15.name = 'panel_15';
    panel_15.userData.description = 'Coronation';
    panel_15.userData.tooltip = createTextMesh(panel_15.userData.description, 0.03, { x: -Math.PI / 6, y: 0, z: 0 }, { x: 0, y: 0.04, z: -0.25 }, 0x000000);
    panel_15.userData.tooltip.name = 'tooltip';
    hotspotModelsGroup.add(panel_15);

    panel_14 = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 1.4, 0.1).rotateY(-Math.PI / 4).translate(1.85, 8.35, -1.0),
        new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.1
        })
    );
    panel_14.name = 'panel_14';
    panel_14.userData.description = 'Assumption of the Virgin Mary';
    panel_14.userData.tooltip = createTextMesh(panel_14.userData.description, 0.03, { x: -Math.PI / 6, y: 0, z: 0 }, { x: 0, y: 0.04, z: -0.25 }, 0x000000);
    panel_14.userData.tooltip.name = 'tooltip';
    hotspotModelsGroup.add(panel_14);

    panel_8 = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 1.9, 0.1).rotateY(Math.PI / 3.9).translate(-1.25, 3.3, -1.0),
        new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.1
        })
    );
    panel_8.name = 'panel_8';
    panel_8.userData.description = 'Nativity';
    panel_8.userData.tooltip = createTextMesh(panel_8.userData.description, 0.03, { x: -Math.PI / 6, y: 0, z: 0 }, { x: 0, y: 0.04, z: -0.25 }, 0x000000);
    panel_8.userData.tooltip.name = 'tooltip';
    hotspotModelsGroup.add(panel_8);

    panel_2 = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 0.4, 0.1).rotateY(Math.PI / 3.9).translate(-1.25, 2.0, -1.0),
        new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.1
        })
    );
    panel_2.name = 'panel_2';
    panel_2.userData.description = 'Flagellation';
    panel_2.userData.tooltip = createTextMesh(panel_2.userData.description, 0.03, { x: -Math.PI / 6, y: 0, z: 0 }, { x: 0, y: 0.04, z: -0.25 }, 0x000000);
    panel_2.userData.tooltip.name = 'tooltip';
    hotspotModelsGroup.add(panel_2);

    panel_3 = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 0.4, 0.1).rotateY(-Math.PI / 4).translate(1.9, 2.0, -1.0),
        new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.1
        })
    );
    panel_3.name = 'panel_3';
    panel_3.userData.description = 'Crown of thorns';
    panel_3.userData.tooltip = createTextMesh(panel_3.userData.description, 0.03, { x: -Math.PI / 6, y: 0, z: 0 }, { x: 0, y: 0.04, z: -0.25 }, 0x000000);
    panel_3.userData.tooltip.name = 'tooltip';
    hotspotModelsGroup.add(panel_3);

    panel_13 = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 1.6, 0.1).rotateY(-Math.PI / 4).translate(1.8, 6.05, -1.0),
        new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.1
        })
    );
    panel_13.name = 'panel_13';
    panel_13.userData.description = 'Pentecost';
    panel_13.userData.tooltip = createTextMesh(panel_13.userData.description, 0.03, { x: -Math.PI / 6, y: 0, z: 0 }, { x: 0, y: 0.04, z: -0.25 }, 0x000000);
    panel_13.userData.tooltip.name = 'tooltip';
    hotspotModelsGroup.add(panel_13);

    panel_10 = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 1.25, 0.1).translate(2.95, 6, -0.5),
        new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.1
        })
    );
    panel_10.name = 'panel_10';
    panel_10.userData.description = 'Christ among the Doctors';
    panel_10.userData.tooltip = createTextMesh(panel_10.userData.description, 0.03, { x: -Math.PI / 6, y: 0, z: 0 }, { x: 0, y: 0.04, z: -0.25 }, 0x000000);
    panel_10.userData.tooltip.name = 'tooltip';
    hotspotModelsGroup.add(panel_10);

    panel_11 = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 1.25, 0.1).translate(-2.35, 6, -0.5),
        new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.1
        })
    );
    panel_11.name = 'panel_11';
    panel_11.userData.description = 'Resurrection of Christ';
    panel_11.userData.tooltip = createTextMesh(panel_11.userData.description, 0.03, { x: -Math.PI / 6, y: 0, z: 0 }, { x: 0, y: 0.04, z: -0.25 }, 0x000000);
    panel_11.userData.tooltip.name = 'tooltip';
    hotspotModelsGroup.add(panel_11);

    panel_6 = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1.7, 0.1).translate(-2.25, 3.15, -0.5),
        new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.1
        })
    );
    panel_6.name = 'panel_6';
    panel_6.userData.description = 'Annunciation';
    panel_6.userData.tooltip = createTextMesh(panel_6.userData.description, 0.03, { x: -Math.PI / 6, y: 0, z: 0 }, { x: 0, y: 0.04, z: -0.25 }, 0x000000);
    panel_6.userData.tooltip.name = 'tooltip';
    hotspotModelsGroup.add(panel_6);

    panel_7 = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1.7, 0.1).translate(2.95, 3.2, -0.5),
        new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.1
        })
    );
    panel_7.name = 'panel_7';
    panel_7.userData.description = 'Visitation';
    panel_7.userData.tooltip = createTextMesh(panel_7.userData.description, 0.03, { x: -Math.PI / 6, y: 0, z: 0 }, { x: 0, y: 0.04, z: -0.25 }, 0x000000);
    panel_7.userData.tooltip.name = 'tooltip';
    hotspotModelsGroup.add(panel_7);

    panel_4 = new THREE.Mesh(
        new THREE.BoxGeometry(1.25, 0.5, 0.1).translate(3.0, 2.0, -0.2),
        new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.1
        })
    );
    panel_4.name = 'panel_4';
    panel_4.userData.description = 'Road to Calvary';
    panel_4.userData.tooltip = createTextMesh(panel_4.userData.description, 0.03, { x: -Math.PI / 6, y: 0, z: 0 }, { x: 0, y: 0.04, z: -0.25 }, 0x000000);
    panel_4.userData.tooltip.name = 'tooltip';
    hotspotModelsGroup.add(panel_4);

    panel_1 = new THREE.Mesh(
        new THREE.BoxGeometry(1.25, 0.5, 0.1).translate(-2.3, 2.0, -0.2),
        new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.1
        })
    );
    panel_1.name = 'panel_1';
    panel_1.userData.description = 'Agony in the Garden of Gethsemane';
    panel_1.userData.tooltip = createTextMesh(panel_1.userData.description, 0.03, { x: -Math.PI / 6, y: 0, z: 0 }, { x: 0, y: 0.04, z: -0.25 }, 0x000000);
    panel_1.userData.tooltip.name = 'tooltip';
    hotspotModelsGroup.add(panel_1);

    door_1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 1.7, 0.1).translate(-2.3, 0.8, -0.3),
        new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            transparent: true,
            //        opacity: 0.3,
            visible: false,
        })
    );
    door_1.name = 'door_1';
    door_1.userData.description = 'Pope Pius V';
    door_1.userData.tooltip = createTextMesh(door_1.userData.description, 0.03, { x: -Math.PI / 6, y: 0, z: 0 }, { x: 0, y: 0.04, z: -0.25 }, 0x000000);
    door_1.userData.tooltip.name = 'tooltip';
    hotspotModelsGroup.add(door_1);

    door_2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 1.7, 0.1).translate(3.0, 0.8, -0.3),
        new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.1,
            visible: false,
        })
    );
    door_2.name = 'door_2';
    door_2.userData.description = 'Saint Albert the Great';
    door_2.userData.tooltip = createTextMesh(door_2.userData.description, 0.03, { x: -Math.PI / 6, y: 0, z: 0 }, { x: 0, y: 0.04, z: -0.25 }, 0x000000);
    door_2.userData.tooltip.name = 'tooltip';
    hotspotModelsGroup.add(door_2);

    square_1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.1).translate(-0.56, 1.925, -1.0),
        new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.1,
            visible: false,
        })
    );
    square_1.name = 'square_1';
    square_1.userData.description = 'Thomas Aquinas';
    square_1.userData.tooltip = createTextMesh(square_1.userData.description, 0.03, { x: -Math.PI / 6, y: 0, z: 0 }, { x: 0, y: 0.04, z: -0.25 }, 0x000000);
    square_1.userData.tooltip.name = 'tooltip';
    hotspotModelsGroup.add(square_1);

    square_2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.1).translate(1.2, 1.925, -1.0),
        new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.1,
            visible: false,
        })
    );
    square_2.name = 'square_2';
    square_2.userData.description = 'Raymond of Peñafort';
    square_2.userData.tooltip = createTextMesh(square_2.userData.description, 0.03, { x: -Math.PI / 6, y: 0, z: 0 }, { x: 0, y: 0.04, z: -0.25 }, 0x000000);
    square_2.userData.tooltip.name = 'tooltip';
    hotspotModelsGroup.add(square_2);

    panel_5 = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 1.7, 0.1).translate(0.25, 8.45, -1.5),
        new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.1
        })
    );
    panel_5.name = 'panel_5';
    panel_5.userData.description = 'Crucifixion';
    panel_5.userData.tooltip = createTextMesh(panel_5.userData.description, 0.03, { x: -Math.PI / 6, y: 0, z: 0 }, { x: 0, y: 0.04, z: -0.25 }, 0x000000);
    panel_5.userData.tooltip.name = 'tooltip';
    hotspotModelsGroup.add(panel_5);

    // HOTSPOT MODELS GROUP END  ///////////////////////////////////////////////////////////////////////////


    /////////// UI BUTTONS START ////////////////////
    // ---- BOTONS INFO I CLOSE---- //

    meshContainer = new THREE.Group();
    meshContainer.position.set(0, -0.25, 0.);
    camera.add(meshContainer);

    //

    const cylinder = createMeshUI('You are about to explore a 3D reconstruction of the partially lost Rosary altarpiece, originally located in the Rosary Chapel of the now-lost Church of Saint Peter Martyr. Both the altarpiece and the church, have been digitally recreated to offer a glimpse into their original appearance and historical significance.', { x: 0, y: 0, z: -2 }, 'center');
    cylinder.set({
        textAlign: 'justify-left',
        width: 1.161,
        height: 0.86,
        // textAnchor: 'left'
    });

    const sphere = createMeshUI('TRIGGER: ray for teleport and selection \nGRIP: toggle flashlight; when on, A/B adjust its brightness \nBUTTON A: toggle hotspots \nBUTTON B: switch between texture and solid color \nJOYSTICK: vertical movement (UP/DOWN) and horizontal panning (LEFT/RIGHT, parallel to altarpiece)', { x: 0, y: 0, z: 0 }, 'left');
    sphere.set({
        textAlign: 'left',
        // textAnchor: 'left'
    });

    const box = createMeshUI('', { x: 0, y: 0, z: 0 }, 'left');
    box.set({
        width: 0.8,
        height: 0.8,
        margin: 0.05
    });

    new THREE.TextureLoader().load(controlsImage, (controlsTexture) => {
        box.set({
            backgroundTexture: controlsTexture,
        });
    });

    const rightSubBlock = new ThreeMeshUI.Block({
        // width: 2,             // total width of the block
        // height: 1,            // total height of the block
        contentDirection: 'row',  // horizontal layout
        justifyContent: 'center', // align children horizontally
        alignItems: 'center',   // align children vertically
        margin: 0.025,
        padding: 0.02,
        fontSize: 0.05,
        backgroundOpacity: 0
    });
    rightSubBlock.position.set(0, 0, -2);
    rightSubBlock.add(sphere, box);

    cylinder.visible = rightSubBlock.visible = false;
    cylinder.hasCloseButton = true;       // text panel
    rightSubBlock.hasCloseButton = false; // icon-only panel


    meshContainer.add(cylinder, rightSubBlock);

    meshes = [cylinder, rightSubBlock];
    currentMesh = 0;

    showMesh(currentMesh);
    makePanel();

    renderer.setAnimationLoop(loop);

    /////////// UI BUTTONS START ////////////////////

    // Controller Model

    const controllerModelFactory = new XRControllerModelFactory();

    const controllerGrip1 = renderer.xr.getControllerGrip(0);
    controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
    scene.add(controllerGrip1);

    const controllerGrip2 = renderer.xr.getControllerGrip(1);
    controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
    scene.add(controllerGrip2);

    // Controller Ray

    const line = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -1)
    );
    //    const curve = new THREE.QuadraticBezierCurve3(
    //		new THREE.Vector3(0, 0, 0),
    //		new THREE.Vector3(0, 0.5, -0.5),
    //		new THREE.Vector3(0, 0, -1)
    //	); 
    const ray1 = new THREE.Mesh(
        new THREE.TubeGeometry(line, 64, .0025, 8, false),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    ray1.name = 'ray';
    ray1.scale.z = 15;
    ray1.visible = false;

    const ray2 = ray1.clone();
    ray2.material = ray1.material.clone();
    ray2.name = 'ray';

    controller1 = renderer.xr.getController(0);
    controller1.name = 'controller1';
    controller1.intersected = [],
        controller1.add(ray1);
    controller1.add(flashlight1);          //attach flashlight to controller
    controller1.add(flashlight1.target);   //attach flashlight to controller
    scene.add(controller1);

    controller2 = renderer.xr.getController(1);
    controller2.name = 'controller2';
    controller2.intersected = [],
        controller2.add(ray2);
    controller2.add(flashlight2);          //attach flashlight to controller
    controller2.add(flashlight2.target);   //attach flashlight to controller	
    scene.add(controller2);


    // Animation
    clock = new THREE.Clock();

    // Interactions
    raycaster = new THREE.Raycaster();
    // ---- AIXO CREC QUE HO NECESSITAVA PELS UI BUTTONS ---- //
    pointer = new THREE.Vector2();

    // Listeners
    controller1.addEventListener('squeezestart', onSqueezeStart);
    controller1.addEventListener('squeezeend', onSqueezeEnd);
    controller2.addEventListener('squeezestart', onSqueezeStart);
    controller2.addEventListener('squeezeend', onSqueezeEnd);

    controller1.addEventListener('selectstart', onSelectStart);
    controller1.addEventListener('selectend', onSelectEnd);
    controller2.addEventListener('selectstart', onSelectStart);
    controller2.addEventListener('selectend', onSelectEnd);

    controller1.addEventListener('connected', (e) => {
        controller1.userData.connected = true; //indicates that the controller is connected

        controller1.gamepad = e.data.gamepad;
        controller1.handedness = e.data.handedness;
    });

    controller2.addEventListener('connected', (e) => {
        controller2.userData.connected = true; //indicates that the controller is connected

        controller2.gamepad = e.data.gamepad;
        controller2.handedness = e.data.handedness;
    });

    controller1.addEventListener('disconnected', (e) => {
        controller1.userData.connected = false; //indicates that the controller is disconnected
    });

    controller2.addEventListener('disconnected', (e) => {
        controller2.userData.connected = false; //indicates that the controller is disconnected
    });

    // ---- POINTER  I TOUCHSTART-TOUCHEND ÉS PER UI BUTTONS ---- //
    document.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerdown', () => {
        selectState = true;
    });

    window.addEventListener('pointerup', () => {
        selectState = false;
    });
    window.addEventListener('touchstart', (event) => {
        selectState = true;
        pointer.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('touchend', () => {
        selectState = false;
        pointer.x = null;
        pointer.y = null;
    });

    renderer.xr.addEventListener('sessionstart', (e) => {
        baseReferenceSpace = renderer.xr.getReferenceSpace();
        mainModelsGroup.position.z -= z_shift;
        primaryModelsGroup.position.z -= z_shift;
        secondaryModelsGroup.position.z -= z_shift;
        hotspotModelsGroup.position.z -= z_shift;
        lightsGroup.position.z -= z_shift;
        spotLight_right.target.position.z -= z_shift;
        spotLight_right.target.updateMatrixWorld();
        spotLight_left.target.position.z -= z_shift;
        spotLight_left.target.updateMatrixWorld();
        helpersGroup.position.z -= z_shift;
    });

    renderer.xr.addEventListener('sessionend', (e) => {
        mainModelsGroup.position.z += z_shift;
        primaryModelsGroup.position.z += z_shift;
        secondaryModelsGroup.position.z += z_shift;
        hotspotModelsGroup.position.z += z_shift;
        lightsGroup.position.z += z_shift;
        spotLight_right.target.position.z += z_shift;
        spotLight_right.target.updateMatrixWorld();
        spotLight_left.target.position.z += z_shift;
        spotLight_left.target.updateMatrixWorld();
        helpersGroup.position.z += z_shift;
        camera.fov = 30;
        camera.position.set(0, 1.8, 25);
    });

    window.addEventListener('resize', onWindowResize);

}

// ---- AIXO CREC QUE HO NECESSITAVA PELS UI BUTTONS ---- //
function onPointerMove(event) {

    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

function addPointLight(x, y, z, color, intensity, distance, decay) {
    const pointLight = new THREE.PointLight(color, intensity, distance, decay);
    pointLight.position.set(x, y, z);
    //    pointLight.castShadow = true;
    //pointLight.shadow.mapSize.width = 512;  // default
    //pointLight.shadow.mapSize.height = 512; // default
    //    pointLight.shadow.camera.fov = 90;
    //pointLight.shadow.camera.near = 0.5;    // default
    //    pointLight.shadow.camera.far = 10;       
    //    pointLight.shadow.bias = - 0.01; 
    //pointLight.shadow.radius = 10; 
    //pointLight.shadow.normalBias = 0.5; 
    //pointLight.shadow.blurSamples = 16; 
    lightsGroup.add(pointLight);
    //	const pointHelper = new THREE.PointLightHelper( pointLight, 10 );
    //	scene.add( pointHelper );
}

function removeGroupAndDispose(group) {
    group.traverse(function (child) {
        if (child.isMesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) child.material.forEach(mat => mat.dispose());
                else child.material.dispose();
            }
        }
    });
    if (group.parent) group.parent.remove(group);
}

function loadPanelMesh(name, rotation, position) {
    model = new NEXUS.Nexus3D('./models/' + name + '-4k.nxz', renderer, {
        onLoad: (nexus) => {
            nexus.rotation.set(rotation.x, rotation.y, rotation.z);
            nexus.position.set(position.x, position.y, position.z);

            nexus.castShadow = true;
            nexus.receiveShadow = true;

            secondaryModelsGroup.add(nexus);
        }, onUpdate: (nexus) => {
            //        console.log(nexus);
        }, onProgress: (nexus) => {
            //        console.log(nexus);
        }, function(error) {
            console.error(error);
        }
    });
    model.material = altarpiece.material;
    model.name = 'model';
    //    model.material.needsUpdate = true;
    //    model.cache.targetError = 1.0;
    //    const monitor = new Monitor(model.cache, model);

    model_gold = new NEXUS.Nexus3D('./models/' + name + 'd.nxz', renderer, {
        onLoad: (nexus) => {
            nexus.rotation.set(rotation.x, rotation.y, rotation.z);
            nexus.position.set(position.x, position.y, position.z);

            nexus.castShadow = true;
            nexus.receiveShadow = true;

            secondaryModelsGroup.add(nexus);
        }, onUpdate: (nexus) => {
            //        console.log(nexus);
        }, onProgress: (nexus) => {
            //        console.log(nexus);
        }, function(error) {
            console.error(error);
        }
    });
    model_gold.material = altarpiece_gold.material;
    model_gold.visible = altarpiece_gold.visible;
    model_gold.name = 'model_gold';
    //    model_gold.material.needsUpdate = true;
    //    model_gold.cache.targetError = 1.0;
    //    const monitor = new Monitor(model_gold.Cache, model_gold);  
}

function createTextMesh(message, height, rotation, position, background_color) {
    const text = createText(message, height);
    text.rotation.set(rotation.x, rotation.y, rotation.z);
    text.position.set(position.x, position.y, position.z);

    const group = new THREE.Group();

    if (background_color !== undefined) {
        // Calculate the text bounding box to size the background
        text.geometry.computeBoundingBox();
        const box = text.geometry.boundingBox;
        const width = box.max.x - box.min.x;
        const h = box.max.y - box.min.y;

        // Create a black plane slightly larger than the text
        const padding = 0.03;
        const bgGeometry = new THREE.PlaneGeometry(width + padding, h + padding);
        const bgMaterial = new THREE.MeshBasicMaterial({ color: background_color, side: THREE.DoubleSide });
        const background = new THREE.Mesh(bgGeometry, bgMaterial);

        // Align the plane behind the text
        background.rotation.copy(text.rotation);
        background.position.copy(text.position);
        background.position.y -= 0.001; // slightly behind the text

        // Add the plane to the group
        group.add(background);
    }

    group.add(text);

    return group;
}

function teleport(position, update) {
    const rotationTransform = new XRRigidTransform(
        { x: 0, y: 0, z: 0, w: 1 },
        new THREE.Quaternion().setFromEuler(new THREE.Euler(0, xrRotationY, 0, 'YXZ'))
    );

    const translationTransform = new XRRigidTransform(
        { x: position.x, y: position.y, z: position.z + z_shift, w: 1 },
        new THREE.Quaternion()
    );

    let currentSpace = baseReferenceSpace.getOffsetReferenceSpace(rotationTransform);
    currentSpace = currentSpace.getOffsetReferenceSpace(translationTransform);
    renderer.xr.setReferenceSpace(currentSpace);

    // Update tracked position
    if (update) xrPosition = { x: position.x, y: position.y, z: position.z };
}

function checkXRButtons(controller) {
    if (!controller.userData.connected) return;

    if (controller.handedness == 'right') {
        // A = button[4], B = button[5]
        const aPressed = controller.gamepad.buttons[4]?.pressed;
        const bPressed = controller.gamepad.buttons[5]?.pressed;

        // x = axes[2], y = axes[3]
        const threshold = 0.0; // deadzone
        const x = Math.abs(controller.gamepad.axes[2]) > threshold ? controller.gamepad.axes[2] : 0;
        const y = Math.abs(controller.gamepad.axes[3]) > threshold ? controller.gamepad.axes[3] : 0;
        const jPressed = x != 0 || y != 0 ? true : false;

        // Press Joy
        if (jPressed && !prevJ) {
            if (joyPressed) return;
            joyPressed = true;
            lockJ = false;
        }
        // Press & Hold Joy
        if (jPressed) {
            if (lockJ) return; //if joy is locked, do not move

            ////////// JOYPAD NAVIGATION //////////////////////////////////////////            
            //            if ( !primaryModelsGroup.parent ) {         //enable joypad only with secondary models group
            if (!secondaryModelsGroup.parent) {         //enable joypad only with primary models group
                const movSpeed = 0.5;
                //                const rotSpeed = 0.5;                 

                // Calculate movement
                const deltaX = -x * movSpeed * delta;     //X
                const deltaY = y * movSpeed * delta;     //Y                  
                //                const deltaZ = -y * movSpeed * delta;     //Z
                //                const deltaX = Math.sin(xrRotationY) * ( y * movSpeed * delta); //X FPS
                //                const deltaZ = Math.cos(xrRotationY) * (-y * movSpeed * delta); //Z FPS              

                // Update tracked position
                xrPosition.x += deltaX;                   //X
                xrPosition.y += deltaY;                   //Y                
                //                xrPosition.z += deltaZ;                   //Z

                if (xrPosition.y > 0) xrPosition.y = 0;   //Y prevent going below ground level         
                //                if (xrPosition.y < -2) xrPosition.y = -2; //Y prevent going too high   

                // Update tracked rotation
                //                xrRotationY += x * rotSpeed * delta;      //Y FPS

                teleport(xrPosition, true);
            }
            ///////////////////////////////////////////////////////////////////////     

        }
        // Release Joy
        if (!jPressed && prevJ) {
            joyPressed = false;
            lockJ = true;
        }

        // Press A
        if (aPressed && !prevA) {
            if (button1Pressed) return;
            button1Pressed = true;
            if (!controller.userData.squeezed) {
                if (primaryModelsGroup.parent) {
                    if (hotspotModelsGroup.parent) removeGroupAndDispose(hotspotModelsGroup); //remove hotspot models
                    else scene.add(hotspotModelsGroup); //add hotspot models
                }
            }
        }
        // Press & Hold A
        if (aPressed) {
            if (controller.userData.squeezed) controller.getObjectByName('flashlight').power += 1;
        }
        // Release A
        if (!aPressed && prevA) {
            button1Pressed = false;
        }

        // Press B
        if (bPressed && !prevB) {
            if (button2Pressed) return;
            button2Pressed = true;

            if (!controller.userData.squeezed) {
                if (altarpiece.userData.isTextured) { //if altarpiece is textured

                    altarpiece.material = altarpiece_solid_material; //change material to solid
                    altarpiece_gold.visible = false; //hide gilded details 
                    altarpieceC.material = altarpiece_solid_material; //change columns material to solid
                    altarpieceC_gold.visible = false; //hide columns gilded details 

                    // ---- ENABLE CLIPPING IF ACTIVE ---- //
                    if (clippingActive) {
                        Clipping.applyToMeshes([altarpiece, altarpieceC]);
                    } else {
                        [altarpiece, altarpieceC].forEach(mesh => {
                            if (mesh.material) {
                                mesh.material.clippingPlanes = null;
                                mesh.material.needsUpdate = true;
                            }
                        });
                    }

                    ////////////// AIXO DE SECONDARY MODEL HO HE TRET PERQUÈ JA NO FAIG loadPanelMesh() //////////////
                    // if ( secondaryModelsGroup.parent ) {   
                    //     model.material = altarpiece_solid_material; //change material to solid
                    //     model_gold.visible = false; //hide gilded details  
                    // }
                    altarpiece.userData.isTextured = false;
                }
                else { //if altarpiece is solid
                    altarpiece.material = altarpiece_text_material; //change material to textured
                    altarpiece_gold.visible = true; //show gilded details
                    // if ( secondaryModelsGroup.parent ) {   
                    //     model.material = altarpiece_text_material; //change material to textured
                    //     model_gold.visible = true; //show gilded details
                    // }

                    altarpieceC.material = altarpiece_text_material; //change columns material to solid
                    altarpieceC_gold.visible = true; //hide columns gilded details 

                    altarpiece.userData.isTextured = true;
                }
            }
        }
        // Press & Hold B
        if (bPressed) {
            if (controller.userData.squeezed && controller.getObjectByName('flashlight').power > 2) controller.getObjectByName('flashlight').power -= 1;
        }
        // Release B
        if (!bPressed && prevB) {
            button2Pressed = false;
        }

        prevA = aPressed;
        prevB = bPressed;
        prevJ = jPressed;
    }
    else {
        // X = button[4], Y = button[5]
        const xPressed = controller.gamepad.buttons[4]?.pressed;
        const yPressed = controller.gamepad.buttons[5]?.pressed;

        // x = axes[2], y = axes[3]
        const threshold = 0.05; // deadzone
        const x = Math.abs(controller.gamepad.axes[2]) > threshold ? controller.gamepad.axes[2] : 0;
        const y = Math.abs(controller.gamepad.axes[3]) > threshold ? controller.gamepad.axes[3] : 0;
        const jPressed = x != 0 || y != 0 ? true : false;

        // Press Joy
        if (jPressed && !prevK) {
            if (joyPressed) return;
            joyPressed = true;
            lockK = false;
        }
        // Press & Hold Joy
        if (jPressed) {
            if (lockK) return; //if joy is locked, do not move

            ////////// JOYPAD NAVIGATION //////////////////////////////////////////            
            //            if ( !primaryModelsGroup.parent ) {         //enable joypad only with secondary models group
            if (!secondaryModelsGroup.parent) {         //enable joypad only with primary models group
                const movSpeed = 0.5;
                //                const rotSpeed = 0.5;                 

                // Calculate movement
                const deltaX = -x * movSpeed * delta;     //X
                const deltaY = y * movSpeed * delta;     //Y                  
                //                const deltaZ = -y * movSpeed * delta;     //Z
                //                const deltaX = Math.sin(xrRotationY) * ( y * movSpeed * delta); //X FPS
                //                const deltaZ = Math.cos(xrRotationY) * (-y * movSpeed * delta); //Z FPS              

                // Update tracked position
                xrPosition.x += deltaX;                   //X
                xrPosition.y += deltaY;                   //Y                
                //                xrPosition.z += deltaZ;                   //Z

                if (xrPosition.y > 0) xrPosition.y = 0;   //Y prevent going below ground level         
                //                if (xrPosition.y < -2) xrPosition.y = -2; //Y prevent going too high   

                // Update tracked rotation
                //                xrRotationY += x * rotSpeed * delta;      //Y FPS

                teleport(xrPosition, true);
            }
            ///////////////////////////////////////////////////////////////////////  

        }
        // Release Joy
        if (!jPressed && prevK) {
            joyPressed = false;
            lockK = true;
        }

        // Press X
        if (xPressed && !prevX) {
            if (button1Pressed) return;
            button1Pressed = true;
            if (!controller.userData.squeezed) {
                if (primaryModelsGroup.parent) {
                    if (hotspotModelsGroup.parent) removeGroupAndDispose(hotspotModelsGroup); //remove hotspot models
                    else scene.add(hotspotModelsGroup); //add hotspot models
                }
            }
        }
        // Press & Hold X
        if (xPressed) {
            if (controller.userData.squeezed) controller.getObjectByName('flashlight').power += 1;
            // else {
            //     const speed = 0.5;

            //     // Calculate upward movement
            //     const upwardY = -1 * speed * delta;

            //     // Update tracked position
            //     xrPosition.y += upwardY;

            //     teleport( xrPosition, true );
            // }
        }
        // Release X
        if (!xPressed && prevX) {
            button1Pressed = false;
        }

        // Press Y
        if (yPressed && !prevY) {
            if (button2Pressed) return;
            button2Pressed = true;
            if (!controller.userData.squeezed) {
                if (altarpiece.userData.isTextured) { //if altarpiece is textured

                    altarpiece.material = altarpiece_solid_material; //change material to solid
                    altarpiece_gold.visible = false; //hide gilded details 
                    altarpieceC.material = altarpiece_solid_material; //change columns material to solid
                    altarpieceC_gold.visible = false; //hide columns gilded details 

                    // ---- ENABLE CLIPPING IF ACTIVE ---- //
                    if (clippingActive) {
                        Clipping.applyToMeshes([altarpiece, altarpieceC]);
                    } else {
                        [altarpiece, altarpieceC].forEach(mesh => {
                            if (mesh.material) {
                                mesh.material.clippingPlanes = null;
                                mesh.material.needsUpdate = true;
                            }
                        });
                    }

                    altarpiece.userData.isTextured = false;
                }
                else { //if altarpiece is solid
                    altarpiece.material = altarpiece_text_material; //change material to textured
                    altarpiece_gold.visible = true; //show gilded details
                    altarpieceC.material = altarpiece_text_material; //change columns material to solid
                    altarpieceC_gold.visible = true; //hide columns gilded details 

                    altarpiece.userData.isTextured = true;
                }
            }
        }
        // Press & Hold Y
        if (yPressed) {
            if (controller.userData.squeezed) {
                if (controller.getObjectByName('flashlight').power > 2) controller.getObjectByName('flashlight').power -= 1;
            }
            // else {
            //     const speed = 0.5;

            //     // Calculate upward movement
            //     const downwardY = 1 * speed * delta;

            //     // Update tracked position
            //     xrPosition.y += downwardY;
            //     if (xrPosition.y > 0) xrPosition.y = 0; //prevent going below ground level

            //     teleport( xrPosition, true );              
            // }    
        }
        // Release Y
        if (!yPressed && prevY) {
            button2Pressed = false;
        }

        prevX = xPressed;
        prevY = yPressed;
        prevK = jPressed;
    }
}


function onSelectStart(event) {
    const controller = event.target;
    if (lockSelect) return; //if select is locked, do not select
    lockSelect = true;
    controller.userData.selected = true; //indicates that the controller is in select mode
    // ---- A PARTIR D'AQUÍ TOT ÉS UI BUTTONS -- //
    selectState = true;

    const intersections = getIntersections(controller, true, true);

    if (intersections.length > 0) {

        const intersection = intersections[0];
        let current = intersection.object;
        while (current) {
            current = current.parent;
        }

        const uiBlock = getUIBlock(intersection.object);
        if (uiBlock) {
            uiBlock.setState('idle');
            controller.userData.selectedUI = null; // remember for release
            return;
        }
        // if (intersection.object.isUI) {
        //     controller.attach(intersection.object);
        //     controller.userData.selected = intersection.object;
        // }

    }
    controller.userData.targetRayMode = event.data.targetRayMode;
}

function onSelectEnd(event) {
    const controller = event.target;
    if (controller.userData.selected) lockSelect = false; //unlock select
    else return; //if controller is not in select mode, do not deselect
    controller.userData.selected = false; //indicates that the controller is not in select mode anymore
    // ---- COSES DELS UI BUTTONS ---- //
    selectState = false;

    // coses dels botons meshUi
    const intersections = getIntersections(controller, true, true);
    if (intersections.length > 0) {
        const intersection = intersections[0];
        let current = intersection.object;
        while (current) {
            current = current.parent;
        }
        const uiBlock = getUIBlock(intersection.object);
        if (uiBlock) {
            uiBlock.setState('selected');
            controller.userData.selectedUI = uiBlock; // remember for release
            // return;
        }

    }
    // ---- FINS AQUÍ UI BUTTONS ---- //

    if (controller.intersected.length > 0) {
        // ---- AIXÒ ÉS PER TORNAR A LA PAGINA INICIAL DE L'ESGLÉSIA ---- //
        if (controller.intersected[0].name === 'button') {
            for (let i = secondaryModelsGroup.children.length - 1; i >= 0; i--) if (secondaryModelsGroup.children[i].isNXS) removeGroupAndDispose(secondaryModelsGroup.children[i]);
            for (let i = base.children.length - 1; i >= 0; i--) removeGroupAndDispose(base.children[i]);
            removeGroupAndDispose(secondaryModelsGroup);

            restoreAltarpieceTransform();
            altarpiece.material = altarpiece_text_material;
            altarpiece_gold.material = altarpiece_gold_material;
            altarpieceC.material = altarpiece_text_material;
            altarpieceC_gold.material = altarpiece_gold_material;
            altarpiece.userData.isTextured = true;
            // removeClippingFromAltarpiece();
            [altarpiece, altarpiece_gold].forEach(mesh => {
                if (mesh.material) {
                    mesh.material.clippingPlanes = null;
                    mesh.material.needsUpdate = true;
                }
            });
            clippingActive = false;

            NEXUS.Cache.targetError = primaryTargetError; //set error tolerance for nexus models in primary scene           
            scene.add(primaryModelsGroup);
            scene.add(hotspotModelsGroup);

            floor.geometry = new THREE.PlaneGeometry(60, 40, 2, 2).translate(-16, -16, 0).rotateX(- Math.PI / 2);
            grid.geometry = new BoxLineGeometry(40, 0, 60, 50, 50, 50).translate(-16, 0.01, -16).rotateY(Math.PI / 2);

            controller.intersection = { x: 0.25, y: 0, z: 5 }; //reset intersection point


        }
        else {
            // ---- AIXÒ ÉS PER ANAR AL MODEL AILLAT ---- //
            let tooltip = controller.getObjectByName('tooltip');
            if (controller.getObjectByName('tooltip')) controller.remove(tooltip);

            altarpiece.material = altarpiece_text_material;
            altarpiece_gold.material = altarpiece_gold_material;

            switch (controller.intersected[0].name) {
                case 'panel_1':  // Agony in the Garden of Gethsemane
                    base.add(createTextMesh('Agony in the Garden', 0.15, { x: 0.0, y: 0.0, z: 0.0 }, { x: 0.0, y: 0.1, z: 0.251 }));
                    base.add(createTextMesh('of Gethsemane', 0.15, { x: 0.0, y: 0.0, z: 0.0 }, { x: 0.0, y: -0.1, z: 0.251 }));
                    repositionAltarpieceCubes({ altarpiece, altarpiece_gold }, {
                        altarpiece: {
                            position: [-3, -1.07, 2.8]
                        },
                        altarpiece_gold: {
                            position: [-3, -1.07, 2.802]
                        }
                    });
                    Clipping.setConstants({
                        left: 0.9,
                        right: 1,
                        top: 1.3,
                        back: 20.2
                    });
                    Clipping.applyToMeshes([altarpiece, altarpiece_gold]);
                    clippingActive = true;
                    break;
                case 'panel_2':  // Flagellation
                    base.add(createTextMesh(controller.intersected[0].userData.description, 0.15, { x: 0.0, y: 0.0, z: 0.0 }, { x: 0.0, y: 0.0, z: 0.251 }));
                    repositionAltarpieceCubes({ altarpiece, altarpiece_gold }, {
                        altarpiece: {
                            position: [-5.4, -1.115, -0.5],
                            rotation: [-Math.PI / 2, 0, -Math.PI / 4]
                        },
                        altarpiece_gold: {
                            position: [-5.4, -1.115, -0.5 + 0.0002],
                            rotation: [-Math.PI / 2, 0, -Math.PI / 4]
                        }
                    });
                    Clipping.setConstants({
                        left: 0.7,
                        right: 1,
                        top: 1.2
                    });
                    Clipping.applyToMeshes([altarpiece, altarpiece_gold]);
                    clippingActive = true;
                    break;
                case 'panel_3':  // Crown of thorns
                    base.add(createTextMesh(controller.intersected[0].userData.description, 0.15, { x: 0.0, y: 0.0, z: 0.0 }, { x: 0.0, y: 0.0, z: 0.251 }));
                    repositionAltarpieceCubes({ altarpiece, altarpiece_gold }, {
                        altarpiece: {
                            position: [-2.6, -1.115, 7.6],
                            rotation: [-Math.PI / 2, 0, Math.PI / 4]
                        },
                        altarpiece_gold: {
                            position: [-2.6, -1.115, 7.602],
                            rotation: [-Math.PI / 2, 0, Math.PI / 4]
                        }
                    });
                    Clipping.setConstants({
                        left: 0.7,
                        right: 0.82,
                        top: 1.2,
                        front: -19.945
                    });
                    Clipping.applyToMeshes([altarpiece, altarpiece_gold]);
                    clippingActive = true;
                    break;
                case 'panel_4':  // Road to Calvary
                    base.add(createTextMesh(controller.intersected[0].userData.description, 0.15, { x: 0.0, y: 0.0, z: 0.0 }, { x: 0.0, y: 0.0, z: 0.251 }));
                    repositionAltarpieceCubes({ altarpiece, altarpiece_gold }, {
                        altarpiece: {
                            position: [-8.4, -1.07, 2.8]
                        },
                        altarpiece_gold: {
                            position: [-8.4, -1.07, 2.802]
                        }
                    });
                    Clipping.setConstants({
                        left: 1.5,
                        right: 1,
                        top: 1.3,
                        back: 20.21
                    });
                    Clipping.applyToMeshes([altarpiece, altarpiece_gold]);
                    clippingActive = true;
                    break;
                case 'panel_5':  // crucifixion
                    base.add(createTextMesh(controller.intersected[0].userData.description, 0.15, { x: 0.0, y: 0.0, z: 0.0 }, { x: 0.0, y: 0.0, z: 0.251 }));
                    repositionAltarpieceCubes({ altarpiece, altarpiece_gold }, {
                        altarpiece: {
                            position: [-5.6, -7.35, 4]
                        },
                        altarpiece_gold: {
                            position: [-5.6, -7.35, 4.002]
                        }
                    });
                    Clipping.setConstants({
                        left: 0.7,
                        right: 1
                    });
                    Clipping.applyToMeshes([altarpiece, altarpiece_gold]);
                    clippingActive = true;
                    break;
                case 'panel_6':  // annunciation
                    base.add(createTextMesh(controller.intersected[0].userData.description, 0.15, { x: 0.0, y: 0.0, z: 0.0 }, { x: 0.0, y: 0.0, z: 0.251 }));
                    repositionAltarpieceCubes({ altarpiece, altarpiece_gold }, {
                        altarpiece: {
                            position: [-3, -1.7, 2.84], // dreta, amunt, endavant
                            // rotation: [-Math.PI / 2, 0, -Math.PI / 4 ]
                        },
                        altarpiece_gold: {
                            position: [-3, -1.7, 2.8402],
                            // follow: 'altarpiece'
                        }
                    });
                    Clipping.setConstants({
                        left: 0.7,
                        right: 0.5,
                        top: 2.5,
                        bottom: -0.5
                    });
                    Clipping.applyToMeshes([altarpiece, altarpiece_gold]);
                    clippingActive = true;
                    break;
                case 'panel_7':  // visitation
                    base.add(createTextMesh(controller.intersected[0].userData.description, 0.15, { x: 0.0, y: 0.0, z: 0.0 }, { x: 0.0, y: 0.0, z: 0.251 }));
                    repositionAltarpieceCubes({ altarpiece, altarpiece_gold }, {
                        altarpiece: {
                            position: [-8.2, -1.725, 2.9], // dreta, amunt, endavant
                            // rotation: [-Math.PI / 2, 0, -Math.PI / 4 ]
                        },
                        altarpiece_gold: {
                            position: [-8.2, -1.725, 2.9002]
                        }
                    });
                    Clipping.setConstants({
                        left: 0.5,
                        right: 0.7,
                        top: 2.42
                    });
                    Clipping.applyToMeshes([altarpiece, altarpiece_gold]);
                    clippingActive = true;
                    break;
                case 'panel_8':  // nativity
                    base.add(createTextMesh(controller.intersected[0].userData.description, 0.15, { x: 0.0, y: 0.0, z: 0.0 }, { x: 0.0, y: 0.0, z: 0.251 }));
                    repositionAltarpieceCubes({ altarpiece, altarpiece_gold }, {
                        altarpiece: {
                            position: [-5.4, -1.7, -0.52], // dreta, amunt, endavant
                            rotation: [-Math.PI / 2, 0, -Math.PI / 4]
                        },
                        altarpiece_gold: {
                            position: [-5.4, -1.7, -0.52 + 0.0002],
                            rotation: [-Math.PI / 2, 0, -Math.PI / 4]
                        }
                    });
                    Clipping.setConstants({
                        left: 0.7,
                        right: 0.7,
                        top: 3
                    });
                    Clipping.applyToMeshes([altarpiece, altarpiece_gold]);
                    clippingActive = true;
                    break;
                case 'panel_9':  // presentation of Jesus at the temple
                    // loadPanelMesh( '12', { x: -Math.PI/2, y: 0.0, z: Math.PI/4 } , { x: -2.6, y: -1.7, z: 7.6 } ); 
                    base.add(createTextMesh('Presentation of Jesus', 0.15, { x: 0.0, y: 0.0, z: 0.0 }, { x: 0.0, y: 0.1, z: 0.251 }));
                    base.add(createTextMesh('at the Temple', 0.15, { x: 0.0, y: 0.0, z: 0.0 }, { x: 0.0, y: -0.1, z: 0.251 }));

                    repositionAltarpieceCubes({ altarpiece, altarpiece_gold }, {
                        altarpiece: {
                            position: [-2.6, -1.75, 7.4],
                            rotation: [-Math.PI / 2, 0, Math.PI / 4]
                        },
                        altarpiece_gold: {
                            position: [-2.6, -1.75, 7.4002],
                            rotation: [-Math.PI / 2, 0, Math.PI / 4]
                        },
                    });
                    Clipping.setConstants({
                        left: 0.7,
                        right: 0.7,
                        top: 3
                    });
                    Clipping.applyToMeshes([altarpiece, altarpiece_gold]);
                    clippingActive = true;
                    break;
                case 'panel_10':  // christ among the doctors
                    base.add(createTextMesh('Christ among the', 0.15, { x: 0.0, y: 0.0, z: 0.0 }, { x: 0.0, y: 0.1, z: 0.251 }));
                    base.add(createTextMesh('Doctors', 0.15, { x: 0.0, y: 0.0, z: 0.0 }, { x: 0.0, y: -0.1, z: 0.251 }));
                    // base.add( createTextMesh( controller.intersected[ 0 ].userData.description, 0.15, { x: 0.0, y: 0.0, z: 0.0 }, { x: 0.0, y: 0.0, z: 0.251 } ) ); 
                    repositionAltarpieceCubes({ altarpiece, altarpiece_gold }, {
                        altarpiece: {
                            position: [-8.2, -4.75, 2.9] // dreta, amunt, endavant
                        },
                        altarpiece_gold: {
                            position: [-8.2, -4.75, 2.9002]
                        }
                    });
                    Clipping.setConstants({
                        left: 0.5,
                        right: 0.7,
                        top: 2
                    });
                    Clipping.applyToMeshes([altarpiece, altarpiece_gold]);
                    clippingActive = true;
                    break;
                case 'panel_11': /// resurrection of christ
                    base.add(createTextMesh(controller.intersected[0].userData.description, 0.15, { x: 0.0, y: 0.0, z: 0.0 }, { x: 0.0, y: 0.0, z: 0.251 }));
                    repositionAltarpieceCubes({ altarpiece, altarpiece_gold }, {
                        altarpiece: {
                            position: [-3, -4.75, 2.89] // dreta, amunt, endavant
                        },
                        altarpiece_gold: {
                            position: [-3, -4.75, 2.8902]
                        }

                    });
                    Clipping.setConstants({
                        left: 0.5,
                        right: 0.5,
                        top: 2
                    });
                    Clipping.applyToMeshes([altarpiece, altarpiece_gold]);
                    clippingActive = true;
                    break;
                case 'panel_12': // ascension of christ
                    // loadPanelMesh( '23', { x: -Math.PI/2, y: Math.PI/110, z: 1.74*Math.PI } , { x: -5.5, y: -4.4, z: -0.5 } );
                    base.add(createTextMesh(controller.intersected[0].userData.description, 0.15, { x: 0.0, y: 0.0, z: 0.0 }, { x: 0.0, y: 0.0, z: 0.251 }));
                    repositionAltarpieceCubes({ altarpiece, altarpiece_gold }, {
                        altarpiece: {
                            position: [-5.4, -4.6, -0.5], // dreta, amunt, endavant
                            rotation: [-Math.PI / 2, 0, -Math.PI / 4]
                        },
                        altarpiece_gold: {
                            position: [-5.4, -4.6, -0.5 + 0.0002],
                            rotation: [-Math.PI / 2, 0, -Math.PI / 4]
                        }
                    });
                    Clipping.setConstants({
                        left: 0.75,
                        right: 0.8,
                        top: 3
                    });
                    Clipping.applyToMeshes([altarpiece, altarpiece_gold]);
                    clippingActive = true;
                    break;
                case 'panel_13': // pentecost
                    base.add(createTextMesh(controller.intersected[0].userData.description, 0.15, { x: 0.0, y: 0.0, z: 0.0 }, { x: 0.0, y: 0.0, z: 0.251 }));
                    repositionAltarpieceCubes({ altarpiece, altarpiece_gold }, {
                        altarpiece: {
                            position: [-2.6, -4.6, 7.45], // dreta, amunt, endavant
                            rotation: [-Math.PI / 2, 0, Math.PI / 4]
                        },
                        altarpiece_gold: {
                            position: [-2.6, -4.6, 7.4502],
                            rotation: [-Math.PI / 2, 0, Math.PI / 4]
                        }
                    });
                    Clipping.setConstants({
                        left: 0.75,
                        right: 0.7,
                        top: 3
                    });
                    Clipping.applyToMeshes([altarpiece, altarpiece_gold]);
                    clippingActive = true;
                    break;
                case 'panel_14':  // assumption of the virgin mary
                    base.add(createTextMesh('Assumption or the', 0.15, { x: 0.0, y: 0.0, z: 0.0 }, { x: 0.0, y: 0.1, z: 0.251 }));
                    base.add(createTextMesh('Virgin Mary', 0.15, { x: 0.0, y: 0.0, z: 0.0 }, { x: 0.0, y: -0.1, z: 0.251 }));
                    // base.add( createTextMesh( controller.intersected[ 0 ].userData.description, 0.15, { x: 0.0, y: 0.0, z: 0.0 }, { x: 0.0, y: 0.0, z: 0.251 } ) ); 
                    repositionAltarpieceCubes({ altarpiece, altarpiece_gold }, {
                        altarpiece: {
                            position: [-2.6, -7.03, 7.45],
                            rotation: [-Math.PI / 2, 0, Math.PI / 4]
                        },
                        altarpiece_gold: {
                            position: [-2.6, -7.03, 7.4502],
                            rotation: [-Math.PI / 2, 0, Math.PI / 4]
                        }
                    });
                    Clipping.setConstants({
                        left: 0.75,
                        right: 0.7,
                        top: 3
                    });
                    Clipping.applyToMeshes([altarpiece, altarpiece_gold]);
                    clippingActive = true;
                    break;
                case 'panel_15':  // coronation
                    base.add(createTextMesh(controller.intersected[0].userData.description, 0.15, { x: 0.0, y: 0.0, z: 0.0 }, { x: 0.0, y: 0.0, z: 0.251 }));
                    repositionAltarpieceCubes({ altarpiece, altarpiece_gold }, {
                        altarpiece: {
                            position: [-5.4, -6.91, -0.5],
                            rotation: [-Math.PI / 2, 0, -Math.PI / 4]
                        },
                        altarpiece_gold: {
                            position: [-5.4, -6.91, -0.5 + 0.0002],
                            rotation: [-Math.PI / 2, 0, -Math.PI / 4]
                        }
                    });
                    Clipping.setConstants({
                        left: 0.75,
                        right: 0.7,
                        top: 3
                    });
                    Clipping.applyToMeshes([altarpiece, altarpiece_gold]);
                    clippingActive = true;
                    break;

                default:
                    // break;
                    marker1.visible = marker2.visible = false; //hide markers
                    controller.getObjectByName('ray').visible = false; //hide ray
                    return;
            }

            removeGroupAndDispose(primaryModelsGroup);
            removeGroupAndDispose(hotspotModelsGroup);
            NEXUS.Cache.targetError = secondaryTargetError //set error tolerance for nexus models in secondary scene
            scene.add(secondaryModelsGroup);
            floor.geometry = new THREE.PlaneGeometry(5, 5, 2, 2).rotateX(- Math.PI / 2).translate(0, 0, 2.25);
            grid.geometry = new BoxLineGeometry(5, 0, 5, 5, 5, 5).translate(0, 0.01, 2.25);
            controller.intersection = { x: 0, y: 0, z: 2.5 }; //reset intersection point
        }
    }

    if (controller.intersection) teleport({ x: -controller.intersection.x, y: -controller.intersection.y, z: -controller.intersection.z }, true); //teleport to intersection point  

    marker1.visible = marker2.visible = false; //hide markers
    controller.getObjectByName('ray').visible = false; //hide ray
}

function restoreAltarpieceTransform() {
    if (altarpiece) {
        altarpiece.position.copy(altarpiece.userData.originalPosition);
        altarpiece.rotation.copy(altarpiece.userData.originalRotation);
        altarpiece.scale.copy(altarpiece.userData.originalScale);
    }

    if (altarpiece_gold) {
        altarpiece_gold.position.copy(altarpiece_gold.userData.originalPosition);
        altarpiece_gold.rotation.copy(altarpiece_gold.userData.originalRotation);
        altarpiece_gold.scale.copy(altarpiece_gold.userData.originalScale);
    }

}

function repositionAltarpieceCubes(objects, cfg) {
    for (const name in cfg) {
        const o = objects[name];
        if (!o) continue;

        o.visible = true;
        const c = cfg[name];

        if (c.follow) {
            const t = objects[c.follow];
            if (t) {
                o.position.copy(t.position);
                o.rotation.copy(t.rotation);
            }
            continue;
        }

        if (c.position) o.position.set(...c.position);
        if (c.rotation) o.rotation.set(...c.rotation);
        if (c.scale) o.scale.set(...c.scale);
    }
}

function removeClippingFromAltarpiece() {
    [altarpiece, altarpiece_gold].forEach(mesh => {
        mesh.traverse(child => {
            if (child.isMesh && child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => {
                        m.clippingPlanes = null;
                        m.needsUpdate = true;
                    });
                } else {
                    child.material.clippingPlanes = null;
                    child.material.needsUpdate = true;
                }
            }
        });
    });
    Clipping.clear(); // clear plane definitions too
}

function applyClipping(planes) {
    altarpiece.material.clippingPlanes = planes;
    altarpiece_gold.material.clippingPlanes = planes;
}

function onSqueezeStart(event) {
    const controller = event.target;
    controller.userData.squeezed = true; //indicates that the controller is in select mode
    if (controller.userData.flashPower !== undefined) controller.getObjectByName('flashlight').power = controller.userData.flashPower;
    else controller.getObjectByName('flashlight').power = 10;
}

function onSqueezeEnd(event) {
    const controller = event.target;
    controller.userData.squeezed = false; //indicates that the controller is in select mode
    //    controller.userData.flashPower = controller.getObjectByName( 'flashlight' ).power;    //remove comment to avoid to reset flashlight power
    controller.getObjectByName('flashlight').power = 0;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ---- COSES AFEGIDES PELS UI BUTTONS ---- //
function getIntersections(controller, xr = true, includeUI = false) {
    // Start with floor and scene object groups 
    const objects = [floor];

    scene.traverse(child => {
        if (child.name === 'primaryModelsGroup' ||
            child.name === 'secondaryModelsGroup' ||
            child.name === 'hotspotModelsGroup') {
            child.children.forEach(element => objects.push(element));

        }
    });

    // Add UI objects 
    if (includeUI && Array.isArray(objsToTest) && objsToTest.length) {
        objects.push(...objsToTest);
    }

    // Set up the raycaster 
    if (xr) {
        controller.updateMatrixWorld();
        raycaster.setFromXRController(controller);
    } else {
        camera.updateMatrixWorld();
        raycaster.setFromCamera(controller, camera);
    }

    return raycaster.intersectObjects(objects, true);
}

// ---- COSES AFEGIDES PELS UI BUTTONS ---- //
function intersectObjects(controller, xr = true) {
    if (!controller.userData.connected) return;
    controller.intersection = false;

    let currentMarker = marker1;
    if (controller.handedness === 'left') currentMarker = marker2;
    currentMarker.visible = false;

    let tooltip = controller.getObjectByName('tooltip');
    if (tooltip) controller.remove(tooltip);

    let ray = controller.getObjectByName('ray');
    ray.visible = true;

    const intersections = getIntersections(controller, true, true);
    // console.log("Intersections:", intersections);

    if (controller.userData.hovered) {
        controller.userData.hovered.forEach(obj => {
            obj.material.emissive.b = 0;
            obj.material.opacity = 0.1;
            obj.material.alphaHash = false;
            obj.material.needsUpdate = true;
        });
    }
    controller.userData.hovered = [];

    if (intersections.length > 0) {
        const intersection = intersections[0];

        // find the actual button block
        const uiBlock = getUIBlock(intersection.object, 'hovered');
        if (uiBlock) {
            uiBlock.setState('hovered');
            intersected.push(uiBlock);
            // ---- volia posar que el ray fos cyan QUAN S'INTERSECT PERO NO SÉ FER-HO: crec que no puc perquè no tinc controller.intersected.push(uiBlock) pero quan ho faig se'm xafa ---- //
        }

        const object = (intersection.object.parent.parent && intersection.object.parent.parent.name == 'button') ? intersection.object.parent.parent : intersection.object;

        // Exit if in mobile-ar
        if (controller.userData.targetRayMode === 'screen') return;

        ray.scale.z = intersection.distance;

        if (object.name == 'floor') {
            controller.intersection = intersection.point;
            controller.intersection.z += z_shift;

            currentMarker.position.copy(controller.intersection);
            currentMarker.position.y += 0.01;
            currentMarker.visible = true;

            ray.material.color.set(0xffffff);
        }
        else if (object.parent.name == 'hotspotModelsGroup' || object.name == 'button') {
            object.material.emissive.b = 1;
            object.material.emissiveIntensity = 3;
            object.material.opacity = 0.3;
            object.material.alphaHash = (object.name !== 'button');
            object.material.needsUpdate = true;

            controller.userData.hovered.push(object);

            controller.intersected.push(object);
            currentMarker.visible = false;
            ray.material.color.set(0x00ffff);
            if (object.userData.tooltip) controller.add(object.userData.tooltip);
        }
        else {
            currentMarker.visible = false;
            ray.material.color.set(0xFF4517);
        }
    } else {
        ray.material.color.set(0xFF4517);
        ray.scale.z = 15;
    }
}

function cleanIntersected(controller) {
    while (controller.intersected.length) {
        const object = controller.intersected.pop();
        object.material.emissive.b = 0
    }
}

// ---- COSES DELS UI BUTTONS --- //
function cleanIntersectedUI() {
    while (intersected.length) {
        const obj = intersected.pop();
        if (obj.isUI) obj.setState('idle');
    }
}

// ---- COSES DELS UI BUTTONS --- //
function createMeshUI(content = 'Some text to be displayed', position = { x: 0, y: 0, z: 0 }) {
    const containerUI = new ThreeMeshUI.Block({
        width: 1.2,
        height: 0.8,
        padding: 0.1,
        borderRadius: 0.02,
        fontSize: 0.055,
        justifyContent: 'center',
        fontFamily: './fonts/Roboto-msdf.json',
        fontTexture: './fonts/Roboto-msdf.png',
        margin: 0.05
    });

    const text = new ThreeMeshUI.Text({
        content: content
    });

    containerUI.add(text);

    camera.add(containerUI);

    containerUI.position.set(position.x, position.y, position.z);
    containerUI.rotation.set(0, 0, 0);

    return containerUI;
}

// ---- COSES DELS UI BUTTONS --- //
function showMesh(index) {
    if (!meshes || meshes.length === 0) return;
    if (index < 0 || index >= meshes.length) return;

    meshes.forEach((m, i) => m.visible = (i === index));
    currentMesh = index;

    if (!window.closeButton) return;

    const panel = meshes[currentMesh];
    if (!panel) return;

    // Show the close button only if panel wants it AND user hasn't manually hidden it
    window.closeButton.visible = panel.hasCloseButton && !closeButtonHiddenManually;
}


// ---- COSES DELS UI BUTTONS --- //
function makePanel() {

    // Container block, in which we put the two buttons.
    // We don't define width and height, it will be set automatically from the children's dimensions
    // Note that we set contentDirection: "row-reverse", in order to orient the buttons horizontally

    const container = new ThreeMeshUI.Block({
        justifyContent: 'center',
        contentDirection: 'row-reverse',
        fontFamily: './fonts/Roboto-msdf.json',
        fontTexture: './fonts/Roboto-msdf.png',
        fontSize: 0.07,
        padding: 0.02,
        borderRadius: 0.11,
        backgroundOpacity: 0
    });

    // container.position.set(-0.0, 1, 3);
    // container.rotation.x = -0.0;
    // scene.add( container );
    container.isUI = true;

    camera.add(container);
    container.position.set(-0.5, 0.35, -2);
    container.rotation.set(0, 0, 0);


    // Important: if camera wasn’t in the scene, add it
    if (!scene.children.includes(camera)) {
        scene.add(camera);
    }


    // BUTTONS

    const buttonOptions = {
        width: 0.3,
        height: 0.15,
        justifyContent: 'center',
        offset: 0.05,
        margin: 0.02,
        borderRadius: 0.075,
        backgroundOpacity: 0.3
    };

    const hoveredStateAttributes = {
        state: 'hovered',
        attributes: {
            offset: 0.035,
            backgroundColor: new THREE.Color(0x999999),
            backgroundOpacity: 1,
            fontColor: new THREE.Color(0xffffff)
        },
    };

    const idleStateAttributes = {
        state: 'idle',
        attributes: {
            offset: 0.035,
            backgroundColor: new THREE.Color(0x666666),
            backgroundOpacity: 0.3,
            fontColor: new THREE.Color(0xffffff)
        },
    };

    const buttonClose = new ThreeMeshUI.Block(buttonOptions);
    const buttonHelp = new ThreeMeshUI.Block(buttonOptions);

    const loader = new THREE.TextureLoader();
    const closeTexture = loader.load('close.png'); // replace with your file
    const infoTexture = loader.load('info.png');   // replace with your file
    const helpTexture = loader.load('help.png');   // replace with your file
    const controllerTexture = loader.load('vr-controller.png');   // replace with your file

    const closeIcon = new THREE.Mesh(
        new THREE.PlaneGeometry(0.1, 0.1), // adjust size to fit button
        new THREE.MeshBasicMaterial({
            map: closeTexture,
            transparent: true,
            depthWrite: false
        })
    );

    const infoIcon = new THREE.Mesh(
        new THREE.PlaneGeometry(0.1, 0.1),
        new THREE.MeshBasicMaterial({
            map: infoTexture,
            transparent: true,
            depthWrite: false
        })
    );

    const helpIcon = new THREE.Mesh(
        new THREE.PlaneGeometry(0.1, 0.1),
        new THREE.MeshBasicMaterial({
            map: helpTexture,
            transparent: true,
            depthWrite: false
        })
    );

    const controllerIcon = new THREE.Mesh(
        new THREE.PlaneGeometry(0.1, 0.1),
        new THREE.MeshBasicMaterial({
            map: controllerTexture,
            transparent: true,
            depthWrite: false
        })
    );

    buttonClose.add(closeIcon);
    buttonHelp.add(controllerIcon);

    closeIcon.position.z = 0.01;
    infoIcon.position.z = 0.01;
    helpIcon.position.z = 0.01;
    controllerIcon.position.z = 0.01;

    const selectedAttributes = {
        offset: 0.02,
        backgroundColor: new THREE.Color(0x777777),
        fontColor: new THREE.Color(0x222222)
    };

    buttonClose.setupState({
        state: 'selected',
        attributes: selectedAttributes,
        // onSet: () => {
        // 	currentMesh = ( currentMesh + 1 ) % meshes.length;
        // 	showMesh( currentMesh );

        // }
        onSet: () => {
            // hide current panel
            if (meshes[currentMesh]) meshes[currentMesh].visible = false;

            if (window.closeButton) {
                window.closeButton.visible = false;
            }
            buttonHelp.remove(controllerIcon);
            buttonHelp.remove(infoIcon);
            buttonHelp.add(helpIcon);

            // mark that user manually hid the close button
            closeButtonHiddenManually = true;
        }
    });

    buttonClose.setupState(hoveredStateAttributes);
    buttonClose.setupState(idleStateAttributes);
    buttonClose.isUI = true;
    buttonClose.name = "closeButton";
    window.closeButton = buttonClose; // global reference

    buttonHelp.setupState({
        state: 'selected',
        attributes: selectedAttributes,
        onSet: () => {
            // increment currentMesh safely
            if (meshes.length === 0) return;
            currentMesh = (currentMesh + 1) % meshes.length;

            showMesh(currentMesh);

            // ALWAYS show close button when clicking next
            if (window.closeButton) window.closeButton.visible = true;

            if (currentMesh === 0) {
                buttonHelp.remove(infoIcon);
                buttonHelp.remove(helpIcon);
                buttonHelp.add(controllerIcon);
            } else {
                buttonHelp.remove(helpIcon);
                buttonHelp.remove(controllerIcon);
                buttonHelp.add(infoIcon);
            }
            // currentMesh -= 1;
            // if ( currentMesh < 0 ) currentMesh = 2;
            // showMesh( currentMesh );

        }
    });
    buttonHelp.setupState(hoveredStateAttributes);
    buttonHelp.setupState(idleStateAttributes);
    buttonHelp.isUI = true;

    //

    container.add(buttonClose, buttonHelp);
    objsToTest.push(buttonClose, buttonHelp);

}

// function getUIBlock(object, stateName = 'hovered') {
//     let current = object;
//     while (current) {
//         if (
//             current.isUI &&
//             current.states &&
//             stateName in current.states
//         ) {
//             return current;
//         }
//         current = current.parent;
//     }
//     return null;
// }

// ---- COSES DELS UI BUTTONS --- //
function getUIBlock(object, state) {
    let current = object;
    while (current) {
        if (current.isUI) return current; // this is your Block (buttonNext / buttonPrevious)
        current = current.parent;
    }
    return null;
}

// ---- COSES DELS UI BUTTONS --- //
function loop() {

    controls.update();

    animate();
}

function animate() {
    delta = clock.getDelta();
    controls.update(delta);

    if (renderer.xr.isPresenting) {
        checkXRButtons(controller1);
        checkXRButtons(controller2);
    }

    ThreeMeshUI.update();

    render();
}

function render() {

    cleanIntersectedUI();

    if (controller1.userData.selected) {
        cleanIntersected(controller1);
        intersectObjects(controller1);
    }
    if (controller2.userData.selected) {
        cleanIntersected(controller2);
        intersectObjects(controller2);
    }

    renderer.render(scene, camera);
}