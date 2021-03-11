//window.addEventListener('load', init);
import * as THREE from '../threejs-dev/build/three.module.js';
import { OrbitControls } from '../threejs-dev/examples/jsm/controls/OrbitControls.js';

function main() {
  const canvas = document.querySelector("#canvas");
  const renderer = new THREE.WebGLRenderer({canvas});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize( window.innerWidth, window.innerHeight );
  const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.set(8, 40, 60);
  camera.lookAt(new THREE.Vector3(8, -2, 2));
  //const controls = new OrbitControls(camera, canvas);
  const scene = new THREE.Scene();

	// Robots arm
  var HandMaterial = new THREE.MeshStandardMaterial({color: 0xFFFFEE});
  var HandGeometry1 = new THREE.BoxGeometry(8,3,3);
	var HandGeometry2 = new THREE.BoxGeometry(8,3,3);
  var HandMesh1 = new THREE.Mesh(HandGeometry1 ,HandMaterial );
	var HandMesh2 = new THREE.Mesh(HandGeometry2 ,HandMaterial );

	var jointMaterial = new THREE.MeshStandardMaterial({color: 0xBBBBBB});
  var jointGeometry = new THREE.SphereGeometry(2,32,32);
  var jointGeometry2 = new THREE.SphereGeometry(1,32,32);
  var jointMesh1 = new THREE.Mesh(jointGeometry ,jointMaterial );
  var jointMesh2 = new THREE.Mesh(jointGeometry ,jointMaterial );
	var jointMesh3 = new THREE.Mesh(jointGeometry2 ,jointMaterial );

	jointMesh1.position.set(0,0,0)
  jointMesh1.add(HandMesh1);
	HandMesh1.position.set(6,0,0);
	HandMesh1.add(jointMesh2);
	jointMesh2.position.set(6,0,0)
	jointMesh2.add(HandMesh2)
	HandMesh2.position.set(6,0,0);
	HandMesh2.add(jointMesh3);
	jointMesh3.position.set(6,0,0)
	scene.add(jointMesh1)
	jointMesh1.rotation.set(0,0,0);
	jointMesh2.rotation.set(0,0,0);

  // floor
  {
  const geometry = new THREE.PlaneGeometry(40,40);
  const material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
  const plane = new THREE.Mesh( geometry, material );
  plane.rotation.x = Math.PI/2;
  plane.position.set(12,-2,10);
  scene.add( plane );
  }
  // hole
  {
    const geometry = new THREE.RingGeometry( 2, 5, 32 );
    const material = new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.DoubleSide } );
    const mesh = new THREE.Mesh( geometry, material );
    mesh.position.set(24,-1.99,0);
    mesh.rotation.x = Math.PI/2;
    scene.add( mesh );
  }
  
  // balls
  {
    const material = new THREE.MeshBasicMaterial({color: 0xFF0000});
    const geometry = new THREE.SphereGeometry(1,32,32);
    var point = [];
    var spheres = [];
    const ballnum = 10;
    
    for (var i = 0; i < ballnum; i++){
      var x = Math.floor(Math.random()*20.0);
      var z = Math.floor(Math.random()*20.0);
      if (x <= 5){
        x = x + 5;
      }
      if (z <= 5){
        z = z + 5;
      }
      
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(x,0,z);
      sphere.name = 'sphere' + String(i);
      spheres.push(sphere);
      point.push( new THREE.Vector3(x,0,z) );
      scene.add(spheres[i]);
    }
  }

  // light
  {
    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
  }


  // Flag to check if the angle change is finished to get the ball.
  var flag1 = true;
  var flag2 = true;
  var flag3 = true;
  // Flag to check if the angle change is finished to come back to the holl.
  var flag4 = true;
  var flag5 = true;
  var flag6 = true;

  document.addEventListener( 'mousedown', clickPosition, false );
  var idx = 0; // Ball id which user selects
  var [theta, theta1, theta2] = [0,0,0]; // Angle of robot's joint
  var BallIds = []; // Buffer to save the ball which is picked up
  tick();
  
  // If user click the ball, the ball will be pickup next time
  function clickPosition( event ) {
    var x = event.clientX;
    var y = event.clientY;
    var mouse = new THREE.Vector2();
    mouse.x =  ( x / window.innerWidth ) * 2 - 1;
    mouse.y = -( y / window.innerHeight ) * 2 + 1;
    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( scene.children );
    console.log(intersects);
    if(intersects[0].object.name.match(/sphere/)){
      BallIds.push(Number(intersects[0].object.name.slice(-1))); //get id of sphere
    }
  }

  function tick() {
    if (flag4==true && flag5==true && flag6==true){
        jointMesh3.remove(spheres[idx]);
      if(BallIds.length){
        idx = BallIds.pop();
        [theta, theta1, theta2] = BallPosition();
        [flag1,flag2,flag3]=[false,false,false];
        [flag4,flag5,flag6]=[false,false,false];
      }
    }
    else{
      if (flag1==false || flag2==false || flag3==false){
        MoveToBall();
      }
      else{
        spheres[idx].position.set(0,0,0);
        jointMesh3.add(spheres[idx]);
        MoveToHoll();
      }
    }
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  //calculate angles to pick up the boll
  function BallPosition(){
    const point_xz = point[idx];
    console.log(point_xz);
    const b = 12;
    const c = 12;
    const Euclidean = Math.pow(point_xz.x,2) + Math.pow(point_xz.z,2);
    const theta = Math.acos(point_xz.x/Math.sqrt(Euclidean)); //direction to the ball
    const theta1 = Math.acos((c**2+Euclidean-b**2)/(2*c*Math.sqrt(Euclidean)));
    const theta2 = Math.acos((b**2+c**2-Euclidean)/(2*b*c));
    return [theta,theta1,theta2];
  }

  //change angles to pick up the boll
  function MoveToBall(){
    if (jointMesh1.rotation.y>=-theta){
      jointMesh1.rotation.y -= 0.01; //-theta;
    }
    else{
      flag1 = true;
    }
    if(jointMesh1.rotation.z<=theta1){
      jointMesh1.rotation.z += 0.01; //theta1
    }
    else{
      flag2 = true;
    }
    if(jointMesh2.rotation.z>=-Math.PI+theta2){
      jointMesh2.rotation.z -=0.02; //theta2+Math.PI
    }
    else{
      flag3 = true;
    }
  }

  // change angles to come back to the holl
  function MoveToHoll(){
    if (jointMesh1.rotation.y<=0){
      jointMesh1.rotation.y += 0.01; //-theta;
    }
    else{
      flag4 = true;
    }
    if(jointMesh1.rotation.z>=0){
      jointMesh1.rotation.z -= 0.01; //theta1
    }
    else{
      flag5 = true;
    }
    if(jointMesh2.rotation.z<=0){
      jointMesh2.rotation.z +=0.02; //theta2+Math.PI
    }
    else{
      flag6 = true;
    }
  }

}
main();