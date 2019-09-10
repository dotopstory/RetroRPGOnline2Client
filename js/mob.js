
define(['character', 'mobdata', 'util'], function(Character, MobData, util) {

    var Mob = Character.extend({
        init: function(id, kind, name) {
            this._super(id, kind);

            this.aggroRange = 1;
            this.isAggressive = true;
            this.moveSpeed = 350;
            this.atkSpeed = 350;
            this.idleSpeed = 1000;


            this.data = MobData.Kinds[this.kind];

            if (this.data.level)
            	    this.level = this.data.level;

            this.title = this.data.name;
            this.xp = this.data.xp;

            this.flags = {};
            this.flags.isCashedUp = false;

            this.attackRange = this.data.attackRange;

            this.setMoveRate(this.moveSpeed);
        },

        idle: function(orientation) {
            if (MobData.Kinds[this.kind].key === "deathknight" ||
            	MobData.Kinds[this.kind].key === "skeletonking")
            {
                if(!this.hasTarget()) {
                    this._super(Types.Orientations.DOWN);
                } else {
                    this._super(orientation);
                }
            }
            else
            {
            	    this._super(orientation);
            }
        },

        getMobSpriteName: function() {
        	log.info("spriteName="+MobData.Kinds[this.kind].spriteName);
                return MobData.Kinds[this.kind].spriteName;
        },

	    distanceToSpawningPoint: function (x, y) {
		return distanceTo(x, y, this.spawningX, this.spawningY);
	    },

	setSpawnPoint: function (x,y) {
		this.spawningX = x;
		this.spawningY = y;
	},

	    forgetEveryone: function () {
		this.hatelist = [];
		this.tankerlist = [];
	    },

    });

    return Mob;
});
