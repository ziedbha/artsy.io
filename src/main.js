var Init = require('./init'); 
var THREE = require('three');
var scene = Init.scene;
var makeRenderLoop = Init.makeRenderLoop;
var renderer = Init.renderer;
var camera = Init.camera;

function createSkybox() {
  // skybox
  var skyGeo = new THREE.SphereGeometry(10000, 80, 80); 
  var loader  = new THREE.TextureLoader();
  var texture = loader.load("static/images/top.png" );
  var material = new THREE.MeshPhongMaterial({ 
    map: texture,
  });
  var sky = new THREE.Mesh(skyGeo, material);
  sky.material.side = THREE.DoubleSide;
  scene.add(sky);

  // ground 
  var groundGeo = new THREE.BoxGeometry(5000, 5000, 3);
  var texture2 = loader.load("static/images/back.png" );
  var material2 = new THREE.MeshPhongMaterial({ 
    map: texture2,
  });
  let ground = new THREE.Mesh(groundGeo, material2);
  ground.material.side = THREE.DoubleSide;
  ground.rotation.x = 90 * 3.14 / 180; // 90 degrees around x-axis
  ground.position.y = -30;
  scene.add(ground);
};

function createLight() {
  var ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight)
}

function render() {
  camera.position.set(0, 0, 0);
  renderer.render(scene, camera);
  renderer.autoClear = false;
}

function startGame() {
  //Init.setupInitial();
  createSkybox();
  createLight();
  makeRenderLoop(render)();
} 

startGame()

module.exports = { startGame }