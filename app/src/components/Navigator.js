import '../styles/navigator.css';
import { useEffect, useRef } from 'react';
import {
    Vector3,
    WebGLRenderer,
    TextureLoader,
    PerspectiveCamera,
    Scene,
    FogExp2,
    BufferGeometry,
    Color,
    Points,
    PointsMaterial,
    AdditiveBlending,
    Float32BufferAttribute,
    LineBasicMaterial,
    Line,
    Group,
    Quaternion
} from "three";
import { prng_alea } from 'esm-seedrandom';

import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';

import { VRButton } from './VRButton';
import { Logger } from './Logger';
import { generateOrbit } from '../services/navigator';
import useStore from '../services/store';


export function Navigator() {

    const initState = useStore.getState();
    const experiment = useStore(state => state.experiment);
    const seed = useRef(initState.seed);
    const incrementSeed = useStore(state => state.incrementSeed);
    const setNavigator = useStore(state => state.setNavigator);
    const speed = useRef(initState.navigator.speed);
    const rotationSpeed = useRef(initState.navigator.rotationSpeed);
    const timerSpeed = useStore(state => state.timerSpeed);

    const { SCENE, ORBIT } = experiment.settings;
    const canvasEl = useRef(null);
    const interval = useRef(null);

    let currentOrbit = useRef({
        // params
        a: 0,
        b: 0,
        c: 0,
        d: 0,
        e: 0,
        // settings
        subsets: [],
        xMin: 0,
        xMax: 0,
        yMin: 0,
        yMax: 0,
        scaleX: 0,
        scaleY: 0
    });

    useEffect(() => {
        const stepIdxSubscriber = useStore.subscribe(state => state.stepIdx, (current, prev) => { 
            if (prev !== current) {
                const navigator = useStore.getState().navigator;
                speed.current = navigator.speed;
                rotationSpeed.current = navigator.rotationSpeed;
                const currentSeed = useStore.getState().seed;
                seed.current = currentSeed;
                start();
            }
            
        });

        setInterval(() => {
            // report current settings to state
            setNavigator({
                speed: speed.current,
                rotationSpeed: rotationSpeed.current
            })
    
          }, 1000 / timerSpeed); // report per second

        return () => {
            stepIdxSubscriber();
            clearInterval(interval.current);
        }
        

    }, [])

    const start = () => {
        init();
        animate();
    }

    const spriteSize = useRef(Math.ceil(3 * window.innerWidth / SCENE.SPRITE_SCALE_FACTOR));

    const camera = useRef(null);
    const xrCameraGroup = useRef(new Group());
    const scene = useRef(null);
    const renderer = useRef(null);

    const controller1 = useRef(null);
    const controller2 = useRef(null)
    const controllerGrip1 = useRef(null);
    const controllerGrip2 = useRef(null);

    let hueValues = [];
    //let vrHMD, vrHMDSensor;

    let cursorX = 0, cursorY = 0;
    let renderTargetWidth = window.innerWidth;
    let renderTargetHeight = window.innerHeight;

    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;

    //let vrSupported = false;
    const vrEnabled = useRef(false);
    let isFullscreen = false;

    const init = () => {

        let orbit = { ...currentOrbit.current };

        scene.current = new Scene();
        scene.current.fog = new FogExp2(0x000000, 0.0012);

        // Initialize data points
        for (let i = 0; i < SCENE.NUM_SUBSETS; i++) {
            let subsetPoints = [];
            for (let j = 0; j < SCENE.NUM_POINTS_SUBSET; j++) {
                subsetPoints[j] = {
                    x: 0,
                    y: 0,
                    vertex: new Vector3(0, 0, 0)
                };
            }
            orbit.subsets.push(subsetPoints);
        }

        renderer.current = new WebGLRenderer({
            canvas: canvasEl.current,
            clearColor: 0x000000,
            clearAlpha: 1,
            //antialias: true,
            devicePixelRatio: window.devicePixelRatio || 1,
            powerPreference: "high-performance"
        });

        renderer.current.setSize(renderTargetWidth, renderTargetHeight);
        renderer.current.xr.enabled = true;


        // set up controllers

        function onSelectStart() {

            this.userData.isSelecting = true;
        }

        function onSelectEnd() {

            this.userData.isSelecting = false;
        }

        controller1.current = renderer.current.xr.getController(0);
        controller1.current.addEventListener('selectstart', onSelectStart);
        controller1.current.addEventListener('selectend', onSelectEnd);
        controller1.current.addEventListener('connected', function (event) {
            this.add(buildController(event.data));
        });
        controller1.current.addEventListener('disconnected', function () {
            this.remove(this.children[0]);
        });

        controller2.current = renderer.current.xr.getController(1);
        controller2.current.addEventListener('selectstart', onSelectStart);
        controller2.current.addEventListener('selectend', onSelectEnd);
        controller2.current.addEventListener('connected', function (event) {
            this.add(buildController(event.data));
        });
        controller2.current.addEventListener('disconnected', function () {
            this.remove(this.children[0]);
        });

        scene.current.add(controller1.current);
        scene.current.add(controller2.current);

        // The XRControllerModelFactory will automatically fetch controller models
        // that match what the user is holding as closely as possible. The models
        // should be attached to the object returned from getControllerGrip in
        // order to match the orientation of the held device.

        const controllerModelFactory = new XRControllerModelFactory();

        controllerGrip1.current = renderer.current.xr.getControllerGrip(0);
        controllerGrip1.current.add(controllerModelFactory.createControllerModel(controllerGrip1.current));
        scene.current.add(controllerGrip1.current);

        controllerGrip2.current = renderer.current.xr.getControllerGrip(1);
        controllerGrip2.current.add(controllerModelFactory.createControllerModel(controllerGrip2.current));
        scene.current.add(controllerGrip2.current);


        // set up effects and scene objects

        spriteSize.current = Math.ceil(3 * renderTargetWidth / 1600);

        const sprite1 = new TextureLoader().load('spiral-galaxy.svg');

        camera.current = new PerspectiveCamera(60, renderTargetWidth / renderTargetHeight, 1, 3 * SCENE.SCALE_FACTOR);
        camera.current.position.set(0, 0, SCENE.SCALE_FACTOR / 2);
        
        const rng = prng_alea(seed.current);
        orbit = generateOrbit({ ...orbit }, ORBIT, SCENE, rng);

        const pointColor = new Color();
  
        for (let s = 0; s < SCENE.NUM_SUBSETS; s++) { hueValues[s] = rng(); }

        // Create particle systems
        for (let k = 0; k < SCENE.NUM_LEVELS; k++) {
            for (let s = 0; s < SCENE.NUM_SUBSETS; s++) {
                const points = [];
                for (let i = 0; i < SCENE.NUM_POINTS_SUBSET; i++) { points.push(orbit.subsets[s][i].vertex); }
                let geometry = new BufferGeometry().setFromPoints(points);
                pointColor.setHSL(hueValues[s], SCENE.DEF_SATURATION, SCENE.DEF_BRIGHTNESS);
                let pointsMaterial = new PointsMaterial({
                    size: spriteSize.current,
                    map: sprite1,
                    blending: AdditiveBlending,
                    depthTest: false,
                    transparent: true,
                    color: pointColor
                });
                let particles = new Points(geometry, pointsMaterial);
                particles.myMaterial = pointsMaterial;
                //particles.myLevel = k;
                particles.mySubset = s;
                particles.position.x = 0;
                particles.position.y = 0;
                particles.position.z = - SCENE.LEVEL_DEPTH * k - (s * SCENE.LEVEL_DEPTH / SCENE.NUM_SUBSETS) + SCENE.SCALE_FACTOR / 2;
                particles.needsUpdate = 0;
                particles.name = 'particle-cloud';
                scene.current.add(particles);
            }
        }

        currentOrbit.current = orbit;

        // Setup listeners
        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('touchstart', onDocumentTouchStart, false);
        document.addEventListener('touchmove', onDocumentTouchMove, false);
        document.addEventListener('webkitfullscreenchange', onFullscreenChange, false);
        document.addEventListener('mozfullscreenchange', onFullscreenChange, false);
        window.addEventListener('resize', onWindowResize, false);
        window.addEventListener('keypress', onKeyPress, false);
        window.addEventListener('keydown', onKeyDown, false);

        setInterval(updateScene, 4000);

    }

    const updateScene = () => {

        incrementSeed();
        const currentSeed = useStore.getState().seed;
        seed.current = currentSeed;
        const rng = prng_alea(seed.current);

        let points = scene.current.children.filter(child => child.name === "particle-cloud");

        for (let s = 0; s < SCENE.NUM_SUBSETS; s++) {
            hueValues[s] = rng();
        }
        for (let i = 0; i < points.length; i++) {
            points[i].needsUpdate = 1;
        }

        currentOrbit.current = generateOrbit({ ...currentOrbit.current }, ORBIT, SCENE, rng);

        const subsets = currentOrbit.current.subsets;
        const scale_factor_l = SCENE.SCALE_FACTOR;
        const num_points_subset_l = SCENE.NUM_POINTS_SUBSET;
        const xMax = currentOrbit.current.xMax;
        const xMin = currentOrbit.current.xMin;
        const yMin = currentOrbit.current.yMin;
        const yMax = currentOrbit.current.yMax;
        const scaleX = 2 * scale_factor_l / (xMax - xMin);
        const scaleY = 2 * scale_factor_l / (yMax - yMin);
        for (let k = 0, idx = 0; k < SCENE.NUM_LEVELS; k++) {
            for (let s = 0; s < SCENE.NUM_SUBSETS; s++, idx++) {
                for (let i = 0; i < num_points_subset_l; i++) {
                    // update existing points in orbit    
                    points[idx].geometry.attributes.position.setXY(
                        i,
                        scaleX * (subsets[s][i].x - xMin) - scale_factor_l,
                        scaleY * (subsets[s][i].y - yMin) - scale_factor_l);
                }
            }
        }
    }

    function buildController(data) {

        let geometry, material;

        switch (data.targetRayMode) {

            case 'tracked-pointer':

                geometry = new BufferGeometry();
                geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 0, 0, - 1], 3));
                geometry.setAttribute('color', new Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3));

                material = new LineBasicMaterial({ vertexColors: true, blending: AdditiveBlending });

                return new Line(geometry, material);

            // case 'gaze':

            //   geometry = new RingGeometry( 0.02, 0.04, 32 ).translate( 0, 0, - 1 );
            //   material = new MeshBasicMaterial( { opacity: 0.5, transparent: true } );
            //   return new Mesh( geometry, material );

        }

    }

    function handleController(controller) {

        if (controller.userData.isSelecting) {


            //console.log(controller);



            //cursorX = event.clientX - windowHalfX;
            //cursorY = event.clientY - windowHalfY;

            // const object = room.children[ count ++ ];

            // object.position.copy( controller.position );
            // object.userData.velocity.x = ( rng() - 0.5 ) * 3;
            // object.userData.velocity.y = ( rng() - 0.5 ) * 3;
            // object.userData.velocity.z = ( rng() - 9 );
            // object.userData.velocity.applyQuaternion( controller.quaternion );

            // if ( count === room.children.length ) count = 0;



        }

    }

    const animate = () => {
        renderer.current.setAnimationLoop(render);
    }

    const render = () => {

        const points = scene.current.children.filter(child => child.name === "particle-cloud");

        // update particle positions
        for (let i = 0; i < points.length; i++) {
            points[i].position.z += speed.current;
            points[i].rotation.z += rotationSpeed.current;
            // if the particle level has passed the fade distance
            if (points[i].position.z >= ((SCENE.NUM_LEVELS / 2) - 1) * SCENE.LEVEL_DEPTH + SCENE.SCALE_FACTOR) {
                // move the particle level back in front of the camera
                points[i].position.z = -((SCENE.NUM_LEVELS / 2) - 1) * SCENE.LEVEL_DEPTH;
                if (points[i].needsUpdate === 1) {
                    // update the geometry and color
                    points[i].geometry.attributes.position.needsUpdate = true;

                    points[i].myMaterial.color.setHSL(hueValues[points[i].mySubset], SCENE.DEF_SATURATION, SCENE.DEF_BRIGHTNESS);
                    points[i].needsUpdate = 0;

                }
            }
        }


        //handleController(controller1.current);

        if (vrEnabled.current) {
            // get state
            //let state = vrHMDSensor.getState();
            const state = controller1.current;


            // if the position is reported use it
            // if (state.position) {

            const xrCam = xrCameraGroup.current.children[0];
            if (!xrCam) return;


            if (xrCameraGroup.current.position.x >= - SCENE.CAMERA_BOUND && xrCameraGroup.current.position.x <= SCENE.CAMERA_BOUND) {
                xrCameraGroup.current.position.x += (cursorX - xrCameraGroup.current.position.x) * 0.05;
                if (xrCameraGroup.current.position.x < - SCENE.CAMERA_BOUND) xrCameraGroup.current.position.x = -SCENE.CAMERA_BOUND;
                if (xrCameraGroup.current.position.x > SCENE.CAMERA_BOUND) xrCameraGroup.current.position.x = SCENE.CAMERA_BOUND;
            }
            if (xrCameraGroup.current.position.y >= - SCENE.CAMERA_BOUND && xrCameraGroup.current.position.y <= SCENE.CAMERA_BOUND) {
                xrCameraGroup.current.position.y += (- cursorY - xrCameraGroup.current.position.y) * 0.05;
                if (xrCameraGroup.current.position.y < - SCENE.CAMERA_BOUND) xrCameraGroup.current.position.y = -SCENE.CAMERA_BOUND;
                if (xrCameraGroup.current.position.y > SCENE.CAMERA_BOUND) xrCameraGroup.current.position.y = SCENE.CAMERA_BOUND;
            }

            const vector = new Vector3(0, 0, -1);
            vector.applyQuaternion(xrCameraGroup.current.quaternion);

            xrCam.updateWorldMatrix(true, true);

            renderer.current.render(scene.current, xrCam);
            return;



            // cLeft.quaternion.set(0,0,0,0);
            // cRight.quaternion.set(0,0,0,0);



            // from middle to one end
            // cLeft.lookAt(0,0,-(SCENE.SCALE_FACTOR / 4));
            // cRight.lookAt(0,0,-(SCENE.SCALE_FACTOR / 4));


            //const quaternion = new Quaternion();

            // cLeft.applyQuaternion(quaternion); // Apply Quaternion
            // cLeft.quaternion.normalize();  // Normalize Quaternion
            // cRight.applyQuaternion(quaternion); // Apply Quaternion
            // cRight.quaternion.normalize();  // Normalize Quaternion


            //renderer.current.render(scene.current, camera.current);

        } else {
            // move the camera position based on mouse position/taps
            if (camera.current.position.x >= - SCENE.CAMERA_BOUND && camera.current.position.x <= SCENE.CAMERA_BOUND) {
                camera.current.position.x += (cursorX - camera.current.position.x) * 0.05;
                if (camera.current.position.x < - SCENE.CAMERA_BOUND) camera.current.position.x = -SCENE.CAMERA_BOUND;
                if (camera.current.position.x > SCENE.CAMERA_BOUND) camera.current.position.x = SCENE.CAMERA_BOUND;
            }
            if (camera.current.position.y >= - SCENE.CAMERA_BOUND && camera.current.position.y <= SCENE.CAMERA_BOUND) {
                camera.current.position.y += (- cursorY - camera.current.position.y) * 0.05;
                if (camera.current.position.y < - SCENE.CAMERA_BOUND) camera.current.position.y = -SCENE.CAMERA_BOUND;
                if (camera.current.position.y > SCENE.CAMERA_BOUND) camera.current.position.y = SCENE.CAMERA_BOUND;
            }
            // look straight ahead
            camera.current.lookAt(scene.current.position);

            renderer.current.render(scene.current, camera.current);

        }





    }

    const onSetVRSession = async (session) => {
        vrEnabled.current = true;
        await renderer.current.xr.setSession(session);

        xrCameraGroup.current.position.set(0, 0, SCENE.SCALE_FACTOR / 2);
        xrCameraGroup.current.add(renderer.current.xr.getCamera());
        //camera.current = renderer.current.xr.getCamera();
        //camera.current.position.set(0, 0, SCENE.SCALE_FACTOR / 2);
    }

    const onEndVRSession = (session) => {
        vrEnabled.current = false;
        init();

    }






    ///////////////////////////////////////////////
    // Event listeners
    ///////////////////////////////////////////////
    const onDocumentMouseMove = (event) => {
        cursorX = event.clientX - windowHalfX;
        cursorY = event.clientY - windowHalfY;
    }

    const onDocumentTouchStart = (event) => {
        if (event.touches.length === 1) {
            event.preventDefault();
            cursorX = event.touches[0].pageX - windowHalfX;
            cursorY = event.touches[0].pageY - windowHalfY;
        }
    }

    const onDocumentTouchMove = (event) => {
        if (event.touches.length === 1) {
            event.preventDefault();
            cursorX = event.touches[0].pageX - windowHalfX;
            cursorY = event.touches[0].pageY - windowHalfY;
        }
    }

    // Find the right method, call on correct element
    const launchIntoFullscreen = (element) => {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }

    // Whack fullscreen
    const exitFullscreen = () => {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }

    const onFullscreenChange = () => {
        if (!document.webkitFullscreenElement && !document.mozFullScreenElement) {
            isFullscreen = false;
            canvasEl.current.style.cursor = "";
            // if (vrSupported) {
            //   vrEnabled = false;
            //   // unhide the mouse and set the device pixel ratio correctly
            //   renderer.devicePixelRatio = window.devicePixelRatio || 1;
            // }
        } else {
            isFullscreen = true;
            canvasEl.current.style.cursor = "none";
            // if (vrSupported) {
            //   vrEnabled = true;
            //   // reset the sensor on enable
            //   vrHMDSensor.zeroSensor();
            //   // reset the camera position
            //   camera.current.position.set(0, 0, SCENE.SCALE_FACTOR / 2);
            //   // hide the mouse, and set the device pixel ratio to 1
            //   renderer.devicePixelRatio = 1;
            // }
        }
        // force resolution change
        onWindowResize();
    }

    const onWindowResize = (event) => {
        renderTargetWidth = window.innerWidth;
        renderTargetHeight = window.innerHeight;
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

        // use recommended render target size if in VR
        if (vrEnabled) {
            //   if ('getRecommendedEyeRenderRect' in vrHMD) {
            //     let leftEyeViewport = vrHMD.getRecommendedEyeRenderRect("left");
            //     let rightEyeViewport = vrHMD.getRecommendedEyeRenderRect("right");
            //     renderTargetWidth = leftEyeViewport.width + rightEyeViewport.width;
            //     renderTargetHeight = Math.max(leftEyeViewport.height, rightEyeViewport.height);
            //   }
            //   // only scale the sprites to half the size for VR
            spriteSize.current = Math.ceil(3 * renderTargetWidth / 3200);
        } else {
            spriteSize.current = Math.ceil(3 * renderTargetWidth / 1600);
        }

        const points = scene.current.children.filter(child => child.name === "particle-cloud");

        // rescale sprites for new resolution
        for (let i = 0; i < points.length; i++) {
            points[i].myMaterial.size = spriteSize.current;
        }

        // update camera
        camera.current.aspect = renderTargetWidth / renderTargetHeight;
        camera.current.updateProjectionMatrix();

        // change render target size
        renderer.current.setSize(renderTargetWidth, renderTargetHeight);
        renderer.current.setViewport(0, 0, renderTargetWidth, renderTargetHeight);
    }

    const onKeyDown = (event) => {
        // hande up/down/left/right, wasd keys
        if ((event.keyCode === 38 || event.keyCode === 87) && speed.current < 20) {
            speed.current += 0.5;
            return;
        }
        if ((event.keyCode === 40 || event.keyCode === 83) && speed.current > 0.5) {
            speed.current -= 0.5;
            return;
        };
        if (event.keyCode === 37 || event.keyCode === 65) {
            if (rotationSpeed.current < 0.1) {
                rotationSpeed.current += 0.001;
            }
            return;
        } if (event.keyCode === 39 || event.keyCode === 68) { 
            if (rotationSpeed.current > -0.1) {
                rotationSpeed.current -= 0.001; 
            }
            return;
        }
    }

    const onKeyPress = (event) => {
        // handle 'f'
        if (event.which === 70 || event.which === 102) {
            //if (vrEnabled || isFullscreen) {
            if (isFullscreen) {
                exitFullscreen();
                // } else if (vrSupported) {
                //   if (canvasEl.current.mozRequestFullScreen) {
                //     canvasEl.current.mozRequestFullScreen({
                //       vrDisplay: vrHMD
                //     });
                //   } else if (canvasEl.current.webkitRequestFullscreen) {
                //     canvasEl.current.webkitRequestFullscreen({
                //       vrDisplay: vrHMD,
                //     });
                //   }
            } else {
                launchIntoFullscreen(canvasEl.current);
            }
            // } else if (vrEnabled && (event.which === 82 || event.which === 114)) {
            //   // handle 'z'
            //   vrHMDSensor.zeroSensor();
        }
    }
    ///

    return (
        <div className="Navigator">
            <canvas ref={canvasEl}></canvas>
            {experiment.settings.isVR && <VRButton setVRSession={onSetVRSession} endVRSession={onEndVRSession}></VRButton>}
            <Logger/>
        </div>
    );
}

export default Navigator;