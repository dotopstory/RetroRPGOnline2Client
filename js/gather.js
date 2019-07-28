
define(['entity', 'gatherdata'], function(Entity, GatherData) {

    var Gather = Entity.extend({
        init: function(id, kind) {
            this._super(id, kind);
            this.data = GatherData.Kinds[kind];
            
            this.collision = this.data.collision;
        },

        setGridPosition: function(gridX, gridY) {
        	this.gridX = gridX;
        	this.gridY = gridY;
        	this.x = gridX * 16;
        	this.y = gridY * 16;
    	},

        getSpriteName: function() {
        	log.info("sprite="+GatherData.Kinds[this.kind].sprite);
            return GatherData.Kinds[this.kind].sprite;
        },
        
        // TODO
        setOrientation: function(orientation) {
            if(orientation) {
                this.orientation = orientation;
            }
        },

        idle: function(orientation) {
            this.setOrientation(orientation);
            this.animate("idle", this.idleSpeed);
        },
        
        animate: function(animation, speed, count, onEndCount) {
            var oriented = ['idle'],
                o = this.orientation;

            if(!(this.currentAnimation && this.currentAnimation.name === "death")) { // don't change animation if the character is dying
                this.flipSpriteX = false;
                this.flipSpriteY = false;

                if(_.indexOf(oriented, animation) >= 0) {
                    animation += "_down";
                    //animation += "_" + (o === Types.Orientations.LEFT ? "right" : Types.getOrientationAsString(o));
                    this.flipSpriteX = (this.orientation === Types.Orientations.LEFT) ? true : false;
					this.collision = this.flipSpriteX ? 
						this.data.collision2 : this.data.collision;
                    
                }

                this.setAnimation(animation, speed, count, onEndCount);
            }
        },


        onDeath: function(callback) {
            this.death_callback = callback;
        },

        die: function() {
            this.isDead = true;

            if(this.death_callback) {
                this.death_callback();
            }
        },

        isAdjacent: function(entity) {
        	if ((this.gridX+this.collision[0]-1) <= entity.gridX &&
        		(this.gridX+this.collision[2]+1) >= entity.gridX &&
        		(this.gridY+this.collision[1]-1) <= entity.gridY && 
        		(this.gridY+this.collision[3]+1) >= entity.gridY)
            {
            	return true;
            }
            return false;
        },     

        setEntityGrid: function (grid) {        	
        	for(var j = this.collision[1]; j < this.collision[3]; ++j)
        	{
        		for(var i = this.collision[0]; i < this.collision[2]; ++i)
        		{
        			grid[this.gridY+j][this.gridX+i][this.id] = this;	
        		}		
        	}
        },

        setPathingGrid: function (grid) {        	
        	for(var j = this.collision[1]; j < this.collision[3]; ++j)
        	{
        		for(var i = this.collision[0]; i < this.collision[2]; ++i) 
        		{
        			grid[this.gridY+j][this.gridX+i] = 1;	
        		}		
        	}
        },
        
        removeEntity: function (grid) {
        	for(var j = this.collision[1]; j < this.collision[3]; ++j)
        	{
        		for(var i = this.collision[0]; i < this.collision[2]; ++i)
        		{
        			grid[this.gridY+j][this.gridX+i][this.id] = null;
        		}		
        	}        	
        },
        
        removeFromPathingGrid: function (grid) {
        	for(var j = this.collision[1]; j < this.collision[3]; ++j)
        	{
        		for(var i = this.collision[0]; i < this.collision[2]; ++i)
        		{
        			grid[this.gridY+j][this.gridX+i] = 0;
        		}		
        	}        	
        },
        
        removeFromRenderingGrid: function (grid) {
        	grid[this.gridY][this.gridX][this.id] = null;
        }, 
    });

    return Gather;
});

