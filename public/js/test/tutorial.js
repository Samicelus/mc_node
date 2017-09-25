/**
 * Created by Administrator on 2016/11/29.
 */
window.markers = [];
window.longitude = 0;
window.latitude = 0;
window.PSV = {};
window.position = {x:0, y:0, z:0};
window.enable_control_button = "enable";

//必须在服务器上才能看到效果！
window.onload=function(){
    var sendData = {
        page_id:"59c333a2fd52da73a0c32383"
    };
    $.post("/panorama/getPanorama",sendData,function(data,status){
        var ret_env = data.data;
        changeTitle(ret_env);
        renew_markers(ret_env.origin._id,function(){
            loadingAllImg(ret_env);
        });
    });
};

$(".marker_input").blur(function(){
    var that = $(this);
    if(!that.val()){
        that.css("background-color","red");
    }else{
        that.css("background-color","white");
    }
});

//
function renew_markers(panorama_id, callback){
    $.get("/panorama/getMarker?panorama_id="+panorama_id,function(data,status){
        var ret_data = data.data;
        var temp_markers = [];
        console.log(ret_data);
        ret_data.forEach(function(markerObj){
            temp_markers.push(markerObj.marker);
        })
        window.markers = temp_markers;
        if(callback){
            callback();
        }
    });
}

function add_marker(panorama_id, marker,callback){
    var sendData = {};
    sendData.panorama_id = panorama_id;
    sendData.marker = marker;
    $.post("/panorama/addMarker",sendData,function(data,status){
        renew_markers(panorama_id, callback);
    });
}

function remove_marker(panorama_id, id,callback){
    var sendData = {};
    sendData.panorama_id = panorama_id;
    sendData.id = id;
    $.post("/panorama/removeMarker",sendData,function(data,status){
        renew_markers(panorama_id, callback);
    });
}

function clear_marker_input(){
    $(".marker_input").val("");
    $(".marker_input").css("background-color","white");
}

function setMaskHeight(panorama_id){
    $("#mask").css("height",$("#container").css("height"));
    $("#mask").css("width",$("#container").css("width"));
    $("#mask").css("top",$("#title").css("height"));
    $("#mask").click(function(){
        $("#mask").hide();
        $("#dialog").hide();
        clear_marker_input()
    });
    $("#cancel").click(function(){
        $("#mask").hide();
        $("#dialog").hide();
        clear_marker_input()
    });
    $("#confirm").click(function(){
        var marker_name = $("#marker_name").val();
        var marker_content = $("#marker_content").val();
        $("#mask").hide();
        $("#dialog").hide();
        clear_marker_input()
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
        if((!marker_name)||(!marker_content)){
            alert("输入内容不能为空")
        }else{
            add_marker(panorama_id, JSON.stringify(marker),function(){
                window.PSV.clearMarkers();
                var markers = window.markers;
                markers.forEach(function(marker){
                    window.PSV.addMarker(marker);
                });
            });
        }
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
function loadingAllImg(ret_env){
    var div = document.getElementById('container');
        setMaskHeight(ret_env.origin._id);
        window.position = {x: ret_env.origin.x,y: ret_env.origin.y,z: ret_env.origin.z};
        window.PSV = new PhotoSphereViewer({
            // 全景图的完整路径
            panorama: ret_env.origin.panorama_url,

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
                width: '80%',
                height: 480
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
            remove_marker(ret_env.origin._id, marker.id, function(){
                window.PSV.clearMarkers();
                var markers = window.markers;
                markers.forEach(function(marker){
                    window.PSV.addMarker(marker);
                });
            })
        });

        $(".control-button").click(function(){
            console.log("click "+ this.id);
            console.log("value "+ window.enable_control_button);
            var sendData = {
                page_id: "59c333a2fd52da73a0c32383",
                current_position:JSON.stringify(window.position),
                move: this.id
            };
            if(window.enable_control_button == "enable"){
                window.enable_control_button = "disable";
                disable_button_color("control-button");
                $.post("/panorama/getPanorama",sendData,function(data,status){
                    var ret_env = data.data;
                    renew_markers(ret_env.origin._id,function(){
                        window.PSV.setPanorama(ret_env.origin.panorama_url, window.PSV.ExtendedPosition,true).then(function(){
                            window.position = {x: ret_env.origin.x,y: ret_env.origin.y,z: ret_env.origin.z};
                            window.enable_control_button = "enable";
                            changeTitle(ret_env);
                        });
                    });
                });
            }
        });
}

function enable_button_color(className){
    $("."+className).css("background-color","#dcdcdc")
}

function disable_button_color(className){
    $("."+className).css("background-color","#6c6c6c")
}


function changeTitle(ret_env){
    console.log(ret_env);
    if(ret_env.front.title){
        $("#front").html("↑");
        $("#front").css("background-color","#dcdcdc");
        $("#front").val("enable");
    }else{
        $("#front").html("前");
        $("#front").css("background-color","#6c6c6c");
        $("#front").val("null");
    }
    if(ret_env.back.title){
        $("#back").html("↓");
        $("#back").css("background-color","#dcdcdc");
        $("#back").val("enable");
    }else{
        $("#back").html("后");
        $("#back").css("background-color","#6c6c6c");
        $("#back").val("null");
    }
    if(ret_env.left.title){
        $("#left").html("←");
        $("#left").css("background-color","#dcdcdc");
        $("#left").val("enable");
    }else{
        $("#left").html("左");
        $("#left").css("background-color","#6c6c6c");
        $("#left").val("null");
    }
    if(ret_env.right.title){
        $("#right").html("→");
        $("#right").css("background-color","#dcdcdc");
        $("#right").val("enable");
    }else{
        $("#right").html("右");
        $("#right").css("background-color","#6c6c6c");
        $("#right").val("null");
    }
    if(ret_env.up.title){
        $("#up").html("▲");
        $("#up").css("background-color","#dcdcdc");
        $("#up").val("enable");
    }else{
        $("#up").html("上");
        $("#up").css("background-color","#6c6c6c");
        $("#up").val("null");
    }
    if(ret_env.down.title){
        $("#down").html("▼");
        $("#down").css("background-color","#dcdcdc");
        $("#down").val("enable");
    }else{
        $("#down").html("下");
        $("#down").css("background-color","#6c6c6c");
        $("#down").val("null");
    }
}