/**
 * Created by Administrator on 2016/11/29.
 */
window.markers = [];
window.longitude = 0;
window.latitude = 0;
window.PSV = {};

//必须在服务器上才能看到效果！
window.onload=function(){
    renew_markers("test",function(){
        loadingAllImg();
        setMaskHeight();
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

function remove_marker(page_name, id,callback){
    var sendData = {};
    sendData.page_name = page_name;
    sendData.id = id;
    $.post("/removeMarker",sendData,function(data,status){
        renew_markers(page_name, callback);
    });
}

function setMaskHeight(){
    $("#mask").css("height",$("#container").css("height"));
    $("#mask").click(function(){
        $("#mask").hide();
        $("#dialog").hide();
    });
    $("#cancel").click(function(){
        $("#mask").hide();
        $("#dialog").hide();
    });
    $("#confirm").click(function(){
        var marker_name = $("#marker_name").val();
        var marker_content = $("#marker_content").val();
        $("#marker_name").val("");
        $("#marker_content").val("");
        $("#mask").hide();
        $("#dialog").hide();
        var marker = {
            id: marker_name + '#' + Math.random(),
            longitude: window.longitude,
            latitude: window.latitude,
            html: marker_name,
            style: {
                maxWidth: '100px',
                color: '#efefef',
                fontSize: '20px',
                fontFamily: 'Helvetica, sans-serif',
                textAlign: 'center'
            },
            tooltip: {
                content: marker_content,
            }
        };
        add_marker("test","tutorial", JSON.stringify(marker),function(){
            window.PSV.clearMarkers();
            var markers = window.markers;
            markers.forEach(function(marker){
                window.PSV.addMarker(marker);
            });
        });
    });
}

function setDialogPosition(){
    $("#dialog").css("top", getCenter("#mask","#dialog").top+"px");
    $("#dialog").css("left", getCenter("#mask","#dialog").left+"px");
}

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
function loadingAllImg(){
    var div = document.getElementById('container');
    window.PSV = new PhotoSphereViewer({
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
            'markers',
            'download',
            'caption',
            'gyroscope',
            'fullscreen'
        ],

        //陀螺仪
        gyroscope:true,

        // 可选，默认值null，全景图容器的最终尺寸。例如：{width: 500, height: 300}。
        size: {
            width: '100%',
            height: 720
        }
    });

    /**
     * Create a new marker when the user clicks somewhere
     */
    window.PSV.on('click', function(e) {
        $("#mask").show();
        setDialogPosition();
        $("#dialog").show();
        window.longitude = e.longitude;
        window.latitude = e.latitude;
    });



    window.PSV.on('select-marker', function(marker) {
        remove_marker("test", marker.id, function(){
            window.PSV.clearMarkers();
            var markers = window.markers;
            markers.forEach(function(marker){
                window.PSV.addMarker(marker);
            });
        })
    });

}