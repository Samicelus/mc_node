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
//基本场景数据
var container = document.getElementById("container");
var width = container.clientWidth;
var height = container.clientHeight;
var fov = 70;
//创建相机
var camera = new THREE.PerspectiveCamera(fov, width / height, 1, 1000);
var camera_dir = new THREE.Vector3(0, 0, 0)
camera.lookAt(camera_dir);
//创建渲染器
var renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
renderer.setClearColor(0xEEEEEE, 1.0);
renderer.setSize(width, height);
//渲染
container.appendChild(renderer.domElement);
renderer.render(scene, camera);

/**
 * 注册监听
 */
document.addEventListener('mousedown', onDocumentMouseDown, false);
document.addEventListener('mousewheel', onDocumentMouseWheel, false);
document.addEventListener('touchstart', onDocumentTouchStart, false);
document.addEventListener('touchmove', onDocumentTouchMove, false);
window.addEventListener('resize', onWindowResize, false);

/**
 * 窗体大小改变
 */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseDown(event) {
    event.preventDefault();
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);
}

function onDocumentMouseMove(event) {
    var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
    lon -= movementX * 0.1;
    lat += movementY * 0.1;
}

function onDocumentMouseUp(event) {
    document.removeEventListener('mousemove', onDocumentMouseMove);
    document.removeEventListener('mouseup', onDocumentMouseUp);
}

/**
 * 鼠标滚轮改变相机焦距
 */
function onDocumentMouseWheel(event) {
    camera.fov -= event.wheelDeltaY * 0.05;
    camera.updateProjectionMatrix();
}

function onDocumentTouchStart(event) {
    event.preventDefault();
    var touch = event.touches[0];
    touchX = touch.screenX;
    touchY = touch.screenY;
}

function onDocumentTouchMove(event) {
    event.preventDefault();
    var touch = event.touches[0];
    lon -= (touch.screenX - touchX) * 0.1;
    lat += (touch.screenY - touchY) * 0.1;
    touchX = touch.screenX;
    touchY = touch.screenY;
}