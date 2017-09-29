window.position_canvas = $("#position_canvas");

function draw_pano_position(current_position, target_position){
    console.log("draw:",target_position);
    var relative_position = {
        x: target_position.x - current_position.x,
        y: target_position.y - current_position.y,
        z: target_position.z - current_position.z
    }
    var fill_color;
    var stroke_color;
    if(z != 0){
        if(x === 0 && y === 0){
            fill_color = "orange";
            stroke_color = "oranged";
        }
        window.position_canvas.drawRect({
            fillStyle: fill_color?fill_color:"steelblue",
            strokeStyle: stroke_color?stroke_color:"blue",
            strokeWidth: 1,
            x: 42 + relative_position.x * 7,
            y: 42 - relative_position.y * 7,
            fromCenter: true,
            width: 7,
            height: 7
        });
    }
}

draw_pano_position({x:0, y:0, z:0}, {x:0, y:0, z:0});
draw_pano_position({x:0, y:0, z:0}, {x:1, y:1, z:0});
