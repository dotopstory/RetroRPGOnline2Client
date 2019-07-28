
define(function() {

    var InfoManager = Class.extend({
        init: function(game) {
            this.game = game;
            this.infos = {};
            this.destroyQueue = [];
            this.infoQueue = [];
            
            var self = this;
            
            
            setInterval(function ()
            {
            	if (self.infoQueue.length > 0)
            	{
            		var time = self.game.currentTime;
            		var info = self.infoQueue[0];
            		if (!info.showTime) info.showTime = time;
            		self.infos[info.id] = info;
            		if (info.isTimeToShow(time))
            		{
            			self.infoQueue.splice(0,1);
            		}
            	}
        	},100);
        },

        addDamageInfo: function(value, x, y, type, duration) {
            var time = this.game.currentTime,
                id = time+""+(isNaN(value*1)?value:value*1)+""+x+""+y,
                self = this,
                info = new HoveringInfo(this.game, id, value, x, y, (duration)?duration:1000, type);
		info.onDestroy(function(id) {
		    self.destroyQueue.push(id);
		});
			
			if (info.interval > 0) {
				self.infoQueue.push(info);
			}
			else
			{
				info.showTime = time;
				self.infos[id] = info;
			}
        },

        forEachInfo: function(callback) {
            var self = this;

            _.each(this.infos, function(info, id) {
                callback(info);
            });
        },

        update: function(time) {
            var self = this;

            this.forEachInfo(function(info) {
            	//if (info.isTimeToShow(time)) {
            		info.update(time);
                //}
            });

            _.each(this.destroyQueue, function(id) {
                delete self.infos[id];
            });
            this.destroyQueue = [];
        }
    });


    var damageInfoData = {
        "received": {
            fill: "rgb(255, 50, 50)",
            stroke: "rgb(255, 180, 180)",
            fontSize: 12,
            speed: 50
        },
        "inflicted": {
            fill: "white",
            stroke: "#373737",
            fontSize: 12,
            speed: 50
        },
        "healed": {
            fill: "rgb(80, 255, 80)",
            stroke: "rgb(50, 120, 50)",
            fontSize: 12,
            speed: 50
         },
        "health": {
            fill: "white",
            stroke: "#373737",
            fontSize: 12,
            speed: 50
        },
        "exp": {
            fill: "rgb(80, 80, 255)",
            stroke: "rgb(40, 40, 127)",
            fontSize: 12,
            speed: 75
       },
        "level": {
            fill: "rgb(255, 255, 255)",
            stroke: "rgb(0, 0, 0)",
            fontSize: 16,
            speed: 50,
            interval:1000,
       },
        "majorlevel": {
            fill: "rgb(255, 255, 255)",
            stroke: "rgb(0, 0, 0)",
            fontSize: 18,
            speed: 50,
            interval:1000,
       },
       "crit": {
            fill: "yellow",
            stroke: "#373737",
            fontSize: 14,
            speed: 100
        },       
    };


    var HoveringInfo = Class.extend({
        DURATION: 1000,

        init: function(game, id, value, x, y, duration, type) {
        	this.game = game;
            this.id = id;
            this.value = value;
            this.duration = duration;
            this.x = x;
            this.y = y;
            this.opacity = 1.0;
            this.lastTime = 0;
            this.speed = damageInfoData[type].speed;
            this.interval = damageInfoData[type].interval || 0;
            this.fillColor = damageInfoData[type].fill;
            this.strokeColor = damageInfoData[type].stroke;
            this.fontSize = damageInfoData[type].fontSize * game.renderer.scale;
            //this.showTime = game.currentTime;
        },

        isTimeToAnimate: function(time) {
            return (time - this.lastTime) > this.speed;
        },

        isTimeToShow: function(time) {
            return (time - this.showTime) > this.interval;
        },
        
        isTimeToDestroy: function (time) {
        	return (time - this.showTime) > (this.interval + this.duration);
        },
        
        update: function(time) {
				if(this.isTimeToAnimate(time)) {
					this.lastTime = time;
					this.tick(time);
				}
        },

        tick: function(time) {
				if(this.type !== 'health') this.y -= 1;
				this.opacity -= (100/this.duration);
				if(this.opacity <= 0) {
					this.destroy();
				}
        },

        onDestroy: function(callback) {
            this.destroy_callback = callback;
        },

        destroy: function() {
            if(this.destroy_callback) {
                this.destroy_callback(this.id);
            }
        }
    });

    return InfoManager;
});
