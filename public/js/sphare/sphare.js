var scene = new THREE.Scene();
//添加物体
var mat = new THREE.MeshBasicMaterial({
    color: 0x60f60f
});//材质
var gem = new Geometry(40, 40, 40);//几何结构
var obj = new THREE.Mesh(gem, mat);//物体
scene.add(obj);
//添加自然光源
var light = new THREE.AmbientLight(0xffffff);
scene.add(light);
//基本场景数据
var container = document.getElementsById("container");
var width = container.clientWidth;
var height = container.clientHeight;
var fov = 70;
//创建相机
var camera = new THREE.PerspectiveCamera(fov, width / height, 1, 1000);
var camera_dir = new THREE.Vector3(0, 0, 0)
camera.lookAt(camera_dir);
//创建渲染器
var renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: ture});
renderer.setClearColor(0xEEEEEE, 1.0);
renderer.setSize(width, height);
//渲染
container.appendChild(renderer.docElement);
render.render(scene, camera);