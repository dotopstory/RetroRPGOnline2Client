define(['dialog', 'tabbook', 'tabpage', 'item', 'items', 'skilldata', 'appearancedata'], function(Dialog, TabBook, TabPage, Item, Items, SkillData, AppearanceData) {
    var Skill = Class.extend({
        init: function(parent, id, name, level, position, game) {
            this.background = $(id);
            this.body = $(id + 'Body');
            this.levels = [];
            this.name = name;
            this.level = level;
            this.game = game;
            this.parent = parent;
            var data = SkillData.Names[this.name];
            this.detail = data.detail.replace('[l]',this.level)
            	.replace('[u]', data.baseLevel+data.perLevel*this.level);

            if (this.game.renderer) {
            	    this.scale = this.game.renderer.getUiScaleFactor();            	    
            }
            
            this.body.css({
                'position': 'absolute',
                'left': (this.scale)+'px',
                'top': (this.scale)+'px',
                'width': 24 * this.scale,
                'height': 24 * this.scale,
                'display': 'none'
            });
            if(position) {
                this.body.css({
                    'background-image': 'url("img/' + this.scale + '/skillicons.png")',
                    'background-position': (-position[0]*24*this.scale)+"px "+(-position[1]*24*this.scale)+"px" ,
                    'display': 'block',
					'border': this.scale+"px solid #000"
                });
            }

            var self = this;
            var dragStart = false;

		this.body.bind('dragstart', function(event) {
			log.info("Began DragStart.")
			event.originalEvent.dataTransfer.setData("skllName", self.name);
			DragData = {};
			DragData.skillName = self.name;
			dragStart = true;
		});
	
		this.body.on('click', function(event){
			  if(!dragStart) {
				  self.game.selectedSkill = self;
				  self.parent.selectedSkill = self;
				  self.parent.clearHighlight();
				  self.body.css('border', self.scale+"px solid #f00");
				  $('#skillDetail').html(self.detail);
			  }
			  dragStart = false;
			  //event.stopPropagation();
		});
		
		this.body.bind('dragend', function(event) {
			dragStart = false;	
		});
            		
        },
        

        getName: function() {
            return this.name;
        },
        getLevel: function() {
            return this.level;
        },
        setLevel: function(value) {
            this.level = value;
            if(value > 0) {
                this.body.css('display', 'inline');
                if (this.body[0])
                    this.body[0].draggable = true;
            } else {
                this.body.css('display', 'none');
                if (this.body[0])
                    this.body[0].draggable = false;
            }
        }
    });

    	var StatPage = TabPage.extend({
        init: function(parent, game) {
            this._super('#characterDialogFrameStatPage');
            this.parent = parent;
            this.game = game;
            var self = this;
            $('#charAddStrength').click(function(e) {
            	self.game.client.sendAddStat(1, 1);	
            });
            $('#charAddAgility').click(function(e) {
            	self.game.client.sendAddStat(2, 1);	
            });
            $('#charAddHealth').click(function(e) {
            	self.game.client.sendAddStat(3, 1);	
            });
            $('#charAddEnergy').click(function(e) {
            	self.game.client.sendAddStat(4, 1);	
            });
            $('#charAddLuck').click(function(e) {
            	self.game.client.sendAddStat(5, 1);	
            });        
        },
        
        refreshStats: function (stats) {
            $('#characterPoints').text("Free Points:\t\t"+stats.free);
            $('#characterStrength').text("Strength:\t\t"+stats.strength);
            $('#characterAgility').text("Agility:\t\t"+stats.agility);
            $('#characterHealth').text("Health:\t\t"+stats.health);
            $('#characterEnergy').text("Energy:\t\t"+stats.energy);
            $('#characterLuck').text("Luck:\t\t"+stats.luck);

            if (stats.free > 0)
            {
            	$('#charAddStrength').css('display','inline-block');
            	$('#charAddAgility').css('display','inline-block');
            	$('#charAddHealth').css('display','inline-block');
            	$('#charAddEnergy').css('display','inline-block');
            	$('#charAddLuck').css('display','inline-block');
            }        	
        },
        
        assign: function(datas) {
            var game = this.game,
                weapon, armor,
                width1, height1, width2, height2, width3, height3;
            var self = this;
                            
			this.stats = {			
				strength: datas[15],
				agility: datas[16],
				health: datas[17],
				energy: datas[18],
				luck: datas[19],
				free: datas[20]
			};
		
            var stats = this.stats;
            
            if (this.game.renderer) {
                if (this.game.renderer.mobile) {
                    this.scale = 1;
                } else {
                    this.scale = this.game.renderer.getUiScaleFactor();
                }
            } else {
                this.scale = 2;
            }
            
            this.refreshStats(stats);
			
			this.player = {
				kind: datas[0],
				experience: datas[1],
				level: datas[2],
				maxHitPoints: datas[3],
				hitPoints: datas[4],
				admin: datas[5],
				pClass: datas[6],
				attackLevel: datas[9],
				defenseLevel: datas[10],
				moveLevel: datas[11],
				attackExp: datas[12],
				defenseExp: datas[13],
				moveExp: datas[14]
			};

            var player = this.player;
            
            if (this.game.renderer) {
                if (this.game.renderer.mobile) {
                    this.scale = 1;
                } else {
                    this.scale = this.game.renderer.getUiScaleFactor();
                }
            } else {
                this.scale = 2;
            }
            /*for(var i = 0; i < game.dialogs.length; i++) {
                if((game.dialogs[i] != this) && game.dialogs[i].visible){
                    game.dialogs[i].hide();
                }
            }*/
            $('#characterName').text("Name\t\t"+game.player.name);
            
            
            var expLevel = (player.experience) ? ((player.experience - Types.expForLevel[player.level-1])/(Types.expForLevel[player.level] - Types.expForLevel[player.level-1]) * 100) : 0;
            var attackExp = (player.attackExp) ? ((player.attackExp - Types.attackExp[player.attackLevel-1])/(Types.attackExp[player.attackLevel] - Types.attackExp[player.attackLevel-1]) * 100) : 0;
            var defenseExp = (player.defenseExp) ? ((player.defenseExp - Types.defenseExp[player.defenseLevel-1])/(Types.defenseExp[player.defenseLevel] - Types.defenseExp[player.defenseLevel-1]) * 100) : 0;
            var moveExp = (player.moveExp) ? ((player.moveExp - Types.moveExp[player.moveLevel-1])/(Types.moveExp[player.moveLevel] - Types.moveExp[player.moveLevel-1]) * 100) : 0;
            
            $('#characterLevel').text("Level\t\t"+player.level+"\t"+expLevel.toFixed(2)+"%");
            $('#characterAttackLevel').text("Attack Level\t\t"+player.attackLevel+"\t"+attackExp.toFixed(2)+"%");
            $('#characterDefenseLevel').text("Defense Level\t\t"+player.defenseLevel+"\t"+defenseExp.toFixed(2)+"%");
            $('#characterMoveLevel').text("Move Level\t\t"+player.moveLevel+"\t"+moveExp.toFixed(2)+"%");			
        }
    });

    var SkillPage = TabPage.extend({
        init: function(frame, game) {
            this._super('#characterDialogFrameSkillPage');
            this.game = game;
            this.skills = [];
            this.selectedSkill = null;
            var self = this;
        },

        setSkill: function(name, level) {
		for (var id in this.skills) 
		{
			if (this.skills[id].name == name)
			{
				this.skills[id] = {name: name, level: level, skill: null};
				return;
			}
		}
		this.skills.push({name: name, level: level, skill: null});
        },
        
        clear: function() {
            var scale = this.game.renderer.getUiScaleFactor(); 
            for (var i = this.skills.length-1; i >= 0; --i)
            {
                var tSkill = this.skills[i];
                //log.info("tSkill="+JSON.stringify(tSkill));
                if(tSkill.skill) {
                    tSkill.skill.background.css({
                        //'display': 'none'
                        'background-image': 'url("../img/'+scale+'/itembackground.png")',
                    });
                    $('#characterSkill' + i).attr('title', '');
                    $('#characterSkill' + i).html();
                    tSkill.skill.setLevel(0);
                }    
            	delete this.skills[i];
            }
            this.skills = [];
        },

        assign: function() {
            //SendNative(["PlayerSkills"].concat(this.skills));
            var scale = this.game.renderer.getUiScaleFactor(); 
            for(var id in this.skills) {
            	
                var tSkill = this.skills[id];
                if(tSkill) {
                    log.info('#characterSkill1' + id);
                    var skill = new Skill(this, '#characterSkill' + id, tSkill.name, tSkill.level,
                        SkillData.Names[tSkill.name].iconOffset, this.game);
                    skill.background.css({
                        'position': 'absolute',
                        'left': ((id % 6) * 26) * scale + 'px',
                        'top': ((6+(14*scale)) + (Math.floor(id / 6) * 26)) * scale + 'px',
                        'width': (24*scale)+'px',
                        'height': (24*scale)+'px',
                        'display': 'block'
                    });
                    this.skills[id].skill = skill;
                    //log.info("this.skills[id].skill="+JSON.stringify(this.skills[id].skill));
                    $('#characterSkill' + id).attr('title', tSkill.name + " Lv: " + tSkill.level);
                    $('#characterSkill' + id + 'Body').css({
                        'text-align': 'center',
                        'color': '#fff',
                        'line-height': (18*scale)+'px',
                        'font-size': (6*scale)+'px',
                        'font-weight': 'bold'
                    });
                    $('#characterSkill' + id + 'Body').html("Lv "+tSkill.level);
                    skill.setLevel(tSkill.level);
                }
            }
        },
        
        clearHighlight: function() {
        	for(var id in this.skills)
        	{
        		if (this.skills[id].skill)
        			this.skills[id].skill.body.css('border',"3px solid black");	
        	}
        }
    });

    var Frame = TabBook.extend({
        init: function(parent, game) {
            this._super('#characterDialogFrame');

            this.parent = parent;
            this.game = game;
            this.add(new SkillPage(this, this.game));
            this.add(new StatPage(this, this.game));

            this.heading = $('#characterDialogHeading');
            var self = this;

        },

        open: function(index) {
			this.setPageIndex(index);
			switch(index) {
				case 0:
					this.heading.html("SKILLS");
					break;
				case 1:
					this.heading.html("CHARACTER");
					break;
			}		
        },
        
        update: function(datas) {
            this.pages[0].assign();
            this.pages[1].assign(datas);
        }
    });

    CharacterDialog = Dialog.extend({
        init: function(game) {
            this._super(game, '#characterDialog');
            this.game = game;
            this.frame = new Frame(this, this.game);
            
            var self = this;
            this.closeButton = $('#characterCloseButton');
            this.closeButton.click(function(event) {
                self.hide();
            });
        },

        show: function(index, datas) {
            this.game.client.sendCharacterInfo();
            this.frame.open(index);

            if(this.button){
                this.button.down();
            }

            this._super();
        },
        
        update: function(datas) {
            this.frame.update(datas);
        },
        
        hide: function() {
            this._super();

            if(this.button){
                this.button.up();
            }
        }
    });

    return CharacterDialog;
});
