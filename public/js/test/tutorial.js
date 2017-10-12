/**
 * Created by Administrator on 2016/11/29.
 */
window.markers = [];
window.longitude = 0;
window.latitude = 0;
window.PSV = {};
window.position = {x:0, y:0, z:0};
window.enable_control_button = "enable";
window.page_id = "59c333a2fd52da73a0c32383";
window.functional = {};
window.functional.set_init = false;
window.functional.set_path = false;
window.panorama_id = "";
window.user_name = "";

//必须在服务器上才能看到效果！
window.onload=function(){
    $.get('/panorama/checkLogin',function(data, status){
        if(data.result == "TRUE"){
            window.user_name = data.data;
            $("#login_pad").css("display","none");
            $("#control_pad").css("display","inline-block");
            getDefaultPage()
        }else{
            $("#login_pad").css("display","inline-block");
            $("#control_pad").css("display","none");
        }
    });
    $.post('/panorama/wechat/accesstoken',{mp_id:"59df356fe9b5234c4d3835dc"},function(data, status){
        console.log("accessToken:",data.data);
    })
};

$("#login").click(function(){
    var user_name = $("#username").val();
    var password = $("#password").val();
    var sendData = {
        user_name: user_name,
        password: password
    };
    $.post("/panorama/loginUser", sendData, function(data, status){
        if(data.result == "TRUE"){
            window.user_name = data.data.username;
            $("#login_pad").css("display","none");
            $("#control_pad").css("display","inline-block");
            getDefaultPage()
        }else{
            $("#login_pad").css("display","inline-block");
            $("#control_pad").css("display","none");
            alert("登录失败！");
        }
    })
});

function getDefaultPage(){
    $.get("/panorama/getDefaultPage", function(data, status){
        window.page_id = data.data;
        var sendData = {
            page_id: window.page_id
        };
        $.post("/panorama/getPanorama",sendData,function(data,status){
            var ret_env = data.data.ret_env;
            window.panorama_id = ret_env.origin._id;
            console.log("change panorama_id:"+window.panorama_id+" when init page");
            var current_position = data.data.current_position;
            var level_env = data.data.level_env;
            window.drawLevel(current_position, level_env);
            changeTitle(ret_env);
            renew_markers(ret_env.origin._id,function(){
                loadingAllImg(ret_env);
            });
        });

        $.get("/panorama/getPages",function(data, status){
            var pages = data.data;
            $("#select_page_option").remove();
            pages.map(function(page){
                $("#select_page").append("<option id='page_"+page._id+"' value='"+page._id+"' class='select_page_option'>"+page.page_name+"</option>");
            });
        });

        $.get("/panorama/getPanoramas?page_id="+window.page_id,function(data, status){
            var panoramas = data.data;
            $("#select_panorama_option").remove();
            panoramas.map(function(panorama){
                $("#select_panorama").append("<option id='panorama_"+panorama._id+"' content='"+panorama.title+"' value='"+panorama._id+"' class='select_panorama_option'>"+panorama.title+"</option>");
            });
        });
    })
}


$("#addPage_button").click(function(){
    $("#addPage_mask").css("display","inline-block");
    setDialogPosition("#addPage_dialog", "#addPage_mask");
    $("#addPage_dialog").show();
});

$(".marker_input").blur(function(){
    var that = $(this);
    if(!that.val()){
        that.css("background-color","red");
    }else{
        that.css("background-color","white");
    }
});

$(".functional_button").click(function(){
    var that = $(this);
    var original_style = that.css("border-style");
    $(".functional_button").css("border-style","groove");
    toggle_button_style(that, original_style);
});

function toggle_button_style(button, original_style){
    if(original_style == "groove"){
        button.css("border-style","inset");
    }else{
        button.css("border-style","groove");
    }
}

function disable_all_other_functional(target_functional){
    for(var i in window.functional){
        if(target_functional != i){
            window.functional[i] = false;
        }
    }
}

$("#justify_init").click(function(){
   disable_all_other_functional("set_init");
   if(window.functional.set_init){
       window.functional.set_init = false;
   } else{
       window.functional.set_init = true;
   }
   console.log(window.functional);
});

$("#add_path").click(function(){
    disable_all_other_functional("set_path");
    if(window.functional.set_path){
        window.functional.set_path = false;
    } else{
        window.functional.set_path = true;
    }
    console.log(window.functional);
});

