export const DEBUG = false && process.env.NODE_ENV === 'development';
import Stats from 'stats-js';
import { Spector } from 'spectorjs';
var THREE = require('three');
var PointerLockControls = require('../src/three-js/PointerLockControls')
var Player = require('./player');

export var ABORTED = false;
export function abort(message) {
  ABORTED = true;
  throw message;
}

// Keep track of time for game loop stuff
var prevTime = performance.now();

// Get the canvas element
export const canvas = document.getElementById('canvas');

// Initialize the Scene
export var scene = new THREE.Scene();

// Initialize statistics widget
const stats = new Stats();
stats.setMode(1); // 0: fps, 1: ms
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild(stats.domElement);

// Initialize camera and pointer lock controls
export const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 50000);
var camControls = new THREE.PointerLockControls(camera, canvas);
scene.add(camControls.getObject());
initializePointerLockControls();

var player = new Player(camera, camControls);
player.initializeKeyControls();

// Adjust size of camera and canvas
setSize(canvas.clientWidth, canvas.clientHeight);
window.addEventListener('resize', () => setSize(canvas.clientWidth, canvas.clientHeight));

// Initialize Renderer
export var renderer = new THREE.WebGLRenderer({canvas: canvas});
renderer.setRenderTarget
renderer.setSize(canvas.width, canvas.height);

// Debug mode
if (DEBUG) {
  const spector = new Spector();
  spector.displayUI();
}

// Creates a render loop
export function makeRenderLoop(render) {
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
  var blocker = document.getElementById( 'blocker' );
  var instructions = document.getElementById( 'instructions' );
  
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

// import the main application
require('./main');