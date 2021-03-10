//window.addEventListener('load', init);
import * as THREE from '../threejs-dev/build/three.module.js';
import { OrbitControls } from '../threejs-dev/examples/jsm/controls/OrbitControls.js';

function main() {
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
  
  // Renderer
  renderer.autoClear = false;// For multi screens
  // CameraA
  let camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  camera.position.set(0, 5, 50);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  scene.add(camera);
  const controls = new OrbitControls(camera, renderer.domElement);


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
	//midMesh.rotation.set(Math.PI/2,0,Math.PI/2);

  {
  const geometry = new THREE.PlaneGeometry(40,40);
  const material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
  const plane = new THREE.Mesh( geometry, material );
  plane.rotation.x = Math.PI/2;
  plane.position.set(12,-2,10);
  scene.add( plane );
  }
  {
    const geometry = new THREE.RingGeometry( 2, 5, 32 );
    const material = new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.DoubleSide } );
    const mesh = new THREE.Mesh( geometry, material );
    mesh.position.set(24,-1.99,0);
    mesh.rotation.x = Math.PI/2;
    scene.add( mesh );
  }
  

  
  const material = new THREE.MeshBasicMaterial({color: 0xFF0000});
  var geometry = new THREE.SphereGeometry(2,32,32);
  const point = [];
  var spheres = [];
  var ballnum = 5;
  
  for (var i = 0; i < ballnum; i++){
    var x = Math.floor(Math.random()*10.0);
    var z = Math.floor(Math.random()*10.0);
    if (x >= 0){
      x = x + 5;
    }
    if (z >= 0){
      z = z + 5;
    }
    
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(x,0,z);
    spheres.push(sphere);
    point.push( new THREE.Vector3(x,0,z) );
    scene.add(spheres[i]);
  }


  //const geometry = new THREE.BoxGeometry(5);
  //const material = new THREE.MeshStandardMaterial({color: 0xff0000});
  //const box = new THREE.Mesh(geometry, material);
  //scene.add(box);

  const directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  var flag1 = false;
  var flag2 = false;
  var flag3 = false;
  var flag4 = false;
  var flag5 = false;
  var flag6 = false;

  document.addEventListener( 'mousedown', clickPosition, false );
  console.log(point)
  var [theta, theta1, theta2] = BallPosition();
  var [Htheta, Htheta1, Htheta2] = HollPosition();
  var angles = [];
  console.log(spheres);
  var idx = ballnum-1; //残りのボールの数をカウントしている
  tick();
  
  function clickPosition( event ) {
    // 画面上のマウスクリック位置
    const element = event.currentTarget;
    const x = event.clientX - element.offsetLeft;
    const y = event.clientY - element.offsetTop;
    //var x = event.clientX;
    //var y = event.clientY;
     
    // マウスクリック位置を正規化
    const w = element.offsetWidth;
    const h = element.offsetHeight;
    var mouse = new THREE.Vector2();
    mouse.x = ( x / w ) * 2 - 1;
    mouse.y = -( y / h ) * 2 + 1;
    // mouse.x =  ( x / window.innerWidth ) * 2 - 1;
    // mouse.y = -( y / window.innerHeight ) * 2 + 1;
     
    // Raycasterインスタンス作成
    var raycaster = new THREE.Raycaster();
    // 取得したX、Y座標でrayの位置を更新
    raycaster.setFromCamera( mouse, camera );
    // オブジェクトの取得
    var intersects = raycaster.intersectObjects( scene.children );
     
    // cube1がクリックされたらcube1を消してcube2を表示
    console.log("test");
    angles.push(1);
    console.log(spheres);
  }

  function tick() {
    //requestAnimationFrame(tick);
    // raycaster.setFromCamera(mouse, camera);
    // const intersects = raycaster.intersectObjects(scene.children);
    // //console.log(intersects)
    // if(intersects[0].object.name === 'spheres'){
    //   console.log("test")
    // }
    if (flag1==false || flag2==false || flag3==false){
      MoveToBall();
    }
    else{
      spheres[idx].position.set(0,0,0);
      jointMesh3.add(spheres[idx]);
      MoveToHoll();
    }
    if (flag4==true && flag5==true && flag6==true){
      jointMesh3.remove(spheres[idx]);
      if(angles.length){
        idx=idx-1;
        [theta, theta1, theta2] = BallPosition();
        [flag1,flag2,flag3]=[false,false,false];
        [flag4,flag5,flag6]=[false,false,false];
        angles.pop();
      }
      //[flag1,flag2,flag3]=[false,false,false]
      //[flag4,flag5,flag6]=[false,false,false]
    }
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  function BallPosition(){//calculate angles to pick up the boll
    const point_xz = point.pop();
    console.log(point_xz);
    const b = 12;
    const c = 12;
    const Euclidean = Math.pow(point_xz.x,2) + Math.pow(point_xz.z,2);
    const theta = Math.acos(point_xz.x/Math.sqrt(Euclidean)); //direction to the ball
    const theta1 = Math.acos((c**2+Euclidean-b**2)/(2*c*Math.sqrt(Euclidean)));
    const theta2 = Math.acos((b**2+c**2-Euclidean)/(2*b*c));
    return [theta,theta1,theta2];
  }

  function HollPosition(){//calculate angles to go to the hole
    var b = 12;
    var c = 12;
    var Euclidean = 20;
    var Htheta = 0 //direction to the ball
    var Htheta1 = Math.acos((c**2+Euclidean-b**2)/(2*c*Math.sqrt(Euclidean)));
    var Htheta2 = Math.acos((b**2+c**2-Euclidean)/(2*b*c));
    return [Htheta,Htheta1,Htheta2];
  }

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