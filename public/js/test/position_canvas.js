window.position_canvas = $("#position_canvas");

function draw_pano_position(current_position, target_position){
    var relative_position = {
        x: target_position.x - current_position.x,
        y: target_position.y - current_position.y,
        z: target_position.z - current_position.z
    }
    var fill_color;
    var stroke_color;
    if(relative_position.z === 0){
        if(relative_position.x === 0 && relative_position.y === 0){
            fill_color = "orange";
            stroke_color = "red";
        }
        console.log("draw:",target_position);
        window.position_canvas.drawRect({
            fillStyle: fill_color?fill_color:"steelblue",
            strokeStyle: stroke_color?stroke_color:"blue",
            strokeWidth: 2,
            x: 72 + relative_position.x * 30,
            y: 72 - relative_position.y * 30,
            fromCenter: true,
            width: 30,
            height: 30,
            cornerRadius: 3
        });
    }
}

window.drawLevel = function(current_position, level_env){
    window.position_canvas.clearCanvas();
    level_env.forEach(function(target_position){
        draw_pano_position(current_position, target_position);
    })
}