var THREE = require('three');

const sizeMultiplier = 10;

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

    // let line = null
    // {
    //   let geom = new THREE.Geometry();
    //   geom.vertices.push(new THREE.Vector3(-1, 0, 1));
    //   geom.vertices.push(new THREE.Vector3(0, 1, 1));
    //   geom.vertices.push(new THREE.Vector3(1, 0, 1));
    //   let mat = new THREE.LineBasicMaterial({ color: 0x5c42f4 });
    //   line = new THREE.Line(geom, mat);
    // }
    // this.drawings.push(line);
    
    



    // let circle = null;
    // {
    //   let geom = new THREE.CircleGeometry(1, 30);
    //   geom.translate(0,0,0.1);
    //   let mat = new THREE.MeshBasicMaterial({ color: 0xf44141 });
    //   circle = new THREE.Mesh(geom, mat);
    // }
    
    // for (let i = 0; i < this.drawings.length; i++) {
    //   this.canvas.add(this.drawings[i]);
    // }
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
}

module.exports = DrawingCanvas