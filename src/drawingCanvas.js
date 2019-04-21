var THREE = require('three');

const sizeMultiplier = 10;
const drawModes = ['CIRCLE', 'LINE']

class DrawingCanvas {
  constructor(scene) {
    let canvasCube = null;
    this.canvasWidth = sizeMultiplier * 3
    this.canvasHeight = sizeMultiplier * 1.5
  
    // make the canvas
    let geom = new THREE.BoxGeometry(this.canvasWidth, this.canvasHeight, 0.1);
    let mat = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      wireframe: false
    });
    canvasCube = new THREE.Mesh(geom, mat);

    this.drawings = [];
    this.canvas = canvasCube;
    this.canvas.name = "playerCanvas";
    this.drawMode = drawModes[0];   
    
    scene.add(this.canvas);
  }

  setDrawings(drawings) {
    var loader = new THREE.ObjectLoader();
    for (let i = 0; i < drawings.length; i++) {
      var obj = loader.parse(JSON.parse(drawings[i]));
      this.drawings.push(obj);
      this.canvas.add(obj);
    }
  }

  drawCircle(uv) {
    let geom = new THREE.CircleGeometry(1, 30);
    var x = uv.x - 0.5;
    var y = uv.y - 0.5;
    let mat = new THREE.MeshBasicMaterial({ color: 0xf44141 });
    var circle = new THREE.Mesh(geom, mat);
    circle.position.x = x * this.canvasWidth;
    circle.position.y = y * this.canvasHeight
    circle.position.z = 0.1
    this.canvas.add(circle);
    this.drawings.push(circle);
  }
}

module.exports = DrawingCanvas