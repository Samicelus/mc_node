var scene = new THREE.Scene();
//添加物体
var mat = new THREE.MeshBasicMaterial({
    color: 0x60f60f
});//材质
var gem = new THREE.BoxGeometry(40, 40, 40);//几何结构
var obj = new THREE.Mesh(gem, mat);//物体
scene.add(obj);
//添加自然光源
var light = new THREE.AmbientLight(0xffffff);
scene.add(light);


//创建相机
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
//var camera_dir = new THREE.Vector3(0, 0, 0)
//camera.lookAt(camera_dir);
//创建渲染器
var renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
//renderer.setClearColor(0xEEEEEE, 1.0);
renderer.setSize(window.innerWidth, window.innerHeight);
//渲染
document.body.appendChild(renderer.domElement);
renderer.render(scene, camera);