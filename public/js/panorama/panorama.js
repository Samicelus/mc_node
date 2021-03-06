var scene, renderer, camera;
var target = new THREE.Vector3();   //相机焦点
var lon = 90, lat = 0;
var phi = 0, theta = 0;
var touchX, touchY;

function init() {
    /**
     * 创建场景
     * @type {THREE.Scene}
     */
    scene = new THREE.Scene();

    /**
     * 添加相机
     * @type {THREE.PerspectiveCamera}
     */
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

    /**
     * 添加一个渲染器
     * @type {THREE.CSS3DRenderer}
     */
    renderer = new THREE.CSS3DRenderer();
    renderer.setClearColor(0x000000, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);

    /**
     *正方体的6个面的资源及相关（坐标、旋转等）设置
     */
    var sides = [{url: '../images/panorama/posx.jpg', position: [-512, 0, 0], rotation: [0, Math.PI / 2, 0]},
        {url: '../images/panorama/negx.jpg', position: [512, 0, 0], rotation: [0, -Math.PI / 2, 0]},
        {url: '../images/panorama/posy.jpg', position: [0, 512, 0], rotation: [Math.PI / 2, 0, Math.PI]},
        {url: '../images/panorama/negy.jpg', position: [0, -512, 0], rotation: [-Math.PI / 2, 0, Math.PI]},
        {url: '../images/panorama/posz.jpg', position: [0, 0, 512], rotation: [0, Math.PI, 0]},
        {url: '../images/panorama/negz.jpg',position: [0, 0, -512], rotation: [0, 0, 0]}];

    for (var i = 0; i < sides.length; i++) {
        var side = sides[i];
        var element = document.createElement('section');
        document.body.appendChild(element);
        element.id = 'section_'+ i;
        var imgElement = document.createElement('img');
        imgElement.width = 1028; // 2 pixels extra to close the gap.
        imgElement.height = 1028;
        imgElement.src = side.url;
        element.appendChild(imgElement);
        var object = new THREE.CSS3DObject(element);
        object.position.set(side.position[0], side.position[1], side.position[2]);
        object.rotation.set(side.rotation[0], side.rotation[1], side.rotation[2]);
        scene.add(object);
    }
    document.body.appendChild(renderer.domElement);

    /**
     * 注册监听
     */
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('mousewheel', onDocumentMouseWheel, false);
    document.addEventListener('touchstart', onDocumentTouchStart, false);
    document.addEventListener('touchmove', onDocumentTouchMove, false);
    window.addEventListener('resize', onWindowResize, false);

    render();
}


/**
 * 实时渲染函数
 */
function render() {
    requestAnimationFrame(render);
    lon = Math.max(-180, Math.min(180, lon));//限制固定角度内旋转
    lon += 0.1;//自动旋转
    lat = Math.max(-85, Math.min(85, lat));
    phi = THREE.Math.degToRad(90 - lat);
    theta = THREE.Math.degToRad(lon);
    target.x = Math.sin(phi) * Math.cos(theta);
    target.y = Math.cos(phi);
    target.z = Math.sin(phi) * Math.sin(theta);
    camera.lookAt(target);
    renderer.render(scene, camera);
}

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

/**
 * 脚本入口
 * @type {init}
 */
window.onload = init;