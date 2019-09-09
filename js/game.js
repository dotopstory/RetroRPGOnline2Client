
/* global Types, log, _, self, Class, CharacterDialog, localforage */

define(['localforage', 'infomanager', 'bubble', 'renderer', 'map', 'animation', 'sprite',
        'tile', 'gameclient', 'audio', 'updater', 'transition',
        'pathfinder', 'entity', 'item', 'items', 'appearancedata', 'appearancedialog', 'mob', 'pvpbase', 'house', 'npc', 'npcdata', 'player', 'character', 'chest', 'mount',
        'pet', 'mobs', 'mobdata', 'mobspeech', 'gather', 'exceptions', 'config', 'chathandler', 'warpmanager', 'textwindowhandler',
        'menu', 'playerpopupmenu', 'classpopupmenu', 'questhandler',
        'equipmenthandler', 'inventoryhandler', 'bankhandler', 'socialhandler', 'leaderboardhandler', 'cardhandler','settingshandler','storehandler','bools',
        'skillhandler', 'statehandler', 'storedialog', 'auctiondialog', 'enchantdialog', 'repairdialog', 'bankdialog', 'craftdialog', 'guild', 'gamedata', 'gamepad',
        '../shared/js/gametypes', '../shared/js/itemtypes', 'util'],
    function(localforage, InfoManager, BubbleManager, Renderer, Map, Animation, Sprite, AnimatedTile,
             GameClient, AudioManager, Updater, Transition, Pathfinder,
             Entity, Item, Items, AppearanceData, AppearanceDialog, Mob, PvpBase, House, Npc, NpcData, Player, Character, Chest, Mount, Pet, Mobs, MobData, MobSpeech, Gather, Exceptions, config,
             ChatHandler, WarpManager, TextWindowHandler, Menu,
             PlayerPopupMenu, ClassPopupMenu, QuestHandler,
             EquipmentHandler, InventoryHandler, BankHandler, SocialHandler, LeaderboardHandler, CardHandler, SettingsHandler, StoreHandler, Bools, SkillHandler, StateHandler,
             StoreDialog, AuctionDialog, EnchantDialog, RepairDialog, BankDialog, CraftDialog, Guild, GameData, GamePad) {
        var Game = Class.extend({
            init: function(app) {
                //$('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', 'css/game.css') );


            	this.app = app;
                this.app.config = config;
                this.ready = false;
                this.started = false;
                this.hasNeverStarted = true;

                this.client = null;
                this.renderer = null;
                this.camera = null;
                this.updater = null;
                this.pathfinder = null;
                this.chatinput = null;
                this.bubbleManager = null;
                this.audioManager = null;

                //this.renderbackground = false;


                // Game state
                this.entities = {};
                //this.deathpositions = {};
                this.entityGrid = null;
                this.pathingGrid = null;
                this.renderingGrid = null;
                this.itemGrid = null;
                this.currentCursor = null;
                this.mouse = { x: 0, y: 0 };
                //this.zoningQueue = [];
                this.previousClickPosition = {};

                this.notifyPVPMessageSent = false;
                this.cursorVisible = true;
                this.selectedX = 0;
                this.selectedY = 0;
                this.selectedCellVisible = false;
                this.targetColor = "rgba(255, 255, 255, 0.5)";
                this.targetCellVisible = true;
                this.hoveringTarget = false;
                this.hoveringPlayer = false;
                this.hoveringMob = false;
                this.hoveringItem = false;
                this.hoveringCollidingTile = false;
                this.hoveringEntity = null;

                // Global chats
                this.chats = 0;
                this.maxChats = 3;
                this.globalChatColor = '#A6FFF9';

                // Menu
                this.menu = new Menu();

                // Item Info
                this.itemInfoOn = true;

                // combat
                this.infoManager = new InfoManager(this);
                this.questhandler = new QuestHandler(this);
                this.chathandler = new ChatHandler(this, this.kkhandler);
                this.playerPopupMenu = new PlayerPopupMenu(this);
                this.socialHandler = new SocialHandler(this);
                this.settingsHandler = new SettingsHandler(this, this.app);
                this.leaderboardHandler = new LeaderboardHandler(this);
                this.storeHandler = new StoreHandler(this, this.app);

                this.statehandler = new StateHandler(this);

                // FPS
                //this.lastFPSTime = new Date().getTime();
                //this.FPSCount = 0;

                // Move Sync
                this.lastCurrentTime = new Date().getTime();
                this.updateCurrentTime = new Date().getTime();
                this.logicTime = new Date().getTime();

                // zoning
                this.currentZoning = null;

                this.cursors = {};

                this.sprites = {};

                // tile animation
                this.animatedTiles = null;

                // debug
                this.debugPathing = false;

                // Shortcut Healing
                this.healShortCut = -1;
                this.hpGuide = 0;
                this.autoEattingHandler = null;
                // pvp
                this.pvpFlag = false;
                //
                this.dialogs = [];
                this.characterDialog = new CharacterDialog(this);
                this.equipmentHandler = new EquipmentHandler(this);


                this.dialogs.push(this.characterDialog);

                //New Stuff
                this.soundButton = null;

                this.doubleEXP = false;
                this.expMultiplier = 1;
                this.membership = false;

                this.showInventory = 0;
                this.activeCircle = null;

                this.selectedSkillIndex = 0;

                this.usejoystick = false;

                this.inputLatency = 0;
                this.keyInterval = null;

                this.optimized = true;

                this.products = null;

                /**
                 * Settings - For player
                 */

                this.moveEntityThreshold = 11;
                this.showPlayerNames = true;
                this.musicOn = true;
                this.sfxOn = true;
                this.frameColour = "default";
                this.autoRetaliate = false;
                this.autoattack = null;
                this.ignorePlayer = false;

                this.bubbleTime = Date.now();
                this.bubbleInterval = 16;

                //Bank
                this.bankShowing = false;

                this.mapIndex = 0;
                this.mapStatus = 0;
                this.mapChanged = false;

                this.mapIndexes = {};
                this.mapIndexes[0] = {file: "nwhouse.json"};
                this.mapIndexes[1] = {file: "nwfinal1.json"};
                this.mapIndexes[2] = {file: "nwfinal2.json"};
                this.mapIndexes[3] = {file: "nwfinal3.json"};

                this.makePlayerAttackAuto2 = false;

                this.renderTick = 16;
                this.renderTime = Date.now();
				if (typeof(requestAnimFrame) === "undefined")
					this.gameTick = setInterval(this.tick,this.renderTick);


                this.spriteNames = [ "item-frankensteinarmor", "ancientmanumentnpc", "provocationeffect",
                    "bearseonbiarmor", "item-bearseonbiarmor", "frankensteinarmor",
                    "item-gayarcherarmor", "redsicklebow", "item-redsicklebow", "jirisanmoonbear",
                    "halloweenjkarmor", "item-halloweenjkarmor", "mojojojonpc", "gayarcherarmor",
                    "combatuniform", "item-combatuniform", "bloodbow", "item-bloodbow",
                    "item-paewoldo", "cursedhahoemask", "secondsonangelnpc", "item-essentialrage",
                    "sicklebow", "item-sicklebow", "radisharmor", "item-radisharmor", "paewoldo",
                    "firstsonangelnpc", "archerschooluniform", "item-archerschooluniform",
                    "item-forestbow", "adhererarcherarmor", "item-adhererarcherarmor",
                    "supercateffect", "burgerarmor", "item-burgerarmor", "item-marblependant",
                    "friedpotatoarmor", "item-friedpotatoarmor", "superiorangelnpc", "forestbow",
                    "frogarmor", "legolasarmor", "item-legolasarmor", "gaybow", "item-gaybow",
                    "crystalbow", "item-crystalbow", "momangelnpc", "frog", "item-frogarmor",
                    "crystalarcherarmor", "item-crystalarcherarmor", "item-cokearmor",
                    "item-blackspiderarmor", "item-rainbowapro", "item-spiritring", "cokearmor",
                    "fallenarcherarmor", "hellspider", "blackspiderarmor", "rainbowapro",
                    "item-rosebow", "item-pearlpendant", "angelnpc", "item-fallenarcherarmor",
                    "bluewingarcherarmor", "item-bamboospear", "item-bluewingarcherarmor",
                    "item-justicebow", "snowshepherdboy", "suicideghost", "bamboospear",
                    "item-pearlring", "wolfarcherarmor", "item-wolfarcherarmor", "justicebow",
                    "item-snowfoxarcherarmor", "marinebow", "item-marinebow", "cursedjangseung",
                    "redwingarcherarmor", "bridalmask", "item-bridalmask", "snowfoxarcherarmor",
                    "item-redmetalbow", "item-devilkazyasword", "item-redwingarcherarmor",
                    "item-gbwingarcherarmor", "item-captainbow", "redmetalbow", "devilkazyasword",
                    "devilkazyaarmor", "item-devilkazyaarmor", "gbwingarcherarmor", "captainbow",
                    "dovakinarcherarmor", "item-dovakinarcherarmor", "devilkazya", "elfnpc",
                    "skylightbow", "item-greenpendant", "redlightbow", "item-redlightbow",
                    "cheoliarcherarmor", "item-cheoliarcherarmor", "item-skylightbow", "rosebow",
                    "item-piratearcherarmor", "item-greenlightbow", "item-cactusaxe",
                    "item-hunterbow", "item-sproutring", "piratearcherarmor", "greenlightbow",
                    "bluestoremannpc", "ratarcherarmor", "item-ratarcherarmor", "hunterbow",
                    "seahorsebow", "item-seahorsebow", "iceelfnpc", "redstoremannpc",
                    "item-conferencecall", "whitearcherarmor", "item-whitearcherarmor", "cactus",
                    "item-redguardarcherarmor", "skydinosaur", "conferencecall", "cactusaxe",
                    "item-reddamboarmor", "mermaidbow", "item-mermaidbow", "redguardarcherarmor",
                    "iamverycoldnpc", "item-blackpotion", "queenspider", "reddamboarmor",
                    "bluebikinigirlnpc", "babyspider", "redenelbow", "item-redenelbow",
                    "item-guardarcherarmor", "item-greenbow", "pirategirlnpc", "redbikinigirlnpc",
                    "greendamboarmor", "item-greendamboarmor", "guardarcherarmor", "greenbow",
                    "mantis", "item-pinksword", "item-greenwingarcherarmor", "poisonspider",
                    "watermelonbow", "item-watermelonbow", "pinksword", "greenwingarcherarmor",
                    "shepherdboy", "zombiegf", "greenarcherarmor", "item-greenarcherarmor",
                    "item-ironknightarmor", "goldenbow", "item-goldenbow", "item-evilarmor",
                    "weastaff", "item-weastaff", "smalldevil", "ironknightarmor", "fairynpc",
                    "item-goldenarcherarmor", "blackwizard", "wizardrobe", "item-wizardrobe",
                    "whitetiger", "tigerarmor", "item-tigerarmor", "goldenarcherarmor", "pierrot",
                    "deathbow", "item-deathbow", "fireplay", "item-fireplay", "blazespider",
                    "squeakyhammer", "item-squeakyhammer", "violetbow", "item-violetbow",
                    "item-redbow", "hongcheol", "hongcheolarmor", "item-hongcheolarmor",
                    "item-platearcherarmor", "item-beetlearmor", "item-redarcherarmor", "redbow",
                    "mailarcherarmor", "item-mailarcherarmor", "queenant", "platearcherarmor",
                    "snowmanarmor", "item-snowmanarmor", "plasticbow", "item-plasticbow", "comb",
                    "goldmedal", "silvermedal", "bronzemedal", "sponge", "snowman", "item-comb",
                    "item-archerarmor", "firespider", "fireshot", "item-fireshot", "item-ironbow",
                    "item-catarmor", "leatherarcherarmor", "item-leatherarcherarmor", "ironbow",
                    "item-dinosaurarmor", "mermaidnpc", "healeffect", "cat", "catarmor", "beetle",
                    "soldier", "fisherman", "octopus", "earthworm", "dinosaurarmor", "evilarmor",
                    "item-butcherknife", "shieldbenef", "bucklerbenef", "criticaleffect",
                    "cockroachsuit", "item-cockroachsuit", "soybeanbug", "butcherknife",
                    "item-pinkcockroacharmor", "vendingmachine", "bluecockroach", "beetlearmor",
                    "item-robocoparmor", "redcockroach", "pinkcockroacharmor", "oddeyecat",
                    "candybar", "item-candybar", "vampire", "christmasarmor", "santa",
                    "item-christmasarmor", "doctor", "soldierant", "robocoparmor", "stuneffect",
                    "rudolf", "rudolfarmor", "item-rudolfarmor", "boxingman", "santaelf",
                    "ant", "bluedamboarmor", "item-bluedamboarmor", "archerarmor", "woodenbow",
                    "rhaphidophoridae", "memme", "item-memme", "bee", "beearmor", "item-beearmor",
                    "typhoon", "item-typhoon", "windguardian", "squid", "squidarmor",
                    "kaonashi", "damboarmor", "item-damboarmor", "item-royalazalea",
                    "rainbowsword", "item-rainbowsword", "item-sword1", "item-squidarmor",
                    "miniemperor", "huniarmor", "item-huniarmor", "slime", "item-woodenbow",
                    "miniseadragon", "miniseadragonarmor", "item-miniseadragonarmor",
                    "eneltrident", "item-eneltrident", "item-snowpotion", "minidragon",
                    "magicspear", "item-magicspear", "enelarmor", "item-enelarmor",
                    "lightningguardian", "breaker", "item-breaker", "enel", "flaredanceeffect",
                    "shadowregion", "shadowregionarmor", "item-shadowregionarmor",
                    "seadragon", "seadragonarmor", "item-seadragonarmor", "searage",
                    "item-searage", "purplecloudkallege", "item-purplecloudkallege",
                    "snowlady", "daywalker", "item-daywalker", "pirateking", "item-pirateking",
                    "hermitcrab", "zombie", "piratecaptain", "ironogre", "ogrelord", "adherer",
                    "icegolem", "flaredeathknight", "redsickle", "item-redsickle",
                    "regionhenchman", "plunger", "item-plunger", "purplepreta", "sickle",
                    "item-sickle", "icevulture", "portalarmor", "item-portalarmor",
                    "item-adminarmor", "adminarmor", "pain", "rabbitarmor", "item-rabbitarmor",
                    "crystalscolpion", "eliminator", "firebenef", "taekwondo", "item-taekwondo",
                    "darkogre", "item-book", "item-cd", "frostqueen", "snowrabbit", "snowwolf",
                    "iceknight", "miniiceknight", "snowelf", "whitebear", "cobra", "goldgolem",
                    "darkregion", "darkregionillusion", "nightmareregion", "justicehammer",
                    "item-justicehammer", "firesword", "item-firesword", "whip", "item-whip",
                    "forestguardiansword", "item-forestguardiansword", "gayarmor",
                    "item-gayarmor", "schooluniform", "item-schooluniform", "beautifullife",
                    "item-beautifullife", "regionarmor", "item-regionarmor", "ghostrider",
                    "item-ghostrider", "desertscolpion", "darkscolpion", "vulture",
                    "forestdragon", "bluewingarmor", "item-bluewingarmor", "thiefarmor",
                    "item-thiefarmor", "ninjaarmor", "item-ninjaarmor", "dragonarmor",
                    "item-dragonarmor", "fallenarmor", "item-fallenarmor", "paladinarmor",
                    "item-paladinarmor", "crystalarmor", "item-crystalarmor", "adhererrobe",
                    "item-adhererrobe", "frostarmor", "item-frostarmor", "redmetalsword",
                    "item-redmetalsword", "bastardsword", "item-bastardsword", "halberd",
                    "item-halberd", "rose", "item-rose", "icerose", "item-icerose", "hand",
                    "sword", "loot", "target", "talk", "sparks", "shadow16", "rat", "skeleton",
                    "skeleton2", "spectre", "skeletonking", "deathknight", "ogre", "crab",
                    "snek", "eye", "bat", "goblin", "wizard", "guard", "king", "villagegirl",
                    "villager", "coder", "agent", "rick", "scientist", "nyan", "priest",
                    "sorcerer", "octocat", "beachnpc", "forestnpc", "desertnpc", "lavanpc",
                    "clotharmor", "item-clotharmor", "leatherarmor", "mailarmor", "platearmor",
                    "redarmor", "goldenarmor", "firefox", "death", "sword1", "axe", "chest",
                    "sword2", "redsword", "bluesword", "goldensword", "item-sword2", "item-axe",
                    "item-redsword", "item-bluesword", "item-goldensword", "item-leatherarmor",
                    "item-mailarmor", "item-platearmor", "item-redarmor", "item-goldenarmor",
                    "item-flask", "item-cake", "item-burger", "morningstar", "item-morningstar",
                    "item-firepotion", "orc", "oldogre", "golem", "mimic", "hobgoblin",
                    "greenarmor", "greenwingarmor", "item-greenarmor", "item-greenwingarmor",
                    "redmouse", "redguard", "scimitar", "item-scimitar", "redguardarmor",
                    "item-redguardarmor", "whitearmor", "item-whitearmor", "infectedguard",
                    "livingarmor", "mermaid", "trident", "item-trident", "ratarmor",
                    "item-ratarmor", "yellowfish", "greenfish", "redfish", "clam", "preta",
                    "pirateskeleton", "bluescimitar", "item-bluescimitar", "bluepiratearmor",
                    "item-bluepiratearmor", "penguin", "moleking", "cheoliarmor",
                    "item-cheoliarmor", "hammer", "item-hammer", "darkskeleton", "redarcherarmor",
                    "greenpirateskeleton", "blackpirateskeleton", "redpirateskeleton",
                    "yellowpreta", "bluepreta", "miniknight", "wolf", "dovakinarmor",
                    "item-dovakinarmor", "gbwingarmor", "item-gbwingarmor", "redwingarmor",
                    "item-redwingarmor", "snowfoxarmor", "item-snowfoxarmor", "wolfarmor",
                    "item-wolfarmor", "pinkelf", "greenlightsaber", "item-greenlightsaber",
                    "skyelf", "skylightsaber", "item-skylightsaber", "redelf", "redlightsaber",
                    "item-redlightsaber", "item-sidesword", "sidesword", "yellowmouse",
                    "whitemouse", "brownmouse", "spear", "item-spear", "guardarmor",
                    "item-guardarmor",
                    "item-pendant1", "item-ring1", "item-gold", "item-bigflask",
                    "armorarcher1",
                    "house1",
                    "house2",
                    "house3",
                    "map-rock",
                    "map-tree",
                    "item-bootsandgloves"];

                this.unknownEntities = [];
                this.removeObsoleteEntitiesChunk = 5;
                var self = this;
                setInterval(function() {
                	self.removeObsoleteEntities();
                },96);

                setInterval(function() {
                	if (self.unknownEntities.length > 0)
                	{
                		self.client.onEntityList(self.unknownEntities);
                		self.unknownEntities = [];
                	}
                }, 500);
            },


            setup: function($bubbleContainer, canvas, backgroundbuffer, backgroundunscaled, foregroundunscaled, atmospherebuffer, background, animated, foreground, textcanvas, toptextcanvas, atmosphere, atmosphere2, input) {
                this.setBubbleManager(new BubbleManager(this, $bubbleContainer));
                this.setRenderer(new Renderer(this, canvas, backgroundbuffer, backgroundunscaled, foregroundunscaled, atmospherebuffer, background, animated, foreground, textcanvas, toptextcanvas, atmosphere, atmosphere2));
                this.camera = this.renderer.camera;
                //this.map = new Map(!this.renderer.upscaledRendering, this);
                for( var id in this.mapIndexes)
                {
                	var map = this.mapIndexes[id];
                	map.map = new Map(!this.renderer.upscaledRendering, this);
                }
                this.map = this.mapIndexes[0].map;


                this.bankHandler = new BankHandler(this);
                this.setChatInput(input);

                this.storeDialog = new StoreDialog(this);
                this.dialogs.push(this.storeDialog);
                this.enchantDialog = new EnchantDialog(this);
                this.dialogs.push(this.enchantDialog);
                this.repairDialog = new RepairDialog(this);
                this.dialogs.push(this.repairDialog);
                this.bankDialog = new BankDialog(this);
                this.dialogs.push(this.bankDialog);
                this.auctionDialog = new AuctionDialog(this);
                this.dialogs.push(this.auctionDialog);
                this.craftDialog = new CraftDialog(this);
                this.dialogs.push(this.craftDialog);
                this.appearanceDialog = new AppearanceDialog(this);
                this.dialogs.push(this.appearanceDialog);

                this.classPopupMenu = new ClassPopupMenu(this);

                this.updateTick = (this.renderer.mobile || this.renderer.tablet) ? 32 : 16;

                this.renderTick = (this.renderer.mobile || this.renderer.tablet) ? 32 : 16;

                this.inventoryHandler = new InventoryHandler(this);
            },


            setRenderer: function(renderer) {
                this.renderer = renderer;
            },

            setUpdater: function(updater) {
                this.updater = updater;
            },

            setPathfinder: function(pathfinder) {
                this.pathfinder = pathfinder;
            },

            setChatInput: function(element) {
                this.chatinput = element;
            },

            setBubbleManager: function(bubbleManager) {
                this.bubbleManager = bubbleManager;
            },

            loadMap: function(mapIndex) {
                var self = this;

                this.map = this.mapIndexes[mapIndex].map;
                /*if (this.map.isLoaded)
                {
                	//this.map.isLoaded = false;
                	this.map._checkReady();
                }
                else*/
                //{
                	this.map.loadMap(this.mapIndexes[mapIndex].file);
                //}
                self.map.index = mapIndex;

            },

            initPlayer: function() {


                this.app.initTargetHud();

                //alert (this.player.getSpriteName());
                this.player.setSprite(this.sprites[this.player.getSpriteName()]);

                this.player.idle();

                log.debug("Finished initPlayer");
            },

            initShadows: function() {
                this.shadows = {};
                if (this.sprites["shadow16"])
                	this.shadows["small"] = this.sprites["shadow16"];
            },

            initCursors: function() {
            	if (this.sprites["hand"])
            		this.cursors["hand"] = this.sprites["hand"];

                this.cursors["sword"] = this.sprites["sword"];
                this.cursors["loot"] = this.sprites["loot"];
                this.cursors["target"] = this.sprites["target"];
                this.cursors["arrow"] = this.sprites["arrow"];
                this.cursors["talk"] = this.sprites["talk"];
                this.cursors["join"] = this.sprites["talk"];
            },
            initAnimations: function() {
                this.targetAnimation = new Animation("idle_down", 4, 0, 16, 16);
                this.targetAnimation.setSpeed(50);

                this.sparksAnimation = new Animation("idle_down", 6, 0, 16, 16);
                this.sparksAnimation.setSpeed(120);

                this.benefAnimation = new Animation("idle_down", 8, 0, 48, 48);
                this.benefAnimation.setSpeed(120);

                this.benef10Animation = new Animation("idle_down", 10, 0, 32, 32);
                this.benef10Animation.setSpeed(80);

                this.benef4Animation = new Animation("idle_down", 4, 0, 48, 48);
                this.benef4Animation.setSpeed(80);
            },

            /*initHurtSprites: function() {
                var self = this;

                ItemTypes.forEachArmorKind(function(kind, kindName) {
                    self.sprites[kindName].createHurtSprite();
                });
            },*/

            initSilhouettes: function() {
                var self = this;

                //Types.forEachMobOrNpcKind(function(kind, kindName) {
                //    self.sprites[kindName].createSilhouette();
                //    log.info("Loading... " + kindName);
                //});
                var sprite = self.sprites["chest"];
                if (sprite)
                {
			if (!sprite.isLoaded) sprite.load();
			sprite.createSilhouette();
		}
                //self.sprites["item-cake"].createSilhouette();
            },


            loadSprite: function(name) {
            	var s = this.renderer.scale;

                if (s==1) {
                    this.spritesets[0][name] = new Sprite(name, 1);
                } else if (s==2) {
                    this.spritesets[0][name] = new Sprite(name, 1);
                    this.spritesets[1][name] = new Sprite(name, 2);
                }
                else {
                    this.spritesets[0][name] = new Sprite(name, 1);
                    this.spritesets[1][name] = new Sprite(name, 2);
                    //this.spritesets[2][name] = new Sprite(name, 3);
                }
            },

            setSpriteScale: function(scale) {
                var self = this;

                    //alert(scale);
			if(this.renderer.upscaledRendering || scale == 1)
			    this.sprites = this.spritesets[0];
			else
			    this.sprites = this.spritesets[scale - 1];

		    //log.info(JSON.stringify(this.sprites));
                    _.each(this.entities, function(entity) {
                         try {
                         	 entity.setSprite(self.sprites[entity.getSpriteName()]);
                         }
                         catch (e) {}
                    });
                    //this.initHurtSprites();
                    this.initShadows();
                    this.initCursors();
            },

            loadSprites: function() {
                log.info("Loading sprites...");
                this.spritesets = [];
                this.spritesets[0] = {};
                this.spritesets[1] = {};
                this.spritesets[2] = {};
                for (var id=0; id < this.spriteNames.length; ++id)
                     this.loadSprite( this.spriteNames[id]);
                this.setSpriteScale(this.renderer.scale);
            },

            spritesLoaded: function() {
                if(_.any(this.sprites, function(sprite) { return !sprite.isLoaded; })) {
                    return false;
                }
                return true;
            },

            setCursor: function(name, orientation) {
                if(name in this.cursors) {
                    this.currentCursor = this.cursors[name];
                    this.currentCursorOrientation = orientation;
                } else {
                    log.error("Unknown cursor name :"+name);
                }
            },

            updateCursorLogic: function() {

            	if(this.hoveringCollidingTile && this.started) {
                    this.targetColor = "rgba(255, 50, 50, 0.5)";
                }
                else {
                    this.targetColor = "rgba(255, 255, 255, 0.5)";
                }

                if(this.hoveringPlayer && this.started && this.player) {
                    if(this.player.pvpFlag || (this.namedEntity && this.namedEntity instanceof Player && this.namedEntity.isWanted)) {
                        this.setCursor("sword");
                    } else {
                        this.setCursor("hand");
                    }
                    this.hoveringTarget = false;
                    this.hoveringMob = false;
                    this.targetCellVisible = false;
                } else if(this.hoveringMob && this.started && this.hoveringEntity.kind != 70) { // Obscure Mimic.
                    this.setCursor("sword");
                    this.hoveringTarget = false;
                    this.hoveringPlayer = false;
                    this.targetCellVisible = false;
                }
                else if(this.hoveringNpc && this.started) {
                    this.setCursor("talk");
                    this.hoveringTarget = false;
                    this.targetCellVisible = false;
                }
                else if((this.hoveringItem || this.hoveringChest) && this.started) {
                    this.setCursor("loot");
                    this.hoveringTarget = false;
                    this.targetCellVisible = true;
                }
                else {
                    this.setCursor("hand");
                    this.hoveringTarget = false;
                    this.hoveringPlayer = false;
                    this.targetCellVisible = true;
                }
            },

            focusPlayer: function() {
                this.renderer.camera.lookAt(this.player);
            },

            addEntity: function(entity) {
                var self = this;
                //if(this.entities[entity.id] === undefined) {
                    this.entities[entity.id] = entity;
                    this.registerEntityPosition(entity);

                    /*if(!(entity instanceof Item && entity.wasDropped)
                        && !(this.renderer.mobile || this.renderer.tablet)) {
                        entity.fadeIn(this.currentTime);
                    }*/

                    /*if(this.renderer.mobile || this.renderer.tablet) {
                        entity.onDirty(function(e) {
                            if(self.camera.isVisible(e)) {
                                e.dirtyRect = self.renderer.getEntityBoundingRect(e);
                                self.checkOtherDirtyRects(e.dirtyRect, e, e.gridX, e.gridY);
                            }
                        });
                    }*/
                //}
                //else {
                //    log.error("This entity already exists : " + entity.id + " ("+entity.kind+")");
                //}
            },

            removeEntity: function(entity) {
                if(entity.id in this.entities && !(entity instanceof House)) {
                    this.unregisterEntityPosition(entity);
                    delete this.entities[entity.id];
                }
                else {
                    log.info("Cannot remove entity. Unknown ID : " + entity.id);
                }
            },

            addItem: function(item, x, y) {
                this.items[item.id] = item;
                //item.setSprite(this.sprites[item.getItemSpriteName()]);
                item.setGridPosition(x, y);
                /*if (ItemTypes.isCard(item.kind))
                	item.setAnimation("idle_down", 60000);
                else
                	item.setAnimation("idle", 300);*/
                this.addEntity(item);
                //this.registerEntityPosition(item);

                //Display info about the item upon creation (dropping, or any appearance on the ground)
                //if (item.kind == 400)
                //	return;

                //this.createBubble(item.id, item.getInfoMsg());
                //this.assignBubbleTo(item);

                this.pathingGrid[y][x] == false;
            },

            removeItem: function(item) {
                if(item) {
                    this.removeFromItemGrid(item, item.gridX, item.gridY);
                    this.removeFromRenderingGrid(item, item.gridX, item.gridY);
                    delete this.entities[item.id];
                } else {
                    log.error("Cannot remove item. Unknown ID : " + item.id);
                }
            },

            initPathingGrid: function() {
                this.pathingGrid = [];
                for(var i=0; i < this.map.height; i += 1) {
                    this.pathingGrid[i] = [];
                    for(var j=0; j < this.map.width; j += 1) {
                        this.pathingGrid[i][j] = this.map.grid[i][j];
                    }
                }
                log.info("Initialized the pathing grid with static colliding cells.");
            },

            initEntityGrid: function() {
                this.entityGrid = [];
                log.info(this.map.height);
                log.info(this.map.width);
                for(var i=0; i < this.map.height; i += 1) {
                    this.entityGrid[i] = [];
                    for(var j=0; j < this.map.width; j += 1) {
                        this.entityGrid[i][j] = {};
                    }
                }
                log.info("Initialized the entity grid.");
            },

            initRenderingGrid: function() {
                this.renderingGrid = [];
                for(var i=0; i < this.map.height; i += 1) {
                    this.renderingGrid[i] = [];
                    for(var j=0; j < this.map.width; j += 1) {
                        this.renderingGrid[i][j] = {};
                    }
                }
                log.info("Initialized the rendering grid.");
            },

            initItemGrid: function() {
                this.items = {};
            	this.itemGrid = [];
                for(var i=0; i < this.map.height; i += 1) {
                    this.itemGrid[i] = [];
                    for(var j=0; j < this.map.width; j += 1) {
                        this.itemGrid[i][j] = {};
                    }
                }
                log.info("Initialized the item grid.");
            },

            /**
             *
             */
            initAnimatedTiles: function() {
                var self = this,
                    m = this.map;

                this.animatedTiles = [];
                this.forEachVisibleTile(function (id, index) {
                    if(m.isAnimatedTile(id)) {
                        var tile = new AnimatedTile(id, m.getTileAnimationLength(id), m.getTileAnimationDelay(id), index),
                            pos = self.map.tileIndexToGridPosition(tile.index);

                        tile.x = pos.x;
                        tile.y = pos.y;
                        self.animatedTiles.push(tile);
                    }
                }, 1, false);
                //log.info("Initialized animated tiles.");
            },

            addToRenderingGrid: function(entity, x, y) {
                if(entity && !this.map.isOutOfBounds(x, y)) {
                    this.renderingGrid[y][x][entity.id] = entity;
                }
            },

            removeFromRenderingGrid: function(entity, x, y) {
                if(entity && this.renderingGrid[y][x] && entity.id in this.renderingGrid[y][x]) {
                    delete this.renderingGrid[y][x][entity.id];
                }
            },

            removeFromEntityGrid: function(entity, x, y) {
            	if(entity && this.entityGrid[y][x] && entity.id in this.entityGrid[y][x]) {
                    delete this.entityGrid[y][x][entity.id];
                    //log.info("x: "+x+",y:"+y+",id:"+entity.id+" removed from grid");
                }
            },

            removeFromItemGrid: function(item, x, y) {
                if(item && this.itemGrid[y][x][item.id]) {
                    delete this.itemGrid[y][x][item.id];
                    delete this.items[item.id];
                }
            },

            removeFromPathingGrid: function(x, y) {
                this.pathingGrid[y][x] = false;
            },

            /**
             * Registers the entity at two adjacent positions on the grid at the same time.
             * This situation is temporary and should only occur when the entity is moving.
             * This is useful for the hit testing algorithm used when hovering entities with the mouse cursor.
             *
             * @param {Entity} entity The moving entity
             */
            registerEntityDualPosition: function(entity) {
                if(entity) {
                    this.entityGrid[entity.gridY][entity.gridX][entity.id] = entity;

                    this.addToRenderingGrid(entity, entity.gridX, entity.gridY);

                    if(entity.nextGridX >= 0 && entity.nextGridY >= 0) {
                        this.entityGrid[entity.nextGridY][entity.nextGridX][entity.id] = entity;
                        //if(!(entity instanceof Player)) {
                            this.pathingGrid[entity.nextGridY][entity.nextGridX] = true;
                        //}
                    }
                }
            },

            /**
             * Clears the position(s) of this entity in the entity grid.
             *
             * @param {Entity} entity The moving entity
             */
            unregisterEntityPosition: function(entity) {
                if(entity) {
                    this.removeFromEntityGrid(entity, entity.gridX, entity.gridY);
                    this.removeFromPathingGrid(entity.gridX, entity.gridY);

                    this.removeFromRenderingGrid(entity, entity.gridX, entity.gridY);

                    if(entity.nextGridX >= 0 && entity.nextGridY >= 0) {
                        this.removeFromEntityGrid(entity, entity.nextGridX, entity.nextGridY);
                        this.removeFromPathingGrid(entity.nextGridX, entity.nextGridY);
                    }
                }
            },

            registerEntityPosition: function(entity) {
                var x = entity.gridX,
                    y = entity.gridY;

                if(entity) {
                    if(entity instanceof Character || entity instanceof Chest || entity instanceof Gather) {
                        //if(!(entity instanceof Player))
                        //log.info("x: "+x+",y:"+y+",id:"+entity.id+" added to grid");

                        this.entityGrid[y][x][entity.id] = entity;
                        if(!(entity instanceof Player) && !(entity instanceof Pet) && !(entity instanceof Item)) {
                            this.pathingGrid[y][x] = true;
                        }
                    }
                    if(entity instanceof Item) {
                        this.itemGrid[y][x][entity.id] = entity;
                        this.items[entity.id] = entity;
                    }
                    this.addToRenderingGrid(entity, x, y);
                }
            },

            setServerOptions: function(host, port, username, userpw, hash, email, newuserpw, pClass) {
                this.host = host;
                this.port = port;
                this.username = this.capitalizeFirstLetter(username.toLowerCase());
                this.userpw = userpw;
                this.hash = hash;
                this.email = email;
                this.newuserpw = newuserpw;
                this.pClass = parseInt(pClass);
            },

            capitalizeFirstLetter: function(string) {

                return string.charAt(0).toUpperCase() + string.slice(1);
            },

            loadAudio: function() {
                this.audioManager = new AudioManager(this);
            },

            loadWarp: function() {
            	this.warpManager = new WarpManager(this);
            },

            initMusicAreas: function() {
                var self = this;
                //_.each(this.map.musicAreas, function(area) {
                //    self.audioManager.addArea(area.x, area.y, area.w, area.h, area.id);
                //});
            },

            run: function(action, started_callback, server) {
            	var self = this;
                this.connect(action, started_callback, server);
                this.loadSprites();
                this.setUpdater(new Updater(this));
                this.camera = this.renderer.camera;
                setTimeout(function () {
                    self.renderer.calcZoom();
                    self.renderer.rescale();
                    self.renderer.resizeCanvases();
                    self.renderer.forceRedraw = true;
                },1500); // Slight Delay For On-Screen Keybaord to minimize.
            },

            tick: function() {
                this.currentTime = new Date().getTime();

                if(this.started) {
			this.gamepad.interval();
			if (this.mapStatus >= 3)
			{
				this.updateCursorLogic();
				this.updater.update();
				this.update();
				this.updateCurrentTime = this.currentTime;
			}

			//if ((Date.now() - this.renderTime) > this.renderTick)
			//{
				this.renderer.renderFrame();
				this.renderTime = Date.now();
			//}

			if(!this.isStopped)
			{
				requestAnimFrame(this.tick.bind(this));
			}
		    if (this.isStopped)
		    	clearInterval(this.gameTick);
		}
            },

            update: function() {

            },

            start: function() {
            	var self = this;
                if (typeof(Native) !== 'undefined')
                {
                	setInterval(function() {
                	    self.tick();
                	}, 16);
                }
            	this.tick();
                this.hasNeverStarted = false;
                log.info("Game loop started.");
            },

            stop: function() {
                log.info("Game stopped.");
                this.isStopped = true;
            },

            entityIdExists: function(id) {
                return id in this.entities;
            },

            getEntityById: function(id) {
                if(id in this.entities) {
                    return this.entities[id];
                }
                else if (id in this.items) {
                	return this.items[id];
                }
                //else {
                //    log.info("Unknown entity id : " + id, true);
                //}
            },


            getEntityByName: function(name){
                for(id in this.entities){
                    var entity = this.entities[id];
                    if(entity.name === name){
                        return entity;
                    }
                }
                return null;
            },

            getEntityByKind: function(kind){
                for(id in this.entities){
                    var entity = this.entities[id];
                    if(entity.kind === kind){
                        return entity;
                    }
                }
                return null;
            },


            loadGameData: function() {
                var self = this;
                self.loadAudio();
                self.loadWarp();

                self.initMusicAreas();

                self.initCursors();
                self.initAnimations();
                self.initShadows();
                self.initSilhouettes();



                self.setCursor("hand");
            },

            /*clearMap: function () {
				 var self = this;

				self.forEachEntity(function (entity) {
					if (entity.id !== self.player.id)
						self.removeEntity(entity);
			    });
			     self.entities = [];

            },*/



            teleportMaps: function(mapIndex, x, y)
            {
            	log.info("teleportMaps");
            	x = x || -1;
            	y = y || -1;
            	this.mapChanged = false;

            	this.client.sendTeleportMap(mapIndex,-1,x,y);
            },

            connect: function(action, started_callback,server) {
                var self = this,
                    connecting = false; // always in dispatcher mode in the build version

                this.client = new GameClient(this, this.host, this.port, this.useServer);

                this.client.fail_callback = function(reason){
                    started_callback({
                        success: false,
                        reason: reason
                    });
                    self.started = false;
                };


				this.client.onPlayerTeleportMap(function(id, status, x, y) {
					log.info("ON PLAYER TELEPORT MAP:"+id+"status: "+status+",x:"+x+",y:"+y);
				    self.mapStatus = status;
				    id = parseInt(id);
					if (status == -2)
					{
						// TODO - TELEPORT
						self.mapIndex = 0;
						self.mapChanged = true;
						self.mapStatus = 3;
						//self.player.stoppedTeleport = true;
						//self.player.onStep();
					}
				    if (status == 0)
					{
						log.info("spawnMap");

						self.mapIndex = id;
						self.player.forceStop();
						if (self.player && self.player.pets)
						{
							self.player.pets = [];
							/*for (var i=0; i < self.player.pets.length; ++i)
							{
								var pet = self.player.pets[i];
								pet.forceStop();
								self.player.pets.splice(i,1);
							}*/
							//delete self.player.pets;
						}

						// TODO - Remove old Entity entry before new grid made.
						//self.removeFromEntityGrid(self.player, self.player.gridX, self.player.gridY);
						//self.removePets();
						//self.forEachEntity(function (entity) {
				        /*for (var id in self.entities)
				        {
				        	var entity = self.entities[id];
							//if (entity.id != self.player.id)
						    self.removeEntity(entity);
						 }*/
						 delete self.entities;
						 self.entities = {};

						 //self.entity = [];
						 //self.map.isLoaded = false;
						 self.map.index = id;
						 log.info("MAP_INDEX:"+id);

						 self.map.isLoaded = false;
						 self.loadMap(id);

						self.map.ready(function() {
							log.info("Map loaded.");
							var tilesetIndex = self.renderer.upscaledRendering ? 0 : self.renderer.scale - 1;
							self.renderer.setTileset(self.map.tilesets[tilesetIndex]);
							self.client.sendTeleportMap(id,0,x,y);
						});

					}
					if (status == 1)
					{
						 //var wait = setInterval(function () {
							  if (self.map.isLoaded)
							  {
									log.info("spawnMap - Loaded");
									clearInterval(wait);
									//self.map.ready = true;
									//id = self.mapIndex;
									self.initPathingGrid();
									self.initEntityGrid();
									self.initRenderingGrid();
									self.setPathfinder(new Pathfinder(self.map.width, self.map.height));
									self.initItemGrid();
									self.initAnimatedTiles();
									log.info("spawnMap - Cleared");
									//setTimeout(function() {
										self.client.sendTeleportMap(id,1,x,y);
									//},500);
							 }
						 //},100);
						//log.debug("Finished respawn");
					}
					if (status == 2)
					{
						log.info("spawnPlayer - started");
						self.initPlayer();

						if (x > -1 && y > -1)
						{
							self.player.setGridPosition(x,y);
							self.camera.setRealCoords({x: x*self.renderer.tilesize, y: y*self.renderer.tilesize});
							self.player.nextGridX=x;
							self.player.nextGridY=y;

							self.addEntity(self.player);

							if (self.player && self.player.pets)
							{
								for (var i=0; i < self.player.pets.length; ++i)
								{
									var pet = self.player.pets[i];
									pet.mapIndex = id;
									pet.setGridPosition(x,y);
									self.addEntity(pet);
									pet.forceStop();
									pet.nextGridX=x;
									pet.nextGridY=y;
								}

							}
						}
						self.updatePlateauMode();

						//self.player.sprite.load();

						//self.resetCamera();

						self.client.sendTeleportMap(id,2,x,y);

						//self.player.id = self.playerId;
						//self.addEntity(self.player);
						self.resetZone();
						//self.client.sendZone();
						self.mapChanged = true;
						self.mapIndex = id;
						//self.renderer.forceRedraw = true;
						self.camera.setRealCoords({x: x, y: y});

					}
					if (status == 3)
					{
						if ($('#loginwindow').is(':visible') || $('#registerwindow').is(':visible'))
						{
							$('#intro').hide();
							$('#container').css('opacity', '100');
						}
						self.renderer.forceRedraw = true;
						log.info("spawnPlayer - finished");
					}
				});

                //>>excludeStart("prodHost", pragmas.prodHost);
                //>>excludeEnd("prodHost");

                //>>includeStart("prodHost", pragmas.prodHost);
                if(!connecting) {

                    this.client.connect(false,server); // Always use dispatcher in production
                }
                //>>includeEnd("prodHost");

                this.client.onDispatched(function(host, port) {
                    log.debug("Dispatched to game server "+host+ ":"+port);

                    self.client.host = host;
                    self.client.port = port;
                    self.client.connect(); // connect to actual game server
                });

                this.client.onConnected(function() {
                    log.info("Starting client/server handshake");

                    if (action == "changePassword")
                    {
                        self.client.sendNewPassword(self.username, self.userpw, self.newuserpw);
                        return;
                    }

                    // Player
                    self.player = new Player("player", "", this);

                    self.player.moveUp = false;
                    self.player.moveDown = false;
                    self.player.moveLeft = false;
                    self.player.moveRight = false;
                    //self.player.disableNpcTalk = false;
                    self.loadGameData();
                    self.player.name = self.username;
                    self.player.pw = self.userpw;

                    var hashObj = new jsSHA(self.username+self.userpw, "ASCII");
                    log.info("self.hash="+self.hash);
                    log.info("hash="+hashObj.getHash("SHA-1","HEX"));
                    self.player.hash = self.hash || hashObj.getHash("SHA-1","HEX");

                    self.player.pClass = parseInt(self.pClass);
                    self.player.email = self.email;
                    self.started = true;
                    self.ready = true;

                    /*if (self.app.useAPI) {
                    	log.info("sendLoginAPI");
                        self.client.sendAPILogin(self.player);
                    } else {*/
            		switch (action)
            		{
            		case "loadcharacter":
            			log.info("sendLogin");
            			self.client.sendLogin(self.player);
            			//self.loadMap(0);
            			break;
            		case "createcharacter":
            			self.client.sendCreate(self.player);
            			//self.loadMap(0);
            			break;
            		}

                    //}

                    /*setTimeout(function() {
                    		    self.renderer.setZoom();
                    },1000);*/
                    //if (self.renderer.tablet || self.renderer.mobile)
                    //{
                    	/*log.info("Loading Joystick");
					self.joystick = new VirtualJoystick({
						game            : self,
							container	: document.getElementById('canvas'),
						mouseSupport	: true,
						//stationaryBase  : true,
						//baseX : 50 * self.renderer.scale,
						//baseY : $('#container').height() - (60 * self.renderer.scale),

						//limitStickTravel: true,
						//stickRadius: 20 * self.renderer.scale,
					});
			log.info("Joystick Loaded");*/
	            //}
	            	self.joystick = null;

	            	self.gamepad = new GamePad(self);


                });

                this.client.onEntityList(function(list) {
                    var entityIds = _.pluck(self.entities, 'id'),
                        knownIds = _.intersection(entityIds, list),
                        newIds = _.difference(list, knownIds);

                    /*self.obsoleteEntities = _.reject(self.entities, function(entity) {
                        return _.include(knownIds, entity.id) || entity.id === self.player.id;
                    });*/

                    // Ask the server for spawn information about unknown entities
                    if(_.size(newIds) > 0) {
                        self.client.sendWho(newIds);
                    }
                });

                this.client.onLogin(function () {
                	self.client.sendPlainLogin(self.player);
                });

                this.client.onWelcome(function(id, name, mapId, x, y, hp, fatigue,
                                experience,
                                equipmentCount, equipmentSlot, equipmentKind, equipmentNumber, equipmentSkillKind, equipmentSkillLevel, equipmentDurability, equipmentDurabilityMax, equipmentExperience,
                                inventoryCount, inventorySlot, inventoryKind, inventoryNumber, inventorySkillKind, inventorySkillLevel, inventoryDurability, inventoryDurabilityMax, inventoryExperience,
                                bankCount, bankSlot, bankKind, bankNumber, bankSkillKind, bankSkillLevel, bankDurability, bankDurabilityMax, bankExperience,
                                questNumber, questFound, questProgress,
                                skillInstalls,
                                skillShortcuts,
                                doubleExp, expMultiplier, membership, kind, rights, pClass,
                                attackExp, defenseExp, moveExp,
                                armorColor, weaponColor,
                                cards, deck,
                                guildId, guildName,
                                inventoryGold, bankGold,
                                armorSpriteId, weaponSpriteId,
                                stats) {

                    //document.cookie = "hash="+self.player.hash+";user="+name;
                    if ($('#loginsave').is(':checked'))
                    {
                    	localforage.setItem('hash', self.player.hash);
                    	localforage.setItem('usr', name);
                    }

                    log.info("Received player ID from server : "+ id);
                    self.player.id = id;
                    self.playerId = id;
                    //self.addEntity(self.player);

                    //self.mapIndexes[self.playerId] = {file: "house_client.json"};

                    //self.loadGameData();
                    // Always accept name received from the server which will
                    // sanitize and shorten names exceeding the allowed length.
                    self.player.kind = kind;
                    self.player.name = name;
                    //Rights cannot, will not, ever be handling complex types
                    //client sided.
                    self.player.rights = rights;
                    self.player.setClass(parseInt(pClass));
                    self.player.experience = experience;
                    self.player.level = Types.getLevel(experience);
                    self.doubleEXP = doubleExp;
                    self.expMultiplier = expMultiplier;

                    self.player.attackExp = attackExp;
                    self.player.defenseExp = defenseExp;
                    self.player.moveExp = moveExp;

                    self.player.attackLevel = Types.getAttackLevel(attackExp);
                    self.player.defenseLevel = Types.getDefenseLevel(defenseExp);
                    self.player.moveLevel = Types.getMoveLevel(moveExp);
                    self.player.moveSpeed = 300-self.player.moveLevel;
                    self.player.walkSpeed = 300-self.player.moveLevel;

                    //self.player.setGridPosition(x, y);
                    //self.camera.setRealCoords();
                    //self.resetZone();

                    self.player.setMaxHitPoints(hp);
                    self.player.setMaxFatigue(fatigue);

                    self.player.armorSpriteId = armorSpriteId;
                    self.player.weaponSpriteId = weaponSpriteId;

                    var armorName = self.player.getArmorSprite();

                    self.player.setArmorName(armorName);
                    self.player.setSpriteName(armorName);

                    var weaponName = self.player.getWeaponSprite();
                    self.player.setWeaponName(weaponName);

                    var weapon = self.sprites[self.player.getWeaponName()];
                    var weaponLoaded = function () { self.renderer.createWeaponColorCanvas(self.player); }
                    if (weapon && !weapon.isLoaded) weapon.load(weaponLoaded);

                    self.player.armorColor = armorColor;
                    self.player.weaponColor = weaponColor;

                    self.player.stats.strength = stats.strength;
                    self.player.stats.agility = stats.agility;
                    self.player.stats.health = stats.health;
                    self.player.stats.energy = stats.energy;
                    self.player.stats.luck = stats.luck;
                    self.player.stats.free = stats.free;


                    //boots = removeDoubleQuotes(boots);
                    //gloves = removeDoubleQuotes(gloves);
                    //self.player.boots = (boots.toString().replace(/\"/g,'')).split(',');
                    //self.player.gloves = (gloves.toString().replace(/\"/g,'')).split(',');

                    //self.player.weapon = {kind:weaponKind ,point:weaponPoint, skillKind:weaponSkillKind, skillLevel: weaponSkillLevel};
                    //self.player.armor = {kind:armorKind ,point:armorPoint, skillKind:armorSkillKind, skillLevel: armorSkillLevel};

                    self.player.setSprite(self.sprites[armorName]);
                    var armorLoaded = function () { self.renderer.createBodyColorCanvas(self.player); }
                    if (!self.player.sprite.isLoaded)  self.player.sprite.load(armorLoaded);

                    self.app.initPlayerBar();

                    // Card Code.
                    self.player.cards = (cards.toString().replace(/\"/g,'')).split(',');
                    self.player.deck = (deck.toString().replace(/\"/g,'')).split(',');

                    self.cardHandler = new CardHandler(self, self.player);
                    self.cardHandler.showCards();
                    self.cardHandler.showDeck();
                    // End Card Code.

                    self.player.setGuild(new Guild(guildId, guildName));

                    self.player.skillHandler = new SkillHandler(self);
                    self.membership = membership;
                    self.equipmentHandler.initEquipment(equipmentCount, equipmentSlot, equipmentKind, equipmentNumber, equipmentSkillKind, equipmentSkillLevel, equipmentDurability, equipmentDurabilityMax, equipmentExperience);
                    log.info("inventoryCount="+inventoryCount);
                    log.info("inventorySlot="+JSON.stringify(inventorySlot));
                    log.info("inventoryKind="+JSON.stringify(inventoryKind));
                    log.info("inventoryNumber="+JSON.stringify(inventoryNumber));
                    log.info("inventorySkillKind="+JSON.stringify(inventorySkillKind));
                    log.info("inventorySkillLevel="+JSON.stringify(inventorySkillLevel));
                    log.info("inventoryDurability="+JSON.stringify(inventoryDurability));
                    log.info("inventoryDurabilityMax="+JSON.stringify(inventoryDurabilityMax));
                    log.info("inventoryGold="+inventoryGold);

                    self.inventoryHandler.initInventory(inventoryCount, inventorySlot, inventoryKind, inventoryNumber, inventorySkillKind, inventorySkillLevel, inventoryDurability, inventoryDurabilityMax, inventoryExperience, inventoryGold);
                    self.bankHandler.initBank(bankCount, bankSlot, bankKind, bankNumber, bankSkillKind, bankSkillLevel, bankDurability, bankDurabilityMax, bankExperience, bankGold);

                    for(var i=0; i < skillInstalls.length; ++i)
                    {
                    	var skillInstall = skillInstalls[i];
                        self.player.setSkill(skillInstall.name, skillInstall.level, skillInstall.index);
                        self.characterDialog.frame.pages[0].setSkill(skillInstall.name, skillInstall.level);

                    }

                    for(var i=0; i < skillShortcuts.length; ++i)
                    {
                    	var skillShortcut = skillShortcuts[i];
                        if (self.player && self.player.skillHandler)
                        	self.player.skillHandler.install(skillShortcut.index, skillShortcut.name);

                    }

                    //self.initPlayer();
                    self.updateBars();
                    self.updateExpBar();

                    log.info("onWelcome-pClass="+pClass);

                    //log.info("onWelcome - loaded");
                    $playButton = self.app.getPlayButton();
                	self.app.$loginInfo.text("Loading Map..");
                	if (mapId == null) mapId=0;
                	//self.loadMap(mapId);
                	self.teleportMaps(0);

                	self.client.sendDevice(self.renderer.mobile ? 1 : 0, self.renderer.tablet ? 1 : 0);
		    //self.initAnimatedTiles();
		    //self.renderer.renderStaticCanvases();
		    //log.info("self.renderbackground");
		    /*self.renderbackground = true;

    	    	    self.client.sendTeleport(self.player.id, x, y);
    		    //self.makeCharacterTeleportTo(self.player, x, y);
                    self.resetZone();
                    self.updatePlateauMode();
		    self.resetCamera();
                    self.updatePlateauMode();
                    self.camera.setRealCoords();
                    self.audioManager.updateMusic();
                    self.addEntity(self.player);
                    self.enqueueZoningFrom(x, y);
                    //self.renderer.forceRedraw = true;

                    self.player.dirtyRect = self.renderer.getEntityBoundingRect(self.player);*/



                    self.questhandler.initQuest(questFound, questProgress);

                    //Welcome message
                    self.chathandler.show();
                    //self.chathandler.addNotification("Welcome to MaEarth!");

                    /*if (self.doubleEXP) {
                        self.chathandler.addNotification("Double EXP is currently on.");
                    }*/
                    if (self.membership) {
                        self.chathandler.addNotification("You are currently a member");
                    }
                    self.player.onStartPathing(function(path) {
                        var i = path.length - 1,
                            x =  path[i][0],
                            y =  path[i][1];

                        if(self.player.isMovingToLoot()) {
                            self.player.isLootMoving = false;
                        }

                        // Target cursor position
                        if (!self.map.isOutOfBounds(x,y))
                        {
                        	self.selectedX = x;
                        	self.selectedY = y;
                        }

                        self.selectedCellVisible = true;

                        /*if(self.renderer.mobile || self.renderer.tablet) {
                            self.drawTarget = true;
                            self.clearTarget = true;
                            self.renderer.targetRect = self.renderer.getTargetBoundingRect();
                            self.checkOtherDirtyRects(self.renderer.targetRect, null, self.selectedX, self.selectedY);
                        }*/
                    });

                    /*self.player.onCheckAggro(function() {
                        self.forEachMob(function(mob) {
                            if((mob.isAggressive === true) && !mob.isAttacking() && self.player.isNear(mob, mob.aggroRange)) {
                            	if (mob.level * 2 > self.player.level) {
                            		self.player.aggro(mob);
                            	}
                            }
                        });
                    });*/

                    /*
                    self.player.onAggro(function(mob) {
                        if(!mob.isWaitingToAttack(self.player) && !self.player.isAttackedBy(mob)) {
                            if (mob.level * 2 > self.player.level) {
                                self.player.log_info("Aggroed by " + mob.id + " at ("+self.player.gridX+", "+self.player.gridY+")");
                                //self.client.sendAggro(mob);
                                mob.waitToAttack(self.player);
                            }
                        }
                    });*/

                    self.player.onBeforeMove(function() {
                        // TODO - Sometimes isnt called so next zone isnt loaded.
                        if(self.isZoningTile(self.player.gridX, self.player.gridY))
                        {
                            //alert ("called");
                            self.enqueueZoningFrom(self.player.gridX, self.player.gridY);
                            //self.client.sendZone();
                        }
                    });

                    self.player.onBeforeStep(function() {
                        /*var blockingEntity = self.getEntityAt(self.player.nextGridX, self.player.nextGridY);
                        if(blockingEntity && blockingEntity.id !== self.playerId) {
                            log.debug("Blocked by " + blockingEntity.id);
                        }*/
                        self.unregisterEntityPosition(self.player);


                    });

                    self.player.onStep(function() {

                        if(self.player.hasNextStep()) {
                        	//self.player.stoppedTeleport = false;
                            self.registerEntityDualPosition(self.player);
                        }




                        //self.player.forEachAttacker(self.makeAttackerFollow);

                        /*var item = self.getItemAt(self.player.gridX, self.player.gridY);
                         if(item instanceof Item) {
                         self.tryLootingItem(item);
                         }*/

                        //ye se whatrm talken aboot? ah?

                        self.updatePlayerCheckpoint();

                        /*if(!self.player.isDead) {
                            self.audioManager.updateMusic();
                        } */
                        if (self.player.moveLeft ||
                        	self.player.moveRight ||
                        	self.player.moveUp ||
                        	self.player.moveDown)
                        {
							self.client.sendMoveEntity2(
								self.player.id,
								self.mapIndex,
								self.player.gridX,
								self.player.gridY, 2, self.player.orientation,
									(self.player.target) ? self.player.target.id : 0);
						}
                    });

                    self.client.onPVPChange(function(pvpFlag) {
                        self.player.flagPVP(pvpFlag);
                        //self.pvpFlag = pvpFlag;
                    });

                    self.player.onStopPathing(function(x, y) {
                        log.info("onStopPathing");

                        self.renderer.forceRedraw = true;

                    	if (self.player.isDead)
                            return;

                    	/*for (var i=0; i < self.player.pets.length; ++i)
                        {
                        	var pet = self.player.pets[i];
                        	//pet.follow(self.player);
                        }*/

                        if (x==0 && y==0) // Fake move.
                        	return;
                        //if (!self.player.hasNextStep())
                        	self.client.sendMoveEntity2(self.player.id, self.mapIndex, x, y, 2, self.player.orientation,
                        		self.player.target ? self.player.target.id : 0);

                        if(self.player.hasTarget()) {
                            self.player.lookAtTarget();
                        }

                        self.selectedCellVisible = false;

                        if(self.isItemAt(x, y)) {
                            var item = self.getItemAt(x, y);

                            try {
                                self.client.sendLoot(item);
                            } catch(e) {
                                throw e;
                            }
                        }

                        if (self.player.pvpFlag && !self.notifyPVPMessageSent && self.map.index == 1) {
                            self.chathandler.addGameNotification("Notification", "You are currently in a PvP area.");
                            self.notifyPVPMessageSent = true;
                            self.pvpFlag = true;
                        } else {
                            if (!self.player.pvpFlag && self.notifyPVPMessageSent && self.map.index != 1) {
                                self.chathandler.addGameNotification("Notification", "You are no longer in the PvP area.");
                                self.notifyPVPMessageSent = false;
                                self.pvpFlag = false;
                            }
                        }

                        var dest = self.map.getDoor(self.player);
                        if(!self.player.hasTarget() && dest) {
                            // Door Level Requirements.
                            var msg;
                            var notification;
                            if (dest.minLevel && self.player.level < dest.minLevel)
                            {
                            	msg = "I must be Level "+dest.minLevel+" or more to proceed.";
                            	notification = "You must be Level "+dest.minLevel+" or more to proceed.";
				    	              }
                            /*if (dest.maxLevel && self.player.level > dest.maxLevel)
                            {
                            	msg = "I must be Level "+dest.maxLevel+" or less to proceed.";
                            	notification = "You must be Level "+dest.maxLevel+" or less to proceed.";
				    	              }*/
				    	    if (msg)
				    	    {
				    	    	self.createBubble(self.player.id, msg);
				    	    	self.assignBubbleTo(self.player);
				    	    	self.chathandler.addGameNotification("Notification", notification);
				    	    	self.unregisterEntityPosition(self.player);
                        		self.registerEntityPosition(self.player);
				    	    	return;
                            }

                            /*if(dest.quest && !self.questhandler.quests[0].completed) {
                                self.unregisterEntityPosition(self.player);
                                self.registerEntityPosition(self.player);
                                self.chathandler.addGameNotification("Notification", "You must finish the tutorial to proceed.");
                                return;
                            }*/

                            /*if(dest.level > self.player.level) {
                                self.unregisterEntityPosition(self.player);
                                self.registerEntityPosition(self.player);
                                return;
                            }
                            if(dest.admin === 1 && self.player.admin === null) {
                                self.unregisterEntityPosition(self.player);
                                self.registerEntityPosition(self.player);
                                return;
                            }*/

                            /*self.player.setGridPosition(dest.x, dest.y);
                            self.player.nextGridX = dest.x;
                            self.player.nextGridY = dest.y;*/
                            self.player.turnTo(dest.orientation);


                            //self.client.sendTeleport(self.player.id, dest.x, dest.y);
                            // TODO
                            self.teleportMaps(dest.map, dest.x, dest.y);

                            self.player.forEachAttacker(function(attacker) {
                                attacker.disengage();
                                attacker.idle();
                            });

                            self.updatePlateauMode();

                            //if(self.renderer.mobile){
                                // When rendering with dirty rects, clear the whole screen when entering a door.
                                //self.renderer.clearScreen(self.renderer.context);
                            //}

                            if(dest.portal) {
                                self.audioManager.playSound("teleport");
                            }

                            //if(!self.player.isDead) {
                            //    self.audioManager.updateMusic();
                            //}
                            //self.camera.setRealCoords();

                            //self.renderer.drawBackground(self.renderer.background, "#12100D");
                            //self.renderbackground = true;
                            //self.renderer.forceRedraw = true;

				/*for (var i=0; i < self.player.pets.length; ++i)
				{
					var pet = self.player.pets[i];
					pet.path = null;
					pet.setGridPosition(dest.x, dest.y);
				}*/
                        }

                        if(self.player.target instanceof Npc) {
                            self.makeNpcTalk(self.player.target);
                        } else if(self.player.target instanceof Chest) {
                            self.client.sendOpen(self.player.target);
                            self.audioManager.playSound("chest");
                        }

                        /*self.player.forEachAttacker(function(attacker) {
                            if(!attacker.isAdjacentNonDiagonal(self.player)) {
                                attacker.follow(self.player);
                            }
                        });*/

                        self.unregisterEntityPosition(self.player);
                        self.registerEntityPosition(self.player);

                        /*if(!(self.renderer.mobile || self.renderer.tablet) && !(self.player.moveUp || self.player.moveDown || self.player.moveLeft || self.player.moveRight))
                        {
                            self.renderer.forceRedraw = true;
                            //self.chathandler.addToChatLog("FORCE REDRAW");
                        }*/

                    });

                    self.player.onRequestPath(function(x, y) {
                        //var ignored = []; // Always ignore self
                    	var ignored = [self.player]; // Always ignore self
                    	var included = [];

                        if(self.player.hasTarget() && !self.player.target.isDead) {

                            ignored.push(self.player.target);
                        }

                        /*for (var i = 0; i < self.player.pets.length; ++i)
                        {
                        	included.push(self.player.pets[i]);
                        }*/

                        var path = self.findPath(self.player, x, y, ignored);
                        if (path && path.length > 0)
                        {
               				    self.client.sendMovePath(self.mapIndex, self.player,
               				    	path.length,
               				    	path);
				                }

						for(var i = 0; i < self.player.pets.length; ++i)
						{
							var pet = self.player.pets[i];
							if (path && !self.player.hasTarget() && !pet.isMoving())
								pet.go(path[path.length-2][0], path[path.length-2][1]);
						}
                        return path;
                    });

                    self.player.onDeath(function() {
                        log.info(self.playerId + " is dead");
                        clearInterval(self.makePlayerAttackAuto);
                        //self.player.disengage();
                        self.player.skillHandler.clear();
                        self.player.stopBlinking();

                        // FIX - Hack to fix dissappear bug.
                        //self.player.kind = 1;
                        self.player.oldSprite = self.player.getSprite();
                        log.info("oldSprite="+self.player.oldSprite);
                        self.player.setSprite(self.sprites["death"]);

                        self.removePets();

                        self.player.isDead = true;

                        self.player.animate("death", 120, 1, function() {
                            log.info(self.playerId + " was removed");

                            //self.removeEntity(self.player);
                            self.removeFromRenderingGrid(self.player, self.player.gridX, self.player.gridY);

                            //self.player = null;
                            //self.client.disable();

                            setTimeout(function() {
                                self.playerdeath_callback();
                            }, 1000);
                        });

                        self.player.forEachAttacker(function(attacker) {
                            attacker.disengage();
                            attacker.idle();
                        });

                        self.audioManager.fadeOutCurrentMusic();
                        self.audioManager.playSound("death");
                    });

                    self.player.onHasMoved(function(player) {
                        self.initAnimatedTiles();
                        //self.assignBubbleTo(player);
                    });


                    self.player.onArmorLoot(function(armorName) {
                        self.player.switchArmor(armorName, self.sprites[armorName]);
                    });

                    // TODO - Pvp bases
                    self.client.onSpawnPvpBase(function(pvpBase) {
                    	self.addEntity(pvpBase);
                    	pvpBase.setSprite(self.sprites[pvpBase.getSpriteName()]);
                    	pvpBase.setEntityGrid(self.entityGrid);
                    	pvpBase.setPathingGrid(self.pathingGrid);
                    	pvpBase.setAnimation("idle_down", 0);
                    	self.addToRenderingGrid(pvpBase, pvpBase.gridX, pvpBase.gridY);
                        pvpBase.onDestroy(function() {
                            pvpBase.setSprite(self.sprites["death"]);
                            pvpBase.setAnimation("death", 120, 1, function() {
                                log.info(pvpBase.id + " was removed");
                                pvpBase.removeEntity(self.entityGrid);
                                pvpBase.removeFromRenderingGrid(self.renderingGrid);
                                pvpBase.removeFromPathingGrid(self.pathingGrid);
                            });
                        });
                    });

                    self.client.onSpawnHouse(function(house) {
                    	self.addEntity(house);
                    	house.setSprite(self.sprites[house.getSpriteName()]);
                    	house.setEntityGrid(self.entityGrid);
                    	house.setPathingGrid(self.pathingGrid);
                    	house.setAnimation("idle_down", 0);
                    	self.addToRenderingGrid(house, house.gridX, house.gridY);
                        house.onDestroy(function() {
                        	house.removeFromPathingGrid(self.pathingGrid);
                            house.setSprite(self.sprites["death"]);
                            house.setAnimation("death", 120, 1, function() {
                                log.info(house.id + " was removed");
                                house.removeEntity(self.entityGrid);
                                house.removeFromRenderingGrid(self.renderingGrid);

                            });
                        });
                    });

                    self.client.onSpawnItem(function(item, x, y) {
                        log.info("Spawned " + ItemTypes.KindData[item.kind].name + " (" + item.id + ") at "+x+", "+y);
                        self.addItem(item, x, y);
                        self.removeFromPathingGrid(x,y);
                    });

                    self.client.onSpawnChest(function(chest, x, y) {
                        log.info("Spawned chest (" + chest.id + ") at "+x+", "+y);
                        chest.setSprite(self.sprites[chest.getSpriteName()]);
                        chest.setGridPosition(x, y);
                        chest.setAnimation("idle_down", 150);
                        self.addEntity(chest, x, y);

                        chest.onOpen(function() {
                            chest.stopBlinking();
                            chest.setSprite(self.sprites["death"]);
                            chest.setAnimation("death", 120, 1, function() {
                                log.info(chest.id + " was removed");
                                self.removeEntity(chest);
                                self.removeFromRenderingGrid(chest, chest.gridX, chest.gridY);
                                self.previousClickPosition = {};
                                self.player.removeTarget();
                            });
                        });
                    });

                    self.client.onSpawnCharacter(function(map, entity, x, y, orientation, targetId, playerId, flags) {
                        var flagArray;
                    	if (flags)
                    		flagArray = flags.toString().split(",");
                    	if(entity && !self.entityIdExists(entity.id) || entity.isDead) {
                            try {
                                if(entity.id !== self.playerId) {
                                    //entity.map = map;
                                    //log.info("self.map="+self.mapIndex+",entity.map="+entity.map);
                                    //if (self.mapIndex != entity.map)
                                    //		return;

                                    var spriteName;
					if (entity instanceof Mob)
					{
						spriteName = entity.getMobSpriteName();
						entity.setSprite(self.sprites[spriteName]);
					}
					else if (entity instanceof Player)
					{
						var armorName = entity.getArmorSprite();
						spriteName = armorName;
						entity.setArmorName(armorName);
						entity.setSpriteName(armorName);

						var weaponName = entity.getWeaponSprite();
						entity.setWeaponName(weaponName);

						var weapon = self.sprites[entity.getWeaponName()];

						var weaponLoaded = function () { self.renderer.createWeaponColorCanvas(entity); }
						if (weapon && !weapon.isLoaded) weapon.load(weaponLoaded);

					        entity.setSprite(self.sprites[spriteName]);
					        self.renderer.createBodyColorCanvas(entity);
					}
					else
					{
						spriteName = entity.getSpriteName();
						entity.setSprite(self.sprites[spriteName]);
					}

					entity.setGridPosition(x, y);
                                    	entity.setOrientation(orientation);
                                    	entity.idle();



                                    self.addEntity(entity);
                                    self.registerEntityPosition(entity);

                                    if (entity instanceof Gather) {
										entity.setEntityGrid(self.entityGrid);
										entity.setPathingGrid(self.pathingGrid);
                                    	entity.onDeath(function() {
                                            entity.removeEntity(self.entityGrid);
                                            entity.removeFromPathingGrid(self.pathingGrid);
                                            entity.removeFromRenderingGrid(self.renderingGrid);
                                    	});
                                    	return;
                                    }

                                    var entityName;
                                    if (entity instanceof Mob)
                                    	entityName = MobData.Kinds[entity.kind].name;
                                    else if (entity instanceof Npc)
                                    	entityName = NpcData.Kinds[entity.kind].name;
                                    else if (entity instanceof Item)
                                    	entityName = ItemTypes.KindData[entity.kind].name;
                                    else
                                    	entityName = entity.name;
                                    log.debug("Spawned " + entityName + " (" + entity.id + ") at "+entity.gridX+", "+entity.gridY);

                                    if (entity instanceof Mob && !(entity instanceof Pet))
                                    {
                                    		if (flagArray)
                                    		{
                                    			//entity.setSpawnPoint(x, y);
                                    			entity.flags.isCashedUp = (flagArray[0] == 1);
                                    		}
                                    }
                                    if (entity instanceof Pet) {
                                    	log.info("playerId="+playerId);
                                    	var player = self.getEntityById(entity.playerId);
                                    	if (player && player == self.player)
                                    	{
                                    		player.pets.push(entity);
                                    		entity.moveSpeed = player.moveSpeed;
                                    	}
                                    }

                                    if(entity instanceof Character || entity instanceof Pet) {
					    //self.entity.onStartPathing(function(path) {
						//self.unregisterEntityPosition(entity);
					    //});

                                    	entity.onBeforeStep(function() {
                                            self.unregisterEntityPosition(entity);
                                            //log.info("unreg x:"+entity.gridX+",y:"+entity.gridY);
                                        });

                                        entity.onStep(function() {
                                            if(!entity.isDying && !entity.isDead) {
                                            	if (!entity instanceof Player)
                                            		self.registerEntityDualPosition(entity);

                                                entity.forEachAttacker(function(attacker) {
                                                    // TODO - Taken from Server.

                                                    if(attacker.isAdjacent(attacker.target)) {
                                                        attacker.lookAtTarget2(attacker.target);
                                                    } //else {
                                                        //attacker.follow(entity);
                                                    //}
                                                });
                                                //if (entity instanceof Player)
                                                //{
                                                self.registerEntityPosition(entity);
                                                //}
                                                /*if (entity instanceof Mob && entity.target)
                                                {
                                                     //log.info("distance_from_home="+entity.distanceToSpawningPoint(entity.gridX, entity.gridY));
						    if (entity.distanceToSpawningPoint(entity.gridX, entity.gridY) >= 20) {
							//alert("too far from home.");
						    	entity.clearTarget();
							entity.forgetEveryone();
							self.player.removeAttacker(entity);
							self.makeCharacterGoTo(entity, entity.spawningX, entity.spawningY);
						    }
                                                }*/

					    }


                                        });

                                        entity.onStopPathing(function(x, y) {


                                            if(entity.isDying || entity.isDead) {
                                            	self.unregisterEntityPosition(entity);
                                            }
                                            else
                                            {

                                                if(entity.hasTarget() && entity.isAdjacent(entity.target)) {
                                                    entity.lookAtTarget();
                                                }

                                                /*entity.forEachAttacker(function(attacker) {
                                                    if(!attacker.isAdjacentNonDiagonal(entity) && attacker.id !== self.playerId) {
                                                        attacker.follow(entity);
                                                    }
                                                });*/

                                                self.unregisterEntityPosition(entity);
                                                //entity.setGridPosition(x,y);
                                                self.registerEntityPosition(entity);
                                                if (entity instanceof Pet && self.player.id == entity.playerId)
                                            	    self.client.sendMoveEntity2(entity.id, self.mapIndex, x, y, 2, entity.orientation,
                                            	    	entity.target ? entity.target.id : 0);
                                            }
                                        });

                                        entity.onRequestPath(function(x, y) {
                                            //if (path) return;

                                            var include = [];
                                            var ignored = [entity], // Always ignore self
                                                ignoreTarget = function(target) {
                                                    ignored.push(target);

                                                    // also ignore other attackers of the target entity
                                                    /*if (!target instanceof PvpBase || !target instanceof House)
                                                    {
														target.forEachAttacker(function(attacker) {
															ignored.push(attacker);
														});
                                                    }*/
                                                };


                                            if(entity.hasTarget()) {
                                                ignoreTarget(entity.target);
                                            } else if(entity.previousTarget) {
                                                // If repositioning before attacking again, ignore previous target
                                                // See: tryMovingToADifferentTile()
                                                ignoreTarget(entity.previousTarget);
                                            }

                                            if (entity instanceof Pet)
                                            {
                                            	if (entity.hasTarget())
                                            		include.push(self.player);
                                            	else
                                            		ignoreTarget(self.player);
                                            }


                               			    /*if (target && target.pets)
											{
												var targetPetLength = target.pets.length;
												if (targetPetLength > 1)
												{
													for (var i = 0; i < targetPetLength; ++i )
													{
														ignored.push(target.pets[i]);
													}
												}
											}*/
											//if (entity instanceof Mob)
											//	ignored = [];
											/*for(var id in ignored)
											{
												var ig = ignored[id];
												//log.info("path.ignored=["+ig.gridX+","+ig.gridY+"]");
											}*/
                                            var path = self.findPath(entity, x, y, ignored, include);
                                            if (path)
                                            {
                                                if (entity instanceof Pet && self.player.id == entity.playerId)
                                            	    self.client.sendMoveEntity2(entity.id, self.mapIndex, x, y, 1, entity.orientation,
                                            	    	entity.target ? entity.target.id : 0);
                                            	self.registerEntityPosition(entity);
                                            	//log.info("path.path="+JSON.stringify(path));
                                            }
                                            return path;
                                        });

                                        entity.onDeath(function(blood) {
                                            log.info(entity.id + " is dead");


                                            if(entity instanceof Mob) {
                                                // Keep track of where mobs die in order to spawn their dropped items
                                                // at the right position later.
                                                //self.deathpositions[entity.id] = {x: entity.gridX, y: entity.gridY};
                                                self.enqueueZoningFrom(entity.gridX, entity.gridY);
                                            }

                                            entity.isDying = true;
                                            entity.setSprite(self.sprites["death"]);
                                            //if (blood)
                                            //	self.renderer.createBloodSpray(entity,5);
                                            entity.animate("death", 256, 1);
                                            setTimeout(function() {
                                                log.info(entity.id + " was removed");
                                                self.removeFromRenderingGrid(entity, entity.gridX, entity.gridY);
                                                //self.unregisterEntityPosition(entity);
                                                self.removeFromPathingGrid(entity.gridX, entity.gridY);

                                                //if (entity.id > 0)
                                                //	SendNative(["onDeath", entity.id]);
                                                self.removeEntity(entity);
                                            },256);

                                            entity.forEachAttacker(function(attacker) {
                                                attacker.disengage();
                                            });

                                            if(self.player.target && self.player.target.id === entity.id) {
                                                self.player.disengage();
                                            }

                                            // Upon death, this entity is removed from both grids, allowing the player
                                            // to click very fast in order to loot the dropped item and not be blocked.
                                            // The entity is completely removed only after the death animation has ended.
                                            self.removeFromEntityGrid(entity, entity.gridX, entity.gridY);
                                            self.unregisterEntityPosition(entity);
                                            self.removeFromPathingGrid(entity.gridX, entity.gridY);

                                            if(self.camera.isVisible(entity) && blood) {
                                                self.audioManager.playSound("kill"+Math.floor(Math.random()*2+1));
                                            }

                                            if (entity instanceof Player)
                                            {
												for(var i=0; i < entity.pets.length; ++i)
												{
													var pet = entity.pets[i];
													self.removeFromRenderingGrid(pet, pet.gridX, pet.gridY);
													self.removeFromPathingGrid(pet.gridX, pet.gridY);
													self.removeFromEntityGrid(pet, pet.gridX, pet.gridY);
												}
											}
                                            self.updateCursor();
                                        });

                                        entity.onHasMoved(function(entity) {
                                            //self.assignBubbleTo(entity); // Make chat bubbles follow moving entities

                                        });

                                        if(entity instanceof Mob) {
                                            if(targetId) {
                                                var player = self.getEntityById(targetId);
                                                if(player && player.target != entity) {
                                                    self.createAttackLink(entity, player);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            catch(e) {
                                log.error(e);
                            }
                        }
                    });

                    self.client.onDespawnEntity(function(entityId, x, y, mapIndex, blood) {
                        if (self.mapIndex != mapIndex)
                        	return;

                    	var entity = self.getEntityById(entityId);
                        if(entity) {
							var entityName;

							if (entity instanceof PvpBase || entity instanceof House)
							{
								entity.destroy();
								return;
							}
							if (entity instanceof Mob)
							entityName = MobData.Kinds[entity.kind].name;
							else if (entity instanceof Npc)
							entityName = NpcData.Kinds[entity.kind].name;
							else if (entity instanceof Item)
							{
							entityName = ItemTypes.KindData[entity.kind].name;
							}
							log.debug("Despawned " + entityName + " (" + entity.id + ") at "+entity.gridX+", "+entity.gridY);

							if(entity.gridX === self.previousClickPosition.x
                                && entity.gridY === self.previousClickPosition.y) {
                                self.previousClickPosition = {};
                            }

                            if(entity instanceof Item) {
                                self.removeItem(entity);
                            } else if(entity instanceof Character) {
                                entity.die(blood);
                            } else if(entity instanceof Chest) {
                                entity.open();
                            } else if (entity instanceof Gather) {
                            	entity.die(0);
                            }

                            entity.clean();
                            self.removeFromEntityGrid(entity, x, y);
                            self.removeFromPathingGrid(x, y);
		                    self.removeFromRenderingGrid(entity, x, y);

                            self.unregisterEntityPosition(entity);

                        }
                    });

                    self.client.onItemBlink(function(id) {
                        var item = self.getEntityById(id);

                        if(item) {

                            item.blink(150);
                        }
                    });

                    self.client.onEntityMove(function(map, id, x, y, o, targetid) {
                        var entity = null;

                        //if (self.player.isDead == true) {
                        //	return;
                        //}

                        if(id !== self.playerId) {
                            var entity = self.getEntityById(id);
                            var target = self.getEntityById(targetid);

                            if (!entity)
                            	self.unknownEntities.push(id);
                            if (!target)
                            	self.unknownEntities.push(targetid);

                            if (entity && target)
                            {
                            	entity.setTarget(target);
                            }
                            if(entity && !entity.isDying && !entity.isDead) {
                                /*if (entity.gridX == x && entity.gridY == y)
                                {
                                	return;
                                }*/
                                if(self.player && self.player.isAttackedBy(entity)) {
                                    this.playerIsAttacked = true;
                                }

                                if (entity instanceof Pet && entity.playerId == self.player.id)
                                {
                                	return;
                                }
                                //entity.disengage();
                                //entity.idle();

                                entity.setOrientation(o);

                               	if (target)
                               	{
                               		entity.setTarget(target);
                               	}

                               	// Works pretty good now.
                                if (self.player && (Math.abs(self.player.gridX - entity.gridX) > self.moveEntityThreshold &&
                                	Math.abs(self.player.gridY - entity.gridY) > self.moveEntityThreshold) &&
                                    (Math.abs(self.player.gridX - x) >= self.moveEntityThreshold &&
                                	Math.abs(self.player.gridY - y) >= self.moveEntityThreshold))
                                {
                                	self.unregisterEntityPosition(entity);
                                	entity.setGridPosition(x, y);
                                	self.registerEntityPosition(entity);
                                	entity.updateCharacter = false;
                                }
                                else
                                {
                                	self.makeCharacterGoTo(entity, x, y);
                                	entity.updateCharacter = true;
                                }
                            }
                        }
                    });


                    self.client.onEntityMovePath(function(map, id, o, path, moveSpeed, date) {
                        var entity = null;

                        if(id !== self.playerId) {
                            entity = self.getEntityById(id);

                            if (!entity)
                            	self.unknownEntities.push(id);

                            if(entity && !entity.isDying && !entity.isDead) {
                                //entity.setOrientation(o);

                                if (self.player && (Math.abs(self.player.gridX - entity.gridX) > self.moveEntityThreshold &&
                                	Math.abs(self.player.gridY - entity.gridY) > self.moveEntityThreshold) &&
                                    (Math.abs(self.player.gridX - x) >= self.moveEntityThreshold &&
                                	Math.abs(self.player.gridY - y) >= self.moveEntityThreshold))
                                {
                                	self.unregisterEntityPosition(entity);

                                  setTimeout(function() {
                                    entity.setGridPosition(path[path.length-1][0], path[path.length-1][1]);
                                    self.registerEntityPosition(entity);
                                  }, moveSpeed * path.length);

                                	entity.updateCharacter = false;
                                }
                                else
                                {
                                  var dateAdjust = Date.now() - date;

                                  var posXY = ~~(dateAdjust / moveSpeed);
                                  var gridXY = ~~(dateAdjust / moveSpeed * 16) / 16;

                                  //entity.setPosition(path[posXY][0], path[XY][1]);
                                  entity.setGridPosition(path[gridXY][0], path[gridXY][1]);
                                  //subpath = entity.path.slice(gridXY);

                                  entity.path = path;
                                	entity.step = gridXY;

                                	entity.lookAt(path[1][0], path[1][1]);
                                  //entity.go(path[path.length-1][0], path[path.length-1][1]);
                                  entity.updateCharacter = true;
                                }
                            }
                        }
                    });


                    self.client.onEntityDestroy(function(id) {
                        var entity = self.getEntityById(id);
                        if(entity) {
                            if(entity instanceof Item) {
                                self.removeItem(entity);
                            } else {
                                self.removeEntity(entity);
                            }
                            log.debug("Entity was destroyed: "+entity.id);
                        }
                    });

                    self.client.onPlayerMoveToItem(function(map, playerId, itemId) {
                        var player, item;

                        if(playerId !== self.playerId) {
                            player = self.getEntityById(playerId);
                            item = self.getEntityById(itemId);

                            if(player && item) {
                                self.makeCharacterGoTo(player, item.gridX, item.gridY);
                            }
                        }
                    });

                    self.client.onEntityAttack(function(attackerId, targetId) {
                        var attacker = self.getEntityById(parseInt(attackerId)),
                            target = self.getEntityById(parseInt(targetId));

                        log.info("onEntityAttack = target.id:"+targetId);

                        if (attacker && target && !attacker.isMoving() && attacker.canReach(target)) {
                          attacker.setTarget(target);
                          attacker.lookAtTarget();
                          attacker.hit();
                        }
                        if (attacker && target && attacker.isMoving() && !attacker.attackInterval)
                        {
                          attacker.attackInterval = setInterval(function() {
                            if (attacker && target && !attacker.target && !attacker.isMoving() && attacker.canReach(target)) {
                              attacker.hit();
                              clearInterval(attacker.attackInterval);
                            }
                          }, 128);
                        }

                       if (attacker instanceof Player && target instanceof Player)
                       	       return;

                       if(attacker && target && attacker.id !== self.playerId) {
                            log.debug(attacker.id + " attacks " + target.id);

                            //setTimeout(function() {
                                if (attacker && target && attacker.id !== self.playerId &&
                                    /*!attacker.isMoving() &&*/ attacker.target !== target && !target instanceof House)
                                {
                                	self.createAttackLink(attacker,target);
                                }
                            //},128);
                       }

                    });

                    self.client.onPlayerDamageMob(function(playerId, mobId, points, healthPoints, maxHp, crit) {
                        var player = self.getEntityById(playerId);
                        var mob = self.getEntityById(mobId);

                        if(mob && points >= 0) {
                            if (player)
                            	player.hit();
                            log.info("crit="+crit);
                            var x,y;
                            if (mob instanceof PvpBase)
                            {
                            	x = mob.x + (16 * self.renderer.scale);
                            	y = mob.y;
                            }
                            else
                            {
                            	//self.renderer.createBloodSpray(mob);
                            	x = mob.x;
                            	y = mob.y;
                            }
				if (crit > 0)

						self.infoManager.addDamageInfo(points, x, y - 15, "crit", 1500, crit);
				else
				{
					if (points == 0)
					{
						self.infoManager.addDamageInfo("miss", x, y - 15, "inflicted", 1500);
					}
					else
					{
						self.infoManager.addDamageInfo(points, x, y - 15, "inflicted", 1500);
					}
				}

                        }
                        if(player && player.hasTarget() && player == self.player){
                            self.updateTarget(mobId, points, healthPoints, maxHp);
                        }


                    });

                    self.client.onPlayerKillMob(function(id, level, exp) {
                    	if (exp > 0)
                    	{
                    		self.infoManager.addDamageInfo("+"+exp+" exp", self.player.x, self.player.y - 15, "exp", 3000);
                    		self.player.level = level;
                    		self.player.experience += exp;
                    		self.updateExpBar();

                    		//self.infoManager.addDamageInfo("+"+mobExp+" exp", self.player.x, self.player.y - 15, "exp", 3000);

                    		var expInThisLevel = self.player.experience - Types.expForLevel[self.player.level-1];
                    		var expForLevelUp = Types.expForLevel[self.player.level] - Types.expForLevel[self.player.level-1];
                    		var expPercentThisLevel = (100*expInThisLevel/expForLevelUp);
                        }
                    });

                    self.client.onPlayerLevelUp(function(type, level, exp) {
                        if (type==1 && self.player.level != level) {
                            self.infoManager.addDamageInfo("Congrats Level " + level, self.player.x, self.player.y - 15, "majorlevel", 5000);
                            self.player.level = level;
                            return;
                        }
                    	if (type==2 && self.player.attackLevel != level) {
                    		self.infoManager.addDamageInfo("Attack Level " + level, self.player.x, self.player.y - 15, "level", 5000);
                    		self.player.attackLevel = level;
                    		return;
                    	}
                    	if (type==3 && self.player.defenseLevel != level) {
                    		self.infoManager.addDamageInfo("Defense Level " + level, self.player.x, self.player.y - 15, "level", 5000);
                    		self.player.defenseLevel = level;
                    		return;
                    	}
                    	if (type==4 && self.player.moveLevel != level) {
                    		self.infoManager.addDamageInfo("Move Level " + level, self.player.x, self.player.y - 15, "level", 5000);
                    		self.player.moveLevel = level;
                    		self.player.moveSpeed = 350-(self.player.moveLevel*2);
                    		self.player.walkSpeed = 350-(self.player.moveLevel*2);
                    		return;
                    	}
                    	if (type >= 10) {
                    		self.infoManager.addDamageInfo("Pet Level " + level, self.player.x, self.player.y - 15, "level", 5000);
                    	}
                    });

                    self.client.onPlayerItemLevelUp(function(type, level, exp) {
                    	if (type == 0)
                    		self.infoManager.addDamageInfo("Armor Level " + level, self.player.x, self.player.y - 15, "level", 5000);
                    	else if (type == 1)
                    		self.infoManager.addDamageInfo("Weapon Level " + level, self.player.x, self.player.y - 15, "level", 5000);
                    });

                    self.client.onWanted(function (id, isWanted) {
                        var player = self.getEntityById(id);
                        if(player && (player instanceof Player)) {
                            player.isWanted = isWanted;
                        }
                    });

                    self.client.onBank(function (bankNumber, itemKind, itemNumber,
                    	itemSkillKind, itemSkillLevel, itemDurability, itemDurabilityMax, itemExperience)
                    {
                    	//alert("onBank - bankNumber="+bankNumber+",itemKind="+itemKind);
                        self.bankHandler.setBank(bankNumber, itemKind, itemNumber, itemSkillKind, itemSkillLevel, itemDurability, itemDurabilityMax, itemExperience);
                        self.bankDialog.bankFrame.open();
                    });

                    self.client.onBankGold(function (bankGold) {
                    	self.bankHandler.setGold(bankGold);
                    });

                    self.client.onPartyInvite(function (id) {
                    		var player = self.getEntityById(id);
                    		self.socialHandler.inviteParty(player);
                    });

                    self.client.onPlayerChangeHealth(function(id, points, isRegen) {
                        var player = self.getEntityById(id),
                            diff,
                            isHurt;

                        if(player && !player.isDead) {
                            isHurt = points <= player.hitPoints;
                            diff = points - player.hitPoints;
                            player.hitPoints = points;

                            self.updateBars();
                            if(player.hitPoints <= 0) {
                                player.die();
                                //self.renderer.createBloodSpray(player,10);

                                return;
                            }
                            if(isHurt) {
                            	//self.renderer.createBloodSpray(player);
                                //player.hurt();
                                self.infoManager.addDamageInfo(diff, player.x, player.y - 15, "received");
                                self.audioManager.playSound("hurt");


                                if(self.playerhurt_callback) {
                                    self.playerhurt_callback();
                                }
                            } else if(!isRegen){
                                self.infoManager.addDamageInfo("+"+diff, player.x, player.y - 15, "healed");
                            }

                            // If they have healing Items then auto use them.
                            if (self.useAutoPotion != 0 && player.hitPoints < (player.maxHitPoints * 0.2)) {
                            	    var potions = [
                            	    	    401,
                            	    	    36
                            	    ];

                            	    var slot;
                            	    for(var i=0; i < potions.length; ++i)
                            	    {
                            	    	    slot = self.inventoryHandler.getItemInventorSlotByKind(potions[i]);
                            	    	    if (slot >= 0)
                            	    	    	    self.eat(slot);
                            	    }
                            }

                            self.updateBars();
                        }
                    });

                    self.client.onPlayerChangeMaxHitPoints(function(hp, mana) {
                        self.player.maxHitPoints = hp;
                        self.player.hitPoints = hp;
                        self.player.mana = mana;
                        self.player.maxMana = mana;
                        self.updateBars();
                    });

                    /*
                    self.client.onPlayerEquipItem(function(playerId, slot, itemKind, itemPoint, skillKind, skillLevel) {
                        var player = self.getEntityById(playerId);

                        if (player)
                        {
				//alert("itemPoint:"+itemPoint);
				var itemName;
				if (slot==1 && itemKind==0) { // Unequip Weapon
					//player.setAtkRange(1);
					//player.kind = 1;
					//player.setWeaponName(null);
					//player.weapon = {kind: 0, point: 0, skillKind: 0, skillLevel: 0};
					//self.changeWeaponColor();
					self.app.initPlayerBar();
					return;
				}
				else if (slot==0 && itemKind==0) { // Unequip Armor
				{
					//player.switchArmor('clotharmor', self.sprites['clotharmor']);
					//player.armor = {kind: 0, point: 0, skillKind: 0, skillLevel: 0};
					//self.changeArmorColor();
					self.app.initPlayerBar();
					return;
				}
				else if (itemKind == -3) // Unequip Boots
				{
					player.boots = 0;
					return;
				}
				else if (itemKind == -4) // Unequip Gloves
				{
					player.gloves = 0;
					return;
				}

			}
                        itemName = ItemTypes.KindData[itemKind].name;

                        if(player) {
                            if(ItemTypes.isArmor(itemKind) || ItemTypes.isArcherArmor(itemKind)) {

                            	//player.switchArmor(itemName, self.sprites[itemName]);
                                player.armor = {kind: itemKind, point: itemPoint, skillKind: skillKind, skillLevel: skillLevel};
                                if(self.player.id === player.id){
                                    self.audioManager.playSound("loot");
                                }
                                //player.setArmorName(itemName);
                                //self.changeArmorColor();
                                //self.app.initPlayerBar();
                            } else if(ItemTypes.isWeapon(itemKind) || ItemTypes.isArcherWeapon(itemKind)) {

                            	//player.switchWeapon(itemName, self.sprites[itemName]);
                            	player.weapon = {kind: itemKind, point: itemPoint, skillKind: skillKind, skillLevel: skillLevel};
                                if(self.player.id === player.id){
                                    self.audioManager.playSound("loot");
                                }
                                //player.setWeaponName(itemName);
                                //self.changeWeaponColor();
                                //self.app.initPlayerBar();
                            } else if(ItemTypes.isBenef(itemKind)){
                                player.setBenef(itemKind);
                                if(self.player.id === player.id){

                                    self.audioManager.playSound("firefox");
                                }
                            } else if(ItemTypes.isConsumableItem(itemKind)){
                                player.setConsumable(itemKind);
                            } else if (ItemTypes.isClothes(itemKind)) {
                            	player[ItemTypes.KindData[itemKind].type] = [itemKind,itemPoint,skillKind,skillLevel];
                            	// TODO
                                if(self.player.id === player.id){
                                    self.audioManager.playSound("loot");
                                }
                            }
                        }
                        //SendNative(["updateInventory"].concat(self.inventoryHandler.inventoryDisplay));
                    });
                    */

                    self.client.onPlayerTeleport(function(id, x, y) {
                        var entity = null,
                            currentOrientation;

                        //log.info ("id: "+id+",self.player,id: "+self.player.id);
                        if(id !== self.playerId) {
                            entity = self.getEntityById(id);
                            //log.info("teleport-entityId="+entity.id);
                            if(entity) {
                            	    log.info("UNREGISTERED ENTITY POS");
                                currentOrientation = entity.orientation;

                                self.removeFromRenderingGrid(entity, entity.gridX, entity.gridY);
                                log.info("entity.gridX, entity.gridY="+entity.gridX+","+entity.gridY);

                                self.unregisterEntityPosition(entity);
                                if (entity.isMoving()) entity.forceStop();
                                entity.setGridPosition(x, y);

                                self.registerEntityPosition(entity);
                                //entity.setOrientation(currentOrientation);
                                //entity.setGridPosition(x,y);

                                entity.forEachAttacker(function(attacker) {
                                    attacker.disengage();
                                    attacker.idle();
                                    attacker.stop();
                                });

                                //self.removeEntity(entity);updatecursorlogic
                            }
                        }
                    });


                    self.client.onDropItem(function(item, mobId, x, y) {
                        //alert(JSON.stringify(item));
                        //var pos = self.getDeadMobPosition(mobId);
                        //log.info("pos="+pos.x+","+pos.y);
                        //alert("x:"+x+",y:"+y);
                        //if(pos) {
                            self.addItem(item, x, y);
                            self.updateCursor();
                            self.removeFromPathingGrid(x,y);
                        //}
                    });

                    self.client.onChatMessage(function(entityId, message) {
                    	if(!self.chathandler.processReceiveMessage(entityId, message)){
                            var entity = self.getEntityById(entityId);
                            if (entity)
                            {
                            	self.createBubble(entityId, message);
                            	self.assignBubbleTo(entity);
                            	self.chathandler.addNormalChat(entity, message);
                            }
                        }
                        self.audioManager.playSound("chat");
                    });

                    self.client.onPopulationChange(function(worldPlayers, totalPlayers) {
                        if(self.nbplayers_callback) {
                            self.nbplayers_callback(worldPlayers, totalPlayers);
                        }
                    });

                    self.client.onDisconnected(function(message) {
                        if(self.player) {
                            self.player.die();
                        }
                        if(self.disconnect_callback) {
                            self.disconnect_callback(message);
                        }
                        for(var index = 0; index < self.dialogs.length; index++) {
                            self.dialogs[index].hide();
                        }
                    });
                    self.client.onQuest(function(data){
                        self.questhandler.handleQuest(data);
                    });

                    self.client.onInventory(function(inventoryNumber, itemKind, itemNumber, itemSkillKind, itemSkillLevel, itemDurability, itemDurabilityMax, itemExperience){
                        self.inventoryHandler.setInventory(inventoryNumber, itemKind, itemNumber, itemSkillKind, itemSkillLevel, itemDurability, itemDurabilityMax, itemExperience);
                        if(itemKind === null){
                            self.inventoryHandler.makeEmptyInventory(inventoryNumber);
                        }
                        if (self.bankDialog.visible)
                        	self.bankDialog.inventoryFrame.open();
                    });

                    self.client.onEquipment(function(index, itemKind, itemNumber, itemSkillKind, itemSkillLevel, itemDurability, itemDurabilityMax, itemExperience){
                    	self.equipmentHandler.setEquipment(index, itemKind, itemNumber, itemSkillKind, itemSkillLevel, itemDurability,itemDurabilityMax, itemExperience);
						self.inventoryHandler.refreshEquipment();
                        /*switch(index)
                        {
                        case 0:
                        	self.player.weapon = {kind:itemKind ,point:itemNumber, skillKind:itemSkillKind, skillLevel: itemSkillLevel};
                        	break;
                        case 1:
                        	self.player.armor = {kind:itemKind ,point:itemNumber, skillKind:itemSkillKind, skillLevel: itemSkillLevel};
                        	break;
                        } */
                        //if (self.enchantDialog.visible)
                        	//self.enchantDialog.inventoryFrame.open();
                    });

                    self.client.onTalkToNPC(function(npcKind, questId, isCompleted){
                        var npc = self.getEntityByKind(npcKind);
                        if (isCompleted)
                        {
				var quest = self.questhandler.getNPCQuest(questId);
				var msg = npc.talk(quest, true);
				if(msg) {
				    self.createBubble(npc.id, msg);
				    self.assignBubbleTo(npc);
				    self.audioManager.playSound("npc");
				    setTimeout(function () {
				        self.destroyBubble(npc.id);
				        self.audioManager.playSound("npc-end");
				    },5000);
				}
				//} else {

				//    self.destroyBubble(npc.id);
				//    self.audioManager.playSound("npc-end");
				//}

			}
                    });

                    // TODO
                    self.client.onNotify(function(msg){
                    	if (msg.indexOf("NOTICE") == 0)
                    	{
                    		self.renderer.pushAnnouncement(msg.substr(6),30000);
                    	}
                    	else
                    		self.showNotification(msg);
                    });

                    self.client.onCharacterInfo(function(datas) {
                        self.characterDialog.update(datas);
                    });

                    self.client.onStatInfo(function(datas) {
                    	var stats = {
                    		strength: datas[0],
                    		agility: datas[1],
                    		health: datas[2],
                    		energy: datas[3],
                    		luck: datas[4],
                    		free: datas[5],
                    	};
                        self.characterDialog.frame.pages[1].refreshStats(stats);
                    });

                    /*
                    self.client.onRanking(function(message){
                        self.rankingHandler.handleRanking(message);
                    });
                    */

                    self.client.onParty(function (members) {
                        self.socialHandler.setPartyMembers(members);
                    });

                    self.client.onHealthEnergy(function(health, healthMax, fatigue, maxFatigue) {
                        self.player.hitPoints = health;
                        self.player.maxHitPoints = healthMax;
                   		self.player.fatigue = fatigue;
                        self.player.maxFatigue = maxFatigue;
                        self.updateBars();
                    });

                    self.client.onShop(function(message){
                    });

                    self.client.onAuction(function(message){
                        var type = message[0];
                        var itemCount = message[1];

                        if (!itemCount || itemCount == 0) {
                        	if (type >= 2)
                        	{
                        		self.auctionDialog.storeFrame.pages[type-1].items=null;
                        		self.auctionDialog.storeFrame.pages[type-1].reload();
                        	}
                        	else
                        	{
                        		self.auctionDialog.storeFrame.pages[0].items=null;
                        		self.auctionDialog.storeFrame.pages[0].reload();
                        	}
                        	return;
                        }

                        var itemData = [];
                        for (var i = 0; i < itemCount; ++i)
                        {
                            itemData.push({
                                index: message[2+(i*10)],
                                kind: message[3+(i*10)],
                                player: message[4+(i*10)],
                                count: message[5+(i*10)],
                                skillKind: message[6+(i*10)],
                                skillLevel: message[7+(i*10)],
                                durability: message[8+(i*10)],
                                durabilityMax: message[9+(i*10)],
                                experience: message[10+(i*10)],
                                buy: message[11+(i*10)]
                            });
                        }
                        if (itemData.length > 0 && type >= 2)
                        {
                        	//log.info(JSON.stringify(itemData));
                        	self.auctionDialog.storeFrame.pages[type-1].setItems(itemData);
                        	self.auctionDialog.storeFrame.pages[type-1].reload();
                        }
                        else
                        {
                        	self.auctionDialog.storeFrame.pages[0].setItems(itemData);
                        	self.auctionDialog.storeFrame.pages[0].reload();
                        }
                    });

                    self.client.onSkill(function(message){
                    });

                    self.client.onSkillInstall(function(datas) {
                        if (self.player && self.player.skillHandler)
                        	self.player.skillHandler.install(datas[0], datas[1]);
                    });

                    self.client.onSkillLoad(function(datas) {
                        var skillIndex = datas[0];
                        var skillName = datas[1];
                        var skillLevel = datas[2];

                        self.player.setSkill(skillName, skillLevel, skillIndex);
                        self.characterDialog.frame.pages[0].setSkill(skillName, skillLevel);

                    });

                    self.client.onClassSwitch(function (pClass) {
                    	self.player.setClass(parseInt(pClass));
                    });

                    self.client.onPvpSide(function (side) {
                    	self.player.setPvpSide(side);
                    	self.pvpSide = side;
                    });

                    self.client.onAggro(function (mobid, targetid, x, y) {
                    	var entity = self.getEntityById(mobid);
                    	var target = self.getEntityById(targetid);
                    	if (entity && target == null)
                    	{
				entity.clearTarget();
				if (entity instanceof Mob)
					entity.forgetEveryone();
				self.player.removeAttacker(entity);
				//self.makeCharacterGoTo(entity, entity.spawningX, entity.spawningY);
                	}
                    	if (entity && target)
                    	{
                    		//entity.go(x, y);
                    		entity.aggro(target);
                    		entity.lookAtTarget2(target);
                    	}
                    });
                    self.client.onSpeech(function (mobid, key, value) {
                    	var entity = self.getEntityById(mobid);
                    	if (!entity) return;

                    	//var type = MobData.Kinds[entity.kind].type;

                    	msg = MobSpeech.Speech[key][value];
                    	self.createBubble(mobid, msg);
                    	self.assignBubbleTo(entity);
                    });

                    //log.info("send skill load");

                    //self.spawnPlayer(0,x,y);

                    //self.client.sendTeleportMap(0, x, y);


                    self.client.sendSkillLoad();

                    self.gamestart_callback();

                    if(self.hasNeverStarted) {
                        self.start();
                        started_callback({success: true});
                    }

                });



                self.client.onMapStatus(function (mapId, status)
                {
                	log.info("mapStatus="+mapId+","+status);
                	self.mapIndex = parseInt(mapId);
                	self.mapStatus = parseInt(status);
                });

                self.client.onGather(function (status)
                {
                	status = parseInt(status);
                	if (status == 1 || status == 0)
                		self.player.gathering = false;
                });

                self.client.onWheather(function (id, status, delay)
				{
					// Cloudy
					if (id==1)
					{
						self.renderer.cloudStatus = status;
						self.renderer.cloudDelay = delay;
					}
					if (id==2)
					{
						self.renderer.lightStatus = status;
						self.renderer.lightDelay = delay;
					}
					if (id==3)
					{
						self.renderer.rainStatus = status;
						self.renderer.rainDelay = delay;
					}

				});

				self.client.onColorTint(function (id, type, color)
				{
					var entity = self.getEntityById(id);
					if (entity instanceof Player)
					{
						entity[type] = color;
						if (type == "armorColor") {
							self.renderer.removeBodyColorCanvas(entity);
							self.renderer.createBodyColorCanvas(entity);
						}
						if (type == "weaponColor") {
							self.renderer.removeWeaponColorCanvas(entity);
							self.renderer.createWeaponColorCanvas(entity);
						}
					}
				});

				self.client.onUpdateLook(function (id, armorSpriteId, weaponSpriteId, armorColor, weaponColor)
				{
					var entity = self.getEntityById(id);
					if (entity instanceof Player)
					{
						entity.armorSpriteId = armorSpriteId;
						entity.weaponSpriteId = weaponSpriteId;

						var armorName = entity.getArmorSprite();

						entity.setArmorName(armorName);
						entity.setSpriteName(armorName);
						entity.setSprite(self.sprites[armorName]);
						entity.armorColor = armorColor;
						self.renderer.removeBodyColorCanvas(entity);
						self.renderer.createBodyColorCanvas(entity);

						var weaponName = entity.getWeaponSprite();
						entity.setWeaponName(weaponName);

						entity.weaponColor = weaponColor;
						var weapon = self.sprites[entity.getWeaponName()];
						self.renderer.removeWeaponColorCanvas(entity);
						var weaponLoaded = function () { self.renderer.createWeaponColorCanvas(entity); }
						if (weapon && !weapon.isLoaded) weapon.load(weaponLoaded);
					}
				});

				self.client.onPetSwap(function (kind)
				{
					self.app.petconfirm(MobData.Kinds[kind]);
				});

				self.client.onRefreshCards( function (type, stack)
				{
					if (type == 1)
					{
						self.player.cards = (stack.toString().replace(/\"/g,'')).split(',');
						self.cardHandler.cards = self.player.cards;
					}
					if (type == 2)
					{
						self.player.deck = (stack.toString().replace(/\"/g,'')).split(',');
						self.cardHandler.deck = self.player.deck;
					}
					self.cardHandler.showCards();
					self.cardHandler.showDeck();
				});

				self.client.onCardBattleRequest( function(id)
				{
					var source = self.getEntityById(id);
					if (!source) return;
					self.cardHandler.inviteconfirm(source);
				});

				self.client.onCardBattleBet( function(id,bet)
				{
					var source = self.getEntityById(id);
					if (!source) return;

					self.cardHandler.showcardGambleDialog(source,bet);
				});

                self.client.onGuildError(function(errorType, info) {
					if(errorType === Types.Messages.GUILDERRORTYPE.BADNAME){
						self.showNotification(info + " seems to be an inappropriate guild name…");
					}
					else if(errorType === Types.Messages.GUILDERRORTYPE.ALREADYEXISTS){
						self.showNotification(info + " already exists…");
						setTimeout(function(){self.showNotification("Either change the name of YOUR guild")},2500);
						setTimeout(function(){self.showNotification("Or ask a member of " + info + " if you can join them.")},5000);
					}
					else if(errorType === Types.Messages.GUILDERRORTYPE.IDWARNING){
						self.showNotification("WARNING: the server was rebooted.");
						setTimeout(function(){self.showNotification(info + " has changed ID.")},2500);
					}
					else if(errorType === Types.Messages.GUILDERRORTYPE.BADINVITE){
						self.showNotification(info+" is ALREADY a member of “"+self.player.getGuild().name+"”");
					}
				});

				self.client.onGuildCreate(function(guildId, guildName) {
					self.player.setGuild(new Guild(guildId, guildName));
					//self.storage.setPlayerGuild(self.player.getGuild());
					self.showNotification("You successfully created and joined…");
					setTimeout(function(){self.showNotification("…" + self.player.getGuild().name)},2500);
				});

				self.client.onGuildInvite(function(guildId, guildName, invitorName) {
					self.showNotification(invitorName + " invited you to join “"+guildName+"”.");
					self.player.addInvite(guildId);
					//setTimeout(function(){self.showNotification("Do you want to join "+guildName+" ? Type /guild accept yes or /guild accept no");
					//},2500);
                    self.socialHandler.inviteGuild(guildId, guildName, invitorName);

				});

				self.client.onGuildJoin(function(playerName, id, guildId, guildName) {
					if(typeof id === "undefined"){
						self.showNotification(playerName + " failed to answer to your invitation in time.");
						setTimeout(function(){self.showNotification("Might have to send another invite…")},2500);
					}
					else if(id === false){
						self.showNotification(playerName + " respectfully declined your offer…");
						setTimeout(function(){self.showNotification("…to join “"+self.player.getGuild().name+"”.")},2500);
					}
					else if(id === self.player.id){
						self.player.setGuild(new Guild(guildId, guildName));
						//self.storage.setPlayerGuild(self.player.getGuild());
						self.showNotification("You just joined “"+guildName+"”.");
					}
					else{
						self.showNotification(playerName+" is now a jolly member of “"+guildName+"”.");//#updateguild
					}
				});

				self.client.onGuildLeave(function(name, playerId, guildName) {
					if(self.player.id===playerId){
						if(self.player.hasGuild()){
							if(self.player.getGuild().name === guildName ||
							   guildName === "")
							{
								self.player.unsetGuild();
								//self.storage.setPlayerGuild();
								self.showNotification("You successfully left “"+guildName+"”.");
								self.socialHandler.setGuildMembers([]);
							}
						}
						//missing elses above should not happen (errors)
					}
					else{
						self.showNotification(name + " has left “"+guildName+"”.");//#updateguild
					}
				});

				self.client.onGuildTalk(function(name, id, message) {
					if(id===self.player.id){
						self.showNotification("YOU: "+message);
					}
					else{
						self.showNotification(name+": "+message);
					}
				});

				self.client.onMemberConnect(function(name) {
					self.showNotification(name + " connected to your world.");//#updateguild
				});

				self.client.onMemberDisconnect(function(name) {
					self.showNotification(name + " lost connection with your world.");
				});

				self.client.onReceiveGuildMembers(function(memberNames) {
					self.showNotification(memberNames.join(", ") + ((memberNames.length===1) ? " is " : " are ") +"currently online.");//#updateguild
					self.socialHandler.setGuildMembers(memberNames);
				});

				self.client.onGold(function(type,amount) {
					if (type==1)
						self.inventoryHandler.setGold(amount);
					else if (type==2)
						self.bankHandler.setGold(amount);
				});

				self.client.onProducts(function(data) {
					self.products = data;
				});

				self.client.onAppearanceList(function (data) {
					if (self.appearanceDialog.visible)
					    self.appearanceDialog.storeFrame.pageArmor.onData(data);
				            self.appearanceDialog.storeFrame.pageWeapon.onData(data);
				});

				self.client.onLooksList(function (data) {
					if (self.appearanceDialog.visible)
					    self.appearanceDialog.assign(data);
				});

            },

            /**
             * Links two entities in an attacker<-->target relationship.
             * This is just a utility method to wrap a set of instructions.
             *
             * @param {Entity} attacker The attacker entity
             * @param {Entity} target The target entity
             */
            createAttackLink: function(attacker, target) {
                if(attacker.hasTarget() || attacker.target != target) {
                   attacker.removeTarget();
                }
                //attacker.engage(target);

                if(attacker.id !== this.playerId && !target instanceof House) {
                    target.addAttacker(attacker);
                }
            },

            /**
             * Converts the current mouse position on the screen to world grid coordinates.
             * @returns {Object} An object containing x and y properties.
             */
            getMouseGridPosition: function() {
            	    //this.camera.setRealCoords();
            	    var r = this.renderer,
            	    c = this.camera,
            	    mx = this.mouse.x,
                    my = this.mouse.y,
                    s = r.scale,
                    ts = r.tilesize,
                    tss = (ts * s),
                    offsetX = mx % tss,
                    offsetY = my % tss,
                    x = ((mx - offsetX) / tss) + c.gridX,
                    y = ((my - offsetY) / tss) + c.gridY;
                    //alert(zoom);

                return { x: x, y: y };
            },

            /**
             * Moves a character to a given location on the world grid.
             *
             * @param {Number} x The x coordinate of the target location.
             * @param {Number} y The y coordinate of the target location.
             */
            makeCharacterGoTo: function(character, x, y) {
                if(!this.map.isOutOfBounds(x, y) && !this.map.isColliding(x,y) && !character.isDead) {
                    //log.info("map-withinbounds");
                    /*if (character instanceof Mob && !(character instanceof Pet) &&
                    	!(x == character.gridX && y == character.gridY))
                    {
                    	    this.unregisterEntityPosition(character);
                    }*/
                    this.removeFromEntityGrid(character, character.gridX, character.gridY);
                    this.removeFromPathingGrid(character.gridX, character.gridY);

                    character.go(x, y);
                }
            },

            /**
             *
             */
            makeCharacterTeleportTo: function(character, x, y) {
                if(!this.map.isOutOfBounds(x, y)) {
                    this.unregisterEntityPosition(character);

                    character.setGridPosition(x, y);
                    if (character.pets)
                    {
                        for(var i=0; i < character.pets.length; ++i)
                        {
                            var pet = character.pets[i];
                            pet.setGridPosition(x,y);
                        }
                    }

                    this.registerEntityPosition(character);
                    this.assignBubbleTo(character);
                } else {
                    log.debug("Teleport out of bounds: "+x+", "+y);
                }
            },

            makePlayerInteractNext: function(orientation)
            {
            	this.ignorePlayer = true;
            	this.player.disableKeyboardNpcTalk = false;
                pos = {
                    x: this.player.gridX,
                    y: this.player.gridY
                };
                //if (this.player.isMoving()) return;
                orientation = orientation || this.player.orientation;
                switch(orientation)
                {
                    case Types.Orientations.DOWN:
                        pos.y += 1;
                        this.processInput(pos);
                        break;
                    case Types.Orientations.UP:
                        pos.y -= 1;
                        this.processInput(pos);
                        break;
                    case Types.Orientations.LEFT:
                        pos.x -= 1;
                        this.processInput(pos);
                        break;
                    case Types.Orientations.RIGHT:
                        pos.x += 1;
                        this.processInput(pos);
                        break;
                }
                this.ignorePlayer = false;
            },

            getEntityNext: function(entity)
            {
                var x = this.player.gridX;
                var y = this.player.gridY;

                switch(this.player.orientation)
                {
                    case Types.Orientations.DOWN:
                        y += 1;
                        this.processInput({x:x,y:y});
                        break;
                    case Types.Orientations.UP:
                        y -= 1;
                        this.processInput({x:x,y:y});
                        break;
                    case Types.Orientations.LEFT:
                        x -= 1;
                        this.processInput({x:x,y:y});
                        break;
                    case Types.Orientations.RIGHT:
                        x += 1;
                        this.processInput({x:x,y:y});
                        break;
                }
                return this.getEntityAt(x, y);
            },

            makePlayerTalkToPos: function(pos)
            {
                entity = this.getEntityAt(pos.x, pos.y);
                if(entity instanceof Npc) {
                    this.speakToNPC(entity);
                }
            },

            /**
             *
             */
            /*makePlayerAttackTo: function(pos)
            {
                entity = this.getEntityAt(pos.x, pos.y);
                if(entity instanceof Mob || entity instanceof Player) {
                    this.makePlayerAttack(entity);
                }
            },*/

            /**
             * Moves the current player to a given target location.
             * @see makeCharacterGoTo
             */
            makePlayerGoTo: function(x, y) {
                if (this.mapStatus >= 3)
                	this.makeCharacterGoTo(this.player, x, y);
            },

            /**
             * Moves the current player towards a specific item.
             * @see makeCharacterGoTo
             */
            makePlayerGoToItem: function(item) {
                if(item) {
                    this.player.isLootMoving = true;
                    this.pathingGrid[item.gridY][item.gridX] = false;
                    this.makePlayerGoTo(item.gridX, item.gridY);
                    this.client.sendLootMove(item, item.gridX, item.gridY);
                }
            },

            /**
             *
             */
            makePlayerTalkTo: function(npc) {
                if(npc) {
                    this.player.setTarget(npc);
                    this.player.follow(npc);
                }
            },

            makePlayerOpenChest: function(chest) {
                if(chest) {
                    this.player.setTarget(chest);
                    this.player.follow(chest);
                }
            },

            makePlayerAttackFirst: function(mob) {
            	var self = this;
            	self.makePlayerAttack(mob);
				self.client.sendMoveEntity2(
					self.player.id,
					self.mapIndex,
					self.player.gridX,
					self.player.gridY, 2, self.player.orientation,
						(self.player.target) ? self.player.target.id : 0);
            },

            /**
             *
             */
            makePlayerAttack: function(mob) {
				if (!this.player || this.player == mob) // sanity check.
					return;

				var container = "#combatContainer";
				var self = this;

				if (self.player && !self.player.isDead) {
					if (mob.isDead)
					{
						self.player.removeTarget();
						return;
					}
					if (self.player.withinAttackRange(mob))
					{
						if ($(container+":visible").length == 0)
							$(container).fadeIn('fast');

						//self.player.attackType = $(this).index();
						self.client.sendAttack(self.player, mob);
						self.player.hitmob = true;
						self.player.skillHandler.showActiveSkill();
					}
				}
            },

            /**
             *
             */
            makeNpcTalk: function(npc) {
            	var msg;
                if (!this.player.isAdjacentNonDiagonal(npc)) {
                	return;
                }
                var msg;

                if(npc) {
                    if(NpcData.Kinds[npc.kind].name==="Craft")
                    {
                    	this.craftDialog.show();
                    	if (this.gamepad.isActive())
			{
				this.joystickSide = 0;
				this.joystickIndex = 0;
				this.gamepad.dialogNavigate();
			}
		    } else if (NpcData.Kinds[npc.kind].name==="Beginner shop")
		    {
		    	this.storeDialog.show(1,20);
                    	if (this.gamepad.isActive())
			{
				this.joystickSide = 0;
				this.joystickIndex = 6;
				this.gamepad.dialogNavigate();
			}
                    } else if (NpcData.Kinds[npc.kind].name==="Bank") {
                    	this.bankDialog.show();
                    	if (this.gamepad.isActive())
			{
				this.joystickSide = 0;
				this.joystickIndex = 0;
				this.gamepad.dialogNavigate();
			}
                    } else if (NpcData.Kinds[npc.kind].name==="Enchant") {
                    	this.enchantDialog.show();
                    	if (this.gamepad.isActive())
			{
				this.joystickSide = 0;
				this.joystickIndex = 0;
				this.gamepad.dialogNavigate();
			}
                    } else if (NpcData.Kinds[npc.kind].name==="Repair") {
                    	this.repairDialog.show();
                    	if (this.gamepad.isActive())
			{
				this.joystickSide = 0;
				this.joystickIndex = 0;
				this.gamepad.dialogNavigate();
			}
                    } else if (NpcData.Kinds[npc.kind].name==="Auction") {
                    	this.auctionDialog.show();
                    	if (this.gamepad.isActive())
			{
				this.joystickSide = 0;
				this.joystickIndex = 0;
				this.gamepad.dialogNavigate();
			}
                    } else if (NpcData.Kinds[npc.kind].name==="King") {
                    	this.classPopupMenu.open();
                    } else if (NpcData.Kinds[npc.kind].name==="Looks") {
                    	this.appearanceDialog.show();
                    } else {
                    	this.destroyBubble(npc.id);
                        msg = this.questhandler.talkToNPC(npc);
                        this.previousClickPosition = {};
                        if (msg) {
                            this.destroyBubble(npc.id);
                            this.createBubble(npc.id, msg);
                            this.assignBubbleTo(npc);
                            this.audioManager.playSound("npc");
                        }
                        if (this.autonpctalk)
                        	clearInterval(this.autonpctalk);
                        var self = this;
                        this.autonpctalk = setInterval(function() {
                        	msg = self.questhandler.talkToNPC(npc);
				if (msg) {
				    self.destroyBubble(npc.id);
				    self.createBubble(npc.id, msg);
				    self.assignBubbleTo(npc);
				    self.audioManager.playSound("npc");
				}
				else {
				    self.destroyBubble(npc.id);
				    self.audioManager.playSound("npc-end");
				    clearInterval(self.autonpctalk);
				}

                        }, 5000);
                    }
                    this.player.removeTarget();
                }
            },


            /**
             * Loops through all the entities currently present in the game.
             * @param {Function} callback The function to call back (must accept one entity argument).
             */
            forEachEntity: function(callback) {
                _.each(this.entities, function(entity) {
                    callback(entity);
                });
            },

            /**
             * Same as forEachEntity but only for instances of the Mob subclass.
             * @see forEachEntity
             */
            forEachMob: function(callback) {
                _.each(this.entities, function(entity) {
                    if(entity instanceof Mob && !(entity instanceof Pet)) {
                        callback(entity);
                    }
                });
            },

            /**
             * Loops through all entities visible by the camera and sorted by depth :
             * Lower 'y' value means higher depth.
             * Note: This is used by the Renderer to know in which order to render entities.
             */

            forEachVisibleEntityByDepth: function(callback) {
                var self = this,
                    m = this.map;

		this.camera.forEachVisibleValidEntityPosition(function(x, y) {
		    if(self.renderingGrid[y][x]) {
			_.each(self.renderingGrid[y][x], function(entity) {
			    //log.info("entity seen " +entity.name);
			    callback(entity);
			});
		    }
		}, 1, m);

            },

            /**
             *
             */
            forEachVisibleTileIndex: function(callback, extra, optimized) {
                var m = this.map;

                if (optimized)
                {
			this.camera.forEachNewTile(function(x, y) {
			    callback(m.GridPositionToTileIndex(x, y));
			}, extra, m);
                }
                else
                {
			this.camera.forEachVisibleValidPosition(function(x, y) {
			    callback(m.GridPositionToTileIndex(x, y));
			}, extra, m);
                }
            },

            /**
             *
             */

            forEachVisibleTile: function(callback, extra, optimized) {
                var self = this,
                    m = this.map;

                if(m.isLoaded) {
                    this.forEachVisibleTileIndex(function(tileIndex) {
                        if(_.isArray(m.data[tileIndex])) {
                            _.each(m.data[tileIndex], function(id) {
                                callback(id-1, tileIndex);
                            });
                        }
                        else {
                            if(_.isNaN(m.data[tileIndex]-1)) {
                                //throw Error("Tile number for index:"+tileIndex+" is NaN");
                            } else {
                                callback(m.data[tileIndex]-1, tileIndex);
                            }
                        }
                    }, extra, optimized);
                }
            },

            /**
             *
             */
            forEachAnimatedTile: function(callback) {
                if(this.animatedTiles) {
                    _.each(this.animatedTiles, function(tile) {
                        callback(tile);
                    });
                }
            },

            /**
             * Returns the entity located at the given position on the world grid.
             * @returns {Entity} the entity located at (x, y) or null if there is none.
             */
            getEntityAt: function(x, y) {
                if(!this.map || !this.map.isLoaded)
            	    return null;

                if(this.map.isOutOfBounds(x, y) || !this.entityGrid || !this.entityGrid[y] || this.entityGrid.length == 0) {
                    return null;
                }

                var entities = this.entityGrid[y][x],
                    entity = null;
                var size = _.size(entities);
                if(size > 0) {
                    for (var i=0; i < size; ++i)
                    {
                    	return entities[_.keys(entities)[i]];
                    }
                } else {
                	entity = this.getItemAt(x, y);
                }
                return entity;
            },

            getEntityByName: function (name) {
            	var entity;
            	$.each(this.entities, function (i, v) {
            	        if (v instanceof Player && v.name.toLowerCase() == name.toLowerCase())
            	        {
            	        	entity = v;
            	        	return false;
            	        }
            	});
            	return entity;
            },

            getMobAt: function(x, y) {
                var entity = this.getEntityAt(x, y);
                if(entity && (entity instanceof Mob && !(entity instanceof Pet))) {
                    return entity;
                }
                return null;
            },

            getPlayerAt: function(x, y) {
                var entity = this.getEntityAt(x, y);
                if(entity && (entity instanceof Player) && (entity !== this.player)) {
                    return entity;
                }
                return null;
            },

            getNpcAt: function(x, y) {
                var entity = this.getEntityAt(x, y);
                if(entity && (entity instanceof Npc)) {
                    return entity;
                }
                return null;
            },

            getChestAt: function(x, y) {
                var entity = this.getEntityAt(x, y);
                if(entity && (entity instanceof Chest)) {
                    return entity;
                }
                return null;
            },

            getItemAt: function(x, y) {
                if(this.map.isOutOfBounds(x, y) || !this.itemGrid || !this.itemGrid[y]) {
                    return null;
                }
                var items = this.itemGrid[y][x],
                    item = null;

                if(_.size(items) > 0) {
                    // If there are potions/burgers stacked with equipment items on the same tile, always get expendable items first.
                    _.each(items, function(i) {
                        if(ItemTypes.isConsumableItem(i.kind)) {
                            item = i;
                        };
                    });

                    // Else, get the first item of the stack
                    if(!item) {
                        item = items[_.keys(items)[0]];
                    }
                }
                return item;
            },

            /**
             * Returns true if an entity is located at the given position on the world grid.
             * @returns {Boolean} Whether an entity is at (x, y).
             */
            isEntityAt: function(x, y) {
                return !_.isNull(this.getEntityAt(x, y));
            },

            isMobAt: function(x, y) {
                return !_.isNull(this.getMobAt(x, y));
            },
            isPlayerAt: function(x, y) {
                return !_.isNull(this.getPlayerAt(x, y));
            },

            isItemAt: function(x, y) {
                return !_.isNull(this.getItemAt(x, y));
            },

            isNpcAt: function(x, y) {
                return !_.isNull(this.getNpcAt(x, y));
            },

            isChestAt: function(x, y) {
                return !_.isNull(this.getChestAt(x, y));
            },

            /**
             * Finds a path to a grid position for the specified character.
             * The path will pass through any entity present in the ignore list.
             */
            findPath: function(character, x, y, ignoreList, includeList) {

                var self = this,
                    //grid = this.pathingGrid,
                    path = [],
                    isPlayer = (character === this.player);

                if (this.mapStatus < 3)
                	return null;

                if(this.map.isColliding(x, y)) {
                    //self.renderer.forceRedraw = true;
                    return path;
                }

                if (character instanceof Player && this.usejoystick)
                {
                	return [[character.gridX,character.gridY],[x,y]];
                }

                log.info("PATHFINDER CODE");

                if(this.pathfinder && character) {
                    path = this.pathfinder.findNeighbourPath(character, x, y);
                    if (path)
                    {
                    	return path;
                    }

                    var shortGrid = this.pathfinder.getShortGrid(this.pathingGrid, character, x, y, 2);
                    path = this.pathfinder.findShortPath(shortGrid.crop, character, x, y,
                    	 shortGrid.minX, shortGrid.minY, shortGrid.substart, shortGrid.subend);

                    if (path)
                    {
						if(ignoreList) {
							this.pathfinder.clearIgnoreList(this.pathingGrid);
						}
						if(includeList) {
							this.pathfinder.clearIncludeList(this.pathingGrid);
						}

                    	return path;
                    }

                    if(ignoreList) {
                        _.each(ignoreList, function(entity) {
                            self.pathfinder.ignoreEntity(entity);
                        });
                    }
                    if(includeList) {
                        _.each(includeList, function(entity) {
                            self.pathfinder.includeEntity(entity);
                        });
                    }

                   	path = this.pathfinder.findPath(this.pathingGrid, character, x, y, false);

                    if(ignoreList) {
                        this.pathfinder.clearIgnoreList(this.pathingGrid);
                    }
                    if(includeList) {
                        this.pathfinder.clearIncludeList(this.pathingGrid);
                    }
                } else {
                    log.error("Error while finding the path to "+x+", "+y+" for "+character.id);
                }
                return path;
            },

            /**
             * Toggles the visibility of the pathing grid for debugging purposes.
             */
            togglePathingGrid: function() {
                if(this.debugPathing) {
                    this.debugPathing = false;
                } else {
                    this.debugPathing = true;
                }
            },

            /**
             * Toggles the visibility of the FPS counter and other debugging info.
             */
            toggleDebugInfo: function() {
                if(this.renderer && this.renderer.isDebugInfoVisible) {
                    this.renderer.isDebugInfoVisible = false;
                } else {
                    this.renderer.isDebugInfoVisible = true;
                }
            },

            /**
             *
             */
            movecursor: function() {
                var mouse = this.getMouseGridPosition(),
                    x = mouse.x,
                    y = mouse.y;

                //if (x >= 0 || y >= 0)
                //if (!this.map.isColliding(x, y))
                	this.cursorVisible = true;

                if(this.map && this.map.isLoaded && this.player && !this.renderer.mobile && !this.renderer.tablet) {
                    this.hoveringCollidingTile = this.map.isColliding(x, y) && !this.map.isDoor(x,y);
                    this.hoveringPlateauTile = this.player.isOnPlateau ? !this.map.isPlateau(x, y) : this.map.isPlateau(x, y);
                    this.hoveringMob = this.isMobAt(x, y);
                    //log.info("isMobAt x="+x+"y="+y);
                    this.hoveringPlayer = this.isPlayerAt(x, y);
                    this.hoveringItem = this.isItemAt(x, y);
                    this.hoveringNpc = this.isNpcAt(x, y);
                    this.hoveringOtherPlayer = this.isPlayerAt(x, y);
                    this.hoveringChest = this.isChestAt(x, y);
                    this.hoveringEntity = this.getEntityAt(x, y);

                    if((this.hoveringMob || this.hoveringPlayer || this.hoveringNpc || this.hoveringChest || this.hoveringOtherPlayer || this.hoveringItem) && !this.player.hasTarget()) {
                        var entity = this.getEntityAt(x, y);
                        if (!entity) return;

                        this.player.showTarget(entity);
                        if(!entity.isHighlighted && this.renderer.supportsSilhouettes) {
                            if(this.lastHovered) {
                                this.lastHovered.setHighlight(false);
                            }
                            entity.setHighlight(true);
                        }
                        this.lastHovered = entity;
                    }
                    else if(this.lastHovered) {
                        this.lastHovered.setHighlight(null);
                        if(this.timeout === undefined && !this.player.hasTarget()) {
                            var self = this;
                            /*this.timeout = setTimeout(function(){
                                $('#inspector').fadeOut('fast');
                                $('#inspector .health').text('');
                                if (self.player)
                                	self.player.inspecting = null;
                            }, 200);*/
                            this.timeout = undefined;
                        }
                        this.lastHovered = null;
                    }
                }
            },

            /**
             * Moves the player one space, if possible
             */
            keys: function(pos, orientation) {
            	var self = this;
                this.hoveringCollidingTile = false;
                this.hoveringPlateauTile = false;

                if(!this.player.isMoving()) {
                    this.cursorVisible = false;
                    this.player.orientation = orientation;
					self.processInput(pos);

                }
            },

            click: function() {
                var pos = this.getMouseGridPosition();
                //alert("x:"+pos.x+",y:"+pos.y);
                var entity;

                //this.inventoryHandler.hideAllInventory();
                this.playerPopupMenu.close();

                for(var i = 0; i < this.dialogs.length; i++) {
                    if(this.dialogs[i].visible){
                        this.dialogs[i].hide();
                    }
                }

                this.processInput(pos);
            },

            handleTouch: function(x,y) {
            	var pos = {x:x, y:y};
                //log.info("processInput:"+x+","+y);
                this.processInput(pos);
            },


            dropItem: function(inventoryNumber) {
      	        var itemKind = this.inventoryHandler.inventory[inventoryNumber];
				if((ItemTypes.isConsumableItem(itemKind)) &&
					(this.inventoryHandler.inventoryCount[inventoryNumber] > 1))
				{
					$('#dropCount').val(this.inventoryHandler.inventoryCount[inventoryNumber]);
					this.app.showDropDialog(inventoryNumber);
				} else {
					this.client.sendInventory(1, "empty", inventoryNumber, 1);
					this.inventoryHandler.makeEmptyInventory(inventoryNumber);
				}
            },


            rightClick: function() {
                var pos = this.getMouseGridPosition();

                if(pos.x === this.camera.gridX+this.camera.gridW-2
                    && pos.y === this.camera.gridY+this.camera.gridH-1){
                    if(this.inventoryHandler.inventory[0]){
                        if(ItemTypes.isConsumableItem(this.inventoryHandler.inventory[0]))
                            this.eat(0);
                    }
                    return;
                } else if(pos.x === this.camera.gridX+this.camera.gridW-1
                    && pos.y === this.camera.gridY+this.camera.gridH-1){
                    if(this.inventoryHandler.inventory[1]){
                        if(ItemTypes.isConsumableItem(this.inventoryHandler.inventory[1]))
                            this.eat(1);
                    }
                } else {
                    if((this.healShortCut >= 0) && this.inventoryHandler.inventory[this.healShortCut]) {
                        if(ItemTypes.isConsumableItem(this.inventoryHandler.inventory[this.healShortCut]))
                            this.eat(this.healShortCut);
                    }
                }
                if (this.player)
                {
					this.player.moveLeft = false;
					this.player.moveRight = false;
					this.player.moveUp = false;
					this.player.moveDown = false;
                }
            },

            /**
             * Processes game logic when the user triggers a click/touch event during the game.
             */
             processInput: function(pos) {
             	log.info("x="+pos.x+",y="+pos.y);
                var entity = this.getEntityAt(pos.x, pos.y);
                if (!entity && this.renderer.mobile)
                {
                	tempX = pos.x;
                	tempY = pos.y;
                	for (var i=-1; i <= 1; ++i)
                	{
                		for (var j=-1; j <= 1; ++j)
                		{
                			if (i == 0 && j == 0)
                				continue;

                			tempEntity = this.getEntityAt(tempX + i, tempY + j);
                			if (tempEntity == this.player)
                				continue;

                			if (tempEntity)
                			{
                				entity = tempEntity;
                				pos.x+=i;
                				pos.y+=j;
                				break;
                			}
                		}
                	}
                }
                //if (!entity && this.player)
                //	this.player.target = null;

                if (!this.started || !this.player || this.player.isDead)
                    return;

		    /*
		    // TODO - Uncomment if you want to have item circles.
		    if (!this.ignorePlayer && this.activeCircle)
		    {
			var inv = this.getCircleSelected(this.mouse.x, this.mouse.y);
			if (inv) {
				log.info(inv.item)
				log.info(inv.index)
				if (ItemTypes.isArmor(inv.item) || ItemTypes.isArcherArmor(inv.item))
				{

				    this.equip(inv.index);
				}
				else if (ItemTypes.isWeapon(inv.item) || ItemTypes.isArcherWeapon(inv.item))
				{
				    this.equip(inv.index);
				}
				else if (ItemTypes.isConsumableItem(inv.item))
				{
				    this.eat(inv.index);
				}
				this.activeCircle = null;
				this.showInventory = 0;
				return;
			}
			else
			    this.activeCircle = null;
		    }*/
                if(!this.hoveringCollidingTile && !this.hoveringPlateauTile) {
                    /*if(!this.ignorePlayer && entity === this.player){
                    	this.showInventory = ++this.showInventory % 4;
                    	if (this.showInventory == 1)
                    		this.makeConsumablesCircle();
                    	else if (this.showInventory == 2)
                    		this.makeWeaponsCircle();
                    	else if (this.showInventory == 3)
                    		this.makeArmorsCircle();
                    	else
                    		this.activeCircle = null;
                    }*/

                    //if (entity instanceof Entity)
                    //    this.renderer.forceRedraw = true;

                    if (entity instanceof Pet)
                    {
                    		this.pathingGrid[pos.y][pos.x] = false;
                    	    this.makePlayerGoTo(pos.x, pos.y);
                    	    return;
                    }

                    if (entity instanceof PvpBase && entity.pvpSide)
                    	log.info("entity.pvpSide="+entity.pvpSide);
                    log.info("this.player.pvpSide="+this.player.pvpSide);
                    log.info("this.pvpSide="+this.pvpSide);

                    if(entity && (entity instanceof Player) && entity !== this.player &&
                      ((this.player.pvpSide == -1 || (this.map.index != 0) ||
                      (entity && entity.hasOwnProperty("influence") && entity.influence > 0)) &&
                      !this.player.pvpTarget))
                    {
                        this.playerPopupMenu.click(entity);
                    } else if(entity && entity instanceof Mob || (entity instanceof PvpBase && (this.player.pvpSide != entity.pvpSide) ||
                    	    (entity instanceof Player && entity !== this.player &&
                    	    (entity.pvpSide != this.player.pvpSide || this.player.pvpTarget == entity) ||
                    	    (entity && entity.hasOwnProperty("influence") && entity.influence < 0)) &&
                    	    this.map.index > 0))
                    {
                        //clearInterval(this.makePlayerAttackAuto);

                        var self = this;
                        if (this.player.pvpTarget && this.player.pvpTarget != entity)
                        	return;
                        if (!this.player.hasTarget() || (this.player.target && entity !== this.player.target))
						{
							this.createAttackLink(this.player, entity);
							this.player.setTarget(entity);
							this.player.lookAtTarget();
							if (!(entity instanceof PvpBase) && !this.player.isAdjacentNonDiagonal(this.player.target) && !this.player.getDistanceToEntity(this.player.target) == 0)
								this.makeAttackerFollow(this.player);
						}
						this.player.attackingMode = true;
						this.makePlayerAttackFirst(entity);
						return;
                    } else if(entity instanceof Item) {
                        this.makePlayerGoToItem(entity);
                    } else if(entity instanceof Npc) {
                    	//this.player.follow(entity);
                    	this.player.follow(entity);
                    	this.speakToNPC(entity);
                    	return;
                    } else if(entity instanceof Chest) {
                        this.makePlayerOpenChest(entity);
                    } else if(entity instanceof Gather) {
                    	if (entity.isAdjacent(this.player) === true && !this.player.gathering) {
                    	    this.player.gathering = true;
                    		this.client.sendGather(entity.id);
                        }

                    }
                    else if (!entity) {
                    	    this.playerPopupMenu.close();
                    	    //this.player.stop();
                    	    this.player.disengage();
                    	    log.info("makePlayerGoTo");
                    	    if (this.pathingGrid && this.pathingGrid[pos.y]) {
                    	    	    this.pathingGrid[pos.y][pos.x] = false;
                    	    	    this.makePlayerGoTo(pos.x, pos.y);
                    	    }
                    	    clearInterval(this.makePlayerAttackAuto);
                    }


                }

            },


            speakToNPC: function (entity) {
				if(this.player.isAdjacentNonDiagonal(entity) === false) {
					//alert("makePlayerTalkto");
					this.makePlayerTalkTo(entity);
				} else {
					//alert("called");
					//if(!this.player.disableKeyboardNpcTalk) {
					this.makeNpcTalk(entity);
				}
            },

            isMobOnSameTile: function(mob, x, y) {
                var X = x || mob.gridX,
                    Y = y || mob.gridY,
                    list = this.entityGrid[Y][X],
                    result = false;

                _.each(list, function(entity) {
                    if(entity instanceof Mob && entity.id !== mob.id) {
                        result = true;
                    }
                });
                return result;
            },

            getFreeAdjacentNonDiagonalPosition: function(entity) {
                var self = this,
                    result = null;

                entity.forEachAdjacentNonDiagonalPosition(function(x, y, orientation) {
                    if(!result && !self.map.isColliding(x, y) && !self.isEntityAt(x, y)) {
                        result = {x: x, y: y, o: orientation};
                    }
                });
                return result;
            },

            tryMovingToADifferentTile: function(character) {
            var attacker = character,
                target = character.target;

			if(attacker && target) {
				//log.info("attacker.getDistanceToEntity(target) ="+attacker.getDistanceToEntity(target) );
				var entities = this.getEntityAt(attacker.gridX, attacker.gridY)
				if (typeof(entities) === "object" && Object(entities.keys).length > 1)
				{
					for(var id in entities)
					{
						var entity = entities[id];
						if (!entity || !(entity instanceof Entity)) continue;
						var pos = this.getFreeAdjacentNonDiagonalPosition(entity);
						attacker.go(pos.x, pos.y);
						return true;
					}
				}

                if(!target.isMoving() && attacker.isAdjacentNonDiagonal(target) && this.isMobOnSameTile(attacker)) {
                    var pos = this.getFreeAdjacentNonDiagonalPosition(target);
                    //return this.unstackMobToPos(attacker, target, pos, true);
                    // avoid stacking mobs on the same tile next to a player
                    // by making them go to adjacent tiles if they are available
                    if(pos && !target.adjacentTiles[pos.o]) {
                        if(this.player && this.player.target && attacker.id === this.player.target.id) {
                            return false; // never unstack the player's target
                        }

                        attacker.previousTarget = target;
                        attacker.disengage();
                        attacker.idle();
                        this.makeCharacterGoTo(attacker, pos.x, pos.y);
                        target.adjacentTiles[pos.o] = true;

                        return true;
                    }
                }
            }
            return false;
        },


            /**
             *
             */
            onCharacterUpdate: function(character) {
                var time = this.currentTime,
                    self = this;

				if (self.mapStatus >= 3 && self.mapChanged && self.map.isLoaded && character instanceof Pet && self.mapIndex == character.mapIndex && character.canMove(time) && self.player.id == character.playerId)
				{
					if (self.player && !self.player.isDead)
					{
						if (self.player.target)
						{
							if (!character.hasTarget())
								character.setTarget(self.player.target);
							if (character.hasTarget() && character.target.isDead)
								character.clearTarget();

							if(character.hasTarget() && character.getOrientationTo(character.target) !== character.orientation) {
								character.lookAtTarget();
							}
						}
					    if (!character.isMoving())
						{
							if (character.hasTarget() && !character.isAdjacentNonDiagonal(character.target))
							{
								character.follow(character.target);
							}
						}
					}
					return;
				}

                // If mob has finished moving to a different tile in order to avoid stacking, attack again from the new position.
                if(character.previousTarget && !character.isMoving() && character instanceof Mob && !(character instanceof Pet)) {
                    var t = character.previousTarget;

                    if(this.getEntityById(t.id)) { // does it still exist?
                        character.previousTarget = null;
                        if (character.target != t)
                        	this.createAttackLink(character, t);
                        return;
                    }
                }

                if(!character.isStunned && character.isAttacking() && (!character.previousTarget || character.id === this.playerId)) {
                    var isMoving;
                	//if (character instanceof Player)
                	//	isMoving = false;
                	//else
                		isMoving = this.tryMovingToADifferentTile(character); // Don't let multiple mobs stack on the same tile when attacking a player.


                    if(character.canAttack(time)) {
                        if(!isMoving) { // don't hit target if moving to a different tile.
                            if(character.hasTarget() && character.getOrientationTo(character.target) !== character.orientation) {
                                character.lookAtTarget();
                            }

                            this.makePlayerAttack(character.target);
                            if (character instanceof Player)
                            {
                            		character.atkSpeed = 256;
                            		var attackRate = 1024 - ~~((character.fatigue / character.maxFatigue) * 512);
                            		character.setAttackRate(attackRate, time);
                            	    /*
                            		if (self.player.attackType == 0)
                            	    {
                            	    	    self.player.atkSpeed = 128;
                            	    	    self.player.setAttackRate(512, time);
                            	    }
                            	    if (self.player.attackType == 1)
                            	    {
                            	    	    self.player.atkSpeed = 256;
                            	    	    self.player.setAttackRate(1024, time);
                            	    }
                            	    */
                            	    //if (self.player.attackType < 2)
                            	    //{
                            	    	character.hit();
                            	    	this.audioManager.playSound("hit"+Math.floor(Math.random()*2+1));
                            	    //}
                            	    self.player.attackCooldown.lastTime = time;
                            }
                        }
                    }
                }
                /*if (character instanceof Mob && !(character instanceof Pet) && character.destination &&
                	!character.isMoving() && !character.hasNextStep() &&
                	!(character.destination.gridX == character.gridX && character.destination.gridY == character.gridY) &&
                	character.canMove(time)
                {
                	this.makeCharacterGoTo(character, character.destination.gridX, character.destination.gridY);
                	character.moveCooldown.lastTime = time;
                }*/
            },

            /**
             *
             */
            isZoningTile: function(x, y) {
                if (x % 4 === 0 ||
                    y % 4 === 0)
                {
                	log.info("Zoning at x:" + x + ",y:" + y);
                	return true;
				}
				return false;

            },

            /**
             *
             */
            getZoningOrientation: function(x, y) {
                var orientation = "",
                    c = this.camera;

                x = x - c.gridX;
                y = y - c.gridY;

                if(x === 0) {
                    orientation = Types.Orientations.LEFT;
                }
                else if(y === 0) {
                    orientation = Types.Orientations.UP;
                }
                else if(x === c.gridW-1) {
                    orientation = Types.Orientations.RIGHT;
                }
                else if(y === c.gridH-1) {
                    orientation = Types.Orientations.DOWN;
                }

                return orientation;
            },

            startZoningFrom: function(x, y) {
                this.zoningOrientation = this.getZoningOrientation(x, y);

                /*if(this.renderer.mobile || this.renderer.tablet) {
                    var z = this.zoningOrientation,
                        c = this.camera,
                        ts = this.renderer.tilesize,
                        x = c.x,
                        y = c.y,
                        xoffset = (c.gridW - 2) * ts,
                        yoffset = (c.gridH - 2) * ts;

                    if(z === Types.Orientations.LEFT || z === Types.Orientations.RIGHT) {
                        x = (z === Types.Orientations.LEFT) ? c.x - xoffset : c.x + xoffset;
                    } else if(z === Types.Orientations.UP || z === Types.Orientations.DOWN) {
                        y = (z === Types.Orientations.UP) ? c.y - yoffset : c.y + yoffset;
                    }
                    //c.setPosition(x, y);

                    this.renderer.clearScreen(this.renderer.context);
                    this.endZoning();

                    // Force immediate drawing of all visible entities in the new zone
                    this.forEachVisibleEntityByDepth(function(entity) {
                        entity.setDirty();
                    });
                }
                else {*/
                    this.currentZoning = new Transition();
                //}
                //this.bubbleManager.clean();
                this.client.sendZone();
            },

            enqueueZoningFrom: function(x, y) {
                //this.zoningQueue.push({x: x, y: y});

                //if(this.zoningQueue.length >= 1) {
                    //var x = this.zoningQueue[0].x;
                    //var y = this.zoningQueue[0].y;
                    this.startZoningFrom(x,y);
                //}
            },

            endZoning: function() {
                this.currentZoning = null;
                this.resetZone();
                /*this.zoningQueue.shift();

                if(this.zoningQueue.length > 0) {
                    var pos = this.zoningQueue[0];
                    this.startZoningFrom(pos.x, pos.y);
                }*/
            },

            isZoning: function() {
                return !_.isNull(this.currentZoning);
            },

            resetZone: function() {
                this.bubbleManager.clean();
                //this.initAnimatedTiles();
                //this.renderer.renderStaticCanvases();
                //this.renderbackground = true;
            },

            resetCamera: function() {
                //this.camera.focusEntity(this.player);
                this.resetZone();
            },

            say: function(message) {
                //All commands must be handled server sided.
                if(!this.chathandler.processSendMessage(message)){
                    this.client.sendChat(message);
                }

            },

            createBubble: function(id, message) {
                this.bubbleManager.create(id, message, this.currentTime);
            },

            destroyBubble: function(id) {
                this.bubbleManager.destroyBubble(id);
            },

            assignBubbleTo: function(character) {
                if (character)
                	var bubble = this.bubbleManager.getBubbleById(character.id);

                if(bubble) {
					var c = character;
					var s = this.renderer.getUiScaleFactor();
					var cm = this.camera;
					var ts = this.renderer.tilesize;
                	var dpr = Math.floor(window.devicePixelRatio);

					//log.info("this.renderer.zoom="+this.renderer.zoom);
					var zoom = 1; //(this.renderer.zoom < 1) ? this.renderer.zoom : 1;

					var left = ~~(((c.x - cm.x + ts) * s)/zoom - (bubble.element.width()/2));
					var top = ~~(((c.y - cm.y - ts) * s)/zoom);
					bubble.element.css('left', left + 'px');
					bubble.element.css('top', top + 'px');
					//bubble.element.css('left', '50%');
					//bubble.element.css('margin-left', '50%');
					//bubble.element.css('top', '75%');

                }
            },

            respawn: function() {
                log.debug("Beginning respawn");
                var self = this;

                this.player.isDead = false;
                this.player.timesAttack = 0;
                this.player.hitPoints = this.player.maxHitPoints;
                self.updateBars();

                self.player.setSprite(self.player.oldSprite);
                self.player.forceStop();
                self.player.disengage();
                self.player.idle();

                this.initPlayer();

                this.started = true;
                //this.client.enable();
                this.client.sendPlayerRevive();

                log.info("this.mapIndex:"+this.mapIndex);
                this.teleportMaps(this.mapIndex);

                log.debug("Finished respawn");
            },

            onGameStart: function(callback) {
                this.gamestart_callback = callback;
            },

            onClientError: function(callback) {
                this.clienterror_callback = callback;
            },

            onDisconnect: function(callback) {
                this.disconnect_callback = callback;
            },

            onPlayerDeath: function(callback) {
                this.playerdeath_callback = callback;
            },

            onUpdateTarget: function(callback){
                this.updatetarget_callback = callback;
            },
            onPlayerExpChange: function(callback){
                this.playerexp_callback = callback;
            },

            onPlayerHealthChange: function(callback) {
                this.playerhp_callback = callback;
            },

            onPlayerFatigueChange: function(callback) {

                this.playerfatigue_callback = callback;
            },

            onPlayerHurt: function(callback) {
                this.playerhurt_callback = callback;
            },


            onNbPlayersChange: function(callback) {
                this.nbplayers_callback = callback;
            },
            onGuildPopulationChange: function(callback) {
    			this.nbguildplayers_callback = callback;
    		},
            onNotification: function(callback) {
                this.notification_callback = callback;
            },

            resize: function() {
                var x = this.camera.x,
                    y = this.camera.y,
                    currentScale = this.renderer.scale,
                    newScale = this.renderer.getScaleFactor();

                //this.resizeButtons();
                //this.renderer.rescale(newScale);



                this.camera = this.renderer.camera;

                //this.renderer.renderStaticCanvases();
                //this.renderbackground = true;
                this.renderer.forceRedraw = true;

                this.inventoryHandler.refreshInventory();
                if (this.player && this.player.skillHandler) {
                    this.player.skillHandler.displayShortcuts();
                }
                if (this.storeDialog.visible)
                	this.storeDialog.rescale();
                if (this.enchantDialog.visible) {
                	this.enchantDialog.rescale();
                }
                if (this.repairDialog.visible) {
                	this.repairDialog.rescale();
                }
                if (this.bankDialog.visible) {
                	this.bankDialog.rescale();
                }
            },

            updateBars: function() {
                if(this.player && this.playerhp_callback && this.playerfatigue_callback) {
                    this.playerhp_callback(this.player.hitPoints, this.player.maxHitPoints);
                    this.playerfatigue_callback(this.player.fatigue, this.player.maxFatigue);
                }
            },
            updateExpBar: function(){
                if(this.player && this.playerexp_callback){
                    var level = this.player.level;
                    var expInThisLevel = this.player.experience - Types.expForLevel[this.player.level-1];
                    var expForLevelUp = Types.expForLevel[this.player.level] - Types.expForLevel[this.player.level-1];
                    this.playerexp_callback(level, expInThisLevel, expForLevelUp);
                }
            },
            updateTarget: function(targetId, points, healthPoints, maxHp){
                if(this.player.hasTarget() && this.updatetarget_callback){
                    var target = this.getEntityById(targetId);
                    if(target instanceof Mob){
                        target.name = MobData.Kinds[target.kind].name;
                    }
                    if (!target)
                    	return;
                    target.points = points;
                    target.healthPoints = healthPoints;
                    target.maxHp = maxHp;
                    this.updatetarget_callback(target);
                }
            },

            /*
            getDeadMobPosition: function(mobId) {
                var position;

                if(mobId in this.deathpositions) {
                    position = this.deathpositions[mobId];
                    delete this.deathpositions[mobId];
                }
                return position;
            },
            */

            showNotification: function(message) {
                if(this.storeDialog.visible) {
                    if (message == "buy" || message == "sold") {
                        this.storeDialog.inventoryFrame.open();
                    }
                    else if (message.indexOf('SHOP') == 0) {
                    	this.storeDialog.notify(message.substr(4));
                    }
                } else if(this.auctionDialog.visible) {
                    if (message == "buy" || message == "sold") {
                        this.auctionDialog.inventoryFrame.open();
                        this.auctionDialog.storeFrame.open();

                        this.auctionDialog.storeFrame.pageMyAuctions.reload();
                        this.auctionDialog.storeFrame.pageArmor.reload();
            		this.auctionDialog.storeFrame.pageWeapon.reload();

                    }
                    else if (message.indexOf('SHOP') == 0) {
                    	this.auctionDialog.notify(message.substr(4));
                    }
                } else if(this.enchantDialog.visible) {
                    if (message == "enchanted") {
                        this.enchantDialog.inventoryFrame.open();
                    }
                    else if (message.indexOf('SHOP') == 0) {
                    	this.enchantDialog.notify(message.substr(4));
                    }
                } else if(this.repairDialog.visible) {
                    if (message == "repaired") {
                        this.repairDialog.inventoryFrame.open();
                    }
                    else if (message.indexOf('SHOP') == 0) {
                    	this.repairDialog.notify(message.substr(4));
                    }
                } else if(this.craftDialog.visible) {
                    if (message == "craft") {
                        this.craftDialog.inventoryFrame.open();
                    }
                    else if (message.indexOf('SHOP') == 0) {
                    	this.craftDialog.notify(message.substr(4));
                    }
                } else if(this.appearanceDialog.visible) {
                    if (message == "appearance") {
                        this.appearanceDialog.storeFrame.open();
                    }
                    else if (message.indexOf('SHOP') == 0) {
                    	this.appearanceDialog.notify(message.substr(4));
                    }
                }

                else {
                    this.chathandler.addNotification(message);
                }
                /*if(this.notification_callback) {
                 this.notification_callback(message);
                 }*/
            },

            removeObsoleteEntities: function() {
                var nb = _.size(this.obsoleteEntities),
                    self = this,
                    delist = [];

                if(nb > 0) {
                	for (var i=0; i < self.removeObsoleteEntitiesChunk; ++i)
                	{
                		if (i == nb)
                			break;
                		entity = this.obsoleteEntities.shift();
                        //if(!(entity instanceof Player) /* && !(entity instanceof Pet)*/) { // never remove Players or Pets.
                        	log.info("Removed Entity: "+ entity.id);
                        	delist.push(entity.id);
                        	//self.removeEntity(entity);

                        //}
                    }
                    self.client.sendDelist(delist);

                    //log.debug("Removed "+nb+" entities: "+_.pluck(_.reject(this.obsoleteEntities, function(id) { return id === self.player.id }), 'id'));
                    //this.obsoleteEntities = null;
                }
            },

            /**
             * Fake a mouse move event in order to update the cursor.
             *
             * For instance, to get rid of the sword cursor in case the mouse is still hovering over a dying mob.
             * Also useful when the mouse is hovering a tile where an item is appearing.
             */
            updateCursor: function() {
                if(!this.cursorVisible)
                    var keepCursorHidden = true;

                this.movecursor();
                this.updateCursorLogic();

                if(keepCursorHidden)
                    this.cursorVisible = false;
            },

            /**
             * Change player plateau mode when necessary
             */
            updatePlateauMode: function() {
                if(this.map && this.map.isPlateau(this.player.gridX, this.player.gridY)) {
                    this.player.isOnPlateau = true;
                } else {
                    this.player.isOnPlateau = false;
                }
            },

            updatePlayerCheckpoint: function() {
                var checkpoint = this.map.getCurrentCheckpoint(this.player);

                if(checkpoint) {
                    var lastCheckpoint = this.player.lastCheckpoint;
                    if(!lastCheckpoint || (lastCheckpoint && lastCheckpoint.id !== checkpoint.id)) {
                        this.player.lastCheckpoint = checkpoint;
                        this.client.sendCheck(checkpoint.id);
                    }
                }
            },

            checkUnderground: function() {
                var music = this.audioManager.getSurroundingMusic(this.player);

                if(music) {
                    if(music.name === 'cave') {

                    }
                }
            },

            makeAttackerFollow: function(attacker) {
                var target = attacker.target;

                if(target && attacker.isAdjacentNonDiagonal(target)) {
                    attacker.lookAtTarget2(target);
                } else if (target) {
                	if (attacker.pClass == Types.PlayerClass.FIGHTER || attacker.pClass == Types.PlayerClass.DEFENDER)
                	{
                    	attacker.follow(target);
                    	if (attacker == this.player)
                    	{
                    		for (var i = 0; i < this.player.pets.length; ++i)
                    		{
                    			var pet = this.player.pets[i];
                    			pet.setTarget(target);
                    			if (!pet.isMoving())
                    				pet.follow(target);
                    		}
                    	}
                    }
                }
            },

            forEachEntityAround: function(x, y, r, callback) {
                for(var i = x-r, max_i = x+r; i <= max_i; i += 1) {
                    for(var j = y-r, max_j = y+r; j <= max_j; j += 1) {
                    	//log.info("i="+i+",j="+j);
                        if(!this.map.isOutOfBounds(i, j)) {
                            _.each(this.entityGrid[j][i], function(entity) {
                                callback(entity);
                            });
                        }
                    }
                }
            },

            forEachEntityRange: function(x, y, r, callback) {
                this.forEachEntity(function(e) {
					if (e.gridX >= x-r && e.gridX <= x+r &&
						e.gridY >= y-r && e.gridY <= y+r)
					{
						callback(e);
					}
                });
            },
            /*checkOtherDirtyRects: function(r1, source, x, y) {
                var r = this.renderer;

                this.forEachEntityAround(x, y, 2, function(e2) {
                    if(source && source.id && e2.id === source.id) {
                        return;
                    }
                    if(!e2.isDirty) {
                        var r2 = r.getEntityBoundingRect(e2);
                        if(r.isIntersecting(r1, r2)) {
                            e2.setDirty();
                        }
                    }
                });

                if(source && !(source.hasOwnProperty("index"))) {
                    this.forEachAnimatedTile(function(tile) {
                        if(!tile.isDirty) {
                            var r2 = r.getTileBoundingRect(tile);
                            if(r.isIntersecting(r1, r2)) {
                                tile.isDirty = true;
                            }
                        }
                    });
                }

                if(!this.drawTarget && this.selectedCellVisible) {
                    var targetRect = r.getTargetBoundingRect();
                    if(r.isIntersecting(r1, targetRect)) {
                        this.drawTarget = true;
                        this.renderer.targetRect = targetRect;
                    }
                }
            },*/

            toggleItemInfo: function(){
                if(this.itemInfoOn){
                    this.itemInfoOn = false;
                } else{
                    this.itemInfoOn = true;
                }
            },
            closeItemInfo: function (){
                this.itemInfoOn = false;
            },
            keyDown: function(key){
                var self = this;
                if(key >= 49 && key <= 54){ // 1, 2, 3, 4, 5, 6
                    var inventoryNumber = key - 49;
                    if(ItemTypes.isConsumableItem(this.inventoryHandler.inventory[inventoryNumber])){
                        this.eat(inventoryNumber);
                    }
                }
            },

            changeArmorColor: function () {
				var color = rgb2hex(document.getElementById('armorColor').style.backgroundColor);
				this.client.sendColorTint("armorColor", color);
				this.player.armorColor = color;

				this.renderer.removeBodyColorCanvas(this.player);
				this.renderer.createBodyColorCanvas(this.player);
            },

            changeWeaponColor: function () {
				var color = rgb2hex(document.getElementById('weaponColor').style.backgroundColor);
				this.client.sendColorTint("weaponColor", color);
				this.player.weaponColor = color;

				this.renderer.removeWeaponColorCanvas(this.player);
				this.renderer.createWeaponColorCanvas(this.player);
            },

            equip: function(inventoryNumber){
                var itemKind = this.inventoryHandler.inventory[inventoryNumber];

                if(ItemTypes.isArmor(itemKind)){
                    this.client.sendInventory(1, "armor", inventoryNumber, 1);
                } else if(ItemTypes.isWeapon(itemKind) || ItemTypes.isArcherWeapon(itemKind)){
                    this.client.sendInventory(1, "weapon", inventoryNumber, 1);
                } else if (ItemTypes.isClothes(itemKind)) {
                	this.client.sendInventory(1, ItemTypes.KindData[itemKind].type, inventoryNumber, 1);
                }
                this.menu.close();
            },
            unequip: function(index) {
                if(index == 1){
                    this.client.sendInventory(0, "weapon", index, 1);
                } else if(index == 0){
                    this.client.sendInventory(0, "armor", index, 1);
                }
            },

            /*avatar: function(inventoryNumber){
                this.client.sendInventory("avatar", inventoryNumber, 1);
                this.audioManager.playSound("loot");
                this.menu.close();
            },*/

            eat: function(inventoryNumber){
            	var kind = this.inventoryHandler.inventory[inventoryNumber];
                if(kind && this.inventoryHandler.healingCoolTimeCallback === null
                   && (ItemTypes.isHealingItem(kind) && this.player.hitPoints < this.player.maxHitPoints
                   && this.player.hitPoints > 0) || (ItemTypes.isConsumableItem(kind) && !ItemTypes.isHealingItem(kind)))
                {

                    if(this.inventoryHandler.decInventory(inventoryNumber))
                    {
                        this.client.sendInventory(1, "eat", inventoryNumber, 1);
                        this.audioManager.playSound("heal");
                    }
                }
                //this.menu.close();
            },
            /*makeEntitiesCircle: function(inventories, radius, center) {
            	 var os = this.renderer.upscaledRendering ? 1 : this.renderer.scale;
            	 var slice = 2 * Math.PI / inventories.length;
            	 mouseCollide=[];
            	 for (var i = 0; i < inventories.length; ++i)
            	 {
			 var angle = slice * i;
			 var x = ~~(center.x + radius * Math.cos(angle));
			 var y = ~~(center.y + radius * Math.sin(angle));
			 var filename = "item-"+ItemTypes.KindData[inventories[i].item].key;
			 var item = this.sprites[filename];

                         mouseCollide.push({"x": x, "y": y,
                             "w": item.width * os * 1.1,
                             "h": item.height * os * 1.1,
                             "inv": inventories[i]});
            	 }
            	 return mouseCollide;
            },
            makeConsumablesCircle: function()
            {
            	if (!this.player || jQuery.isEmptyObject(ItemTypes.KindData))
            		return;

                var consumables = [];
                for (var i=0; i < 6; ++i)
                {
                	var item = this.inventoryHandler.inventory[i];
                	if (!item) continue;
                	    consumables.push({"item": item, "index": i});
                }
                var radius = 36 * this.renderer.scale;
                var point = {"x": this.renderer.canvas.width / 2,"y": this.renderer.canvas.height / 2};
                this.activeCircle = this.makeEntitiesCircle(consumables, radius, point);
            },

            makeWeaponsCircle: function ()
            {
            	if (!this.player || jQuery.isEmptyObject(ItemTypes.KindData))
            		return;

                var weapons = [];
                for (var i=6; i < 24; ++i)
                {
                	var item = this.inventoryHandler.inventory[i];
                	if (!item) continue;
                	//log.info("item.kind="+item.kind);
                        if (ItemTypes.isWeapon(item) || ItemTypes.isArcherWeapon(item))
                        	weapons.push({"item": item, "index": i});
                }
                var radius = 48 * this.renderer.scale;
                var point = {"x": this.renderer.canvas.width / 2,"y": this.renderer.canvas.height / 2};
                this.activeCircle = this.makeEntitiesCircle(weapons, radius, point);
            },

            makeArmorsCircle: function ()
            {
            	if (!this.player || jQuery.isEmptyObject(ItemTypes.KindData))
            		return;

                var armors = [];
                for (var i=6; i < 24; ++i)
                {
                	var item = this.inventoryHandler.inventory[i];
                	if (!item) continue;
                        if (ItemTypes.isArmor(item) || ItemTypes.isArcherArmor(item))
                            armors.push({"item": item, "index": i});
                }
                var radius = 48 * this.renderer.scale;

                var point = {"x": this.renderer.canvas.width / 2,"y": this.renderer.canvas.height / 2};
                this.activeCircle = this.makeEntitiesCircle(armors, radius, point);
            },

            getCircleSelected: function (x, y) {
            	for (var i = 0; i < this.activeCircle.length; ++i)
            	{
            		var circleItem = this.activeCircle[i];

            		log.info("x:" +x+",y:"+y);
            		log.info("circleItem.x:" +circleItem.x+",circleItem.y:"+circleItem.y);
            		log.info("circleItem.w:" +circleItem.w+",circleItem.h:"+circleItem.h);
            		if (x >= circleItem.x && x <= circleItem.x + circleItem.w &&
            		    y >= circleItem.y && y <= circleItem.y + circleItem.h)
            		{
            			return this.activeCircle[i].inv;
            		}
            	}
            	return null;
            },*/

	    // TODO make a entity map so this is more efficient.
	    /*getCharactersMovesSync: function(entity, range) {
		if (!entity) return;
	    	var x = entity.gridX;
		var y = entity.gridY;
		var entities = [];
		this.forEachEntityAround(x,y,range, function (entity2)
		{
	             entities.push(entity2.id);
	             entities.push(entity2.gridX);
	             entities.push(entity2.gridY);
		});
		if (entities.length > 0)
		    this.client.sendEntityMoveSynch(entities);
	    },*/

            moveKey: function(key) {
            	self = this;
            	var moveKeyAsync = function(key)
            	{
            	    self.stopMove = false;
            	    self.moveKeycode = key;
		    setTimeout( function() {
			if (self.stopMove) {
				self.stopMove = false;
				return;
			}
			switch(self.moveKeycode) {
				case 1:
					self.player.moveLeft = true;
					break;
				case 2:
					self.player.moveUp = true;
					break;
				case 3:
					self.player.moveRight = true;
					break;
				case 4:
					self.player.moveDown = true;
					break;

			}
		    }, self.inputLatency);
            	}
            	moveKeyAsync(key);
            },

            removePets: function() {
				// Avoid Pet Duplication.
				if (self.player && self.player.pets)
				{
					/*for (var i=0; i < self.player.pets.length; ++i)
					{
						var pet = self.player.pets[i];
						if (pet.gridX == -1 && pet.gridY == -1)
							continue;
						self.removeEntity();
					}*/
					self.player.pets = [];
				}
            },

            getScaleFactor: function() {
                var w = window.innerWidth,
                    h = window.innerHeight,
                    scale;

                if(Detect.isMobile()) {
                	if (w < 1000)
                		scale = 1;
                	else if (w <=1500 || h <= 870)
                		scale = 2;
                	else
                		scale = 3;
                } else if(w <= 1500 || h <= 870) {
                    scale = 2;
                } else {

                    scale = 3;
                }

                return scale;
            }
        });

        return Game;
    });
