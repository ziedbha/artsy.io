import { makeRenderLoop, camera, renderer, scene} from './init';

var THREE = require('three');

const sizeMultiplier = 2;
var geom = new THREE.BoxGeometry(sizeMultiplier * 3, sizeMultiplier * 1.5, 0.1);
var mat = new THREE.MeshBasicMaterial({
  color: 0xFFFFFF,
  wireframe: false
});
var cube = new THREE.Mesh(geom, mat);
scene.add(cube);

var material = new THREE.LineBasicMaterial( { color: 0x5c42f4 } );
var geometry = new THREE.Geometry();
geometry.vertices.push(new THREE.Vector3( -1, 0, 1) );
geometry.vertices.push(new THREE.Vector3( 0, 1, 1) );
geometry.vertices.push(new THREE.Vector3( 1, 0, 1) );
var line = new THREE.Line( geometry, material );
scene.add( line );

var g = new THREE.CircleGeometry( 1, 30 );
var m = new THREE.MeshBasicMaterial( { color: 0xf44141 } );
g.translate(0,0,0.1);
var circle = new THREE.Mesh( g, m);
scene.add(circle);

function createSkybox() {
  let geometry = new THREE.CubeGeometry(1200, 1200, 1200);
  let cubeMats = [
    new THREE.MeshLambertMaterial({
      map: new THREE.TextureLoader().load('../images/front.png'), 
      side: THREE.DoubleSide
    }),
    new THREE.MeshLambertMaterial({
      map: new THREE.TextureLoader().load('../images/back.png'), 
      side: THREE.DoubleSide
    }),
    new THREE.MeshLambertMaterial({
      map: new THREE.TextureLoader().load('../images/top.png'), 
      side: THREE.DoubleSide
    }),
    new THREE.MeshLambertMaterial({
      map: new THREE.TextureLoader().load('../images/bot.png'), 
      side: THREE.DoubleSide
    }),
    new THREE.MeshLambertMaterial({
      map: new THREE.TextureLoader().load('../images/right.png'), 
      side: THREE.DoubleSide
    }),
    new THREE.MeshLambertMaterial({
      map: new THREE.TextureLoader().load('../images/left.png'), 
      side: THREE.DoubleSide
    }),
  ];

  var cubeMaterial = new THREE.MeshFaceMaterial(cubeMats);
  var cube = new THREE.Mesh(geometry, cubeMaterial);
  scene.add(cube);
};

createSkybox();
var ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
scene.add(ambientLight)

function render() {
  camera.position.set(0, 0, 0);
  renderer.render(scene, camera);
  renderer.autoClear = false;
}

makeRenderLoop(render)();