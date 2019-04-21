//var $ = require('../src/lib/jquery.min.js')
const DEBUG = false && process.env.NODE_ENV === 'development';
var Stats = require('stats-js');
//const performance = require('perf_hooks').performance;
var THREE = require('three');
var PointerLockControls = require('../src/three-js/PointerLockControls')
var Player = require('./player');
var socket = require('./realtime')

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
let playerDrawings = null;
let playerModel = null;
let playerAdded = false;
let loaded = false;

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
player.createCrosshairs()

// Adjust size of camera and canvas
setSize(canvas.clientWidth, canvas.clientHeight);
window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

// Initialize Renderer
renderer = new THREE.WebGLRenderer({canvas: canvas});
renderer.setRenderTarget
renderer.setSize(canvas.width, canvas.height);

// Initialize Raycaster
var camDir = new THREE.Vector3();
camDir  = camControls.getDirection(camDir);
let raycaster = new THREE.Raycaster(camControls.getObject().position, camDir, 0.1, 50000);

// Setup updating state of other connected sockets
function drawOthers() {
  if (loaded) {
    socket.allowOthersToDraw = false;
    var loader = new THREE.ObjectLoader();
      for (var key in socket.othersToDraw) {
        if (socket.othersToDraw.hasOwnProperty(key)) {
          var obj = socket.othersToDraw[key];
          for (var dataProp in obj) {
            if (obj.hasOwnProperty(dataProp)) {
              switch(dataProp) {
                case "canvas":
                  var sceneObj = scene.getObjectByName(key)
                  scene.remove(sceneObj)
                  
                  var objToAdd = loader.parse(JSON.parse(obj[dataProp]))
                  objToAdd.name = key
                  scene.add(objToAdd)
                  break;
                case "position":
                  var rotation = JSON.parse(obj["rotation"])  
                  var position = JSON.parse(obj["position"])

                  var eurlerRot = new THREE.Euler(-rotation._x, rotation._y + 3.14, rotation._z, 'YXZ')
                  var quat = new THREE.Quaternion()
                  quat.setFromEuler(eurlerRot)
                  playerModel.setRotationFromQuaternion(quat)

                  playerModel.position.x = position.x
                  playerModel.position.y = position.y
                  playerModel.position.z = position.z
                  if (!playerAdded) {
                    scene.add(playerModel)
                    playerAdded = true;
                  }
                  
                  break;
                case "rotation":
                  break;
              }
           }
          } 
       }
    }
    socket.allowOthersToDraw = true;
  }
}
setInterval(drawOthers, 50);

function loadPlayerModel() {
  var loader = new THREE.GLTFLoader();

  loader.load('/static/models/gltf/BoomBox.glb', function (gltf) {
    gltf.scene.scale.x = 70
    gltf.scene.scale.y = 70
    gltf.scene.scale.z = 70

    playerModel = gltf.scene
  }, undefined, function ( error ) {
    console.error( error );
  });
}
loadPlayerModel();

// Creates a render loop
function makeRenderLoop(render) {
  return function tick() {
    loaded = true;
    if (playerDrawings) {
      player.drawingCanvas.setDrawings(playerDrawings);
      playerDrawings = null;
    }

    // pre-render stuff
    player.trySpawnCanvas(scene);
    player.rotateCanvasTowardsPlayer();

    var time = performance.now();
    var delta = (time - prevTime) / 1000;
    player.controlUpdate(delta);

    if (player.username) {
      var dataForSocket = {
        username: player.username,
        position: JSON.stringify(camControls.getObject().position),
        rotation: JSON.stringify(camControls.getRotation()),
        canvas: JSON.stringify(player.drawingCanvas.canvas).toString()
      }
      socket.emit('tellThemToDrawMe', dataForSocket)
      socket.checkOthers()
    }

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

// onclick: drawing circle
window.onclick = function(event) {
  var gamePlaying = camControls.isLocked
  if (gamePlaying) {
    camDir  = camControls.getDirection(camDir);
    raycaster.set(camControls.getObject().position, camDir);
    var intersects = raycaster.intersectObjects([player.drawingCanvas.canvas])
    if (intersects.length > 0) {
      var uv = intersects[0].uv;
      switch(player.drawingCanvas.drawMode) {
        case 'CIRCLE':
          player.drawingCanvas.drawCircle(uv);
          break;
      }
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

$(document).ready(function () {
  getDrawings();
  function getDrawings() {
    $.ajax({
      url: '/api/getDrawings',
      type: 'GET',
      success: function(res) {
        playerDrawings = res.drawings;
        player.setUsername(res.username)
      }
    })
  }

  setInterval(saveDrawings, 1000);
  function saveDrawings() {
    if (camControls.isLocked) {
      var drawingsInJSON = []
      for (let i = 0; i < player.drawingCanvas.drawings.length; i++) {
        drawingsInJSON[i] = JSON.stringify(player.drawingCanvas.drawings[i]).toString()
      }
      
      $.ajax({
        url: '/api/saveDrawings',
        data: {drawings: drawingsInJSON, length: player.drawingCanvas.drawings.length},
        type: 'POST',
        success: function(res) {
        }
      })
    } 
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
        window.location.replace('account/login')
      }
    })
  })
})

module.exports = {DEBUG, makeRenderLoop, renderer, camera, scene, canvas, abort, ABORTED}
