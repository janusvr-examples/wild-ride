room.registerElement('path', {
  createChildren: function() {
    console.log('hey!', this.children);
    this.generatePath();
  },
  generatePath: function() {
    var children = this.children;
    var vectors = [];
    var path = new THREE.CurvePath();
    if (children.length > 1) {
      var curr = children[0];
      for (var i = 1; i < children.length; i++) {
        var child = children[i];
        vectors.push(child.pos);
        var linecurve = new THREE.LineCurve3(curr.pos._target, child.pos._target);
        path.add(linecurve);
        curr = child;
      }
    }

    this.path = path;
  },
  getLength: function() {
/*
    var children = this.children;
    var length = 0;
    if (children.length > 1) {
      var curr = children[0];
      for (var i = 1; i < children.length; i++) {
        var child = children[i];
        length += curr.distanceTo(child);
        curr = child;
      }
    }
    return length;
*/
    return this.path.getLength();
  },
  getPointAlongPath: function(t) {
    var length = this.getLength();
    var p = this.path.getPoint(t / length);
    return p;
  }
});
room.registerElement('waypoint', {
  
});
