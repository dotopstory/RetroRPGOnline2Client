
define(['character', 'timer', 'player', 'pet'], function(Character, Timer, Player, Pet) {

    var Updater = Class.extend({
        init: function(game) {
            this.game = game;
            this.playerAggroTimer = new Timer(1000);
        },

        update: function() {
            //log.info("Updater.update() called");
            if (this.game.mapStatus < 3)
            	return;

            this.updateZoning();
            this.updateCharacters();
            this.updatePlayerAggro();
            this.updateTransitions();
            this.updateAnimations();
            this.updateAnimatedTiles();
            this.updateChatBubbles();
            this.updateInfos();
            this.updateKeyboardMovement();
        },

        // TODO - Pet make off screen following possible.
        updateCharacters: function() {
            var self = this;

            //self.updateCharacter(self.game.player);
            //self.game.onCharacterUpdate(self.game.player);
        		/*for(var i =0; i < self.game.player.pets.length; ++i)
        		{
        			var pet = self.game.player.pets[i];
        			self.game.onCharacterUpdate(pet);
        			self.updateCharacter(pet);
        		}*/

			// TODO - Optimization not working.
            self.game.camera.forEachInOuterScreen(function(entity) {
                if((entity instanceof Character || entity instanceof Player)) {
                    self.updateCharacter(entity);
                    self.game.onCharacterUpdate(entity);
                }
            });

            /*self.game.forEachEntity(function(entity) {
                    if(entity instanceof Character && self.game.player.id != entity.id) {
                    	if (entity.updateCharacter)
                    	{
                    		self.updateCharacter(entity);
                    		self.game.onCharacterUpdate(entity);
                    	}
                    }
            });*/
        },

        updatePlayerAggro: function() {
            var t = this.game.currentTime,
                player = this.game.player;

            // Check player aggro every 1s when not moving nor attacking
            if(player && !player.isMoving() && !player.isAttacking()  && this.playerAggroTimer.isOver(t)) {
                player.checkAggro();
            }
        },

        updateEntityFading: function(entity) {
            if(entity && entity.isFading) {
                var duration = 1000,
                    t = this.game.currentTime,
                    dt = t - entity.startFadingTime;

                if(dt > duration) {
                    this.isFading = false;
                    entity.fadingAlpha = 1;
                } else {
                    entity.fadingAlpha = dt / duration;
                }
            }
        },

        updateTransitions: function() {
            var self = this,
                m = null,
                z = this.game.currentZoning;

            this.game.forEachEntity(function(entity) {
            		if (!entity)
            			return;
            		m = entity.movement;
                    if(m && m.inProgress && !entity.isDead) {
                        m.step(self.game.currentTime);
                    }
            });

            /*if(z) {
                if(z.inProgress) {
                    z.step(this.game.currentTime);
                }
            }*/
        },

        updateZoning: function() {
            var g = this.game,
                c = g.camera,
                z = g.currentZoning,
                s = 1,
                ts = 16,
                speed = 100;

            if(z && z.inProgress === false) {
                var orientation = this.game.zoningOrientation,
                    startValue = endValue = offset = 0,
                    updateFunc = null,
                    endFunc = null;

                if(orientation === Types.Orientations.LEFT || orientation === Types.Orientations.RIGHT) {
                    offset = (c.gridW - 2) * ts;
                    startValue = (orientation === Types.Orientations.LEFT) ? c.x - ts : c.x + ts;
                    endValue = (orientation === Types.Orientations.LEFT) ? c.x - offset : c.x + offset;
                    updateFunc = function(x) {
                        //g.camera.setRealCoords();

                    },
                    endFunc = function() {
                        g.endZoning();
                    };
                } else if(orientation === Types.Orientations.UP || orientation === Types.Orientations.DOWN) {
                    offset = (c.gridH - 2) * ts;
                    startValue = (orientation === Types.Orientations.UP) ? c.y - ts : c.y + ts;
                    endValue = (orientation === Types.Orientations.UP) ? c.y - offset : c.y + offset;
                    updateFunc = function(y) {
                        //g.camera.setRealCoords();
                    },
                    endFunc = function() {
                        g.endZoning();

                    };
                }

                z.start(this.game.currentTime, updateFunc, endFunc, startValue, endValue, speed);
            }
        },

        updateCharacter: function(c) {
            var self = this;
            var r = this.game.renderer;
            // Estimate of the movement distance for one update
            //var tick = Math.round(16 / Math.round((c.moveSpeed / (1000 / this.game.renderer.FPS))));
            //log.info("tick="+tick);
            var tick=1;

            if (c.isStunned)
            	return;

	    //if (c === self.game.player)
	    //{
	    	    //c.prevOrientation2 = c.prevOrientation;
	    	    //c.prevOrientation = c.orientation;
	    	    //r.prevOffsetX = r.backgroundOffsetX;
	    	    //r.prevOffsetY = r.backgroundOffsetY;
	    //}

			//r.backgroundOffsetX = 0;
			//r.backgroundOffsetY = 0;
            if(c.isMoving() && c.movement.inProgress === false) {
            	//r.backgroundOffsetX = 0;
				//r.backgroundOffsetY = 0;

                if(c.orientation === Types.Orientations.LEFT) {
                    c.movement.start(this.game.currentTime,
                                     function(x) {
                                     	var x2 = c.x;
                                     	c.x = x;
                                     	if (c == self.game.player)
                                     	{
                                     		r.backgroundOffsetX += (x2 - x);
                                     		//r.backgroundOffsetY = 0;
                                     	}
                                     	//log.info("r.backgroundOffsetX="+r.backgroundOffsetX+",r.backgroundOffsetY="+r.backgroundOffsetY);
                                        c.hasMoved();
                                     },
                                     function(x) {
                                     	var x2 = c.x;
                                     	c.x = x;
                                     	if (c == self.game.player)
                                     	{
                                     		r.backgroundOffsetX += (x2 - x);
                                     		//r.backgroundOffsetY = 0;
                                     	}
                                     	//log.info("r.backgroundOffsetX="+r.backgroundOffsetX+",r.backgroundOffsetY="+r.backgroundOffsetY);
                                        c.hasMoved();
                                        c.nextStep();
                                     },
                                     c.x - tick,
                                     c.x - 16,
                                     c.moveSpeed);
                }
                else if(c.orientation === Types.Orientations.RIGHT) {
                    c.movement.start(this.game.currentTime,
                                     function(x) {
                                     	var x2 = c.x;
                                     	c.x = x;
                                     	if (c == self.game.player)
                                     	{
                                     		r.backgroundOffsetX += (x2 - x);
                                     		//r.backgroundOffsetY = 0;
                                     	}
                                     	//log.info("r.backgroundOffsetX="+r.backgroundOffsetX+",r.backgroundOffsetY="+r.backgroundOffsetY);
                                        c.hasMoved();
                                     },
                                     function(x) {
                                     	var x2 = c.x;
                                     	c.x = x;
                                     	if (c == self.game.player)
                                     	{
                                     		r.backgroundOffsetX += (x2 - x);
                                     		//r.backgroundOffsetY = 0;
                                     	}
                                     	//log.info("r.backgroundOffsetX="+r.backgroundOffsetX+",r.backgroundOffsetY="+r.backgroundOffsetY);
                                        c.hasMoved();
                                        c.nextStep();
                                     },
                                     c.x + tick,
                                     c.x + 16,
                                     c.moveSpeed);
                }
                else if(c.orientation === Types.Orientations.UP) {
                    c.movement.start(this.game.currentTime,
                                     function(y) {
                                     	var y2 = c.y;
                                     	c.y = y;
                                     	if (c == self.game.player)
                                     	{
                                     		r.backgroundOffsetY += (y2 - y);
                                     		//r.backgroundOffsetX = 0;
                                     	}
                                     	//log.info("r.backgroundOffsetX="+r.backgroundOffsetX+",r.backgroundOffsetY="+r.backgroundOffsetY);
                                        c.hasMoved();
                                     },
                                     function(y) {
                                     	var y2 = c.y;
                                     	c.y = y;
                                     	if (c == self.game.player)
                                     	{
                                     		r.backgroundOffsetY += (y2 - y);
                                     		//r.backgroundOffsetX = 0;
                                     	}
                                     	//log.info("r.backgroundOffsetX="+r.backgroundOffsetX+",r.backgroundOffsetY="+r.backgroundOffsetY);
                                        c.hasMoved();
                                        c.nextStep();
                                     },
                                     c.y - tick,
                                     c.y - 16,
                                     c.moveSpeed);

                }
                else if(c.orientation === Types.Orientations.DOWN) {
                    c.movement.start(this.game.currentTime,
                                     function(y) {
                                     	var y2 = c.y;
                                     	c.y = y;
                                     	if (c == self.game.player)
                                     	{
                                     		r.backgroundOffsetY += (y2 - y);
                                     		//r.backgroundOffsetX = 0;
                                     	}
                                     	//log.info("r.backgroundOffsetX="+r.backgroundOffsetX+",r.backgroundOffsetY="+r.backgroundOffsetY);
                                        c.hasMoved();
                                     },
                                     function(y) {
                                     	var y2 = c.y;
                                     	c.y = y;
                                     	if (c == self.game.player)
                                     	{
                                     		r.backgroundOffsetY += (y2 - y);
                                     		//r.backgroundOffsetX = 0;
                                     	}
                                     	//log.info("r.backgroundOffsetX="+r.backgroundOffsetX+",r.backgroundOffsetY="+r.backgroundOffsetY);
                                        c.hasMoved();
                                        c.nextStep();
                                     },
                                     c.y + tick,
                                     c.y + 16,
                                     c.moveSpeed);
                }

            }
        },

        updateKeyboardMovement: function()
        {
            if(!this.game.player)
                return;

            var game = this.game;
            var player = this.game.player;

            if (game.joystick && game.usejoystick)
            {
              if (!game.joystick.isActive())
              {
                 player.joystickTime = 0;
	               player.moveRight = false;
	       	       player.moveLeft = false;
		             player.moveUp = false;
		             player.moveDown = false;
              }
              else
      		    {
                /*setTimeout(function () {
                    if (game.joystick.isActive())
                      game.player.moveHeldDown = true;
                },50);*/
                log.info("player.joystickTime="+player.joystickTime);
                //if (player.joyStickTime >= 0)
                player.joystickTime += game.renderTick;
      		   	  clearInterval(game.autoattack);
      		   	  clearInterval(game.autotalk);
      		    }

      		   if (game.joystick.right())
      		   {
      		       player.moveRight = true;
      	     }
      		   else if (game.joystick.left())
      		   {
      		       player.moveLeft = true;
      		   }
      		   else if (game.joystick.up())
      		   {
      		       player.moveUp = true;
      		   }
      		   else if (game.joystick.down())
      		   {
      		       player.moveDown = true;
      		   }
          }


            var pos = {
                x: player.gridX,
                y: player.gridY
            };

            if(player.moveUp)
            {
                pos.y -= 1;
                game.keys(pos, Types.Orientations.UP);
                //game.makePlayerInteractNext(Types.Orientations.UP);
            }
            else if(player.moveDown)
            {
                pos.y += 1;
                game.keys(pos, Types.Orientations.DOWN);
                //game.makePlayerInteractNext(Types.Orientations.DOWN);
            }
            else if(player.moveRight)
            {
                pos.x += 1;
                game.keys(pos, Types.Orientations.RIGHT);
                //game.makePlayerInteractNext(Types.Orientations.RIGHT);
            }
            else if(player.moveLeft)
            {
                pos.x -= 1;
                game.keys(pos, Types.Orientations.LEFT);
                //game.makePlayerInteractNext(Types.Orientations.LEFT);
            }
        },

        updateAnimations: function() {
            var t = this.game.currentTime;

            this.game.forEachVisibleEntityByDepth(function(entity) {
                if (!entity)
                	return;

            	var anim = entity.currentAnimation;

                if(anim && !entity.isStun) {
                    if(anim.update(t)) {
                        //entity.setDirty();
                    }
                }

                if (entity.mount) {
                	var animMount = entity.mount.currentAnimation;
                	if (animMount) {
                		animMount.update(t);
                        }
                }

                anim = entity.criticalAnimation;
                if(anim && entity.isCritical){
                    anim.update(t);
                }
                anim = entity.healAnimation;
                if(anim && entity.isHeal){
                    anim.update(t);
                }
                anim = entity.stunAnimation;
                if(anim && entity.isStun){
                    anim.update(t);
                }
            });

            var sparks = this.game.sparksAnimation;
            if(sparks) {
                sparks.update(t);
            }

            var target = this.game.targetAnimation;
            if(target) {
                target.update(t);
            }

            var benef = this.game.benefAnimation;
            if(benef) {
                benef.update(t);
            }

            var benef10 = this.game.benef10Animation;
            if(benef10) {
                benef10.update(t);
            }

            var benef4 = this.game.benef4Animation;
            if(benef4) {
                benef4.update(t);
            }
        },

        updateAnimatedTiles: function() {
            var self = this,
                t = this.game.currentTime;

            this.game.forEachAnimatedTile(function (tile) {
                tile.animate(t);
            });
        },

        updateChatBubbles: function() {
            var self = this;
        	var t = this.game.currentTime;
            var p = this.game.player;
            var s = this.game.renderer.getUiScaleFactor();
            var cm = this.game.camera;
            var ts = this.game.renderer.tilesize;
            var zoom = 1; //(this.game.renderer.zoom < 1) ? this.game.renderer.zoom : 1;
			var dpr = Math.floor(window.devicePixelRatio);
		    if ($(".bubble").length > 0)
		    {
		        $(".bubble").each(function() {
					var id = $(this).attr('id');
					var c = self.game.getEntityById(parseInt(id,10));
					if (c)
					{
						//log.info("self.game.renderer.zoom="+self.game.renderer.zoom);
						c.speechX = ~~(((c.x - cm.x + ts) * s)/zoom - ($(this).width()/2));
						c.speechY = ~~(((c.y - cm.y - ts) * s)/zoom);
						$(this).css("left",c.speechX+"px");
						$(this).css("top",c.speechY+"px");
						//$(this).css("left","50%");
						//$(this).css("top","75%");


					}
		        });
		    }

            this.game.bubbleManager.update(t);
        },

        updateInfos: function() {
            var t = this.game.currentTime;

            this.game.infoManager.update(t);
        }
    });

    return Updater;
});