//
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

function add_marker(panorama_id, marker,callback){
    var sendData = {};
    sendData.panorama_id = panorama_id;
    sendData.marker = marker;
    $.post("/panorama/addMarker",sendData,function(data,status){
        renew_markers(panorama_id, callback);
    });
}

function remove_marker(panorama_id, id,callback){
    console.log("触发removeMarker")
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

function resetMaskHeight(){
    $("#mask").css("height",$("#container").css("height"));
    $("#mask").css("width",$("#container").css("width"));
    $("#mask").css("top",$("#title").css("height"));
    $("#mask").css("margin-left",$("#main_div").css("margin-left"));
}

function setMaskHeight(panorama_id){
    resetMaskHeight();
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
            console.log("add marker for:"+window.panorama_id);
            add_marker(window.panorama_id, JSON.stringify(marker),function(){
                window.PSV.clearMarkers();
                var markers = window.markers;
                markers.forEach(function(marker){
                    window.PSV.addMarker(marker);
                });
            });
        }
    });

    $("#addPath").click(function(){
        var selected_panorama = $("#select_panorama").val();
        var marker_icon = $("#select_marker_style").val();
        var content = $("#select_panorama option:selected").attr("content");
        $("#insert_mask").hide();
        $("#insert_path_dialog").hide();
        window.functional.set_path = false;
        var marker = {
            id: 'path#' + Math.random(),
            longitude: window.longitude,
            latitude: window.latitude,
            html: marker_icon,
            style: {
                maxWidth: '100px',
                color: '#efefef',
                fontSize: '52px',
                fontFamily: 'Webdings',
                textAlign: 'center',
                textShadow: '#000 2px 0 0, #000 0 2px 0, #000 -2px 0 0, #000 0 -2px 0'
            },
            tooltip: {
                content: "移动到:" + content
            },
            marker_type: "path",
            goto_panorama: selected_panorama
        };
        console.log("add path for:"+window.panorama_id);
        add_marker(window.panorama_id, JSON.stringify(marker),function(){
            window.PSV.clearMarkers();
            var markers = window.markers;
            markers.forEach(function(marker){
                window.PSV.addMarker(marker);
            });
        });
    });

    $("#insert_mask").click(function(){
        $("#insert_mask").hide();
        $("#insert_dialog").hide();
        clear_marker_input();
    });

    $("#cancel_add").click(function(){
        $("#insert_mask").hide();
        $("#insert_dialog").hide();
        $("#insert_path_dialog").hide();
        clear_marker_input()
    });

    $("#cancel_addPath").click(function(){
        $("#insert_mask").hide();
        $("#insert_path_dialog").hide();
    });

    $("#addPage_mask").click(function(){
        $("#addPage_mask").hide();
        $("#addPage_dialog").hide();
        clear_marker_input();
    });

    $("#cancel_addPage").click(function(){
        $("#addPage_mask").hide();
        $("#addPage_dialog").hide();
        clear_marker_input()
    });

    $("#addPanorama").click(function(){
        var insert_title = $("#insert_title").val();
        var insert_content = $("#insert_content").val();
        var insert_position = JSON.parse($("#insert_position").val());
        var quality = $("#insert_quality").val();
        var x = insert_position.x;
        var y = insert_position.y;
        var z = insert_position.z;
        var page_id = window.page_id;
        $("#insert_mask").hide();
        $("#insert_dialog").hide();
        if((!insert_title)||(!insert_content)||(!insert_position)||(!page_id)){
            alert("输入内容不能为空");
        }else{
            disable_button_color("control-button");
            var fd = new FormData();
            fd.append("panorama_pic",$("#insert_file")[0].files[0]);
            fd.append("title",insert_title);
            fd.append("content",insert_content);
            fd.append("quality",quality);
            fd.append("page_id",page_id);
            fd.append("x",x.toString());
            fd.append("y",y.toString());
            fd.append("z",z.toString());
            $.ajax({
                type: 'post',
                url: '/panorama/addPanorama',
                data: fd,
                cache: false,
                contentType: false,// 当有文件要上传时，此项是必须的，否则后台无法识别文件流的起始位置(详见：#1)
                processData: false,// 是否序列化data属性，默认true(注意：false时type必须是post，详见：#2)
                success: function(data) {
                    var sendData = {
                        page_id: window.page_id,
                        current_position:JSON.stringify(window.position)
                    };
                    $.post("/panorama/getPanorama",sendData,function(data,status){
                        var ret_env = data.data.ret_env;
                        var current_position = data.data.current_position;
                        var level_env = data.data.level_env;
                        window.drawLevel(current_position, level_env);
                        changeTitle(ret_env);
                    });
                }
            });
        }
    });
}

