
define(function() {

    var Camera = Class.extend({
        init: function(game, renderer) {
            this.game = game;
            this.renderer = renderer;
            //this.offset = 0.5;
            this.x = 0;
            this.y = 0;
            this.gridX = 0;
            this.gridY = 0;
            this.unclipped = true;
            this.prevUnclipped = true;
            //this.prevOrientation = null;

            this.rescale( (this.renderer.mobile) ? 17 : 21);

            this.entities = {};


        },

        rescale: function(gridW) {
        	this.gridW = gridW;

            this.gridH = Math.ceil(this.gridW / this.renderer.getProportionFactor());

            this.gridW2 = Math.floor(this.gridW / 2);
            this.gridH2 = Math.floor(this.gridH / 2) - ((this.renderer.mobile || this.renderer.tablet) ? 1 : 0);

            //this.isattached = false;

            log.debug("---------");
            log.debug("W:"+this.gridW + " H:" + this.gridH);
            //alert("W:"+this.gridW + " H:" + this.gridH);
        },

        setRealCoords: function(coords) {
            coords = coords || (this.game.player) ? this.game.player : null;

             if (!coords) return;
             //if (this.game.mapStatus < 3)
             //	 return;

             var ts = this.renderer.tilesize;
             //var w = (this.renderer.tablet || this.renderer.mobile) ? this.gridW - 4 : this.gridW;
             //var h = (this.renderer.tablet || this.renderer.mobile) ? this.gridH - 4 : this.gridH;
             var w = this.gridW - 2;
             var h = this.gridH - 2;

             var s = this.renderer.scale;
             this.unclippedX = ~~(coords.x - (this.gridW2 * ts));
             this.unclippedY = ~~(coords.y - (this.gridH2 * ts));

             var maxX = (this.game.map.width-w)*ts;
             var maxY = (this.game.map.height-h)*ts;

             if (this.game.map.width <= w || this.game.map.height <= h)
             {
             	 this.x = this.unclippedX;
             	 this.y = this.unclippedY;
             	 this.unclipped = true;
             }
             else
             {
        			 this.setIsUnclipped();
        			 this.x = this.unclippedX.clamp(0, maxX);
        			 this.y = this.unclippedY.clamp(0, maxY);
             }

             this.gridX = Math.round(this.x / this.renderer.tilesize);
             this.gridY = Math.round(this.y / this.renderer.tilesize);
        },

        updateTick: function () {
        	/*var p = this.game.player;
        	if (p)
        		this.prevOrientation = p.orientation;*/
        },

        setIsUnclipped: function () {
        	var p = this.game.player;
        	var r =  this.renderer;
        	var ts = this.renderer.tilesize;
        	//var s = this.renderer.scale;
        	var x = 0;
        	var y = 0;
        	//var w = (this.renderer.tablet || this.renderer.mobile) ? this.gridW - 4 : this.gridW;
	        //var h = (this.renderer.tablet || this.renderer.mobile) ? this.gridH - 4 : this.gridH;
	        var w = this.gridW - 2;
	        var h = this.gridH - 2;

        	var maxX = (this.game.map.width-w)*ts;
        	var maxY = (this.game.map.height-h)*ts;

    			if (this.game.map.width <= w || this.game.map.height <= h)
    			{
    			  this.x = this.unclippedX;
    			  this.y = this.unclippedY;
    			  this.unclipped = true;
    			}
    			else if (p && ((this.unclippedX <= 0 || this.unclippedX >= maxX) &&
    				(p.orientation == Types.Orientations.LEFT || p.orientation == Types.Orientations.RIGHT) ) ||
    				((this.unclippedY <= 0 || this.unclippedY >= maxY) &&
    				(p.orientation == Types.Orientations.UP || p.orientation == Types.Orientations.DOWN)))
    			{
    			  this.unclipped = false;
    			}
    			else
    			{
    			  this.unclipped = true;
    			}

    			if (p && ((this.unclippedX <= 0 || this.unclippedX >= maxX) ||
    				(this.unclippedY <= 0 || this.unclippedY >= maxY)))
    			{
    			  this.oldclip = true;
    			}
    			else
    			{
    			  this.oldclip = false;
    			}

        },

        forEachVisibleValidPosition: function(callback, extra, map) {
            var w = this.gridW;
            var h = this.gridH;

            //log.info("extra: "+extra);
            //Invalid: isInt(x) && isInt(y) && (x < 0 || x >= this.width || y < 0 || y >= this.height);
            //log.info("map: "+map.width+","+map.height);
            //log.info("grid_min: "+Math.max(0,this.gridX-extra)+","+Math.max(0,this.gridY-extra));
            //log.info("grid_max: "+Math.min(map.width, this.gridX+w+(2*extra))+","+Math.min(map.height, this.gridY+h+(2*extra)));
            //log.info("w:"+w+",h:"+h);
            //log.info("x:"+this.gridX+",y:"+this.gridY);
            var minX = Math.max(0,this.gridX-1-extra);
            var minY = Math.max(0,this.gridY-1-extra);
            //log.info("minX="+minX);
            //log.info("minY="+minY);
            var maxX = Math.min(map.width-1, this.gridX+w+extra);
            var maxY = Math.min(map.height-1, this.gridY+h+extra);

            for(var y=minY; y <= maxY; ++y) {
                for(var x=minX; x <= maxX; ++x) {
                    callback(x, y);
                }
            }
        },

        forEachVisibleValidEntityPosition: function(callback, extra, map) {
            var w = this.gridW;
            var h = this.gridH;

            //log.info("extra: "+extra);
            //Invalid: isInt(x) && isInt(y) && (x < 0 || x >= this.width || y < 0 || y >= this.height);
            //log.info("map: "+map.width+","+map.height);
            //log.info("grid_min: "+Math.max(0,this.gridX-extra)+","+Math.max(0,this.gridY-extra));
            //log.info("grid_max: "+Math.min(map.width, this.gridX+w+(2*extra))+","+Math.min(map.height, this.gridY+h+(2*extra)));
            //log.info("w:"+w+",h:"+h);
            //log.info("x:"+this.gridX+",y:"+this.gridY);

            var minX = Math.max(0,this.gridX-1);
            var minY = Math.max(0,this.gridY-1);
            //log.info("minX="+minX);
            //log.info("minY="+minY);
            var maxX = Math.min(map.width+1, this.gridX+w+4);
            var maxY = Math.min(map.height-1, this.gridY+h+3);

            for(var y=minY; y <= maxY; ++y) {
                for(var x=minX; x <= maxX; ++x) {
                    callback(x, y);
                }
            }
        },

        forEachNewTile: function(callback, extra, map) {
        	var c = this.game.player;
        	var w = this.gridW;
	        var h = this.gridH;
      		var minX = Math.max(0,this.gridX-1-extra);
      		var minY = Math.max(0,this.gridY-1-extra);
      		var maxX = Math.min(map.width-1, this.gridX+w+extra);
      		var maxY = Math.min(map.height-1, this.gridY+h+extra);

      		//var orientations;

      		var r = this.game.renderer;

      		if (r.backgroundOffsetX > 0)
      		{
      		    for(var y=minY; y <= maxY; ++y) {
                callback(minX, y);
                callback(minX+1, y);
      		    }

      		}

      		if (r.backgroundOffsetX < 0)
      		{
      		    for(var y=minY; y <= maxY; ++y) {
          			callback(maxX, y);
          			callback(maxX-1, y);
      		    }
      		}

      		if (r.backgroundOffsetY > 0)
      		{
      		    for(var x=minX; x <= maxX; ++x) {
          			callback(x, minY);
          			callback(x, minY+1);
      		    }

      		}

      		if (r.backgroundOffsetY < 0)
      		{
      		    for(var x=minX; x <= maxX; ++x) {
          			callback(x, maxY);
          			callback(x, maxY-1);
      		    }
      		}
        },

        isVisible: function(map, entity) {
            if (!entity) return false;
            return this.isVisiblePosition(map, entity.gridX, entity.gridY);
        },

        isVisiblePosition: function(map, x, y) {
            //var w = this.gridW;
	          //var h = this.gridH;
            var minX = Math.max(0,this.gridX-1);
      		  var minY = Math.max(0,this.gridY-1);
      		  var maxX = Math.min(map.width, this.gridX+this.gridW+1);
      		  var maxY = Math.min(map.height, this.gridY+this.gridH+1);

            if(y >= minY && y <= maxY && x >= minX && x <= maxX)
            {
                return true;
            } else {
                return false;
            }
        },

    });

	Number.prototype.clamp = function (min, max) {
		return Math.min(Math.max(this, min), max);
	};
    return Camera;
});
