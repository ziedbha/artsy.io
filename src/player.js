var THREE = require('three')
var DrawingCanvas = require('./drawingCanvas')

class Player {
  constructor(camera, cameraControls) {
    this.cam = camera
    this.ctrls = cameraControls

    this.ctrls.enabled = true;
    this.ctrls.getObject().position.set(0, 0, 3);

    this.velocity = new THREE.Vector3()
    this.direction = new THREE.Vector3()

    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.moveUp = false;
    this.moveDown = false;
    this.drawingCanvas = null;

    this.pressedToSpawn = false;
    this.spawnCanvas = false;
  }  

  trySpawnCanvas(scene) {
    if (!this.spawnedCanvas) {
      if (!this.drawingCanvas) {
        this.drawingCanvas = new DrawingCanvas(scene);
      }
  
      let pos = this.ctrls.getObject().position;
      let camDir = new THREE.Vector3();
      this.cam.getWorldDirection(camDir);
  
      this.drawingCanvas.canvas.position.x = pos.x;
      this.drawingCanvas.canvas.position.y = pos.y;
      this.drawingCanvas.canvas.position.z = pos.z;
      this.drawingCanvas.canvas.rotation.x = 0;
      this.drawingCanvas.canvas.rotation.y = 0;
      this.drawingCanvas.canvas.rotation.z = 0;

      this.drawingCanvas.canvas.translateOnAxis(camDir, 20);
      this.drawingCanvas.canvas.lookAt(pos);
      this.spawnedCanvas = true;
    }
  }

  move(velocity, dt) {
    this.ctrls.getObject().translateX(velocity.x * dt);
    this.ctrls.getObject().translateY(velocity.y * dt);
    this.ctrls.getObject().translateZ(velocity.z * dt);
  }

  controlUpdate(dt) {
    if (this.ctrls.enabled) {
      this.velocity.x -= this.velocity.x * 10.0 * dt;
      this.velocity.y -= this.velocity.y * 10.0 * dt;
      this.velocity.z -= this.velocity.z * 10.0 * dt;
      
      this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
      this.direction.x = Number(this.moveLeft) - Number(this.moveRight);
      this.direction.y = Number(this.moveDown) - Number(this.moveUp);
      this.direction.normalize(); // this ensures consistent movements in all directions
  
      if (this.moveForward || this.moveBackward) {
        this.velocity.z -= this.direction.z * 400.0 * dt;
      }

      if (this.moveLeft || this.moveRight) {
        this.velocity.x -= this.direction.x * 400.0 * dt;
      }

      if (this.moveUp || this.moveDown) {
        this.velocity.y -= this.direction.y * 400.0 * dt;
      }
      
      // physically translate player
      this.move(this.velocity, dt);
    }
  }

  initializeKeyControls() {
    var player = this;
    var onKeyDown = function (event) {
      switch (event.keyCode) {
        case 38: // up
        case 87: // w
          player.moveForward = true;
          break;
        case 37: // left
        case 65: // a
          player.moveLeft = true;
          break;
        case 40: // down
        case 83: // s
          player.moveBackward = true;
          break;
        case 39: // right
        case 68: // d
          player.moveRight = true;
          break;
        case 69: // e
        case 32: // space
          player.moveUp = true;
          break;
        case 81: // q
          player.moveDown = true;
          break;
        case 88: // x
          if (!player.pressedToSpawn) {
            player.pressedToSpawn = true;
            player.spawnedCanvas = false;
          }          
          break;
      }
    };
    
    var onKeyUp = function (event) {
      switch (event.keyCode) {
        case 38: // up
        case 87: // w
          player.moveForward = false;
          break;
        case 37: // left
        case 65: // a
          player.moveLeft = false;
          break;
        case 40: // down
        case 83: // s
          player.moveBackward = false;
          break;
        case 39: // right
        case 68: // d
          player.moveRight = false;
          break;
        case 32: // space
        case 69: // e
          player.moveUp = false;
          break;
        case 81: // q
          player.moveDown = false;
          break;
        case 88: // x
          player.pressedToSpawn = false;
          break;
      }
    };
    
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
  }
}

module.exports = Player