$("#addPage").click(function(){
    var page_name = $("#addPage_title").val();
    var initial_title = $("#initial_title").val();
    var initial_content = $("#initial_content").val();
    var quality = $("#add_quality").val();
    $("#addPage_mask").hide();
    $("#addPage_dialog").hide();
    var sendData = {
        page: page_name
    };
    $.post("/panorama/addPage",sendData,function(data,status){
        var pageObj = data.data;
        var page_id = pageObj._id;
        console.log("page_id:"+page_id);
        var fd = new FormData();
        fd.append("panorama_pic",$("#addPage_file")[0].files[0]);
        fd.append("title",initial_title);
        fd.append("content",initial_content);
        fd.append("page_id",page_id);
        fd.append("quality",quality);
        fd.append("x","0");
        fd.append("y","0");
        fd.append("z","0");
        $.ajax({
            type: 'post',
            url: '/panorama/addPanorama',
            data: fd,
            cache: false,
            contentType: false,// 当有文件要上传时，此项是必须的，否则后台无法识别文件流的起始位置(详见：#1)
            processData: false,// 是否序列化data属性，默认true(注意：false时type必须是post，详见：#2)
            success: function(data) {
                $.get("/panorama/getPages",function(data, status){
                    var pages = data.data;
                    $("#select_page_option").remove();
                    pages.map(function(page){
                        $("#select_page").append("<option id='page_"+page._id+"' value='"+page._id+"' class='select_page_option'>"+page.page_name+"</option>");
                    });
                });
            }
        });
    });
});

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
        if(ret_env.origin.init_position){
            window.PSV.rotate(ret_env.origin.init_position);
        }

        /**
         * Create a new marker when the user clicks somewhere
         */
        window.PSV.on('click', function(e) {
            window.longitude = e.longitude;
            window.latitude = e.latitude;
            if(window.functional.set_init){
                var sendData = {
                    page_id: window.page_id,
                    current_position:JSON.stringify(window.position),
                    init_position: JSON.stringify({longitude:window.longitude, latitude:window.latitude})
                };
                $.post("/panorama/setInitPosition",sendData,function(data,status){
                    window.functional.set_init = false;
                    toggle_button_style($("#justify_init"));
                });
            }else if(window.functional.set_path){
                $("#insert_mask").css("display","inline-block");
                setDialogPosition("#insert_path_dialog","#insert_mask");
                $("#insert_path_dialog").show();
                toggle_button_style($("#add_path"));
            }else{
                resetMaskHeight();
                $("#mask").css("display","inline-block");
                setDialogPosition("#dialog", "#mask");
                $("#dialog").show();
            }
        });


        window.PSV.on('select-marker', function(marker) {
            if(marker.marker_type == "path"){
                var goto_panorama = marker.goto_panorama;
                var sendData = {panorama_id:goto_panorama};
                $.post("/panorama/getPanoramaById",sendData,function(data,status){
                    var ret_env = data.data.ret_env;
                    window.panorama_id = ret_env.origin._id;
                    console.log("change panorama_id:"+window.panorama_id+" when click marker");
                    var current_position = data.data.current_position;
                    var level_env = data.data.level_env;
                    window.drawLevel(current_position, level_env);
                    console.log("init_position:");
                    console.log(ret_env.origin.init_position);
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
            }else{
                remove_marker(ret_env.origin._id, marker.id, function(){
                    window.PSV.clearMarkers();
                    var markers = window.markers;
                    markers.forEach(function(marker){
                        window.PSV.addMarker(marker);
                    });
                });
            }
        });

        $(".control-button").click(function(){
            var sendData = {
                page_id: window.page_id,
                current_position:JSON.stringify(window.position),
                move: this.id
            };
            if(window.enable_control_button == "enable"){
                if(this.value == "true"){
                    window.enable_control_button = "disable";
                    disable_button_color("control-button");
                    $.post("/panorama/getPanorama",sendData,function(data,status){
                        var ret_env = data.data.ret_env;
                        window.panorama_id = ret_env.origin._id;
                        console.log("change panorama_id:"+window.panorama_id+" when click control-button");
                        var current_position = data.data.current_position;
                        var level_env = data.data.level_env;
                        window.drawLevel(current_position, level_env);
                        console.log("init_position:");
                        console.log(ret_env.origin.init_position);
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
                if(this.value == "null"){
                    $("#insert_mask").css("display","inline-block");
                    setDialogPosition("#insert_dialog","#insert_mask");
                    $("#insert_dialog").show();
                    var new_position = getRelativePosition(window.position, this.id);
                    $("#insert_position").val(JSON.stringify(new_position));
                }
            }
        });

        $("#select_page").change(function(event){
            if(window.enable_control_button == "enable"){
                window.enable_control_button = "disable";
                disable_button_color("control-button");
                var page_id = event.target.value;
                window.page_id = page_id;
                window.position = {x:0, y:0, z:0};
                var sendData = {
                    page_id: window.page_id
                };
                disable_button_color("control-button");
                $.post("/panorama/getPanorama",sendData,function(data,status){
                    var ret_env = data.data.ret_env;
                    window.panorama_id = ret_env.origin._id;
                    console.log("change panorama_id:"+window.panorama_id+" when change page_id");
                    var current_position = data.data.current_position;
                    var level_env = data.data.level_env;
                    window.drawLevel(current_position, level_env);
                    console.log("ret_env:",ret_env);
                    renew_markers(ret_env.origin._id,function(){
                        window.PSV.clearMarkers();
                        window.markers.forEach(function(marker){
                            window.PSV.addMarker(marker);
                        });
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

function getRelativePosition(position, direction){
    switch(direction){
        case "up":
            return {x:position.x, y:position.y, z:position.z+1};
            break;
        case "down":
            return {x:position.x, y:position.y, z:position.z-1};
            break;
        case "front":
            return {x:position.x, y:position.y+1, z:position.z};
            break;
        case "back":
            return {x:position.x, y:position.y-1, z:position.z};
            break;
        case "left":
            return {x:position.x-1, y:position.y, z:position.z};
            break;
        case "right":
            return {x:position.x+1, y:position.y, z:position.z};
            break;
        default:
            return position;
            break;
    }
}

function setDialogPosition(dialogName, maskName){
    $(dialogName).css("top", getCenter(maskName,dialogName).top+"px");
    $(dialogName).css("left", getCenter(maskName,dialogName).left+"px");
}

function disable_button_color(className){
    $("."+className).css("background-color","#6c6c6c")
}


function changeTitle(ret_env){
    $("#title").html(ret_env.origin.title);
    if(ret_env.front.title){
        $("#front").html("↑");
        $("#front").css("background-color","#dcdcdc");
        $("#front").val("true");
    }else{
        $("#front").html("前");
        $("#front").css("background-color","#6c6c6c");
        $("#front").val("null");
    }
    if(ret_env.back.title){
        $("#back").html("↓");
        $("#back").css("background-color","#dcdcdc");
        $("#back").val("true");
    }else{
        $("#back").html("后");
        $("#back").css("background-color","#6c6c6c");
        $("#back").val("null");
    }
    if(ret_env.left.title){
        $("#left").html("←");
        $("#left").css("background-color","#dcdcdc");
        $("#left").val("true");
    }else{
        $("#left").html("左");
        $("#left").css("background-color","#6c6c6c");
        $("#left").val("null");
    }
    if(ret_env.right.title){
        $("#right").html("→");
        $("#right").css("background-color","#dcdcdc");
        $("#right").val("true");
    }else{
        $("#right").html("右");
        $("#right").css("background-color","#6c6c6c");
        $("#right").val("null");
    }
    if(ret_env.up.title){
        $("#up").html("▲");
        $("#up").css("background-color","#dcdcdc");
        $("#up").val("true");
    }else{
        $("#up").html("上");
        $("#up").css("background-color","#6c6c6c");
        $("#up").val("null");
    }
    if(ret_env.down.title){
        $("#down").html("▼");
        $("#down").css("background-color","#dcdcdc");
        $("#down").val("true");
    }else{
        $("#down").html("下");
        $("#down").css("background-color","#6c6c6c");
        $("#down").val("null");
    }
}
