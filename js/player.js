/* global Types */

define(['character', 'exceptions', 'mount', 'pvpbase','appearancedata'], function(Character, Exceptions, Mount, PvpBase, AppearanceData) {

    var Player = Character.extend({
        //MAX_LEVEL: 10,

        init: function(id, name, pw, kind, game) {
            this._super(id, kind);
            this.game = game;
            this.name = name;
            this.pw = pw;

            // Renderer
            this.nameOffsetY = -10;
            this.rights = 0;
            // sprites
            this.spriteName = "clotharmor";
            this.armorName = "clotharmor";
            this.weaponName = "sword1";

            if (typeof guild !== 'undefined') {
				this.setGuild(guild);
			}
            
            // modes
            this.isLootMoving = false;
            this.isSwitchingWeapon = true;

            // PVP Flag
            this.pvpFlag = false;

            this.isWanted = false;
            // Benef
            //this.invincible = false;
            //this.isRoyalAzaleaBenef = false;

            this.isWanted = false;

            /*
            this.healCooltimeCallback = null;
            this.healCooltimeCounter = 0;

            this.flareDanceCooltimeCallback = null;
            this.flareDanceCooltimeCounter = 0;
            this.flareDanceMsgCooltimeCounter = 0;
            */
            
            this.mount=null;
            this.mountName=null;
            this.mountOffsetY=0;
            this.mountOffsetX=0;
            //this.mount.setPosition(this.gridX, this.gridY);
          
            this.pets = [];
            
            this.prevX = 0;
            this.prevY = 0;
            
            this.pClass = 0;
            
            this.timesAttack = 0;
            this.setAttackRate(150);
            
            this.pvpSide = -1;
            
            this.stopMove = false;
            
            this.gathering = false;
            
            this.attackExp = 0;
            this.defenseExp = 0;
            this.moveExp = 0;
            
            this.attackLevel = 0;
            this.defenseLevel = 0;
            this.moveLevel = 0;
            
            this.cards = [];
            this.deck = [];
            
            this.armorSpriteId = 0;
            this.weaponSpriteId = 0;
            
            this.stats = {};
        },
        
        getGuild: function() {
			return this.guild;
		},
		
		setGuild: function(guild) {
			this.guild = guild;
			$('#guild-population').addClass("visible");
			$('#guild-name').html(guild.name);
		},
		
		unsetGuild: function(){
			delete this.guild;
			$('#guild-population').removeClass("visible");
		},
		
        hasGuild: function(){
			return (typeof this.guild !== 'undefined');
		},
		
			
		addInvite: function(inviteGuildId){
			this.invite = {time:new Date().valueOf(), guildId: inviteGuildId};
		},
		
		deleteInvite: function(){
			delete this.invite;
		},
		
		checkInvite: function(){
			if(this.invite && ( (new Date().valueOf() - this.invite.time) < 595000)){
				return this.invite.guildId;
			}
			else{
				if(this.invite){
					this.deleteInvite();
					return -1;
				}
				else{
					return false;
				}
			}
		},

        /**
         * Returns true if the character is currently walking towards an item in order to loot it.
         */

        setSkill: function(name, level, skillIndex)
        {
        
            //alert("name:" + name + ",level:" + level);
            this.skillHandler.add(name, level, skillIndex);
        },

        /*setBenef: function(itemKind){
            switch(itemKind){
                case 169:
                    this.startInvincibility();
                    break;
                case 213:
                    this.startRoyalAzaleaBenef();
                    break;
                case 20:
                    this.stopInvincibility();
                    break;
            }
        },*/
        
        setConsumable: function(itemKind) {
            switch (itemKind) {
                case 450:
                    this.startMount("seadragon", 0, -42, 45000);
                    break;
                case 451:
                    this.startMount("whitetiger", 0, -75, 45000);
                    break;
                case 452:
                    this.startMount("forestdragon", -25, -50, 45000);
                    break;              
            }
        },

        /*flareDanceAttack: function(){
            var adjacentMobIds = [];
            var entity = null;
            var x = this.gridX-1;
            var y = this.gridY-1;
            for(x = this.gridX-1; x < this.gridX+2; x++){
                for(y = this.gridY-1; y < this.gridY+2; y++){
                    entity = this.game.getMobAt(x, y);
                    if(entity){
                        adjacentMobIds.push(entity.id);
                    }
                }
            }
            if(adjacentMobIds.length > 0){
                var i = 4;
                for(i = adjacentMobIds.length; i < 4; i++){
                    adjacentMobIds.push(0);
                }
                if(adjacentMobIds.length > 4){
                    adjacentMobIds = adjacentMobIds.slice(0,4);
                }
                this.game.client.sendFlareDance(adjacentMobIds);
            }
        },*/
        
        isMovingToLoot: function() {
            return this.isLootMoving;
        },

        getSpriteName: function() {
            if (!this.spriteName)
            {
            	    setSpriteName("clotharmor");
            }
            return this.spriteName;
        },
        setSpriteName: function(name) {
            if (!name) {
            	this.spriteName = "clotharmor";
            } else if(name){
                this.spriteName = name;
            } else {
                this.spriteName = this.armorName;
            }
        },
        getArmorName: function() {
            return this.armorName;
        },
        getArmorSprite: function() {
            return this.sprite;
        },
        /*
        getGuild: function() {
			return this.guild;
		},
		
		setGuild: function(guild) {
			this.guild = guild;
			$('#guild-population').addClass("visible");
			$('#guild-name').html(guild.name);
		},
		
		unsetGuild: function(){
			delete this.guild;
			$('#guild-population').removeClass("visible");
		},
		
        hasGuild: function(){
			return (typeof this.guild !== 'undefined');
		},
		
			
		addInvite: function(inviteGuildId){
			this.invite = {time:new Date().valueOf(), guildId: inviteGuildId};
		},
		
		deleteInvite: function(){
			delete this.invite;
		},
		
		checkInvite: function(){
			if(this.invite && ( (new Date().valueOf() - this.invite.time) < 595000)){
				return this.invite.guildId;
			}
			else{
				if(this.invite){
					this.deleteInvite();
					return -1;
				}
				else{
					return false;
				}
			}
		},*/
        setArmorName: function(name){
            this.armorName = name;
        },
        getWeaponName: function() {
            return this.weaponName;
        },
        setWeaponName: function(name) {
            this.weaponName = name;
        },
        hasWeapon: function() {
            return this.weaponName !== null;
        },      
        switchArmor: function(armorName, sprite){
            this.setSpriteName(armorName);
            this.setSprite(sprite);
            this.setArmorName(armorName);
            if(this.switch_callback) {
                this.switch_callback();
            }
        },
        switchWeapon: function(newWeaponName) {
            var count = 14, 
                value = false, 
                self = this;

            var toggle = function() {
                value = !value;
                return value;
            };

            if(newWeaponName !== this.getWeaponName()) {
                if(this.isSwitchingWeapon) {
                  clearInterval(blanking);
                }

                this.switchingWeapon = true;
                var blanking = setInterval(function() {
                    if(toggle()) {
                        self.setWeaponName(newWeaponName);
                    } else {
                        self.setWeaponName(null);
                    }

                    count -= 1;
                    if(count === 1) {
                        clearInterval(blanking);
                        self.switchingWeapon = false;

                        if(self.switch_callback) {
                            self.switch_callback();
                        }
                    }
                }, 90);
            }
        },
        onArmorLoot: function(callback) {
            this.armorloot_callback = callback;
        },

        /*startRoyalAzaleaBenef: function() {
            var self = this;

            if(!this.isRoyalAzaleaBenef) {
                this.isRoyalAzaleaBenef = true;
            } else {
                if(this.royalAzaleaBenefTimeout) {
                    clearTimeout(this.royalAzaleaBenefTimeout);
                }
            }
            this.royalAzaleaBenefTimeout = setTimeout(function() {
                self.stopRoyalAzaleaBenef();
                self.idle();
            }, 15000);
        },
        stopRoyalAzaleaBenef: function(){
            this.isRoyalAzaleaBenef = false;

            if(this.royalAzaleaBenefTimeout) {
                clearTimeout(this.royalAzaleaBenefTimeout);
            }
        },*/
        
        flagPVP: function(pvpFlag){
            this.pvpFlag = pvpFlag;
       },

        // Override walk, idle, and updateMovement for mounts.
        walk: function(orientation) {
            this.setOrientation(orientation);
            if (this.mount) {
            	    this.mount.walk(orientation);
            	    this.animate("idle", this.idleSpeed);
            }
            else {
            	    this.animate("walk", this.walkSpeed);
            }
        },
        
        idle: function(orientation) {
            this.setOrientation(orientation);
            if (this.mount) {
            	    this.mount.idle(orientation);
            }
            else {
            	    this.animate("idle", this.idleSpeed);
            }
        },        

        updateMovement: function() {
        	if (this.mount) {
        		this.mount.walk(this.orientation);
        	}
        	this._super();	
        },
        
        // Mount Code.
        startMount: function(mountName, mountOffsetX, mountOffsetY, time) {
            var self = this;

            if(this.mount) {
                this.destroyMount();
                this.createMount(mountName, mountOffsetX, mountOffsetY);
            } else {
            	this.createMount(mountName, mountOffsetX, mountOffsetY);
		this.mountTimeout = setTimeout(function() {
		    self.stopMount();
		    self.idle();
		}, time);
            }
        },

        stopMount: function() {
            if(this.mountTimeout) {
            	this.destroyMount();
                clearTimeout(this.mountTimeout);
            }
        },

        createMount: function (mountName, mountOffsetX, mountOffsetY) {
            this.mountName=mountName;
            this.mountOffsetX=mountOffsetX;
            this.mountOffsetY=mountOffsetY;
            this.mount = new Mount(this.game, this, mountName, this.walkSpeed, this.idleSpeed);
            this.moveSpeed = 150;
			for (var i=0; i < this.pets.length; ++i)
			{
				this.pets[i].moveSpeed = 150;
			}            
            this.mount.setOrientation(this.orientation);
        },
        
        destroyMount: function () {
            this.moveSpeed = 200;
			for (var i=0; i < this.pets.length; ++i)
			{
				this.pets[i].moveSpeed = 200;
			}
            delete this.mount;
        },

        removeTarget: function () {
            if (this.pets) {
				for (var i=0; i < this.pets.length; ++i)
				{
					this.pets[i].clearTarget();
					//log.info("pet removed target");
				}
            }
            this._super();	
        },
            
	    setClass: function (pClass) {
		this.pClass = pClass;
		if (pClass == Types.PlayerClass.WARRIOR)
		{
		    this.setAtkRange(1);
		}
		else if (pClass == Types.PlayerClass.DEFENDER)
		{
		    this.setAtkRange(1);
		}
		else if (pClass == Types.PlayerClass.ARCHER)
		{
		    this.setAtkRange(10);
		}
		/*else if (pClass == Types.PlayerClass.MAGE)
		{
		    this.setAtkRange(10);
		}*/
		    
	    },
        
	setPvpSide: function (side) {
		this.pvpSide = side;	
	},
	    
	withinAttackRange: function (entity) {
		//log.info("pClass="+this.pClass);
            if( ((this.pClass == Types.PlayerClass.FIGHTER || this.pClass == Types.PlayerClass.DEFENDER) && ((entity instanceof PvpBase && entity.isAdjacent(this)) || this.isAdjacentNonDiagonal(entity))) ||
            	 (this.pClass == Types.PlayerClass.ARCHER && ((entity instanceof PvpBase && entity.isNear(entity, this.atkRange)) || this.isNear(entity, this.atkRange))))
            {
            	return true;
            }
            return false;
	},
	
	
	isNPCPlayer: function () {
        var regExp = /^6[0-9].*$/;
        return regExp.test(this.id);		
	},
	
	getArmorSprite: function () {
	    if (this.armorSpriteId > 0)
	    {
	    	    return AppearanceData[this.armorSpriteId].sprite;
	    }
	    if (this.pClass == Types.PlayerClass.FIGHTER || this.pClass == Types.PlayerClass.DEFENDER) 
	        return "clotharmor";
	    if (this.pClass == Types.PlayerClass.ARCHER)
	    	return "armorarcher1";
	},
	
	getWeaponSprite: function () {
	    if (this.weaponSpriteId > 0)
	    {
	    	    return AppearanceData[this.weaponSpriteId].sprite;
	    }
	    if (this.pClass == Types.PlayerClass.FIGHTER || this.pClass == Types.PlayerClass.DEFENDER) 
	        return "sword1";
	    if (this.pClass == Types.PlayerClass.ARCHER)
	    	return "woodenbow";
		
	},

    });

    return Player;
});
