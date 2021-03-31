//window.addEventListener('load', init);
import * as THREE from '../../threejs-dev/build/three.module.js';
import { OrbitControls } from '../../threejs-dev/examples/jsm/controls/OrbitControls.js';
//import { VRButton } from '../threejs-dev/examples/jsm/webxr/VRButton.js';

function main() {
  const canvas = document.querySelector("#canvas");
  const renderer = new THREE.WebGLRenderer({canvas});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize( window.innerWidth, window.innerHeight );
  const scene = new THREE.Scene();
  //document.body.appendChild( VRButton.createButton( renderer ) );
  //renderer.xr.enabled = true;
  const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
  
  camera.lookAt(new THREE.Vector3(8, -2, 2));
  const controls = new OrbitControls(camera, canvas);
  camera.position.set(0, 40, 60);
  controls.update();
 
  
  // WebVR
  //const container = document.getElementById('container');
  //canvas.appendChild(WEBVR.createButton(renderer));

	// Robots arm
  var HandMaterial = new THREE.MeshStandardMaterial({color: 0xf0e68c});
  var HandGeometry1 = new THREE.BoxGeometry(8,2,2);
	var HandGeometry2 = new THREE.BoxGeometry(8,2,2);
  var HandMesh1 = new THREE.Mesh(HandGeometry1 ,HandMaterial );
	var HandMesh2 = new THREE.Mesh(HandGeometry2 ,HandMaterial );

	var jointMaterial = new THREE.MeshStandardMaterial({color: 0xBBBBBB});
  var jointGeometry = new THREE.SphereGeometry(2,32,32);
  var jointGeometry2 = new THREE.SphereGeometry(1,32,32);
  var jointMesh1 = new THREE.Mesh(jointGeometry ,jointMaterial );
  var jointMesh2 = new THREE.Mesh(jointGeometry ,jointMaterial );
	var jointMesh3 = new THREE.Mesh(jointGeometry2 ,jointMaterial );
  var Hand1 = new THREE.BoxGeometry(2,0.5,0.5);
  var Hand2 = new THREE.BoxGeometry(2,0.5,0.5);
  var Hand1Mesh = new THREE.Mesh(Hand1 ,jointMaterial );
  var Hand2Mesh = new THREE.Mesh(Hand2 ,jointMaterial );

	jointMesh1.position.set(0,0,0);
  jointMesh1.add(HandMesh1);
	HandMesh1.position.set(6,0,0);
	HandMesh1.add(jointMesh2);
	jointMesh2.position.set(6,0,0);
	jointMesh2.add(HandMesh2);
	HandMesh2.position.set(6,0,0);
	//HandMesh2.add(jointMesh3);
	//jointMesh3.position.set(6,0,0);
  HandMesh2.add(Hand1Mesh);
  HandMesh2.add(Hand2Mesh);
  Hand1Mesh.position.set(5,0,1);
  Hand2Mesh.position.set(5,0,-1);
	scene.add(jointMesh1);
	jointMesh1.rotation.set(0,0,0);
	jointMesh2.rotation.set(0,0,0);

  // floor
  {
  const geometry = new THREE.PlaneGeometry(60,40);
  const material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
  const plane = new THREE.Mesh( geometry, material );
  plane.rotation.x = Math.PI/2;
  plane.position.set(0,-2,0);
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
    const ballnum = 20;
    var ballname = "";
    
    for (var i = 0; i < ballnum; i++){
      var x = Math.floor(Math.random()*30.0-15.0);
      var z = Math.floor(Math.random()*30.0-15.0);
      if (x < 5 && x > 0){
        x = x + 5;
      }
      else if(x > -5 && x < 0){
        x = x - 5;
      }
      if (z < 6 && z > 0){
        z = z + 5;
      }
      else if(z > -5 && z < 0){
        z = z - 5;
      }
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(x,0,z);
      if (i<10){
        ballname = 'sphere0' + String(i);
      }
      else{
        ballname = 'sphere' + String(i);
      }
      console.log(ballname);
      sphere.name =  ballname;
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

  //document.addEventListener( 'mousedown', clickPosition, false );
  document.addEventListener( 'click', clickPosition );
  var idx = 0; // Ball id which user selects
  let [theta, theta1, theta2] = [0,0,0]; // Angle of robot's joint
  var BallIds = []; // Buffer to save the ball which is picked up
  //renderer.setAnimationLoop(tick);
  tick();
  //renderer.setAnimationLoop( tick );
  
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
      BallIds.push(Number(intersects[0].object.name.substr(-2,2))); //get id of sphere
    }
  }

  function tick() {
    if (flag4==true && flag5==true && flag6==true){
        //jointMesh3.remove(spheres[idx]);
        Hand2Mesh.remove(spheres[idx]);
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
        spheres[idx].position.set(0.5,0,1);
        //jointMesh3.add(spheres[idx]);
        Hand2Mesh.add(spheres[idx]);
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
    //const theta = Math.acos(point_xz.x/Math.sqrt(Euclidean)); //direction to the ball
    const X = point_xz.x - 0;
    const Z = point_xz.z - 0;
    let theta = Math.atan(Z/X);
    const theta1 = Math.acos((c**2+Euclidean-b**2)/(2*c*Math.sqrt(Euclidean)));
    const theta2 = Math.acos((b**2+c**2-Euclidean)/(2*b*c));
    if(X<0 && theta>0){
      theta = -(Math.PI-theta);
    }
    else if(X<0 && theta<0){
      theta = Math.PI+theta;
    }
    console.log(theta);
    return [theta,theta1,theta2];
  }

  //change angles to pick up the boll
  function MoveToBall(){
    if (theta>0){
      if (jointMesh1.rotation.y>=-theta){
        jointMesh1.rotation.y -= 0.01; //-theta;
      }
      else{
        flag1 = true;
      }
    }
    if(theta<0){
      if (jointMesh1.rotation.y<=-theta){
        jointMesh1.rotation.y += 0.01; //-theta;
      }
      else{
        flag1 = true;
      }
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
    if (theta>0){
      if (jointMesh1.rotation.y<=0){
        jointMesh1.rotation.y += 0.01; //-theta;
      }
      else{
        flag4 = true;
      }
    }
    else if (theta<0){
      if (jointMesh1.rotation.y>=0){
        jointMesh1.rotation.y -= 0.01; //-theta;
      }
      else{
        flag4 = true;
      }
    }
    if (flag4){
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

}
main();