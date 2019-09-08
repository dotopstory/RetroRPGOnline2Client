
/* global Types, log, Class */

define(['lib/pako', 'player', 'entityfactory', 'mob', 'mobdata', 'gather', 'gatherdata', 'pet', 'lib/bison', 'config', 'chathandler', 'pvpbase', 'house','guild', 'timer'],
	function(pako, Player, EntityFactory, Mob, MobData, Gather, GatherData, Pet, BISON, config, ChatHandler, PvpBase, House, Guild, Timer) {

    var GameClient = Class.extend({
        init: function(game, host, port, useServer) {
            this.game = game;
            this.connection = null;
            this.host = host;
            this.port = port;

            this.connected_callback = null;
            this.clienterror_callback = null;
            this.spawn_callback = null;
            this.movement_callback = null;
            this.ban_callback = null;
            this.wanted_callback = null;
            this.fail_callback = null;

            this.notify_callback = null;

            this.handlers = [];
            this.handlers[Types.Messages.PLAINLOGIN] = this.recievePlainLogin;
            this.handlers[Types.Messages.WELCOME] = this.receiveWelcome;
            this.handlers[Types.Messages.MOVE] = this.receiveMove;
            this.handlers[Types.Messages.MOVEPATH] = this.receiveMovePath;
            this.handlers[Types.Messages.LOOTMOVE] = this.receiveLootMove;
            this.handlers[Types.Messages.ATTACK] = this.receiveAttack;
            this.handlers[Types.Messages.SPAWN] = this.receiveSpawn;
            this.handlers[Types.Messages.DESPAWN] = this.receiveDespawn;
            //this.handlers[Types.Messages.SPAWN_BATCH] = this.receiveSpawnBatch;
            this.handlers[Types.Messages.HEALTH] = this.receiveHealth;
            this.handlers[Types.Messages.CHAT] = this.receiveChat;
            //this.handlers[Types.Messages.EQUIP] = this.receiveEquipItem;
            this.handlers[Types.Messages.DROP] = this.receiveDrop;
            this.handlers[Types.Messages.TELEPORT] = this.receiveTeleport;
            this.handlers[Types.Messages.TELEPORT_MAP] = this.receiveTeleportMap;
            this.handlers[Types.Messages.DAMAGE] = this.receiveDamage;
            this.handlers[Types.Messages.POPULATION] = this.receivePopulation;
            this.handlers[Types.Messages.LIST] = this.receiveList;
            this.handlers[Types.Messages.DESTROY] = this.receiveDestroy;
            this.handlers[Types.Messages.KILL] = this.receiveKill;
            this.handlers[Types.Messages.LEVELUP] = this.receiveLevelUp;
            this.handlers[Types.Messages.ITEMLEVELUP] = this.receiveItemLevelUp;
            this.handlers[Types.Messages.HP] = this.receiveHitPoints;
            this.handlers[Types.Messages.BLINK] = this.receiveBlink;
            this.handlers[Types.Messages.PVP] = this.receivePVP;
            this.handlers[Types.Messages.BOARD] = this.receiveBoard;
            this.handlers[Types.Messages.NOTIFY] = this.receiveNotify;
            this.handlers[Types.Messages.KUNG] = this.receiveKung;
            this.handlers[Types.Messages.HEALTHENERGY] = this.receiveHealthEnergy;
            this.handlers[Types.Messages.QUEST] = this.receiveQuest;
            this.handlers[Types.Messages.PARTY] = this.receiveParty;
            this.handlers[Types.Messages.TALKTONPC] = this.receiveTalkToNPC;
            //this.handlers[Types.Messages.RANKING] = this.receiveRanking;
            this.handlers[Types.Messages.EQUIPMENT] = this.receiveEquipment;
            this.handlers[Types.Messages.INVENTORY] = this.receiveInventory;
            this.handlers[Types.Messages.DOUBLE_EXP] = this.receiveDoubleEXP;
            this.handlers[Types.Messages.EXP_MULTIPLIER] = this.receiveEXPMultiplier;
            this.handlers[Types.Messages.MEMBERSHIP] = this.receiveMembership;
            this.handlers[Types.Messages.SKILL] = this.receiveSkill;
            this.handlers[Types.Messages.SKILLINSTALL] = this.receiveSkillInstall;
            this.handlers[Types.Messages.SKILLLOAD] = this.receiveSkillLoad;
            this.handlers[Types.Messages.CHARACTERINFO] = this.receiveCharacterInfo;
            this.handlers[Types.Messages.STATINFO] = this.receiveStatInfo;
            this.handlers[Types.Messages.SHOP] = this.receiveShop;
            this.handlers[Types.Messages.GUILDERROR] = this.receiveGuildError;
            this.handlers[Types.Messages.GUILD] = this.receiveGuild;
            this.handlers[Types.Messages.WANTED] = this.receiveWanted;
            this.handlers[Types.Messages.BANK] = this.receiveBank;
            this.handlers[Types.Messages.BANKGOLD] = this.receiveBankGold;
            this.handlers[Types.Messages.PARTYINVITE] = this.receivePartyInvite;
            this.handlers[Types.Messages.AUCTIONOPEN] = this.receiveAuction;
            this.handlers[Types.Messages.CLASSSWITCH] = this.receiveClassSwitch;
            this.handlers[Types.Messages.PVP_SIDE] = this.receivePvPSide;
            this.handlers[Types.Messages.AGGRO] = this.receiveAggro;
            this.handlers[Types.Messages.MOB_SPEECH] = this.receiveSpeech;
            this.handlers[Types.Messages.GATHER] = this.receiveGather;
            this.handlers[Types.Messages.WHEATHER] = this.receiveWheather;
            this.handlers[Types.Messages.COLOR_TINT] = this.receiveColorTint;
            this.handlers[Types.Messages.LOOKUPDATE] = this.receiveUpdateLook;
            this.handlers[Types.Messages.PET_SWAP] = this.receivePetSwap;
            this.handlers[Types.Messages.REFRESH_CARDS] = this.receiveRefreshCards;
            this.handlers[Types.Messages.CARD_BATTLE_REQUEST] = this.receiveCardBattleRequest;
            this.handlers[Types.Messages.CARD_BATTLE_BET] = this.receiveCardBattleBet;
            this.handlers[Types.Messages.GOLD] = this.receiveGold;
            this.handlers[Types.Messages.PRODUCTS] = this.receiveProducts;
            this.handlers[Types.Messages.APPEARANCELIST] = this.receiveAppearanceList;
            this.handlers[Types.Messages.LOADLOOKS] = this.receiveLoadLooks;

            this.useBison = false;
            this.versionChecked = false;

            this.useServer = useServer;
            this.enable();

            this.tablet = Detect.isTablet(window.innerWidth);
            this.mobile = Detect.isMobile();

            // TODO
            this.packets = [];
            this.rawpackets = [];
            var self = this;
            var burst = 4;

            setInterval(function() {
                if (self.rawpackets && self.rawpackets.length > 0)
            	{
            	    //var startDate = new Date();
			if (self.rawpackets.length == 0)
				return;
			var data = self.rawpackets.shift();
			if (data.substr(0,1) == '2')
			{
				var buffer = _base64ToArrayBuffer(data.substr(1));
				try {
				var message = pako.inflate(buffer, {gzip: true, to: 'string'});
				if(self.isListening) {
					if(self.useBison) {
						data = BISON.decode(message);
					} else {
						data = JSON.parse(message);
					}
					if(data instanceof Array) {
						if(data[0] instanceof Array) {
							// Multiple actions received
							self.receiveActionBatch(data);
						} else {
							// Only one action received
							self.packets.push(data);
						}
					}
				}
				} catch (err) {
				console.log(err);
				}
			}
			else
			{
				var message = data.substr(1);
				if(self.isListening) {
					if(self.useBison) {
						data = BISON.decode(message);
					} else {
						data = JSON.parse(message);
					}
					if(data instanceof Array) {
						if(data[0] instanceof Array) {
							// Multiple actions received
							self.receiveActionBatch(data);
						} else {
							// Only one action received
							self.packets.push(data);
						}
					}
				}
			}
			//var endDate = new Date();
			//var time = endDate.getTime() - startDate.getTime()
			//if (time > 0)
				//log.info("Raw Packet burst: " + (time) + "ms");
            	}
            },16);

            self.packetInterval = 32;
            self.packetProcFunc = (function() {
                if (self.packets && self.packets.length > 0)
            	{
            		self.packetInterval = 32;
            		//var startDate = new Date();
					for (var i=0; i < burst; ++i)
					{
							if (self.packets.length == 0)
								return;
							var data = self.packets.shift();
							if (data[0] == Types.Messages.WELCOME)
								self.packetInterval += 500;
							log.info("live packet: "+data);
							self.receiveAction(data);
					}
					//var endDate = new Date();
					//var time = endDate.getTime() - startDate.getTime()
					//if (time > 0)
						//log.info("Packet burst: " + (time) + "ms");
            	}
            });

            self.packetTimer = new Timer(new Date(), 32);
            setInterval(function() { self.tick(); }, 16);
        },

        tick: function() {
        	var self = this;
        	var time = new Date();
        	if (self.packetTimer.isOver(time))
        	{
        		self.packetProcFunc();
        		self.packetTimer.startTime = time;
        		self.packetTimer.duration = self.packetInterval;
        	}
        },

        enable: function() {
            this.isListening = true;
        },

        disable: function() {
            this.isListening = false;
        },

        connect: function(dispatcherMode) {
        //var url = "wss://"+ this.host +":"+ this.port +"/",
        var url = "ws://"+ this.host +":"+ this.port +"/",
        self = this;
        var $playButton = self.game.app.getPlayButton();

        log.info("Trying to connect to server : "+url);
        app.$loginInfo.text("Connecting to RSO server...");

		self.onClientError(function(message) {
		    $('#errorwindow .errordetails').html("<p>"+message+"</p>");
		    app.loadWindow('loginwindow','errorwindow');
		});

        this.connection = io(url, {forceNew: true, reconnection: false, timeout: 10000});

            this.connection.on('connection', function() {
                log.info("Connected to server "+self.host+":"+self.port);
            });

            this.connection.on('connect_error', function() {
            	$('#container').addClass('error');
                self.clienterror_callback("There has been an error connecting to RSO server try again soon.");
            });

            this.connection.on('message', function(e) {
                //log.info("e="+e);
                //log.info("server="+self.useServer);
                if(!self.versionChecked && e.indexOf("version") == 0) {
                	self.versionChecked = true;
                	log.info("config.build.version="+config.build.version);
                    if (e.substr(7) == config.build.version)
                    {
						self.connection.send(self.useServer);
						if(self.connected_callback) {
							self.connected_callback();
						}
						log.info("go called");
						app.$loginInfo.text("Loading Data...");
						return;
					}
					else
					{
						$('#container').addClass('error');
						self.clienterror_callback("Please download the new version of RSO");
						if (this.tablet || this.mobile)
							window.location.replace(config.build.updatepage);
						return;
					}
                }

                switch(e) {
                        case 'full':
                        case 'invalidlogin':
                        case 'userexists':
                        case 'loggedin':
                        case 'invalidusername':
                        case 'ban':
                        case 'passwordChanged':
                            if (self.fail_callback)
                                self.fail_callback(e);
                        return;

                        case 'timeout':
                            self.isTimeout = true;
                        return;

                        default:
                        	//log.info("recv=" + e);
                            self.receiveMessage(e);
                        return;
                }

            });

            this.connection.on('error', function(e) {
                $('#container').addClass('error');
            	self.clienterror_callback("There has been an error connecting to RSO server try again soon.");
            	log.error(e, true);
            });

            this.connection.on('disconnect', function() {
                log.debug("Connection closed");
                $('#container').addClass('error');
                //$('#container').show();

                if(self.disconnected_callback) {
                    if(self.isTimeout) {
                        self.disconnected_callback("You have been disconnected for being inactive for too long");
                    } else {
                        self.disconnected_callback("The connection to RSO has been lost.");
                    }
                }
            });

        },

        sendMessage: function(json) {
            var data;
            if(this.connection.connected === true) {
                log.info("sent=" + JSON.stringify(json));
            	if(this.useBison) {
                    data = BISON.encode(json);
                } else {
                    data = JSON.stringify(json);
                }

				try {
					if (data.length >= 128)
					{
						var buffer = pako.deflate(data, {gzip: true});
						var dataBase64 = _arrayBufferToBase64(buffer);
						log.info("compressed: "+dataBase64);
						this.connection.send("2"+dataBase64);
					}
					else
					{
						//log.info(data);
						this.connection.send("1"+data);
					}
				} catch (err) {
					console.log(err);
				}
            }
        },

        receiveMessage: function(incomingData) {
            var self = this;
            self.rawpackets.push(incomingData);
        },

        receiveAction: function(data) {
            //log.info("recieved=" + JSON.stringify(data));
            var action = data[0];
            if(this.handlers[action] && _.isFunction(this.handlers[action])) {
                this.handlers[action].call(this, data);
            }
            else {
                log.error("Unknown action : " + action);
            }
        },

        receiveActionBatch: function(actions) {
            var self = this;
            _.each(actions, function(action) {
                //self.receiveAction(action);
                self.packets.push(action);
                //log.info(JSON.stringify(action));
            });
        },

        recievePlainLogin: function (data) {
        	if (this.login_callback)
        		this.login_callback();
        },

        receiveWelcome: function(data) {
            data.shift();
            var id = data.shift(),
                name = data.shift(),
                x = data.shift(),
                y = data.shift(),
                hp = data.shift(),
                experience = data.shift(),
                mana = data.shift(),
                doubleExp = data.shift(),
                expMultiplier = data.shift(),
                membership = data.shift(),
                kind = data.shift(),
                rights = data.shift(),
                pClass = data.shift(),
                mapId = data.shift(),
                attackExp = data.shift(),
                defenseExp = data.shift(),
                moveExp = data.shift(),
                armorColor = data.shift(),
                weaponColor = data.shift(),
                cards = data.shift(),
                deck = data.shift(),
                guildId = data.shift(),
                guildName = data.shift(),
                inventoryGold = data.shift(),
                bankGold = data.shift(),
                armorSpriteId = data.shift(),
                weaponSpriteId = data.shift();

                var stats = {};
                stats.strength = data.shift();
                stats.agility = data.shift();
                stats.health = data.shift();
                stats.energy = data.shift();
                stats.luck = data.shift();
                stats.free = data.shift();

            var equipmentCount = data.shift();
            var equipmentSlot = [];
            var equipmentKind = [];
            var equipmentNumber = [];
            var equipmentSkillKind = [];
            var equipmentSkillLevel = [];
            var equipmentDurability = [];
            var equipmentDurabilityMax = [];
            var equipmentExperience = [];
            for(var i=0; i < equipmentCount; ++i)
            {
            	equipmentSlot.push(data.shift());
                equipmentKind.push(data.shift());
                equipmentNumber.push(data.shift());
                equipmentSkillKind.push(data.shift());
                equipmentSkillLevel.push(data.shift());
                equipmentDurability.push(data.shift());
                equipmentDurabilityMax.push(data.shift());
                equipmentExperience.push(data.shift());
            }

            var inventoryCount = data.shift();
            var inventorySlot = [];
            var inventoryKind = [];
            var inventoryNumber = [];
            var inventorySkillKind = [];
            var inventorySkillLevel = [];
            var inventoryDurability = [];
            var inventoryDurabilityMax = [];
            var inventoryExperience = [];
            for(var i=0; i < inventoryCount; ++i)
            {
            	inventorySlot.push(data.shift());
                inventoryKind.push(data.shift());
                inventoryNumber.push(data.shift());
                inventorySkillKind.push(data.shift());
                inventorySkillLevel.push(data.shift());
                inventoryDurability.push(data.shift());
                inventoryDurabilityMax.push(data.shift());
                inventoryExperience.push(data.shift());
            }

            var bankCount = data.shift();
            var bankSlot = [];
            var bankKind = [];
            var bankNumber = [];
            var bankSkillKind = [];
            var bankSkillLevel = [];
            var bankDurability = [];
            var bankDurabilityMax = [];
            var bankExperience = [];
            for(var i=0; i < bankCount; ++i)
            {
            	bankSlot.push(data.shift());
                bankKind.push(data.shift());
                bankNumber.push(data.shift());
                bankSkillKind.push(data.shift());
                bankSkillLevel.push(data.shift());
                bankDurability.push(data.shift());
                bankDurabilityMax.push(data.shift());
                bankExperience.push(data.shift());
            }
            //log.info("bank_kind="+JSON.stringify(bankKind));

            var i=0;
            var maxQuestNumber = data.shift();
            var questFound = [];
            var questProgress = [];
            for(i=0; i < maxQuestNumber; i++) {
                questFound.push(data.shift());
                questProgress.push(data.shift());
            }

            var maxSkillInstall = data.shift();
            var skillInstalls = [];
            for(i=0; i < maxSkillInstall; i++) {
                skillInstalls.push({index: data.shift(), name: data.shift(), level: data.shift()});
            }

            var maxSkillShortcuts = data.shift();
            var skillShortcuts = [];
            for(i=0; i < maxSkillShortcuts; i++) {
            	skillShortcuts.push({index: data.shift(), name: data.shift()});
            }


            if(this.welcome_callback) {
                this.welcome_callback(id, name, mapId, x, y, hp, mana,
                experience,
                equipmentCount, equipmentSlot, equipmentKind, equipmentNumber, equipmentSkillKind, equipmentSkillLevel, equipmentDurability, equipmentDurabilityMax, equipmentExperience,
                inventoryCount, inventorySlot, inventoryKind, inventoryNumber, inventorySkillKind, inventorySkillLevel, inventoryDurability, inventoryDurabilityMax, inventoryExperience,
                bankCount, bankSlot, bankKind, bankNumber, bankSkillKind, bankSkillLevel, bankDurability, bankDurabilityMax, bankExperience,
                maxQuestNumber, questFound, questProgress,
                skillInstalls,
                skillShortcuts,
                doubleExp, expMultiplier, membership, kind, rights, pClass,
                attackExp, defenseExp, moveExp,
                armorColor, weaponColor,
                cards, deck,
                guildId, guildName,
                inventoryGold, bankGold,
                armorSpriteId, weaponSpriteId,
                stats);
            }
        },

        receiveHealthEnergy: function(data) {
            if (this.healthenergy_callback) {

            	var health = data[1];
                var healthMax = data[2];
                var fatigue = data[3];
                var maxFatigue = data[4];
                this.healthenergy_callback(health, healthMax, fatigue, maxFatigue);
            }
        },

        receiveQuest: function(data){
            data.shift();
            if(this.quest_callback){
                this.quest_callback(data);
            }
        },
        receiveInventory: function(data){
            var inventoryNumber = data[1];
            var itemKind = data[2];
            var itemCount = data[3];
            var itemSkillKind = data[4];
            var itemSkillLevel = data[5];
            var itemDurability = data[6];
            var itemDurabilityMax = data[7];
            var itemExperience = data[8];
            if(this.inventory_callback){
                this.inventory_callback(inventoryNumber, itemKind, itemCount, itemSkillKind, itemSkillLevel, itemDurability, itemDurabilityMax, itemExperience);
            }
        },
        receiveEquipment: function(data){
            var inventoryNumber = data[1];
            var itemKind = data[2];
            var itemCount = data[3];
            var itemSkillKind = data[4];
            var itemSkillLevel = data[5];
            var itemDurability = data[6];
            var itemDurabilityMax = data[7];
            var itemExperience = data[8];
            if(this.equipment_callback){
                this.equipment_callback(inventoryNumber, itemKind, itemCount, itemSkillKind, itemSkillLevel, itemDurability, itemDurabilityMax, itemExperience);
            }
        },

        receiveTalkToNPC: function(data){
            var npcKind = data[1];
            var questId = data[2];
            var isCompleted = data[3];

            if(this.talkToNPC_callback){
                this.talkToNPC_callback(npcKind, questId, isCompleted);
            }
        },
        receiveMove: function(data) {
            var map = data[1],
            	id = data[2],
                x = data[3],
                y = data[4],
                o = data[5],
                target = data[6];

            if (!this.game.map.isLoaded || this.game.mapIndex != map)
            	return;

            ///log.info("MOBMOVE");
            if(this.move_callback) {
                this.move_callback(map, id, x, y, o, target);
            }
        },

        receiveMovePath: function(data) {
            var map = data[1],
            	id = data[2],
                orientation = data[3],
                path = JSON.parse(data[4]);

            if (!this.game.map.isLoaded || this.game.mapIndex != map)
            	return;

            //log.info("MOVEPATH");
            if(this.movepath_callback) {
                this.movepath_callback(map, id, orientation, path);
            }
        },

        receiveLootMove: function(data) {
            var map = data[1],
            	id = data[2],
                item = data[3];

            if (!this.game.map.isLoaded || this.game.mapIndex != map)
            	return;

            log.info("MOBMOVE");
            if(this.lootmove_callback) {
                this.lootmove_callback(map, id, item);
            }
        },

        receiveAttack: function(data) {
            var attacker = data[1],
                target = data[2];

            if(this.attack_callback) {
                this.attack_callback(attacker, target);
            }
        },
        receiveParty: function (data) {
            data.shift();
            if(this.party_callback) {
                this.party_callback(data);
            }
        },

        receiveSpawn: function(data) {
            var id = data[1],
                kind = data[2],
                x = data[3],
                y = data[4],
                map = data[5],
                count = data[6];

            //log.info("this.game.mapIndex:"+this.game.mapIndex);
            //log.info("map:"+parseInt(map));

            if (!this.game.map.ready || this.game.mapIndex != parseInt(map) ||
            	id == this.game.player.id)
            	return;

            //log.info("data="+JSON.stringify(data));
            if (this.game.entityIdExists(id)) {
            	var entity = this.game.getEntityById();
            	if (entity instanceof Mob || (entity instanceof Pet && kind == entity.kind))
            		return;
            }

            // TODO
            var pvpBaseExp = /^10[0-9].*$/;
            var houseExp = /^15[0-9].*$/;
        	if (pvpBaseExp.test(id))
            {
            	//log.info("data[7]="+data[7]);
            	var pvpBase = new PvpBase(id, kind, x, y, data[7]);
            	if (this.spawn_pvpbase_callback) {
            		this.spawn_pvpbase_callback(pvpBase);
            	}
            	return;
            }
            else if (houseExp.test(id))
            {
            	var house = new House(id, kind, x, y);
            	if (this.spawn_house_callback) {
            		this.spawn_house_callback(house);
            	}
            	return;
            }


            if(isItem(id)) {
                var item = EntityFactory.createEntity(kind, id);
                item.count = count;
                if(this.spawn_item_callback) {
                    this.spawn_item_callback(item, x, y);
                }
            } else if(isChest(id)) {
                var item = EntityFactory.createEntity(kind, id);

                if(this.spawn_chest_callback) {
                    this.spawn_chest_callback(item, x, y);
                }
            } else {
                var name, orientation, target, weapon, armor, level, playerId, pvpSide, flags = '';
                var pClass, armorEnchantedPoint, weaponEnchantedPoint, armorColor, weaponColor,
                	influence, guildId, guildName, hitPoints;

                if(isPlayer(id) || isNpcPlayer(id)) {
                    name = data[6];
                    orientation = data[7];
                    armor = data[8];
                    weapon = data[9];
                    level = data[10];
                    pClass = data[11];
                    target = data[12];
                    pvpSide = data[13];
                    armorEnchantedPoint = data[14];
                    weaponEnchantedPoint = data[15];
                    armorSpriteId = data[16];
                    weaponSpriteId = data[17];
                    armorColor = data[18];
                    weaponColor = data[19];
                    influence = data[20];
                    guildId = data[21];
                    guildName = data[22];
                }
                else if(isMob(id) || isPet(id)) {
                    name = data[6];
                    orientation = data[7];
                    target = data[8];
                    playerId = data[9];
                    flags = data[10];
                    level = data[11];
                    hitPoints = data[12];
                }
                else if (isGather(id)) {
                    orientation = data[6];
                }

                var entity = EntityFactory.createEntity(kind, id, name, map);

                if (entity instanceof Pet) {
                    entity.playerId = playerId;
                }
                if(entity instanceof Player) {
                    entity.level = level;
                    entity.setClass(pClass);
                    entity.pvpSide = pvpSide;
                    // NOTE - Skil Kind and Level are set to 0 because they are unknown.
                    entity.weapon = {kind: weapon, point:weaponEnchantedPoint, skillKind:0, skillLevel:0};
                    entity.armor = {kind: armor, point:armorEnchantedPoint, skillKind:0, skillLevel:0};
                    entity.armorSpriteId = armorSpriteId;
                    entity.weaponSpriteId = weaponSpriteId;
                    entity.armorColor = armorColor;
                    entity.weaponColor = weaponColor;
                    entity.influence = influence;
                    entity.setGuild(new Guild(guildId, guildName));
                }
                if (entity instanceof Mob) {
                    entity.spriteName = MobData.Kinds[kind].spriteName;
                    entity.level = level;
                    entity.setMaxHitPoints(hitPoints);
                }
                if (entity instanceof Gather) {
                	entity.setGridPosition(x,y);
                }
                //log.info("character="+JSON.stringify(character));
                if(this.spawn_character_callback) {
                    this.spawn_character_callback(map, entity, x, y, orientation,
                    	target, playerId, flags, influence);
                }
            }
        },

        receiveDespawn: function(data) {
            var id = data[1],
            	x = data[2],
            	y = data[3],
            	mapId = data[4]
            	blood = data[5];

            if(this.despawn_callback) {
                this.despawn_callback(id, x, y, mapId, blood);
            }
        },

        receiveHealth: function(data) {
            var id = data[1],
            	points = data[2],
                isRegen = false;

            if(data[3]) {
                isRegen = true;
            }

            if(this.health_callback) {
                this.health_callback(id, points, isRegen);
            }
        },

        receiveChat: function(data) {
            var id = data[1],
                text = data[2];

            if(this.chat_callback) {
                this.chat_callback(id, text);
            }
        },

        /*receiveEquipItem: function(data) {
            var id = data[1],
                slot = data[2],
            	itemKind = data[3],
                itemPoint = data[4],
                skillKind = data[5],
                skillLevel = data[6];

            if(this.equip_callback) {
                this.equip_callback(id, slot, itemKind, itemPoint, skillKind, skillLevel);
            }
        },*/

        receiveDrop: function(data) {
            var mobId = data[1],
                id = data[2],
                kind = data[3],
                count = data[4],
                skillKind = data[5],
                skillLevel = data[6],
                durability = data[7],
                durabilityMax = data[8],
                x = data[9],
                y = data[10];

            var item = EntityFactory.createEntity(kind, id, '', skillKind, skillLevel);
            if (item)
            {
				item.count = count;
				item.wasDropped = true;
				log.info("x:"+x+",y:"+y);
				item.setGridPosition(x,y);

				if(this.drop_callback) {
					this.drop_callback(item, mobId, x, y);
                }
            }
        },

        receiveTeleport: function(data) {
            var id = data[1],
                x = data[2],
                y = data[3];

            if(this.teleport_callback) {
                this.teleport_callback(id, x, y);
            }
        },

        receiveTeleportMap: function(data) {
            var id = data[1],
                status = data[2],
            	x = data[3],
                y = data[4];

            if(this.teleportmap_callback) {
                this.teleportmap_callback(id, status, x, y);
            }
        },

        receiveDamage: function(data) {
            var id1 = data[1],
                id2 = data[2],
                dmg = data[3],
                hp = parseInt(data[4]),
                maxHp = parseInt(data[5]);
                var crit = 0;
                if (data[6])
                	crit = parseInt(data[6]);

            if(this.dmg_callback) {
                this.dmg_callback(id1, id2, dmg, hp, maxHp, crit);
            }
        },

        receivePopulation: function(data) {
            var worldPlayers = data[1],
                totalPlayers = data[2];

            if(this.population_callback) {
                this.population_callback(worldPlayers, totalPlayers);
            }
        },

        receiveKill: function(data) {
            var id = data[1];
            var level = data[2];
            var exp = data[3];


            if(this.kill_callback) {
                this.kill_callback(id, level, exp);
            }
        },

        receiveLevelUp: function(data) {
            var type = data[1];
            var level = data[2];
            var exp = data[3];


            if(this.levelup_callback) {
                this.levelup_callback(type, level, exp);
            }
        },

        receiveItemLevelUp: function(data) {
            var type = data[1];
            var level = data[2];
            var exp = data[3];


            if(this.itemlevelup_callback) {
                this.itemlevelup_callback(type, level, exp);
            }
        },

        receiveList: function(data) {
            data.shift();

            if(this.list_callback) {
                this.list_callback(data);
            }
        },

        receiveDestroy: function(data) {
            var id = data[1];

            if(this.destroy_callback) {
                this.destroy_callback(id);
            }
        },

        receiveHitPoints: function(data) {
            var maxHp = data[1];
            var maxMana = data[2];
            var hp = data[3];
            var mp = data[4];

            if(this.hp_callback) {
                this.hp_callback(maxHp, maxMana);
            }
        },

        receiveBlink: function(data) {
            var id = data[1];

            if(this.blink_callback) {
                this.blink_callback(id);
            }
        },
        receivePVP: function(data){
            var pvp = data[1];
            if(this.pvp_callback){
                this.pvp_callback(pvp);
            }
        },

        receiveGuildError: function(data) {
			var errorType = data[1];
			var guildName = data[2];
			if(this.guilderror_callback) {
				this.guilderror_callback(errorType, guildName);
			}
		},

		receiveGuild: function(data) {
			if( (data[1] === Types.Messages.GUILDACTION.CONNECT) &&
				this.guildmemberconnect_callback ){
				this.guildmemberconnect_callback(data[2]); //member name
			}
			else if( (data[1] === Types.Messages.GUILDACTION.DISCONNECT) &&
				this.guildmemberdisconnect_callback ){
				this.guildmemberdisconnect_callback(data[2]); //member name
			}
			else if( (data[1] === Types.Messages.GUILDACTION.ONLINE) &&
				this.guildonlinemembers_callback ){
					data.splice(0,2);
				this.guildonlinemembers_callback(data); //member names
			}
			else if( (data[1] === Types.Messages.GUILDACTION.CREATE) &&
				this.guildcreate_callback){
				this.guildcreate_callback(data[2], data[3]);//id, name
			}
			else if( (data[1] === Types.Messages.GUILDACTION.INVITE) &&
				this.guildinvite_callback){
				this.guildinvite_callback(data[2], data[3], data[4]);//id, name, invitor name
			}
			else if( (data[1] === Types.Messages.GUILDACTION.POPULATION) &&
				this.guildpopulation_callback){
				this.guildpopulation_callback(data[2], data[3]);//name, count
			}
			else if( (data[1] === Types.Messages.GUILDACTION.JOIN) &&
				this.guildjoin_callback){
					this.guildjoin_callback(data[2], data[3], data[4], data[5]);//name, (id, (guildId, guildName))
			}
			else if( (data[1] === Types.Messages.GUILDACTION.LEAVE) &&
				this.guildleave_callback){
					this.guildleave_callback(data[2], data[3], data[4]);//name, id, guildname
			}
			else if( (data[1] === Types.Messages.GUILDACTION.TALK) &&
				this.guildtalk_callback){
					this.guildtalk_callback(data[2], data[3], data[4]);//name, id, message
			}
        },

        receiveRanking: function(data){
            data.shift();
            if(this.ranking_callback){
                this.ranking_callback(data);
            }
        },

        receiveNotify: function(data){
            var msg = data[1];
            if(this.notify_callback){
                this.notify_callback(msg);
            }
        },

        receiveDoubleEXP: function(data) {
            var msg = data[1];
            if (this.doubleexp_callback) {
                this.doubleexp_callback(msg);
            }
        },
        receiveEXPMultiplier: function(data) {
            var msg = data[1];
            //You're only sending and receiving a damn integer
            if (this.expmultiplier_callback) {
                this.expmultiplier_callback(msg);
            }
        },
        receiveMembership: function(data) {
            var msg = data[1];
            if (this.membership_callback) {
                this.membership_callback(msg);
            }
        },
        receiveSkill: function(data){
            data.shift();
            if(this.skill_callback){
                this.skill_callback(data);
            }
        },
        receiveSkillInstall: function(data) {
            if(this.skillInstall_callback) {
                data.shift();
                this.skillInstall_callback(data);
            }
        },
        receiveSkillLoad: function(data) {
            if(this.skillLoad_callback) {
                data.shift();
                this.skillLoad_callback(data);
            }
        },

        receiveCharacterInfo: function(data) {
            if(this.characterInfo_callback) {
                data.shift();
                this.characterInfo_callback(data);
            }
        },

        receiveStatInfo: function(data) {
            if(this.statInfo_callback) {
                data.shift();
                this.statInfo_callback(data);
            }
        },

        receiveShop: function(data){
            data.shift();
            if(this.shop_callback){
                this.shop_callback(data);
            }
        },
        receiveAuction: function(data){
            data.shift();
            if(this.auction_callback){
                this.auction_callback(data);
            }
        },
        receiveWanted: function (data) {
            var id = data[1],
                isWanted = data[2];
            if(this.wanted_callback) {
                this.wanted_callback(id, isWanted);
            }
        },

        receivePartyInvite: function(data) {
            if(this.partyInvite_callback) {
                this.partyInvite_callback(data[1]);
            }
        },

        receiveBank: function (data) {
            var bankNumber = data[1],
                itemKind = data[2],
                itemNumber = data[3],
                itemSkillKind = data[4],
                itemSkillLevel = data[5],
                itemDurability = data[6],
                itemDurabilityMax = data[7];

            if(this.bank_callback) {
                this.bank_callback(bankNumber, itemKind, itemNumber,
                	itemSkillKind, itemSkillLevel, itemDurability, itemDurabilityMax);
            }
        },

        receiveBank: function (data) {
            var bankGold = data[1];

            if(this.bankgold_callback) {
                this.bankgold_callback(bankGold);
            }
        },

        receiveClassSwitch: function(data) {
            if(this.classSwitch_callback) {
                this.classSwitch_callback(data[1]);
            }
        },

        receivePvPSide: function(data) {
            if(this.pvpSide_callback) {
                this.pvpSide_callback(data[1]);
            }
        },

        receiveAggro: function(data) {
            if(this.aggro_callback) {
                this.aggro_callback(data[1], data[2], data[3], data[4]);
            }
        },

        receiveSpeech: function(data) {
            if(this.speech_callback) {
                this.speech_callback(data[1], data[2], data[3]);
            }
        },

        receiveMapStatus: function(data) {
        	if (this.mapstatus_callback)
        	{
        		this.mapstatus_callback(data[1], data[2]);
        	}
        },

        receiveGather: function(data) {
            if(this.gather_callback) {
                this.gather_callback(data[1]);
            }
        },

        receiveWheather: function(data) {
            if(this.wheather_callback) {
                this.wheather_callback(data[1],data[2],data[3]);
            }
        },

        receiveColorTint: function (data) {
        	if (this.colortint_callback) {
        		this.colortint_callback(data[1], data[2], data[3]);
        	}
        },

        receiveUpdateLook: function (data) {
        	if (this.updatelook_calllback) {
        		this.updatelook_calllback(data[1], data[2], data[3], data[4], data[5]);
        	}
        },

        receivePetSwap: function (data) {
        	if (this.petswap_calllback) {
        		this.petswap_calllback(data[1]);
        	}
        },

        receiveRefreshCards: function(data) {
        	if (this.refreshcards_callback) {
        		this.refreshcards_callback(data[1], data[2]);
        	}
        },

        receiveCardBattleRequest: function(data) {
        	if (this.refreshcardbattlerequest_callback) {
        		this.refreshcardbattlerequest_callback(data[1]);
        	}
        },

        receiveCardBattleBet: function(data) {
        	if (this.refreshcardbattlebet_callback) {
        		this.refreshcardbattlebet_callback(data[1], data[2]);
        	}
        },

        receiveGold: function(data) {
        	if (this.refreshgold_callback) {
        		this.refreshgold_callback(data[1], data[2]);
        	}
        },

        receiveProducts: function (data) {
        	data.shift();
        	if (this.products_callback) {
        		this.products_callback(data);
        	}
        },

        receiveAppearanceList: function (data) {
        	data.shift();
        	if (this.appearancelist_callback) {
        		this.appearancelist_callback(data);
        	}
        },

        receiveLoadLooks: function (data) {
        	data.shift();
        	if (this.loadlooks_callback) {
        		this.loadlooks_callback(data);
        	}
        },

        onDispatched: function(callback) {
            this.dispatched_callback = callback;
        },

        onConnected: function(callback) {
            this.connected_callback = callback;
        },

        onDisconnected: function(callback) {
            this.disconnected_callback = callback;
        },

        onClientError: function(callback) {
            this.clienterror_callback = callback;
        },

        onLogin: function(callback) {
        	this.login_callback = callback;
        },

        onWelcome: function(callback) {
            this.welcome_callback = callback;
        },

        onSpawnPvpBase: function (callback) {
        	this.spawn_pvpbase_callback = callback;
        },

        onSpawnHouse: function (callback) {
        	this.spawn_house_callback = callback;
        },

        onSpawnCharacter: function(callback) {
            this.spawn_character_callback = callback;
        },

        onSpawnItem: function(callback) {
            this.spawn_item_callback = callback;
        },

        onSpawnChest: function(callback) {
            this.spawn_chest_callback = callback;
        },

        onDespawnEntity: function(callback) {
            this.despawn_callback = callback;
        },

        onEntityMove: function(callback) {
            this.move_callback = callback;
        },

        onEntityMovePath: function(callback) {
            this.movepath_callback = callback;
        },

        onEntityAttack: function(callback) {
            this.attack_callback = callback;
        },

        onPlayerChangeHealth: function(callback) {
            this.health_callback = callback;
        },

        /*onPlayerEquipItem: function(callback) {
            this.equip_callback = callback;
        },*/


        onPlayerMoveToItem: function(callback) {
            this.lootmove_callback = callback;
        },

        onPlayerTeleport: function(callback) {
            this.teleport_callback = callback;
        },

        onPlayerTeleportMap: function(callback) {
            this.teleportmap_callback = callback;
        },

        onChatMessage: function(callback) {
            this.chat_callback = callback;
        },

        onDropItem: function(callback) {
            this.drop_callback = callback;
        },

        onPlayerDamageMob: function(callback) {
            this.dmg_callback = callback;
        },

        onPlayerKillMob: function(callback) {
            this.kill_callback = callback;
        },

        onPlayerLevelUp: function(callback) {
            this.levelup_callback = callback;
        },

        onPlayerItemLevelUp: function(callback) {
            this.itemlevelup_callback = callback;
        },

        onPopulationChange: function(callback) {
            this.population_callback = callback;
        },

        onEntityList: function(callback) {
            this.list_callback = callback;
        },

        onEntityDestroy: function(callback) {
            this.destroy_callback = callback;
        },

        onPlayerChangeMaxHitPoints: function(callback) {
            this.hp_callback = callback;
        },

        onItemBlink: function(callback) {
            this.blink_callback = callback;
        },
        onPVPChange: function(callback){
            this.pvp_callback = callback;
        },

        onNotify: function(callback){
            this.notify_callback = callback;
        },

        onHealthEnergy: function(callback) {
            this.healthenergy_callback = callback;
        },

        onQuest: function(callback) {
            this.quest_callback = callback;
        },
        onTalkToNPC: function(callback) {
            this.talkToNPC_callback = callback;
        },
        onParty: function (callback) {
            this.party_callback = callback;
        },
        onRanking: function (callback) {
            this.ranking_callback = callback;
        },
        onInventory: function(callback) {
            this.inventory_callback = callback;
        },
        onEquipment: function(callback) {
            this.equipment_callback = callback;
        },
        onDoubleEXP: function(callback) {
            this.doubleexp_callback = callback;
        },
        onEXPMultiplier: function(callback) {
            this.expmultiplier_callback = callback;
        },
        onMembership: function(callback) {
            this.membership_callback = callback;
        },
        onSkill: function (callback) {
            this.skill_callback = callback;
        },
        onSkillInstall: function(callback) {
            this.skillInstall_callback = callback;
        },
        onSkillLoad: function(callback) {
            this.skillLoad_callback = callback;
        },

        onCharacterInfo: function(callback) {
            this.characterInfo_callback = callback;
        },

        onStatInfo: function(callback) {
            this.statInfo_callback = callback;
        },

        onShop: function (callback) {
            this.shop_callback = callback;
        },
        onAuction: function (callback) {
            this.auction_callback = callback;
        },

        onWanted: function (callback) {
            this.wanted_callback = callback;
        },
        onBank: function (callback) {
            this.bank_callback = callback;
        },
        onBankGold: function (callback) {
            this.bankgold_callback = callback;
        },

        onPartyInvite: function (callback) {
            this.partyInvite_callback = callback;
        },

        onClassSwitch: function (callback) {
             this.classSwitch_callback = callback;
        },

        onPvpSide: function (callback) {
             this.pvpSide_callback = callback;
        },

        onAggro: function (callback) {
             this.aggro_callback = callback;
        },

        onSpeech: function (callback) {
             this.speech_callback = callback;
        },

        onMapStatus: function (callback) {
        	this.mapstatus_callback = callback;
        },

        onGather: function (callback) {
        	this.gather_callback = callback;
        },

        onWheather: function (callback) {
        	this.wheather_callback = callback;
        },

        onColorTint: function (callback) {
        	this.colortint_callback = callback;
        },

        onUpdateLook: function (callback) {
        	this.updatelook_calllback = callback;
        },


        onPetSwap: function (callback) {
        	this.petswap_calllback = callback;
        },

        onRefreshCards: function(callback) {
        	this.refreshcards_callback = callback;
        },

        onCardBattleRequest: function (callback) {
        	this.refreshcardbattlerequest_callback = callback;
        },

        onCardBattleBet: function (callback) {
        	this.refreshcardbattlebet_callback = callback;
        },

        onGuildError: function(callback) {
			this.guilderror_callback = callback;
	},

	onGuildCreate: function(callback) {
		this.guildcreate_callback = callback;
	},

	onGuildInvite: function(callback) {
		this.guildinvite_callback = callback;
	},

	onGuildJoin: function(callback) {
		this.guildjoin_callback = callback;
	},

	onGuildLeave: function(callback) {
		this.guildleave_callback = callback;
	},

	onGuildTalk: function(callback) {
		this.guildtalk_callback = callback;
	},

	onMemberConnect: function(callback) {
		this.guildmemberconnect_callback = callback;
	},

	onMemberDisconnect: function(callback) {
		this.guildmemberdisconnect_callback = callback;
	},

	onReceiveGuildMembers: function(callback) {
		this.guildonlinemembers_callback = callback;
	},

	onGuildPopulation: function(callback) {
		this.guildpopulation_callback = callback;
	},

	onGold: function(callback) {
		this.refreshgold_callback = callback;
	},

	onProducts: function (callback) {
		this.products_callback = callback;
	},

	onAppearanceList: function (callback) {
		this.appearancelist_callback = callback;
	},

	onLooksList: function (callback) {
		this.loadlooks_callback = callback;
	},

        sendPartyInvite: function(playerId, status) { // 0 for request, 1, for yes, 2 for no.
            this.sendMessage([Types.Messages.PARTYINVITE,
                              playerId, status]);
        },

        sendPartyLeave: function(playerId) {
            this.sendMessage([Types.Messages.PARTYLEAVE]);
        },

        sendPartyLeader: function(playerId) {
            this.sendMessage([Types.Messages.PARTYLEADER,
                              playerId]);
        },

        sendPartyKick: function(playerId) {
            this.sendMessage([Types.Messages.PARTYKICK,
                              playerId]);
        },

        sendCreate: function(player) {
            this.sendMessage([Types.Messages.CREATE,
                              player.name,
                              //player.pw,
                              player.hash,
                              player.email,
            		      player.pClass]);
        },

        sendLogin: function(player) {
            this.sendMessage([Types.Messages.LOGIN,
                              player.name,
                              //player.pw,
            			      player.hash]);
        },

        sendPlainLogin: function(player) {
            this.sendMessage([Types.Messages.PLAINLOGIN,
                              player.name,
                              player.pw,
            			      ]);
        },

        sendNewPassword: function(username, pw, newpw) {
            this.sendMessage([Types.Messages.NEWPASSWORD,
                              username,
                              pw,
                              newpw]);
            //alert("sendNewPassword");
        },

        sendAPILogin: function(player) {
            this.sendMessage([Types.Messages.KBVE,
                              player.name,
                              player.pw,
                              player.id]);
        },

        // future move 1 for planned, 2 for arrived.
        sendMoveEntity: function(mapId, entity) {
            this.sendMessage([Types.Messages.MOVEENTITY,
            		      mapId,
            		      entity.id,
                          entity.gridX,
                          entity.gridY,
            		      2,
            		      entity.orientation,
            			  entity.target]);
        },

        // future move 1 for planned, 2 for arrived.
        sendMoveEntity2: function(id, mapId, gridX, gridY, future, orientation, target) {
            this.sendMessage([Types.Messages.MOVEENTITY,
            		      id,
            		      mapId,
                          gridX,
                          gridY,
            		      future,
            		      orientation,
            			  target]);
        },

        sendMovePath: function(mapId, entity, length, path) {
            var array = [Types.Messages.MOVEPATH,
            		      mapId,
            		      entity.id,
                      length];
						if (entity.followingMode)
            {
              path.pop();
            }
			    	path.shift();
            array = array.concat(JSON.stringify(path));
        	this.sendMessage(array);
        },

        sendLootMove: function(item, x, y) {
            this.sendMessage([Types.Messages.LOOTMOVE,
                              x,
                              y,
                              item.id]);
        },

        sendAggro: function(mob) {
            this.sendMessage([Types.Messages.AGGRO,
                              mob.id]);
        },

        sendAttack: function(player, mob) {
            this.sendMessage([Types.Messages.ATTACK,
                              mob.id, player.gridX, player.gridY,
            				  player.Orientation]);
        },

        sendChat: function(text) {
            this.sendMessage([Types.Messages.CHAT,
                              text]);
        },

        sendLoot: function(item) {
            this.sendMessage([Types.Messages.LOOT,
                              item.id]);
        },

        sendTeleport: function(id, x, y) {
            this.sendMessage([Types.Messages.TELEPORT,
            		      id,
                              x,
                              y]);
        },

        sendTeleportMap: function(map, status, x, y) {
            this.sendMessage([Types.Messages.TELEPORT_MAP,
            		      	  map, status,
                              x,
                              y]);
        },

        sendZone: function() {
            this.sendMessage([Types.Messages.ZONE]);
        },

        sendOpen: function(chest) {
            this.sendMessage([Types.Messages.OPEN,
                              chest.id]);
        },

        sendCheck: function(id) {
            this.sendMessage([Types.Messages.CHECK,
                              id]);
        },

        sendWho: function(ids) {
            ids.unshift(Types.Messages.WHO);
            this.sendMessage(ids);
        },

        sendDelist: function(ids) {
            ids.unshift(Types.Messages.DELIST);
            this.sendMessage(ids);
        },

        sendEntityMoveSynch: function (ids) {
            ids.unshift(Types.Messages.MOVE_SYNC);
            this.sendMessage(ids);
        },

        sendTalkToNPC: function(kind, questId){
            this.sendMessage([Types.Messages.TALKTONPC,
                              kind, questId]);
        },
        sendMagic: function(magicName, target){
            this.sendMessage([Types.Messages.MAGIC,
                              magicName, target]);
        },
        sendBoard: function(command, number, replynumber){
          this.sendMessage([Types.Messages.BOARD,
                            command,
                            number,
                            replynumber]);
        },
        sendBoardWrite: function(command, title, content){
          this.sendMessage([Types.Messages.BOARDWRITE,
                            command,
                            title,
                            content]);
        },
        sendKung: function(word) {
            this.sendMessage([Types.Messages.KUNG,
                              word]);
        },
        sendRanking: function(command){

            this.sendMessage([Types.Messages.RANKING, command]);
        },
        sendQuest: function(id, type){

            this.sendMessage([Types.Messages.QUEST, id, type]);
        },
        sendInventory: function(category, type, inventoryNumber, count){

            this.sendMessage([Types.Messages.INVENTORY, category, type, inventoryNumber, count]);
        },
        sendDoubleEXP: function(enabled) {

            this.sendMessage([Types.Messages.DOUBLE_EXP, enabled]);
        },
        sendEXPMultiplier: function(times) {

            this.sendMessage([Types.Messages.EXP_MULTIPLIER, times]);
        },
        sendMembership: function(hasMembership) {

            this.sendMessage([Types.Messages.MEMBERSHIP, hasMembership]);
        },
        sendSkill: function(type, targetId){

            this.sendMessage([Types.Messages.SKILL, type, targetId]);
        },
        sendSkillInstall: function(index, name) {

            this.sendMessage([Types.Messages.SKILLINSTALL, index, name]);
        },
        sendSkillLoad: function() {
            this.sendMessage([Types.Messages.SKILLLOAD]);
        },

        sendCharacterInfo: function() {
            this.sendMessage([Types.Messages.CHARACTERINFO]);
        },
        sendSell: function(inventoryNumber, count){
            this.sendMessage([Types.Messages.SELL,
                inventoryNumber,
                count]);
        },
        sendShop: function(command, number){
            this.sendMessage([Types.Messages.SHOP,
                command,
                number]);
        },
        sendBuy: function(number, itemKind, goldCount){
            this.sendMessage([Types.Messages.BUY,
                number,
                itemKind,
                goldCount]);
        },
        sendStoreSell: function(inventoryNumber) {
            this.sendMessage([Types.Messages.STORESELL, inventoryNumber]);
        },
        sendStoreBuy: function(itemType, itemKind, itemCount) {
            this.sendMessage([Types.Messages.STOREBUY, itemType, itemKind, itemCount]);
        },

        sendAuctionOpen: function(type) {
            this.sendMessage([Types.Messages.AUCTIONOPEN, type]);
        },
        sendAuctionSell: function(inventoryNumber, sellValue) {
            this.sendMessage([Types.Messages.AUCTIONSELL, inventoryNumber, sellValue]);
        },
        sendAuctionBuy: function(index) {
            this.sendMessage([Types.Messages.AUCTIONBUY, index]);
        },
        sendAuctionDelete: function(index) {
            this.sendMessage([Types.Messages.AUCTIONDELETE, index]);
        },

        sendStoreEnchant: function(type, index) { // type 1 = Inventory, 2 = Equipment.
            this.sendMessage([Types.Messages.STOREENCHANT, type, index]);
        },
        sendStoreRepair: function(type, index) { // type 1 = Inventory, 2 = Equipment.
            this.sendMessage([Types.Messages.STOREREPAIR, type, index]);
        },

        sendBankStore: function(inventoryNumber) {
            this.sendMessage([Types.Messages.BANKSTORE, inventoryNumber]);
        },
        sendBankRetrieve: function(inventoryNumber) {
            this.sendMessage([Types.Messages.BANKRETRIEVE, inventoryNumber]);
        },
        sendGold: function(type, amount) {
            this.sendMessage([Types.Messages.GOLD, parseInt(type), parseInt(amount)]);
        },
        sendHasFocus: function(flag) {
            this.sendMessage([Types.Messages.CLIENTFOCUS, flag]);
        },
        sendAddSpawn: function (id, x, y) {
            this.sendMessage([Types.Messages.ADDSPAWN, id, x, y]);
        },

        sendSaveSpawns: function () {
            this.sendMessage([Types.Messages.SAVESPAWNS]);
        },
        sendPetCreate: function (targetId, kind) {
            this.sendMessage([Types.Messages.PETCREATE, targetId, kind]);
        },
        sendRemovePet: function (targetId, index) {
            this.sendMessage([Types.Messages.REMOVEPET, targetId, index]);
        },

        sendClassSwitch: function (pClass) {
            this.sendMessage([Types.Messages.CLASSSWITCH, pClass]);
        },
        sendGather: function (id) {
            this.sendMessage([Types.Messages.GATHER, id]);
        },
        sendCraft: function (id) {
            this.sendMessage([Types.Messages.CRAFT, id]);
        },
        sendMapStatus: function (mapId, status) {
        	this.sendMessage([Types.Messages.MAP_STATUS, mapId, status]);
        },
        sendPlayerRevive: function () {
        	this.sendMessage([Types.Messages.PLAYER_REVIVE]);
        },
        sendColorTint: function(type, value) {
        	this.sendMessage([Types.Messages.COLOR_TINT, type, value]);
        },
        sendDevice: function(mobile, tablet) {
        	this.sendMessage([Types.Messages.DEVICE, mobile, tablet]);
        },
        sendPetInvite: function(status) {
        	log.info("sent pet invite: "+Types.Messages.PET_SWAP+" "+status);
        	this.sendMessage([Types.Messages.PET_SWAP, status]);
        },

        // Cards
        sendCardsToDeck: function(index) {
        	this.sendMessage([Types.Messages.CARD_SWAP, 1, index]);
        },
        sendDeckToCards: function(index) {
        	this.sendMessage([Types.Messages.CARD_SWAP, 2, index]);
        },

        sendCardBattleRequest: function(playerIndex) {
        	this.sendMessage([Types.Messages.CARD_BATTLE_REQUEST, 1, playerIndex]);
        },
        sendCardBattleRequestOk: function(playerIndex) {
        	this.sendMessage([Types.Messages.CARD_BATTLE_REQUEST, 2, playerIndex]); // OK
        },
        sendCardBattleRequestCancel: function(playerIndex) {
        	this.sendMessage([Types.Messages.CARD_BATTLE_REQUEST, 3, playerIndex]); // CANCEL
        },
        sendCardBattleBetOk: function(playerIndex, bet) {
        	this.sendMessage([Types.Messages.CARD_BATTLE_REQUEST, 4, playerIndex, bet]); // BET OK
        },
        sendCardBattleBetCancel: function(playerIndex) {
        	this.sendMessage([Types.Messages.CARD_BATTLE_REQUEST, 3, playerIndex]); // BET CANCEL
        },

        // Cards - End.

        sendNewGuild: function(name) {
			this.sendMessage([Types.Messages.GUILD, Types.Messages.GUILDACTION.CREATE, name]);
		},

		sendGuildInvite: function(invitee) {
			this.sendMessage([Types.Messages.GUILD, Types.Messages.GUILDACTION.INVITE, invitee]);
		},

		sendGuildInviteReply: function(guild, answer) {
			this.sendMessage([Types.Messages.GUILD, Types.Messages.GUILDACTION.JOIN, guild, answer]);
		},

		talkToGuild: function(message){
			this.sendMessage([Types.Messages.GUILD, Types.Messages.GUILDACTION.TALK, message]);
		},

		sendLeaveGuild: function(){
			this.sendMessage([Types.Messages.GUILD, Types.Messages.GUILDACTION.LEAVE]);
		},

	sendPurchase: function(product, receipt) {
		this.sendMessage([Types.Messages.PURCHASE, product, receipt]);
	},

	sendAppearanceUnlock: function(index) {
		this.sendMessage([Types.Messages.APPEARANCEUNLOCK, index]);
	},

	sendAppearanceUpdate: function() {
		this.sendMessage([Types.Messages.APPEARANCELIST]);
	},

	sendLook: function (type, id) {
		this.sendMessage([Types.Messages.LOOKUPDATE, type, id]);
	},

	sendLooks: function () {
		this.sendMessage([Types.Messages.LOADLOOKS]);
	},

	sendAddStat: function(statType, points) {
		this.sendMessage([Types.Messages.STATADD, statType, points]);
	}

    });
    return GameClient;
});
