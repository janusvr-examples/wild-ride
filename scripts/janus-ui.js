  room.registerElement('pushbutton', {
    width:        .5,
    length:       .5,
    height:       .5,
    clicking:     false,
    active:       false,

    onactivate:   false,
    ondeactivate: false,

    createChildren: function() {
      this.base = room.createObject('Object', {
        id: 'cube',
        collision_id: 'cube',
        locked: true,
        col: V(.6,.6,.6),
        scale: V(this.length,this.height / 2,this.width),
        pos: V(0,this.height/4,0)
      }, this);
      this.button = room.createObject('Object', {
        id: 'cube',
        collision_id: 'cube',
        locked: true,
        col: this.col,
        scale: V(this.length * .8, this.height / 4, this.width * .8),
      }, this);
console.log('LOCKED!', this.base.locked);
      this.sounds = {
        clickin:  this.createObject('Sound', { id: 'pushbutton-click-in', }),
        clickon:  this.createObject('Sound', { id: 'pushbutton-click-on', }),
        clickoff: this.createObject('Sound', { id: 'pushbutton-click-off', }),
      };

      this.button.addEventListener('mousedown', this.onMouseDown);
      window.addEventListener('mouseup', this.onMouseUp);
      window.addEventListener('touchend', this.onMouseUp);
      this.button.addEventListener('click', this.onClick);

      this.setButtonPos();
    },
    activate: function() {
      this.active = !this.active;

      if (this.active && this.onactivate) {
        this.executeCallback(this.onactivate);
      } else if (!this.active && this.ondeactivate) {
        this.executeCallback(this.ondeactivate);
      }
    },
    onClick: function(ev) {
      if (ev.button == 0) {
        if (this.onclick) {
          this.executeCallback(this.onclick);
        }
        ev.stopPropagation();
      }
    },
    onMouseDown: function(ev) {
      if (ev.button == 0) {
        this.button.sync = true;
        this.clicking = true;
        this.activate();

        this.setState('in');

        ev.stopPropagation();
      }
    },
    onMouseUp: function(ev) {
      if (ev.button == 0 && this.clicking) {
        if (this.active) {
          this.setState('on');
        } else {
          this.setState('off');
        }
        this.button.sync = true;
        this.clicking = false;

        ev.stopPropagation();
      }
    },
    setActive: function(active) {
      this.active = active;
      this.setState(active ? 'on' : 'off');
    },
    setButtonPos: function(pos)   {
      if (typeof pos == 'undefined') pos = (this.active ? .6 : 0);
      var percent = Math.min(1, Math.max(0, pos));
      var defaultpos = this.height / 2;
      this.button.pos = V(0, defaultpos - ((this.height / 8) * percent) + (this.height / 16), 0);
    },
    setState: function(state) {
      if (state != this.state) {
        this.state = state;
        if (state == 'in') {
          this.setButtonPos(1);
          this.sounds.clickin.play();
        } else if (state == 'on') {
          this.setButtonPos(.6);
          this.sounds.clickon.play();
        } else if (state == 'off') {
          this.setButtonPos(0);
          this.sounds.clickoff.play();
        }
      }
    }
      
  });
  room.registerElement('slider', {
    clicking: false,
    value: 1,
    min: 0,
    max: 1,
    length: 1,
    width: .25,
    height: .2,

    onbegin:  false,
    onchange: false,
    onend:    false,

    createChildren: function() {
      this.base = room.createObject('Object', {
        id: 'cube',
        collision_id: 'cube',
        col: V(.6,.6,.6),
        scale: V(this.length,this.height/2,this.width),
        pos: V(0,this.height/4,0)
      }, this);
      this.track = room.createObject('Object', {
        id: 'cube',
        collision_id: 'cube',
        col: V(.02,.02,.02),
        scale: V(this.length * .9, this.height / 4, this.width / 5),
        pos: V(0, this.base.pos.y + this.height / 4,0)
      }, this);
      this.handle = room.createObject('Object', {
        id: 'cube',
        collision_id: 'cube',
        col: this.col,
        scale: V(this.width / 4, this.height / 4, this.width * .75),
        pos: V(0,this.base.pos.y,0)
      }, this);
      this.sounds = {
        clickin:  room.createObject('Sound', { id: 'pushbutton-click-in', }, this),
        clickon:  room.createObject('Sound', { id: 'pushbutton-click-on', }, this),
        clickoff: room.createObject('Sound', { id: 'pushbutton-click-off', }, this),
      };

      this.handle.addEventListener('mousedown', this.onMouseDown);
      this.track.addEventListener('mousedown', this.onMouseDown);
      // FIXME - bind these in mousedown, for maximum efficiency
      window.addEventListener('mouseup', this.onMouseUp);
      window.addEventListener('touchend', this.onMouseUp);
      window.addEventListener('mousemove', this.onMouseMove);
      window.addEventListener('touchmove', this.onMouseMove);
      this.handle.addEventListener('click', this.onClick);

      this.setValue(this.value);
    },
    setValue: function(value, skipchange) {
      var realvalue = Math.min(this.max, Math.max(this.min, value));
      var percent = realvalue / (this.max - this.min);
      var pos = (percent - .5) * this.length * .9;
      this.handle.pos = V(pos, this.base.pos.y + this.height * 3 / 8 , 0);
      this.handle.sync = true;
      this.value = realvalue;

      if (!skipchange) {
        if (this.onchange) {
          this.executeCallback(this.onchange);
        }
console.log('event!');
        this.dispatchEvent({type: 'change', data: this.value});
      }
    },
    updateValueFromCursorPos: function() {
      // FIXME - vector proxies are currently broken
      var sliderpos = this.parent.localToWorld(this.pos._target.clone());
      var dist = player.head_pos.distanceTo(sliderpos);

      // Cast a ray from my head to the cursor position
      var dir = V(player.cursor_pos.x - player.head_pos.x, player.cursor_pos.y - player.head_pos.y, player.cursor_pos.z - player.head_pos.z);

      // Then project the ray into the same plane as the slider I'm manipulating
      var pos = translate(player.head_pos, scalarMultiply(normalized(dir), dist));
      this.worldToLocal(pos);

      // The slider position is now determined based on the x position (left/right) in the slider's own coordinate system, and the length of the slider
      var foo = pos.x / (this.length * .9) + .5;

      this.setValue(foo * (this.max - this.min));
    },
    onMouseDown: function(ev) {
      if (ev.button == 0) {
        this.clicking = true;
        this.updateValueFromCursorPos(); 
        this.sounds.clickin.play();
        if (this.onbegin) this.executeCallback(this.onbegin);
        ev.preventDefault();
        ev.stopPropagation();
      }
    },
    onMouseMove: function(ev) {
      if (ev.button == 0 && this.clicking) {
        this.updateValueFromCursorPos(); 
        ev.stopPropagation();
      }
    },
    onMouseUp: function(ev) {
      if (ev.button == 0 && this.clicking) {
        this.clicking = false;
        this.sounds.clickoff.play();
        if (this.onend) this.executeCallback(this.onend);
        ev.stopPropagation();
      }
    },
    onClick: function(ev) {
      if (ev.button == 0) {
        ev.stopPropagation();
      }
    }
    
  });

  room.registerElement('radiobuttons', {
    createChildren: function() {
      console.log('my children', this.children);
    }
  }, 'verticallayout');

