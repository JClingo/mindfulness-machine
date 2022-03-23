import './App.css';
// import * as THREE from './js/Three';
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
  AdditiveBlending
} from "three";

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
const SCALE_FACTOR = 1500;
const CAMERA_BOUND = 200;

const NUM_POINTS_SUBSET = 20000;
const NUM_SUBSETS = 7;

const NUM_LEVELS = 10;
const LEVEL_DEPTH = 400;

const DEF_BRIGHTNESS = 0.5;
const DEF_SATURATION = 1;



function App() {

  const canvasEl = useRef(null);

  let speed = 4.0;
  let rotationSpeed = -0.004;
  let currentOrbit = {
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
  };

  useEffect(() => {
    init();
    render();
  })

  // TODO: UseRefs
  let spriteSize = Math.ceil(3 * window.innerWidth / 1600);


  let camera, scene, renderer, vrrenderer;
  let hueValues = [];
  //let vrHMD, vrHMDSensor;

  let mouseX = 0, mouseY = 0;
  let renderTargetWidth = window.innerWidth;
  let renderTargetHeight = window.innerHeight;

  let windowHalfX = window.innerWidth / 2;
  let windowHalfY = window.innerHeight / 2;

  //let vrSupported = false;
  //let vrEnabled = false;
  let isFullscreen = false;

  const init = () => {

    const orbit = { ...currentOrbit };

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

    renderer = new WebGLRenderer({
      canvas: canvasEl.current,
      clearColor: 0x000000,
      clearAlpha: 1,
      devicePixelRatio: window.devicePixelRatio || 1,
      powerPreference: "high-performance"
    });

    // Setup renderer and effects
    renderer.setSize(renderTargetWidth, renderTargetHeight);
    renderer.xr.enabled = true;

    spriteSize = Math.ceil(3 * renderTargetWidth / 1600);

    const sprite1 = new TextureLoader().load('galaxy.png');

    camera = new PerspectiveCamera(60, renderTargetWidth / renderTargetHeight, 1, 3 * SCALE_FACTOR);
    camera.position.set(0, 0, SCALE_FACTOR / 2);

    scene = new Scene();
    scene.fog = new FogExp2(0x000000, 0.00025);

    currentOrbit = generateAndUpdateOrbit(orbit);

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
          size: (spriteSize),
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
        scene.add(particles);
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

    setInterval(updateOrbit, 7000);

  }

  const render = () => renderer.setAnimationLoop(() => {
    // if (vrEnabled && vrHMDSensor) {
    //   // get state
    //   let state = vrHMDSensor.getState();

    //   // if the position is reported use it
    //   if (state.position) {
    //     camera.position.set(state.position.x * 50,
    //       state.position.y * 50,
    //       state.position.z * 50 + SCALE_FACTOR / 2);
    //   }

    //   // if the orientation is reported use it
    //   if (state.orientation) {
    //     camera.quaternion.set(state.orientation.x,
    //       state.orientation.y,
    //       state.orientation.z,
    //       state.orientation.w);
    //   } else {
    //     camera.lookAt(scene.position);
    //   }
    // } else {
    // move the camera position based on mouse position/taps
    if (camera.position.x >= - CAMERA_BOUND && camera.position.x <= CAMERA_BOUND) {
      camera.position.x += (mouseX - camera.position.x) * 0.05;
      if (camera.position.x < - CAMERA_BOUND) camera.position.x = -CAMERA_BOUND;
      if (camera.position.x > CAMERA_BOUND) camera.position.x = CAMERA_BOUND;
    }
    if (camera.position.y >= - CAMERA_BOUND && camera.position.y <= CAMERA_BOUND) {
      camera.position.y += (- mouseY - camera.position.y) * 0.05;
      if (camera.position.y < - CAMERA_BOUND) camera.position.y = -CAMERA_BOUND;
      if (camera.position.y > CAMERA_BOUND) camera.position.y = CAMERA_BOUND;
    }
    // look straight ahead
    camera.lookAt(scene.position);
    //}

    // update particle positions
    for (let i = 0; i < scene.children.length; i++) {
      scene.children[i].position.z += speed;
      scene.children[i].rotation.z += rotationSpeed;
      // if the particle level has passed the fade distance
      if (scene.children[i].position.z >= ((NUM_LEVELS / 2) - 1) * LEVEL_DEPTH + SCALE_FACTOR) {
        // move the particle level back in front of the camera
        scene.children[i].position.z = -((NUM_LEVELS / 2) - 1) * LEVEL_DEPTH;
        if (scene.children[i].needsUpdate === 1) {
          // update the geometry and color
          scene.children[i].geometry.attributes.position.needsUpdate = true;

          scene.children[i].myMaterial.color.setHSL(hueValues[scene.children[i].mySubset], DEF_SATURATION, DEF_BRIGHTNESS);
          scene.children[i].needsUpdate = 0;

        }
      }
    }

    // call the proper renderer
    // if (vrEnabled) {
    //   vrrenderer.render(scene, camera);
    // } else {
    renderer.render(scene, camera);
    //}
  })


  // const render = () => {

  //   //requestAnimationFrame(render);



  // }

  ///////////////////////////////////////////////
  // Hopalong Orbit Generator
  ///////////////////////////////////////////////
  const updateOrbit = () => {

    for (let s = 0; s < NUM_SUBSETS; s++) {
      hueValues[s] = Math.random();
    }
    for (let i = 0; i < scene.children.length; i++) {
      scene.children[i].needsUpdate = 1;
    }
    currentOrbit = generateAndUpdateOrbit({ ...currentOrbit });


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
    const points = scene.children.filter(child => child.name === "particle-cloud");

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
      //   camera.position.set(0, 0, SCALE_FACTOR / 2);
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
    // if (vrEnabled) {
    //   if ('getRecommendedEyeRenderRect' in vrHMD) {
    //     let leftEyeViewport = vrHMD.getRecommendedEyeRenderRect("left");
    //     let rightEyeViewport = vrHMD.getRecommendedEyeRenderRect("right");
    //     renderTargetWidth = leftEyeViewport.width + rightEyeViewport.width;
    //     renderTargetHeight = Math.max(leftEyeViewport.height, rightEyeViewport.height);
    //   }
    //   // only scale the sprites to half the size for VR
    //   spriteSize = Math.ceil(3 * renderTargetWidth / 3200);
    // } else {
    spriteSize = Math.ceil(3 * renderTargetWidth / 1600);
    //}

    // rescale sprites for new resolution
    for (let i = 0; i < scene.children.length; i++) {
      scene.children[i].myMaterial.size = spriteSize;
    }

    // update camera
    camera.aspect = renderTargetWidth / renderTargetHeight;
    camera.updateProjectionMatrix();

    // change render target size
    renderer.setSize(renderTargetWidth, renderTargetHeight);
    renderer.setViewport(0, 0, renderTargetWidth, renderTargetHeight);
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
    <div className="App">
      <canvas ref={canvasEl}></canvas>
    </div>
  );
}

export default App;
