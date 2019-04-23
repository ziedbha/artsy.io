const DEBUG = false && process.env.NODE_ENV === 'development';
var Stats = require('stats-js');
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
  socket.allowOthersUpdate = false;
  var loader = new THREE.ObjectLoader();
    for (var key in socket.othersToDraw) {
      if (socket.othersToDraw.hasOwnProperty(key)) {
        var otherUser = key
        var obj = socket.othersToDraw[otherUser];

        if (!obj) {
          // player disconnected
          var oldCanvas = scene.getObjectByName(otherUser + "_canvas")
          var oldPlayerModel = scene.getObjectByName(otherUser + "_playerModel")
          scene.remove(oldCanvas)
          scene.remove(oldPlayerModel)
        }

        if (!obj["position"] || !socket.loadedPlayerModels[otherUser]) {
          // player hasn't sent complete or model isn't fully loaded
          continue;
        }

        if (obj["disconnected"]) {
          // player disconnected
          scene.remove(scene.getObjectByName(otherUser + "_playerModel"))
          scene.remove(scene.getObjectByName(otherUser + "_canvas"))
          socket.othersToDraw[otherUser] = null
          socket.loadedPlayerModels[otherUser] = null
        }
        
        // create the new canvas
        var canvasToAdd = loader.parse(JSON.parse(obj["canvas"]))
        canvasToAdd.name = otherUser + "_canvas"
        
        // get player rotation and position
        var rotation = JSON.parse(obj["rotation"])  
        var position = JSON.parse(obj["position"])
        var eurlerRot = new THREE.Euler(-rotation._x, rotation._y + 3.14, rotation._z, 'YXZ')
        var quat = new THREE.Quaternion()
        quat.setFromEuler(eurlerRot)

        // fetch old state
        var oldCanvas = scene.getObjectByName(otherUser + "_canvas")
        var oldPlayerModel = scene.getObjectByName(otherUser + "_playerModel")
        var playerModelToAdd = socket.loadedPlayerModels[otherUser].model

        if (playerModelToAdd && !oldPlayerModel) {
          playerModelToAdd.name = otherUser + "_playerModel"
          scene.add(playerModelToAdd)
          oldPlayerModel = playerModelToAdd
        }

        if (!oldCanvas) {
          scene.add(canvasToAdd)
        } else {
          scene.remove(oldCanvas)
          scene.add(canvasToAdd)
        }

        // set pos and rotation of player
        if (oldPlayerModel) {
          oldPlayerModel.setRotationFromQuaternion(quat)
          oldPlayerModel.position.x = position.x
          oldPlayerModel.position.y = position.y
          oldPlayerModel.position.z = position.z    
        }
      }  
  }
  socket.allowOthersUpdate = true;
}
setInterval(drawOthers, 50);

// Creates a render loop
function makeRenderLoop(render) {
  return function tick() {
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
        case 'LINE':
          player.drawingCanvas.drawLine(uv);
          break;
        default:
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
        if (!player.username) {
          player.setUsername(res.username)
        }
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
        socket.emit('iAmDisconnected', {username: player.username})
        window.location.replace('account/login')
      }
    })
  })
})

module.exports = {DEBUG, makeRenderLoop, renderer, camera, scene, canvas, abort, ABORTED}
