//var $ = require('../src/lib/jquery.min.js')
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

let prevTime = null;
let canvas = null;
let stats = null;
let player = null;
let camera = null;
let camControls = null;
let scene = new THREE.Scene();
let renderer = null;
var playerDrawings = null;

let centerOfScreen = new THREE.Vector2(0,0);

// Setup
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

// Initialize Raycaster
var camDir = new THREE.Vector3();
camDir  = camControls.getDirection(camDir);
let raycaster = new THREE.Raycaster(camControls.getObject().position, camDir, 0.1, 50000);

// Creates a render loop
function makeRenderLoop(render) {
  return function tick() {
    // pre-render stuff
    var time = performance.now();
    var delta = (time - prevTime) / 1000;

    if (playerDrawings) {
      player.drawingCanvas.setDrawings(playerDrawings);
      playerDrawings = null;
    }
    player.controlUpdate(delta);
    player.trySpawnCanvas(scene);
    player.rotateCanvasTowardsPlayer(); 

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

window.onclick = function(event) {
  camDir  = camControls.getDirection(camDir);
  raycaster.set(camControls.getObject().position, camDir);
  var intersects = raycaster.intersectObjects([player.drawingCanvas.canvas])
  if (intersects.length > 0) {
    var uv = intersects[0].uv;
    console.log(uv)


    let geom = new THREE.CircleGeometry(1, 30);
    var x = uv.x - 0.5;
    var y = uv.y - 0.5;
    geom.translate(x * player.drawingCanvas.canvasWidth, y * player.drawingCanvas.canvasHeight, 0.1);
    let mat = new THREE.MeshBasicMaterial({ color: 0xf44141 });
    circle = new THREE.Mesh(geom, mat);
    player.drawingCanvas.canvas.add(circle);
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


$(document).ready(function () {
  getDrawings();
  // now do it  every 2.5 seconds
  //setInterval(getQuestions, 2500);
  
  function getDrawings() {
    $.ajax({
      url: '/api/getDrawings',
      type: 'GET',
      success: function(res) {
        console.log(res)
        playerDrawings = res.drawings;
      }
    })
  }

  $('#logout').on('click', function () {
    // grab current drawings associated with this player
    var drawingsInJSON = []
    for (let i = 0; i < player.drawingCanvas.drawings.length; i++) {
      drawingsInJSON[i] = JSON.stringify(player.drawingCanvas.drawings[i]).toString()
    }

    $.ajax({
      url: '/api/logout',
      data: {drawings: drawingsInJSON, length: player.drawingCanvas.drawings.length},
      type: 'POST',
      success: function(res) {
        //console.log(res.drawings)
        window.location.replace('account/login')
      }
    })
  })
})

module.exports = {DEBUG, makeRenderLoop, renderer, camera, scene, canvas, abort, ABORTED}
