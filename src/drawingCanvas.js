var THREE = require('three');

const sizeMultiplier = 10;
const drawModes = ['CIRCLE', 'LINE']
const MAX_LINE_POINTS = 50

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

  drawLine(uv) {
    var x = uv.x - 0.5;
    var y = uv.y - 0.5;
    if (!this.currentLine) {
      var geom = new THREE.Geometry();
      for (let i = 0; i < MAX_LINE_POINTS; i++){
        geom.vertices.push(new THREE.Vector3(x * this.canvasWidth, y * this.canvasHeight, 1));
      }
      let mat = new THREE.LineBasicMaterial({ color: 0x5c42f4 });
      this.currentLine = new THREE.Line(geom, mat);
      this.drawings.push(this.currentLine);
      this.canvas.add(this.currentLine);
      this.currentLine.geometry.verticesNeedUpdate = true;
    } else {
      this.currentLine.geometry.vertices.push(this.currentLine.geometry.vertices.shift()); //shift the array
      this.currentLine.geometry.vertices[MAX_LINE_POINTS - 1] = new THREE.Vector3(x * this.canvasWidth, y * this.canvasHeight, 1); //add the point to the end of the array
      this.currentLine.geometry.verticesNeedUpdate = true
    }
  }
}

module.exports = DrawingCanvas