var socket = io();
var othersToDraw = {}
socket.allowOthersUpdate = true
socket.on('drawSomeone', function(data) {
  var username = data.username
  var canvas = data.canvas
  othersToDraw[username] = {
    canvas: canvas, 
    position: data.position, 
    rotation: data.rotation
  }
  console.log(username)
})

socket.checkOthers = function() {
  if (socket.allowOthersUpdate) {
    socket.othersToDraw = othersToDraw
  }
}

module.exports = socket