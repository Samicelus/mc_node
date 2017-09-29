window.position_canvas = $("#position_canvas");

function draw_pano_position(current_position, target_position){
    var relative_position = {
        x: target_position.x - current_position.x,
        y: target_position.y - current_position.y,
        z: target_position.z - current_position.z
    }
    var fill_color;
    var stroke_color;
    if(relative_position.z != 0){
        if(relative_position.x === 0 && relative_position.y === 0){
            fill_color = "orange";
            stroke_color = "oranged";
        }
        console.log("draw:",target_position);
        window.position_canvas.drawRect({
            fillStyle: fill_color?fill_color:"steelblue",
            strokeStyle: stroke_color?stroke_color:"blue",
            strokeWidth: 1,
            x: relative_position.x * 7,
            y: relative_position.y * 7,
            fromCenter: true,
            width: 7,
            height: 7
        });
    }
}

draw_pano_position({x:0, y:0, z:0}, {x:0, y:0, z:0});
draw_pano_position({x:0, y:0, z:0}, {x:1, y:1, z:0});
