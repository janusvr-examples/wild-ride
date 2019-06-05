var start;
var speed = 7.5;
room.onLoad = function() {
/*
  var light = room.objects['mylight']._target.light;
  light.shadow.camera.near = 20;
  light.shadow.camera.far = 60;
  light.shadow.bias = 1;
  light.shadow.camera.updateProjectionMatrix();
*/
}
room.update = function() {
  if (start) {
    var now = performance.now();
    var diff = (now - start) / 1000;
    var newpos = room.objects['camerapath'].getPointAlongPath(diff * speed);
    var car = room.objects['car'];
    if (newpos) {
      car.pos = newpos;
    } else {
      start = false;
      room.appendChild(player);
    }
  } else {
    room.stopSound('vivalasvegas');
  }
}
function begin() {
  start = performance.now();
  room.playSound('vivalasvegas');
  room.objects['car'].appendChild(player);
  //player.appendChild(room.objects['mylight']);
  player.pos = V(0.87, 0.655, 3.42);
  
  //room.objects['mylight'].pos = V(0,10,10);
}
