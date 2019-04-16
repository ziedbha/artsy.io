var THREE = require('three');

const sizeMultiplier = 10;

class DrawingCanvas {
  constructor(scene) {
    let canvasCube = null;
    {
      let geom = new THREE.BoxGeometry(sizeMultiplier * 3, sizeMultiplier * 1.5, 0.1);
      let mat = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        wireframe: false
      });
      canvasCube = new THREE.Mesh(geom, mat);

    }

    this.drawings = [];
    this.canvas = canvasCube;
    // this.canvas.position.x =  100;//new THREE.Vector3(10,10,10);

    // let line = null
    // {
    //   let geom = new THREE.Geometry();
    //   geom.vertices.push(new THREE.Vector3(-1, 0, 1));
    //   geom.vertices.push(new THREE.Vector3(0, 1, 1));
    //   geom.vertices.push(new THREE.Vector3(1, 0, 1));
    //   let mat = new THREE.LineBasicMaterial({ color: 0x5c42f4 });
    //   line = new THREE.Line(geom, mat);
    // }
    
    // let circle = null;
    // {
    //   let geom = new THREE.CircleGeometry(1, 30);
    //   geom.translate(0,0,0.1);
    //   let mat = new THREE.MeshBasicMaterial({ color: 0xf44141 });
    //   circle = new THREE.Mesh(geom, mat);
    // }
    // this.drawings.push(circle, line);
    // this.canvas.add(line);
    // this.canvas.add(circle);

    scene.add(this.canvas);
  }
}

module.exports = DrawingCanvas