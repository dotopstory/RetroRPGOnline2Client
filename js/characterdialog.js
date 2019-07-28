define(['dialog', 'tabbook', 'tabpage', 'item', 'items', 'skilldata', 'appearancedata'], function(Dialog, TabBook, TabPage, Item, Items, SkillData, AppearanceData) {
	var StatePage = TabPage.extend({
        init: function(parent, game) {
            this._super('#characterDialogFrameStatePage');
            this.parent = parent;
            this.game = game;
            this.heldTime = 0;
            
            var self = this;
            
                $('#characterItemWeapon').bind("mousedown touchstart", function(event) {
                    self.heldTime = new Date().getTime();
                    self.equippedActive = true;
                });
                $('#characterItemArmor').bind("mousedown touchstart", function(event) {
                    self.heldTime = new Date().getTime();
                    self.equippedActive = true;
                });
                
                $('#characterItemWeapon').bind("mouseup touchend", function(event) {
                   self.heldTime = new Date().getTime() - self.heldTime;
                   
                   if (!self.equippedActive)
                       return;

                   if (self.heldTime < 1000)
                   {
			    if (self.game.ready){
				self.game.unequip(1);
				$("#characterItemWeapon").css("background-image","none");
				$("#characterItemWeaponNumber").html('');
			    }                   	   
                   }
                   else {
			    if (self.game.ready){
				self.game.menu.clickEquipped(1);
				var weapon = self.game.EquipmentHandler.equipment[1];
				//self.game.createBubble(weapon, Item.getInfoMsgEx(weapon.kind, p.weaponEnchantedPoint, p.weaponSkillKind, p.weaponSkillLevel));
				//var id = $("#weapon"+weapon.kind);
				//$(id).css("left",self.game.mouse.x-$(id).width()/2+"px");
				//$(id).css("top",self.game.mouse.y-$(id).height()+"px");
			    }
                   	   
                   }
                   self.equippedActive = false;
                });

                $('#characterItemArmor').bind("mouseup touchend", function(event) {
                   self.heldTime = new Date().getTime() - self.heldTime;
                   
                   if (!self.equippedActive)
                       return;
                   
                   if (self.heldTime < 1000)
                   {
			    if (self.game.ready){
				self.game.unequip(0);
				$("#characterItemArmor").css("background-image","none");
				$("#characterItemArmorNumber").html('');
			    }                   	   
                   }
                   else {
			    if (self.game.ready){
				self.game.menu.clickEquipped(2);
				var armor = self.game.EquipmentHandler.equipment[0];
				//self.game.createBubble(p.armor, Item.getInfoMsgEx(p.armor, p.armorEnchantedPoint, p.armorSkillKind, p.armorSkillLevel));
				//var id = $("armor#"+armor.kind);
				//$(id).css("left",self.game.mouse.x-$(id).width()/2+"px");
				//$(id).css("top",self.game.mouse.y-$(id).height()+"px");
			    }                   	   
                   }
                   self.equippedActive = false;
                });

                $('#characterItemBoots').bind("mouseup touchend", function(event) {
					if (self.game.ready){
						self.game.unequip(3);
						$("#characterItemBoots").css("background-image","none");
					}
                });

                $('#characterItemGloves').bind("mouseup touchend", function(event) {
					if (self.game.ready){
						self.game.unequip(4);
						$("#characterItemGloves").css("background-image","none");
					}
                });
        },

        assign: function(datas) {
            var weapon = this.game.equipmentHandler.equipment[1];
            if (weapon)
            	weapon.name = (weapon.kind > 0) ? ItemTypes.KindData[weapon.kind].name : "";
                        
            this.scale = this.game.renderer.getUiScaleFactor();
	              
            if (weapon && weapon.kind > 0)
            {
            	  var itemData = ItemTypes.KindData[weapon.kind];  
		  $('#characterItemWeapon').css({
	              'background-image': "url('img/" + this.scale + "/" + itemData.sprite + "')",
		      'background-position': '-'+(itemData.offset[0]*this.scale*16)+'px -'+(itemData.offset[1]*this.scale*16)+'px',
			'line-height': (this.scale*16)+'px',
			'text-shadow': '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black',
			'color': 'rgba(255,255,0,1.0)',
			'font-size': (this.scale*6)+'px',
			'text-align': 'center',		      
		  });
            	    
		    $('#characterItemWeapon').attr(
			'title',
			Item.getInfoMsgEx(weapon.kind, weapon.point, weapon.skillKind, weapon.skillLevel,  weapon.durability, weapon.durabilityMax)
		    );
		    $('#characterItemWeapon').html((weapon.durability/weapon.durabilityMax*100).toFixed()+"%");
		    $('#characterItemWeaponNumber').html(ItemTypes.getLevelByKind(weapon.kind) + '+' + weapon.count);
            }
            else
            {
		    $('#characterItemWeapon').css('background-image', "none");
		    $('#characterItemWeapon').html('');
            	    
            }
            
            var armor = this.game.equipmentHandler.equipment[0];
            if (armor)
            	armor.name = (armor.kind > 0) ? ItemTypes.KindData[armor.kind].name : "clotharmor";
            
            if (armor && armor.kind > 0)
            {
            	  var itemData = ItemTypes.KindData[armor.kind];  
		  $('#characterItemArmor').css({
		      'background-image': "url('img/" + this.scale + "/" + itemData.sprite + "')",
		      'background-position': '-'+(itemData.offset[0]*this.scale*16)+'px -'+(itemData.offset[1]*this.scale*16)+'px',
			'line-height': (this.scale*16)+'px',
			'text-shadow': '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black',
			'color': 'rgba(255,255,0,1.0)',
			'font-size': (this.scale*6)+'px',
			'text-align': 'center',		      
		  });

		    $('#characterItemArmor').attr(
			'title',
			Item.getInfoMsgEx(armor.kind, armor.count, armor.skillKind, armor.skillLevel, armor.durability, armor.durabilityMax)
		    );
		    $('#characterItemArmor').html((armor.durability/armor.durabilityMax*100).toFixed()+"%");
		    $('#characterItemArmorNumber').html(ItemTypes.getLevelByKind(armor.kind) + '+' + armor.count);
            }
            else
            {
		    $('#characterItemArmor').css('background-image', "none");
		    $('#characterItemArmor').html('');
            	    
            }
        }
        
    });

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
                    'display': 'block'
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
				  self.body.css('border', self.game.renderer.scale+"px solid #f00");
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

    	var Stat2Page = TabPage.extend({
        init: function(parent, game) {
            this._super('#characterDialogFrameStat2Page');
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
        }
    });

    	var StatPage = TabPage.extend({
        init: function(parent, game) {
            this._super('#characterDialogFrameStatPage');
            this.parent = parent;
            this.game = game;
        },
        
        assign: function(datas) {
            var game = this.game,
                weapon, armor,
                width1, height1, width2, height2, width3, height3;
            var self = this;
                            
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
            
			/*$('#skillAssign').on('click', function(event){
				self.game.selectedSkill = self.selectedSkill;
				//if (SkillData.Names[self.game.selectedSkill.name].type == "active")
				//	self.game.client.sendSkillInstall(self.game.selectedSkillIndex++ % 4, self.game.selectedSkill.name);
				//self.clearHighlight();
				event.stopPropagation();
			});*/
            
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

        assign: function(player) {
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
        			this.skills[id].skill.body.css('border',"0");	
        	}
        }
    });

    var PageNavigator = Class.extend({
        init: function() {
            this.body = $('#characterDialogFramePageNavigator');
            this.movePreviousButton = $('#characterDialogFramePageNavigatorMovePreviousButton');
            this.moveNextButton = $('#characterDialogFramePageNavigatorMoveNextButton');

            this.changeHandler = null;

            var self = this;

            this.movePreviousButton.click(function(event) {
                if(self.index > 1) {
                    self.setIndex(self.index - 1);
                }
            });
            this.moveNextButton.click(function(event) {
                if(self.index < self.count) {
                    self.setIndex(self.index + 1);
                }
            });
        },

        getCount: function() {
            return this.count;
        },
        setCount: function(value) {
            this.count = value;
        },
        getIndex: function() {
            return this.index;
        },
        setIndex: function(value) {
            this.index = value;

            this.movePreviousButton.attr('class', this.index > 1 ? 'enabled' : '');
            this.moveNextButton.attr('class', this.index < this.count ? 'enabled' : '');

            if(this.changeHandler) {
                this.changeHandler(this);
            }
        },
        getVisible: function() {
            return this.body.css('display') === 'block';
        },
        setVisible: function(value) {
            this.body.css('display', value ? 'block' : 'none');
        },

        onChange: function(handler) {
            this.changeHandler = handler;
        }
    });

    var Frame = TabBook.extend({
        init: function(parent, game) {
            this._super('#characterDialogFrame');

            this.parent = parent;
            this.game = game;
            this.add(new StatePage(this, this.game));
            this.add(new SkillPage(this, this.game));
            this.add(new Stat2Page(this, this.game));
            this.add(new StatPage(this, this.game));

            this.pageNavigator = new PageNavigator();
            this.pageNavigator.setCount(this.getPageCount());

            this.heading = $('#characterHeading');
            var self = this;

            this.pageNavigator.onChange(function(sender) {
                self.setPageIndex(sender.getIndex() - 1);
                
            	switch(sender.getIndex()) {
            		case 1:
            		    self.heading.html("Character - Items");
            		    break;
            		case 2:
            		    self.heading.html("Character - Skills");
            		    break;
            		case 3:
            		    self.heading.html("Character - Stats");
            		    break;
            	}
            	self.game.selectedSkill = null;
            });
        },

        open: function() {
            this.pageNavigator.setIndex(1);
        },
        
        update: function(datas) {
            this.pages[0].assign(datas);
            this.pages[1].assign(this.game.player);
            this.pages[2].assign(datas);
        	this.pages[3].assign(datas);
        }
    });

    CharacterDialog = Dialog.extend({
        init: function(game) {
            this._super(game, '#characterDialog');
            this.game = game;
            this.frame = new Frame(this, this.game); // send the game... easier right?
            
            var self = this;
            this.closeButton = $('#characterCloseButton');
            this.closeButton.click(function(event) {
                self.hide();
            });
        },

        show: function(datas) {
            this.game.client.sendCharacterInfo();
            this.frame.open();

            if(this.button){
                this.button.down();
            }

            this._super();
            //SendNative(["CharacterStatsShow"]);
        },
        
        update: function(datas) {
            this.frame.update(datas);
        },
        
        hide: function() {
            this._super();

            if(this.button){
                this.button.up();
            }
            //this.game.selectedSkill = null;
            //SendNative(["CharacterStatsClose"]);
        }
    });

    return CharacterDialog;
});
