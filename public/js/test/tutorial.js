/**
 * Created by Administrator on 2016/11/29.
 */
window.markers = [];

//必须在服务器上才能看到效果！
window.onload=function(){
    renew_markers("test",function(){
        getTitleHeight();
        loadingAllImg();
    });
}

//
function renew_markers(page_name, callback){
    $.get("/getMarker?page_name="+page_name,function(data,status){
        var ret_date = data.data;
        var temp_markers = [];
        ret_date.forEach(function(markerObj){
            temp_markers.push(markerObj.marker);
        })
        window.markers = temp_markers;
        if(callback){
            callback();
        }
    });
}

function add_marker(page_name,panorama_id, marker,callback){
    var sendData = {};
    sendData.page_name = page_name;
    sendData.panorama_id = panorama_id;
    sendData.marker = marker;
    $.post("/addMarker",sendData,function(data,status){
        renew_markers(page_name, callback);
    });
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
    var div = document.getElementById('container');
    var PSV = new PhotoSphereViewer({
        // 全景图的完整路径
        panorama: '../images/tutorial.jpg',

        markers: window.markers,

        // 放全景图的元素
        container: div,

        // 可选，默认值为2000，全景图在time_anim毫秒后会自动进行动画。（设置为false禁用它）
        time_anim: false,

        // 可选值，默认为false。显示导航条。
        navbar: [
            'autorotate',
            'zoom',
            'markers',
            'caption',
            'fullscreen'
        ],

        // 可选，默认值null，全景图容器的最终尺寸。例如：{width: 500, height: 300}。
        size: {
            width: '100%',
            height: canvasHeight
        }
    });

    /**
     * Create a new marker when the user clicks somewhere
     */
    PSV.on('click', function(e) {
        var marker = {
            id: '#' + Math.random(),
            longitude: e.longitude,
            latitude: e.latitude,
            circle: 20,
            tooltip: 'customer added marker'
        };
        console.log(JSON.stringify(marker));
        add_marker("test","tutorial", JSON.stringify(marker));
    });
}