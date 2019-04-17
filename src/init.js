const DEBUG = false && process.env.NODE_ENV === 'development';
var Stats = require('stats-js');
//const performance = require('perf_hooks').performance;
var THREE = require('three');
var PointerLockControls = require('../src/three-js/PointerLockControls')
var Player = require('./player');

var ABORTED = false;
function abort(message) {
  ABORTED = true;
  throw message;
}

let prevTime = null; // timer to do velocity computations
let canvas = null;
let stats = null;
let player = null;

// THREEJS structs: camera, pointer lock controls
let camera = null;
let camControls = null;
let scene = new THREE.Scene();
let renderer = null;

//function setupInitial() {
  prevTime = performance.now();
  canvas = document.getElementById('canvas');
  stats = new Stats();

  // FPS stats
  stats.setMode(1); // 0: fps, 1: ms
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  window.document.body.appendChild(stats.domElement);

  // Camera and canvas
  camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 50000);
  camControls = new THREE.PointerLockControls(camera, canvas);
  scene.add(camControls.getObject());
  initializePointerLockControls();

  // Player init
  player = new Player(camera, camControls);
  player.initializeKeyControls();

  // Adjust size of camera and canvas
  setSize(canvas.clientWidth, canvas.clientHeight);
  window.addEventListener('resize', () => setSize(canvas.clientWidth, canvas.clientHeight));

  // Initialize Renderer
  renderer = new THREE.WebGLRenderer({canvas: canvas});
  renderer.setRenderTarget
  renderer.setSize(canvas.width, canvas.height);
//}

// Creates a render loop
function makeRenderLoop(render) {
  return function tick() {
    // pre-render stuff
    var time = performance.now();
    var delta = (time - prevTime) / 1000;
    player.controlUpdate(delta);
    player.trySpawnCanvas(scene);

    // rendering here
    stats.begin();
    render();
    stats.end();

    // post render stuff
    prevTime = time;
    if (!ABORTED) {
      requestAnimationFrame(tick);
    }
  }
}

/********************************* HELPER FUNCTIONS *********************************/
function setSize(width, height) {
  canvas.width = width;
  canvas.height = height;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function initializePointerLockControls() {
  var blocker = window.document.getElementById( 'blocker' );
  var instructions = window.document.getElementById( 'instructions' );
  
  instructions.addEventListener( 'click', function () {
    camControls.lock();
  }, false );
  
  camControls.addEventListener( 'lock', function () {
    instructions.style.display = 'none';
    blocker.style.display = 'none';
  } );
  
  camControls.addEventListener( 'unlock', function () {
    blocker.style.display = 'block';
    instructions.style.display = '';
  } );
}

module.exports = {DEBUG, makeRenderLoop, renderer, camera, scene, canvas, abort, ABORTED}
