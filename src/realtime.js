var THREE = require('three');
var socket = io();

var othersToDraw = {}
socket.allowOthersUpdate = true
socket.loadedPlayerModels = {}

// Load player model
function loadPlayerModel(name) {
  socket.loadedPlayerModels[name] = {model: null}
  var loader = new THREE.GLTFLoader();
  loader.load('/static/models/gltf/BoomBox.glb', function (gltf) {
    gltf.scene.scale.x = 70
    gltf.scene.scale.y = 70
    gltf.scene.scale.z = 70

    socket.loadedPlayerModels[name] = {model: gltf.scene}
  }, undefined, function ( error ) {
    console.error(error);
  });
}

socket.on('someoneDisconnected', function(data) {
  var username = data.username
  othersToDraw[username].disconnected = true
})

socket.on('drawSomeone', function(data) {
  var username = data.username
  var canvas = data.canvas

  // if never seen name before OR seen but loading
  if (!socket.loadedPlayerModels[username]) {
    loadPlayerModel(username)
  }
  
  // don't bother if disconnected already
  if (othersToDraw[username] && othersToDraw[username].disconnected) {
    return;
  }

  othersToDraw[username] = {}
  othersToDraw[username].canvas = canvas;
  othersToDraw[username].position = data.position;
  othersToDraw[username].rotation = data.rotation;
})

socket.checkOthers = function() {
  if (socket.allowOthersUpdate) {
    socket.othersToDraw = othersToDraw
  }
}

module.exports = socket