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
    Line
} from "three";

import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';

import { VRButton } from './VRButton';
import { Quaternion } from 'three';

// Orbit parameters constraints
const A_MIN = -30;
const A_MAX = 30;
const B_MIN = 0.2;
const B_MAX = 1.8;
const C_MIN = 5;
const C_MAX = 17;
const D_MIN = 0;
const D_MAX = 10;
const E_MIN = 0;
const E_MAX = 12;

// Constants
const SPRITE_SCALE_FACTOR = 800;
const SCALE_FACTOR = 1600;
const CAMERA_BOUND = 200;

const NUM_POINTS_SUBSET = 25000;
const NUM_SUBSETS = 7;

const NUM_LEVELS = 10;
const LEVEL_DEPTH = 400;

const DEF_BRIGHTNESS = 0.5;
const DEF_SATURATION = 1;



function Navigator(props) {

    const canvasEl = useRef(null);


    let speed = 2.0;
    let rotationSpeed = -0.004;
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
        init();
        animate();
    })

    const spriteSize = useRef(Math.ceil(3 * window.innerWidth / SPRITE_SCALE_FACTOR));

    const camera = useRef(null);
    const scene = useRef(null);
    const renderer = useRef(null);

    const controller1 = useRef(null);
    const controller2 = useRef(null)
    const controllerGrip1 = useRef(null);
    const controllerGrip2 = useRef(null);


    let hueValues = [];
    //let vrHMD, vrHMDSensor;

    let mouseX = 0, mouseY = 0;
    let renderTargetWidth = window.innerWidth;
    let renderTargetHeight = window.innerHeight;

    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;

    //let vrSupported = false;
    const vrEnabled = useRef(false);
    let isFullscreen = false;

    const init = () => {

        const orbit = { ...currentOrbit.current };

        scene.current = new Scene();
        scene.current.fog = new FogExp2(0x000000, 0.0012);

        // Initialize data points
        for (let i = 0; i < NUM_SUBSETS; i++) {
            let subsetPoints = [];
            for (let j = 0; j < NUM_POINTS_SUBSET; j++) {
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

        camera.current = new PerspectiveCamera(60, renderTargetWidth / renderTargetHeight, 1, 3 * SCALE_FACTOR);
        camera.current.position.set(0, 0, SCALE_FACTOR / 2);

        currentOrbit.current = generateAndUpdateOrbit(orbit);

        const pointColor = new Color();

        for (let s = 0; s < NUM_SUBSETS; s++) { hueValues[s] = Math.random(); }

        // Create particle systems
        for (let k = 0; k < NUM_LEVELS; k++) {
            for (let s = 0; s < NUM_SUBSETS; s++) {
                const points = [];
                for (let i = 0; i < NUM_POINTS_SUBSET; i++) { points.push(orbit.subsets[s][i].vertex); }
                let geometry = new BufferGeometry().setFromPoints(points);
                pointColor.setHSL(hueValues[s], DEF_SATURATION, DEF_BRIGHTNESS);
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
                particles.position.z = - LEVEL_DEPTH * k - (s * LEVEL_DEPTH / NUM_SUBSETS) + SCALE_FACTOR / 2;
                particles.needsUpdate = 0;
                particles.name = 'particle-cloud';
                scene.current.add(particles);
            }
        }

        // Setup listeners
        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('touchstart', onDocumentTouchStart, false);
        document.addEventListener('touchmove', onDocumentTouchMove, false);
        document.addEventListener('webkitfullscreenchange', onFullscreenChange, false);
        document.addEventListener('mozfullscreenchange', onFullscreenChange, false);
        window.addEventListener('resize', onWindowResize, false);
        window.addEventListener('keypress', onKeyPress, false);
        window.addEventListener('keydown', onKeyDown, false);

        setInterval(updateOrbit, 4000);

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



            //mouseX = event.clientX - windowHalfX;
            //mouseY = event.clientY - windowHalfY;

            // const object = room.children[ count ++ ];

            // object.position.copy( controller.position );
            // object.userData.velocity.x = ( Math.random() - 0.5 ) * 3;
            // object.userData.velocity.y = ( Math.random() - 0.5 ) * 3;
            // object.userData.velocity.z = ( Math.random() - 9 );
            // object.userData.velocity.applyQuaternion( controller.quaternion );

            // if ( count === room.children.length ) count = 0;



        }

    }

    const animate = () => {
        renderer.current.setAnimationLoop(render);
    }

    const render = () => {

        //handleController(controller1.current);

        if (vrEnabled.current) {
            // get state
            //let state = vrHMDSensor.getState();
            console.log(controller1.current.quaternion.x);
            const state = controller1.current;


            // if the position is reported use it
            // if (state.position) {

            const cLeft = camera.current.cameras[0];
            const cRight = camera.current.cameras[1];


            // cLeft.position.set(state.position.x * CAMERA_BOUND,
            //     state.position.y * CAMERA_BOUND,
            //     state.position.z * CAMERA_BOUND + SCALE_FACTOR / 2);

           

            // cRight.position.set(state.position.x * CAMERA_BOUND,
            //     state.position.y * CAMERA_BOUND,
            //     state.position.z * CAMERA_BOUND + SCALE_FACTOR / 2);



            if (cLeft.position.x >= - CAMERA_BOUND && cLeft.position.x <= CAMERA_BOUND) {
                cLeft.position.x += (mouseX - cLeft.position.x) * 0.05;
                if (cLeft.position.x < - CAMERA_BOUND) cLeft.position.x = -CAMERA_BOUND;
                if (cLeft.position.x > CAMERA_BOUND) cLeft.position.x = CAMERA_BOUND;
            }
            if (cLeft.position.y >= - CAMERA_BOUND && cLeft.position.y <= CAMERA_BOUND) {
                cLeft.position.y += (- mouseY - cLeft.position.y) * 0.05;
                if (cLeft.position.y < - CAMERA_BOUND) cLeft.position.y = -CAMERA_BOUND;
                if (cLeft.position.y > CAMERA_BOUND) cLeft.position.y = CAMERA_BOUND;
            }

            if (cRight.position.x >= - CAMERA_BOUND && cRight.position.x <= CAMERA_BOUND) {
                cRight.position.x += (mouseX - cRight.position.x) * 0.05;
                if (cRight.position.x < - CAMERA_BOUND) cRight.position.x = -CAMERA_BOUND;
                if (cRight.position.x > CAMERA_BOUND) cRight.position.x = CAMERA_BOUND;
            }
            if (cRight.position.y >= - CAMERA_BOUND && cRight.position.y <= CAMERA_BOUND) {
                cRight.position.y += (- mouseY - cRight.position.y) * 0.05;
                if (cRight.position.y < - CAMERA_BOUND) cRight.position.y = -CAMERA_BOUND;
                if (cRight.position.y > CAMERA_BOUND) cRight.position.y = CAMERA_BOUND;
            }

            
            
            
            // cLeft.quaternion.set(0,0,0,0);
            // cRight.quaternion.set(0,0,0,0);

            //const vector = new Vector3( 0, 0, -1 );
            // vector.applyQuaternion( cLeft.quaternion );
            // vector.applyQuaternion( cRight.quaternion );
            

            cLeft.updateWorldMatrix(true, false);
            cRight.updateWorldMatrix(true, false);

            
            // from middle to one end
            cLeft.lookAt(0,0,-(SCALE_FACTOR / 4));
            cRight.lookAt(0,0,-(SCALE_FACTOR / 4));
            const quaternion = new Quaternion();

            // cLeft.applyQuaternion(quaternion); // Apply Quaternion
            // cLeft.quaternion.normalize();  // Normalize Quaternion
            // cRight.applyQuaternion(quaternion); // Apply Quaternion
            // cRight.quaternion.normalize();  // Normalize Quaternion



        } else {
            // move the camera position based on mouse position/taps
            if (camera.current.position.x >= - CAMERA_BOUND && camera.current.position.x <= CAMERA_BOUND) {
                camera.current.position.x += (mouseX - camera.current.position.x) * 0.05;
                if (camera.current.position.x < - CAMERA_BOUND) camera.current.position.x = -CAMERA_BOUND;
                if (camera.current.position.x > CAMERA_BOUND) camera.current.position.x = CAMERA_BOUND;
            }
            if (camera.current.position.y >= - CAMERA_BOUND && camera.current.position.y <= CAMERA_BOUND) {
                camera.current.position.y += (- mouseY - camera.current.position.y) * 0.05;
                if (camera.current.position.y < - CAMERA_BOUND) camera.current.position.y = -CAMERA_BOUND;
                if (camera.current.position.y > CAMERA_BOUND) camera.current.position.y = CAMERA_BOUND;
            }
            // look straight ahead
            camera.current.lookAt(scene.current.position);
        }

        const points = scene.current.children.filter(child => child.name === "particle-cloud");

        // update particle positions
        for (let i = 0; i < points.length; i++) {
            points[i].position.z += speed;
            points[i].rotation.z += rotationSpeed;
            // if the particle level has passed the fade distance
            if (points[i].position.z >= ((NUM_LEVELS / 2) - 1) * LEVEL_DEPTH + SCALE_FACTOR) {
                // move the particle level back in front of the camera
                points[i].position.z = -((NUM_LEVELS / 2) - 1) * LEVEL_DEPTH;
                if (points[i].needsUpdate === 1) {
                    // update the geometry and color
                    points[i].geometry.attributes.position.needsUpdate = true;

                    points[i].myMaterial.color.setHSL(hueValues[points[i].mySubset], DEF_SATURATION, DEF_BRIGHTNESS);
                    points[i].needsUpdate = 0;

                }
            }
        }

        renderer.current.render(scene.current, camera.current);

    }

    const onSetVRSession = async (session) => {
        vrEnabled.current = true;
        await renderer.current.xr.setSession(session);
        //camera.current = renderer.current.xr.getCamera();
        //camera.current.position.set(0, 0, SCALE_FACTOR / 2);
    }

    const onEndVRSession = (session) => {
        vrEnabled.current = false;
        init();

    }


    ///////////////////////////////////////////////
    // Hopalong Orbit Generator
    ///////////////////////////////////////////////
    const updateOrbit = () => {

        for (let s = 0; s < NUM_SUBSETS; s++) {
            hueValues[s] = Math.random();
        }
        const points = scene.current.children.filter(child => child.name === "particle-cloud");
        for (let i = 0; i < points.length; i++) {
            points[i].needsUpdate = 1;
        }
        currentOrbit.current = generateAndUpdateOrbit({ ...currentOrbit.current });


    }

    const generateAndUpdateOrbit = (orbit) => {
        let x, y, z, x1;
        //let idx = 0;

        orbit = prepareOrbit({ ...orbit });

        let al = orbit.a;
        let bl = orbit.b;
        let cl = orbit.c;
        let dl = orbit.d;
        let el = orbit.e;
        let subsets = orbit.subsets;
        let num_points_subset_l = NUM_POINTS_SUBSET;
        let scale_factor_l = SCALE_FACTOR;

        let xMin = 0, xMax = 0, yMin = 0, yMax = 0;

        for (let s = 0; s < NUM_SUBSETS; s++) {

            // Use a different starting point for each orbit subset
            x = s * 0.005 * (0.5 - Math.random());
            y = s * 0.005 * (0.5 - Math.random());

            let curSubset = subsets[s];

            for (let i = 0; i < num_points_subset_l; i++) {

                // Iteration formula (generalization of the Barry Martin's original one)
                z = (dl + Math.sqrt(Math.abs(bl * x - cl)));
                if (x > 0) { x1 = y - z; }
                else if (x === 0) { x1 = y; }
                else { x1 = y + z; }
                y = al - x;
                x = x1 + el;

                curSubset[i].x = x;
                curSubset[i].y = y;

                if (x < xMin) { xMin = x; }
                else if (x > xMax) { xMax = x; }
                if (y < yMin) { yMin = y; }
                else if (y > yMax) { yMax = y; }

                //idx++;
            }
        }

        let scaleX = 2 * scale_factor_l / (xMax - xMin);
        let scaleY = 2 * scale_factor_l / (yMax - yMin);

        orbit.xMin = xMin;
        orbit.xMax = xMax;
        orbit.yMin = yMin;
        orbit.yMax = yMax;
        orbit.scaleX = scaleX;
        orbit.scaleY = scaleY;

        // find all points
        const points = scene.current.children.filter(child => child.name === "particle-cloud");

        if (points.length === 0) {
            // Normalize vertex data
            for (let k = 0, idx = 0; k < NUM_LEVELS; k++) {
                for (let s = 0; s < NUM_SUBSETS; s++, idx++) {
                    let curSubset = subsets[s];
                    for (let i = 0; i < num_points_subset_l; i++) {
                        curSubset[i].vertex.x = scaleX * (curSubset[i].x - xMin) - scale_factor_l;
                        curSubset[i].vertex.y = scaleY * (curSubset[i].y - yMin) - scale_factor_l;;
                    }
                }
            }
        } else {
            // Normalize AND update vertex data
            for (let k = 0, idx = 0; k < NUM_LEVELS; k++) {
                for (let s = 0; s < NUM_SUBSETS; s++, idx++) {
                    let curSubset = subsets[s];
                    for (let i = 0; i < num_points_subset_l; i++) {
                        const vertexX = scaleX * (curSubset[i].x - xMin) - scale_factor_l;
                        const vertexY = scaleY * (curSubset[i].y - yMin) - scale_factor_l;
                        curSubset[i].vertex.x = vertexX
                        curSubset[i].vertex.y = vertexY;
                        // update existing points in orbit    
                        points[idx].geometry.attributes.position.setXY(i, vertexX, vertexY);
                    }
                }
            }
        }
        return orbit;

    }

    const prepareOrbit = (orbit) => {
        //shuffle params
        orbit.a = A_MIN + Math.random() * (A_MAX - A_MIN);
        orbit.b = B_MIN + Math.random() * (B_MAX - B_MIN);
        orbit.c = C_MIN + Math.random() * (C_MAX - C_MIN);
        orbit.d = D_MIN + Math.random() * (D_MAX - D_MIN);
        orbit.e = E_MIN + Math.random() * (E_MAX - E_MIN);

        orbit.xMin = 0;
        orbit.xMax = 0;
        orbit.yMin = 0;
        orbit.yMax = 0;

        return orbit;
    }

    ///////////////////////////////////////////////
    // Event listeners
    ///////////////////////////////////////////////
    const onDocumentMouseMove = (event) => {
        mouseX = event.clientX - windowHalfX;
        mouseY = event.clientY - windowHalfY;
    }

    const onDocumentTouchStart = (event) => {
        if (event.touches.length === 1) {
            event.preventDefault();
            mouseX = event.touches[0].pageX - windowHalfX;
            mouseY = event.touches[0].pageY - windowHalfY;
        }
    }

    const onDocumentTouchMove = (event) => {
        if (event.touches.length === 1) {
            event.preventDefault();
            mouseX = event.touches[0].pageX - windowHalfX;
            mouseY = event.touches[0].pageY - windowHalfY;
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
            //   camera.current.position.set(0, 0, SCALE_FACTOR / 2);
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
        // hande up/down/left/right keys
        if (event.keyCode === 38 && speed < 20) speed += 0.5;
        else if (event.keyCode === 40 && speed > 0.5) speed -= 0.5;
        else if (event.keyCode === 37) rotationSpeed += 0.001;
        else if (event.keyCode === 39) rotationSpeed -= 0.001;
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
            {<VRButton setVRSession={onSetVRSession} endVRSession={onEndVRSession}></VRButton>}
        </div>
    );
}

export default Navigator;
