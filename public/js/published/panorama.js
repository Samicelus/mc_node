/**
 * Created by Administrator on 2016/11/29.
 */
window.markers = [];
window.longitude = 0;
window.latitude = 0;
window.PSV = {};
window.position = {x:0, y:0, z:0};
window.canvasHeight;
window.panorama_id;


//必须在服务器上才能看到效果！
window.onload=function(){
    getTitleHeight();
    getDefaultPage();
};

function getTitleHeight(){
    var title=document.getElementById('title');
    var titleHeight=parseFloat(getComputedStyle(title).height);
    var maxHeight=window.innerHeight;
    window.canvasHeight=parseFloat(maxHeight-titleHeight)+'px';
}

function getDefaultPage(){
    console.log("page_id:",window.page_id);
    var sendData = {
        page_id: window.page_id
    };
    $.post("/panorama/getPanorama",sendData,function(data,status){
        var ret_env = data.data.ret_env;
        window.panorama_id = ret_env.origin._id;
        changeTitle(ret_env);
        renew_markers(ret_env.origin._id,function(){
            loadingAllImg(ret_env);
        });
    });
}

function renew_markers(panorama_id, callback){
    $.get("/panorama/getMarker?panorama_id="+panorama_id,function(data,status){
        var ret_data = data.data;
        var temp_markers = [];
        console.log(ret_data);
        ret_data.forEach(function(markerObj){
            temp_markers.push(markerObj.marker);
        });
        window.markers = temp_markers;
        if(callback){
            callback();
        }
    });
}

//根据内外div的id获取内div应该有的top和left
function getCenter(out_id, inner_id){
    var out_width = parseFloat($(out_id).css("width"));
    var out_height = parseFloat($(out_id).css("height"));
    var out_top = parseFloat($(out_id).css("top"));
    var out_left = parseFloat($(out_id).css("left"));
    var inner_width = parseFloat($(inner_id).css("width"));
    var inner_height = parseFloat($(inner_id).css("height"));
    var top = out_top + out_height/2 - inner_height/2;
    var left = out_left + out_width/2 - inner_width/2;
    return {top:top, left:left};
}

//全景图参数配置函数
function loadingAllImg(ret_env){
    var div = document.getElementById('container');
    window.position = {x: ret_env.origin.x,y: ret_env.origin.y,z: ret_env.origin.z};
    window.PSV = new PhotoSphereViewer({
        // 全景图的完整路径
        panorama: ret_env.origin.panorama_url,

        markers: window.markers,
        // 放全景图的元素
        container: div,

        // 可选，默认值为2000，全景图在time_anim毫秒后会自动进行动画。（设置为false禁用它）
        time_anim: 2000,

        // 可选值，默认为false。显示导航条。
        navbar: [
            'autorotate',
            'zoom',
            'markers',
            'caption',
            'gyroscope',
            'fullscreen'
        ],

        //陀螺仪
        gyroscope:true,
        min_fov: 1,
        max_fov: 179,
        default_fov: 70,
        fisheye: true,

        // 可选，默认值null，全景图容器的最终尺寸。例如：{width: 500, height: 300}。
        size: {
            width: window.innerWidth,
            height: window.canvasHeight
        },

        transition:{
          duration: 1000,
          loader: true
        }

    });
    if(ret_env.origin.init_position){
        window.PSV.rotate(ret_env.origin.init_position);
    }

    /**
     * Create a new marker when the user clicks somewhere
     */
    window.PSV.on('click', function(e) {
        window.longitude = e.longitude;
        window.latitude = e.latitude;
        //点击事件
    });

    window.PSV.on('select-marker', function(marker) {
        var id = marker.id;
        //点击marker事件
        if(marker.marker_type == "path"){
            var goto_panorama = marker.goto_panorama;
            var sendData = {panorama_id:goto_panorama};
            $.post("/panorama/getPanoramaById",sendData,function(data,status){
                var ret_env = data.data.ret_env;
                window.panorama_id = ret_env.origin._id;
                renew_markers(ret_env.origin._id,function(){
                    window.PSV.clearMarkers();
                    window.markers.forEach(function(marker){
                        window.PSV.addMarker(marker);
                    });
                    window.PSV.setPanorama(ret_env.origin.panorama_url, ret_env.origin.init_position?ret_env.origin.init_position:window.PSV.getPosition(),true).then(function(){
                        window.position = {x: ret_env.origin.x,y: ret_env.origin.y,z: ret_env.origin.z};
                        window.enable_control_button = "enable";
                        changeTitle(ret_env);
                    });
                });
            });
        }
    });
}


function changeTitle(ret_env){
    $("#title").html(ret_env.origin.title);
}

$('#page_audio').on('ended', function() {
    console.log("音频已播放完成");
    $('.btn-audio').css({'background':'url(../../images/music.png) no-repeat center bottom','background-size':'cover'});
})
//播放器控制
var audio = document.getElementById('page_audio');
audio.volume = .3;
$('.btn-audio').click(function() {
    event.stopPropagation();//防止冒泡
    if(audio.paused){ //如果当前是暂停状态
        $('.btn-audio').css({'background':'url(../../images/music.png) no-repeat center bottom','background-size':'cover'});
        audio.play(); //播放
        return;
    }else{//当前是播放状态
        $('.btn-audio').css({'background':'url(../../images/music.png) no-repeat center bottom','background-size':'cover'});
        audio.pause(); //暂停
    }
});
