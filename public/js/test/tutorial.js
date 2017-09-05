/**
 * Created by Administrator on 2016/11/29.
 */


//必须在服务器上才能看到效果！
window.onload=function(){
    getTitleHeight();
    loadingAllImg();
}
//让全景图刚好撑满屏幕
var canvasHeight;
function getTitleHeight(){
    var title=document.getElementById('title');
    var titleHeight=parseFloat(getComputedStyle(title).height);
    var maxHeight=window.innerHeight;
    canvasHeight=parseFloat(maxHeight-titleHeight)+'px';
}
//全景图参数配置函数
function loadingAllImg(){
    var markers = [];
    var marker_1 = {
        id: "sun",
        circle: 10,
        width: 20,
        height: 20,
        latitude : 5.69810,
        longitude: -0.13770,
        tooltip: "sun"
    };
    markers.push(marker_1);
    var div = document.getElementById('container');
    var PSV = new PhotoSphereViewer({
        // 全景图的完整路径
        panorama: '../images/tutorial.jpg',

        marker: markers,

        // 放全景图的元素
        container: div,

        // 可选，默认值为2000，全景图在time_anim毫秒后会自动进行动画。（设置为false禁用它）
        time_anim: true,

        // 可选值，默认为false。显示导航条。
        navbar: [
            'autorotate',
            'zoom',
            'markers',
            {
                id: 'my-button',
                title: 'Hello world',
                className: 'custom-button',
                content: 'Custom',
                onClick: function() {
                    alert('Hello from custom button');
                }
            },
            'caption',
            'fullscreen'
        ],

        // 可选，默认值null，全景图容器的最终尺寸。例如：{width: 500, height: 300}。
        size: {
            width: '100%',
            height: canvasHeight
        }
    });
}