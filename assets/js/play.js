var play_state = {
create:function() {
           var space_key = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
           space_key.onDown.add(this.jump, this);

           this.pipes = game.add.group();
           this.pipes.createMultiple(20, 'pipe');

           this.timer = this.game.time.events.loop(1500, this.add_rows_of_pipe, this);

           this.bird = this.game.add.sprite(100, 245, 'bird');

           this.bird.body.gravity.y = 1000;
           this.bird.anchor.setTo(-0.2, 0.5);

           score = 0;
           var style = {font:"30px Arial", fill: "#ffffff"};
           this.label_score = this.game.add.text(20, 20, "0", style);

           this.jump_sound = this.game.add.audio('jump');

       },
update: function() {
            if (this.bird.inWorld == false) {
                this.restart_game();
            }
            if (this.bird.angle < 20) {
                this.bird.angle += 1;
            }

            this.game.physics.overlap(this.bird, this.pipes, this.hit_pipe, null, this);
        },
jump: function() {
          if (this.bird.alive == false) {
              return;
          }

          this.bird.body.velocity.y = -350;
          this.game.add.tween(this.bird).to({angle:-20}, 100).start();
          this.jump_sound.play();
      },
hit_pipe: function() {
              if (this.bird.alive == false) {
                  return;
              }

              this.bird.alive = false;

              this.game.time.events.remove(this.timer);
              this.pipes.forEachAlive(function(p) {
                      p.body.velocity.x = 0;
                      }, this);
          },
add_one_pipe: function(x, y) {
                  var pipe = this.pipes.getFirstDead();
                  pipe.reset(x, y);

                  // add velocity to the pipe to make it move left
                  pipe.body.velocity.x = -200;

                  // Kill the pipe the it's no longer visible
                  pipe.outOfBoundsKill = true;
              },
add_rows_of_pipe: function() {
                      var hole = Math.floor(Math.random()*5) + 1;
                      for (var i=0; i<8; i++) {
                          if (i != hole && i != hole+1) {
                              this.add_one_pipe(400, 60*i+10);
                          }
                      }

                      score += 1;
                      this.label_score.content = score;
                  },

restart_game: function () {
                  this.game.time.events.remove(this.timer);
                  this.game.state.start('menu')
              }
}
