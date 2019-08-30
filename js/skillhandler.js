define(['mob', 'skilldata', 'character'], function(Mob, SkillData, Character) {

    var Skill = Class.extend({
        init: function(name, skillIndex) {
            this.name = name;
            this.level = 0;
            this.slots = [];
            this.skillIndex = skillIndex;
            this.skillData = SkillData.Data[skillIndex];
        },

        getName: function() {
            return this.name;
        },
        getLevel: function() {
            return this.level;
        },
        setLevel: function(value) {
            this.level = value;

            /*for(var index = 0; index < this.slots.length; index++) {
                this.slots[index].setLevel(value);
            }*/
        },

        clear: function() {
        },
        add: function(slot) {
            this.slots.push(slot);
        },
        remove: function(slot) {
            var index = this.slots.indexOf(slot);
            if(index >= 0) {
                this.slots.splice(index, 1);
            }
        }
    });
    var SkillPassive = Skill.extend({
    });
    var SkillActive = Skill.extend({
        init: function(name, skillIndex) {
            this._super(name, skillIndex);
            
            this.cooltime = SkillData.Data[skillIndex].recharge;
            this.cooltimeCounter = 0;
            this.cooltimeTickHandle = null;
            this.cooltimeDoneHandle = null;

            this.executingHandler = null;
        },

        clear: function() {
            if(this.cooltimeTickHandle) {
                clearInterval(this.cooltimeTickHandle);
                this.cooltimeTickHandle = null;
            }
            if(this.cooltimeDoneHandle) {
                clearTimeout(this.cooltimeDoneHandle);
                this.cooltimeDoneHandle = null;
            }
        },
        execute: function(game) {
        	var self = this;
        	
        	if (this.cooltimeDoneHandle)
        	{
                    game.chathandler.addNotification('Wait for cooldown.');
        	    return;
        	}
        	if (this.skillData.target == "front")
        	{
    	            game.player.skillTarget = game.getEntityNext(self);			
        	}
        	if (this.skillData.target == "enemy")
        	{
        	    game.player.skillTarget = game.player.target;
        	}
		if (this.skillData.target == "enemy" || this.skillData.target == "front")
		{
		    if(!this.cooltimeDoneHandle
			&& game.player.skillTarget
			&& game.player.skillTarget instanceof Character)
		    {
			if (this.execute_callback)
			    this.execute_callback(self, game);
			else
		    	    game.client.sendSkill(this.skillIndex, game.player.skillTarget.id);
		    } else{
			game.chathandler.addNotification('No target chosen.');
			return;
		    }
		}
		else if (this.skillData.target == "self")
		{
		    if(!this.cooltimeDoneHandle)
			if (this.execute_callback)
			{
			    log.info("execute_callback");
			    this.execute_callback(self, game);
			}
			else
		    	    game.client.sendSkill(this.skillIndex);
		}


                this.cooltimeCounter = this.cooltime;

                this.cooltimeTickHandle = setInterval(function() {
                    if(self.cooltimeCounter >= 0.5) {
                        self.cooltimeCounter -= 0.5;

                        self.tick(game);
                        for(var index = 0; index < self.slots.length; index++) {
                            self.slots[index].tick(self);
                        }
                    }
                }, 500);
                this.cooltimeDoneHandle = setTimeout(function() {
                    clearInterval(self.cooltimeTickHandle);
                    self.cooltimeTickHandle = null;

                    self.cooltimeDoneHandle = null;

                    self.done();
                    for(var index = 0; index < self.slots.length; index++) {
                        self.slots[index].done();
                    }
                }, this.cooltime * 1000);

                for(var index = 0; index < this.slots.length; index++) {
                    this.slots[index].execute_(this);
                }
                
                
				//log.info("this.name="+this.name);
				game.player.skillHandler.pushActiveSkill(this);
        },

        tick: function(game) {
        },
        done: function(game) {
        },
        
        onExecuting: function(handler) {
            this.executingHandler = handler;
        }
    });

    
    var SkillFactory = {
        make: function(name, index) {
            if(name in SkillFactory.Skills) {
                return new SkillFactory.Skills[name](name, index);
            } else {
                return null;
            }
        }    
    };
    
    SkillFactory.Skills = {};
    for (var i = 0; i < SkillData.Data.length; ++i)
    {
    	var skillName = SkillData.Data[i].name;
        log.info("skillName="+skillName);
    	SkillFactory.Skills[skillName] =  SkillActive;
    };
    log.info("SKillFactory.Skills:" + JSON.stringify(SkillFactory.Skills));
    
    var haste_attack_execute_callback = function(self, game) {
    	var speedMultiplier = 1 + (self.level * self.skillData.perLevel / 100); 
    	game.player.attackCooldown.duration /= speedMultiplier;
    	setTimeout(function() {
    	   if (game.player)
    	       game.player.attackCooldown.duration *= speedMultiplier;
    	}, self.skillData.duration * 1000)

    	game.client.sendSkill(this.skillIndex);
    };

    var haste_move_execute_callback = function(self, game) {
    	var speedMultiplier = 1 + (self.level * self.skillData.perLevel / 100); 
    	game.player.moveSpeed /= speedMultiplier;
    	setTimeout(function() {
    	   if (game.player)
    	       game.player.moveSpeed *= speedMultiplier;
    	}, self.skillData.duration * 1000)

    	game.client.sendSkill(this.skillIndex);
    };

    
    var slow_execute_callback = function(self, game) {
    	var target = game.player.target;
    	var speedMultiplier = 1 + (self.level * self.skillData.perLevel / 100); 
    	target.moveSpeed *= speedMultiplier;
    	target.attackCooldown.duration *= speedMultiplier;
    	
    	setTimeout(function() {
    	    target.moveSpeed /= speedMultiplier;
      	    target.attackCooldown.duration /= speedMultiplier;
    	}, self.skillData.duration * 1000)

    	game.client.sendSkill(this.skillIndex, target.id);
    };

    var stun_execute_callback = function(self, game) {
    	var target = game.player.target;
    	var duration = self.level * self.skillData.perLevel; 
    	target.isStunned = true;
    	setTimeout(function() {
    	    target.isStunned = false;
    	}, duration * 1000)

    	game.client.sendSkill(this.skillIndex, target.id);
    };

    
    var SkillSlot = Class.extend({
        init: function(game, parent, index, id) {
            this.game = game;
            this.parent = parent;
            this.index = index;
            this.body = $(id + 'Body');
            this.cooltime = $(id + 'Cooltime');
            this.levels = [];
            this.name;

    		if (this.game.renderer.tablet || this.game.renderer.mobile)
    		{
    			this.body.html("");	
    		}
             
            var self = this;

            this.body.bind('click', function(event) {
				if (self.game.selectedSkill)
				{
					self.game.client.sendSkillInstall(self.index, self.game.selectedSkill.name);
					self.done();
					self.game.selectedSkill = null;
					self.game.characterDialog.frame.pages[0].clearHighlight();
						
				}
				else
				{
					self.execute(self.parent.game);
					self.game.selectedSkill = null;
				}
                event.stopPropagation();
            });
            $(id).bind('click', function(event) {
				if (self.game.selectedSkill)
				{
					self.game.client.sendSkillInstall(self.index, self.game.selectedSkill.name);
					self.done();
					self.game.selectedSkill = null;
					self.game.characterDialog.frame.pages[1].clearHighlight();
				}
				else
				{
					self.execute(self.parent.game);
					self.game.selectedSkill = null;
				}
				event.stopPropagation();
            });

            this.body.unbind('dragover').bind('dragover', function(event) {
                log.info("Drag is over.");
                if(DragData && DragData.skillName) {
                    event.preventDefault();
                }
            });
            this.body.unbind('drop').bind('drop', function(event) {
                log.info("Drag is dropped.");
                if(DragData && DragData.skillName) {
                    self.parent.game.client.sendSkillInstall(self.index, DragData.skillName);
		    DragData.skillName = null;
                }
            });
        },

        /*
        setLevel: function(value) {
            var scale = this.game.renderer.getScaleFactor();
            //log.info("levelPosition: " + levelPosition[scale-1]);
            for(var index = 0; index < value; index++) {
            	    this.levels[index].css({
            	            'display': 'block',
            	    	    //'background-position': levelPosition[scale-1]
            	    });
                
            }
            for(var index = value; index < this.levels.length; index++) {
                this.levels[index].css('display', 'none');
            }
        },
        */

        clear: function() {
            if(this.skill) {
                this.skill.clear();
                this.cooltime.css('display', 'none');
            }
        },
        hideShortcut: function() {
                this.body.css({
                    'background-image': '',
                    'background-position': ''
                });
                this.body.attr('title', '');        	
        },
        
        displayShortcut: function() {
		if (this.name)
		{
			var scale = this.game.renderer.mobile ? 1 : this.game.renderer.getUiScaleFactor();
			if (SkillData.Names[this.name])
			{
				var position = SkillData.Names[this.name].iconOffset;
				log.info("this.name="+this.name);
				this.body.css({
					'background-image': 'url("img/'+scale+'/skillicons.png")',
					'background-position': (-position[0]*24*scale)+"px "+(-position[1]*24*scale)+"px" ,
					'background-repeat': 'no-repeat',
					/*'background-size': (240*scale*1.5)+"px "+(224*scale*1.5)+"px",*/
				});
			}
		}
        },
        assign: function(name) {
        	//log.info("name"+name);
            this.name = name;
            if(this.skill) {
                this.skill.remove(this);
            }

            this.skill = this.parent.getSkill(name);
            //log.info("skill:"+JSON.stringify(this.skill));
            if(this.skill) {
                this.skill.add(this);

                var self = this;
                var scale = this.game.renderer.getScaleFactor();
                this.displayShortcut();               
                this.body.attr('title', name);

                this.setLevel(this.skill.level);

                if((this.skill instanceof SkillActive) && this.skill.cooltimeDoneHandle) {
                    this.execute_(this.skill);
                }
            } else {
                this.body.css({
                    'background-image': '',
                    'background-position': ''
                });
                this.body.attr('title', '');
            }
        },
        execute: function() {
            if(this.skill && (this.skill instanceof SkillActive)) {
                this.skill.execute(this.parent.game);
            }
        },
        execute_: function(skill) {
            if(skill.cooltime > 0) {
                this.cooltime.css('display', 'block');
                this.tick(skill);
            }
        },
        tick: function(skill) {
            this.cooltime.html('' + skill.cooltimeCounter.toFixed(0));
        },
        done: function() {
            this.cooltime.css('display', 'none');
        }
    });

    var SkillHandler = Class.extend({
        init: function(game) {
            this.game = game;
            this.skills = {};
            this.skillSlots = [];
            this.container = $('#skillcontainer');
            this.activeSkills = [];
            
            for(var index = 0; index < 6; index++) {
                this.skillSlots.push(new SkillSlot(this.game, this, index, '#skill' + index));
                this.skillSlots[index].assign();
            }

            	var self = this;
            	self.isDragging = false;

            	this.container.bind("touchstart", function(ev) {
                    self.isClicked = true;
    		});
		this.container.mousedown(function() {
		    self.isClicked = true;
		});
		
		this.container.mousemove(function() {
		    self.isDragging = true;
		});

		this.container.mouseup(function(event) {
	            self.isDragging = false;
	            self.isClicked = false;
		});
            	this.container.bind("touchend", function(ev) {
	            self.isDragging = false;
	            self.isClicked = false;
    		});
    			
   			
        },
        
        moveShortcuts: function() {
	    this.container.css({
		"left":this.game.mouse.x + "px",
		"top":this.game.mouse.y + "px"
	    });        	
        },
        
        displayShortcuts: function() {
            for(var i = 0; i < 6; ++i) {
                this.skillSlots[i].displayShortcut();
            }
        },
        
        hideShortcuts: function() {
            for(var i = 0; i < 6; ++i) {
                this.skillSlots[i].hideShortcut();
            }
        },

        getSkill: function(name) {
            return name in this.skills ? this.skills[name] : null;
        },

        clear: function() {
            for(var index = 0; index < this.skillSlots.length; index++) {
                this.skillSlots[index].clear();
            }
        },
        add: function(name, level, skillIndex) {
            log.info("skillIndex:" + skillIndex);
            var skill = null;
            if(name in this.skills) {
                skill = this.skills[name];
            } else {
                skill = SkillFactory.make(name, skillIndex);
                log.info("skill="+JSON.stringify(skill));
                if(skill) {
                    if(skill instanceof SkillActive) {
                        var self = this;
                        var type = skill.skillData.skillType;
                        if (type == "haste-attack")
                        	skill.execute_callback = haste_attack_execute_callback;
                        else if (type == "haste-move")
                        	skill.execute_callback = haste_move_execute_callback;
                        else if (type == "slow")
                        	skill.execute_callback = slow_execute_callback;
                        else if (type == "stun")
                        	skill.execute_callback = stun_execute_callback;
                        skill.onExecuting(function(sender) {
                            self.game.chathandler.addNotification('You have to wait for ' + sender.name + ' to cool down.');
                        });
                    }
                    this.skills[name] = skill;
                }
            }
            if(skill) {
                skill.setLevel(level);
            }
            //alert(JSON.stringify(this.skills));
        },
        install: function(index, name) {
            if((index >= 0) && (index < this.skillSlots.length)) {
                this.skillSlots[index].assign(name);
            }
        },
        execute: function(key) {
            //var index = [81, 69, 82, 84].indexOf(key); // q, e, r, t
            //if(index >= 0) {
                this.skillSlots[index].execute(this.game);
            //}
        },
        pushActiveSkill: function (activeSkill) {
        	this.activeSkills.push(activeSkill);	
        },
        showActiveSkill: function () {
        	var skill = this.activeSkills.shift();
        	if (!skill)
        		return;

			var scale = this.game.renderer.mobile ? 1 : this.game.renderer.getUiScaleFactor();
			var position = skill.skillData.iconOffset;
        	
			$("#currentSkill").css({
				'background-image': 'url("img/'+scale+'/skillicons.png")',
				'background-position': (-position[0]*24*scale*0.75)+"px "+(-position[1]*24*scale*0.75)+"px" ,
				'background-repeat': 'no-repeat',
				'background-size': (360*scale*0.75)+"px "+(336*scale*0.75)+"px" 
			});
			if (!$("#currentSkill").is(":visible"))
				$("#currentSkill").fadeIn(500);

			if ($("#currentSkill").is(":visible"))
				$("#currentSkill").fadeOut(1000);        	
        }
        
    });

    return SkillHandler;
});