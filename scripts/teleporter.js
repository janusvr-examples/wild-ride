room.registerElement('teleporter', {
  target: false,
  url: false,
  external: false,
  width: 1,
  length: 1,
  height: 2,
  flicker: 8,
  fudgefactor: 1.2,
  cooldown: 1000,
  cooling: false,

  createChildren: function() {
    this.light = room.createObject('Light', {
      col: this.col,
      pos: V(0,1,0)
    }, this);
    this.particles = room.createObject('Particle', {
      col: this.col,
      pos: V(-.5,.1,-.5),
      scale: V(.05),
      //vel: V(-.5,0,-.5),
      particle_vel: V(-.4,0,-.4),
      rand_vel: V(.8,2,.8),
      rand_col: V(1,.5,.5),
      rand_pos: V(1,0,1),
      accel: V(0,-1,0),
      rand_accel: V(0,2,0),
      rate: 50,
      count: 50,
      duration: 1,
      loop: true
    }, this);
    this.particles.particle_vel = V(-.4, 0, -.4); // FIXME - particle velocity isn't being set on spawn
    this.base = room.createObject('Object', {
      id: 'cube',
      col: this.col,
      scale: V(this.length,.2,this.width),
      collision_id: 'cube',
      collision_scale: V(1,.5,1),
      collision_trigger: true,
      oncollision: this.handleCollision
    }, this);

    this.sound = room.createObject('Sound', { id: 'teleport' }, this);

    this.addEventListener('update', this.handleFrame);
  },
  activate: function() {
    if (!this.cooling) {
      this.cooling = true;
      if (this.target && room.objects[this.target]) {
        player.pos = room.objects[this.target].pos;
        this.sound.play();
      } else if (this.url) {
        var url = this.url;
        this.sound.play();
        if (this.external) {
          document.location.href = url;
        } else {
          janus.load(url);
        }
      }
      setTimeout(this.cooldownFinish, this.cooldown);
    }
  },
  cooldownFinish: function() {
    this.cooling = false;
  },
  handleCollision: function(ev) {
    // FIXME - player collisions are currently disabled
    console.log('boing!', this.target);
  },
  handleFrame: function() {
    // FIXME - vextor proxies are all kinds of broken
    var pos = this.worldToLocal(player.head_pos.clone());
    if ((pos.y >= 0 && pos.y <= this.height) && (Math.abs(pos.x) < this.length / 2 * this.fudgefactor && Math.abs(pos.z) < this.width / 2 * this.fudgefactor)) {
      this.activate();
    }
    this.light.light_intensity = Math.max(10, Math.min(16, this.light.light_intensity + (Math.random() * this.flicker - (this.flicker / 2))));
  }
});

