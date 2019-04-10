export const DEBUG = false && process.env.NODE_ENV === 'development';
import Stats from 'stats-js';
import { Spector } from 'spectorjs';
var THREE = require('three');
var PointerLockControls = require('../src/three-js/PointerLockControls')

export var ABORTED = false;
export function abort(message) {
  ABORTED = true;
  throw message;
}

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;

var prevTime = performance.now();
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();

// Get the canvas element
export const canvas = document.getElementById('canvas');

// Initialize the Scene
export var scene = new THREE.Scene();

// initialize statistics widget
const stats = new Stats();
stats.setMode(1); // 0: fps, 1: ms
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild(stats.domElement);

// Initialize camera
export const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
var camControls = new THREE.PointerLockControls(camera, canvas);
camControls.enabled = true;
camControls.getObject().position.set(0, 0, 3);
scene.add(camControls.getObject());


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

function setSize(width, height) {
  canvas.width = width;
  canvas.height = height;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

setSize(canvas.clientWidth, canvas.clientHeight);
window.addEventListener('resize', () => setSize(canvas.clientWidth, canvas.clientHeight));

export var renderer = new THREE.WebGLRenderer({canvas: canvas});
renderer.setRenderTarget
renderer.setSize(canvas.width, canvas.height);

if (DEBUG) {
  const spector = new Spector();
  spector.displayUI();
}

var onKeyDown = function ( event ) {

  switch ( event.keyCode ) {

    case 38: // up
    case 87: // w
      moveForward = true;
      break;

    case 37: // left
    case 65: // a
      moveLeft = true;
      break;

    case 40: // down
    case 83: // s
      moveBackward = true;
      break;

    case 39: // right
    case 68: // d
      moveRight = true;
      break;

    case 32: // space
      if ( canJump === true ) velocity.y += 350;
      canJump = false;
      break;

  }

};

var onKeyUp = function ( event ) {

  switch ( event.keyCode ) {

    case 38: // up
    case 87: // w
      moveForward = false;
      break;

    case 37: // left
    case 65: // a
      moveLeft = false;
      break;

    case 40: // down
    case 83: // s
      moveBackward = false;
      break;

    case 39: // right
    case 68: // d
      moveRight = false;
      break;

  }

};

document.addEventListener( 'keydown', onKeyDown, false );
document.addEventListener( 'keyup', onKeyUp, false );

function controlUpdate(controls) {
  if ( controls.enabled === true ) {
    var time = performance.now();
    var delta = ( time - prevTime ) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    direction.z = Number( moveForward ) - Number( moveBackward );
    direction.x = Number( moveLeft ) - Number( moveRight );
    direction.normalize(); // this ensures consistent movements in all directions

    if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
    if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;

    controls.getObject().translateX( velocity.x * delta );
    controls.getObject().translateY( velocity.y * delta );
    controls.getObject().translateZ( velocity.z * delta );

    if ( controls.getObject().position.y < 10 ) {

      velocity.y = 0;
      controls.getObject().position.y = 10;

      canJump = true;

    }

    prevTime = time;
  }
}

// Creates a render loop that is wrapped with camera update and stats logging
export function makeRenderLoop(render) {
  return function tick() {
    controlUpdate(camControls);
    stats.begin();
    render();
    stats.end();
    if (!ABORTED) {
      requestAnimationFrame(tick);
    }
  }
}

// import the main application
require('./main');

