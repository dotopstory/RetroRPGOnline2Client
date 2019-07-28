
define(['entity','housesdata'], function(Entity, HousesData) {

    var House = Entity.extend({
        init: function(id, kind, gridX, gridY) {
            this._super(id, kind);
        	
            this.setGridPosition(gridX, gridY);
        	
        	this.data = HousesData.Kinds[kind];
        	
        },

        getSpriteName: function() {
            return this.data.sprite;
        },
        
        setEntityGrid: function (grid) {        	
        	for(var j = this.data.collision[1]; j < this.data.collision[3]; ++j)
        	{
        		for(var i = this.data.collision[0]; i < this.data.collision[2]; ++i)
        		{
        			grid[this.gridY+j][this.gridX+i][this.id] = this;	
        		}		
        	}
        },

        setPathingGrid: function (grid) {        	
        	for(var j = this.data.collision[1]; j < this.data.collision[3]; ++j)
        	{
        		for(var i = this.data.collision[0]; i < this.data.collision[2]; ++i) 
        		{
        			grid[this.gridY+j][this.gridX+i] = 1;	
        		}		
        	}
        },
        
        removeEntity: function (grid) {
        	for(var j = this.data.collision[1]; j < this.data.collision[3]; ++j)
        	{
        		for(var i = this.data.collision[0]; i < this.data.collision[2]; ++i)
        		{
        			grid[this.gridY+j][this.gridX+i][this.id] = null;
        		}		
        	}        	
        },
        
        removeFromPathingGrid: function (grid) {
        	for(var j = this.data.collision[1]; j < this.data.collision[3]; ++j)
        	{
        		for(var i = this.data.collision[0]; i < this.data.collision[2]; ++i)
        		{
        			grid[this.gridY+j][this.gridX+i] = 0;
        		}		
        	}        	
        },
        
        removeFromRenderingGrid: function (grid) {
        	grid[this.gridY][this.gridX][this.id] = null;
        }, 
        
        destroy: function() {
            if(this.destroy_callback) {
                this.destroy_callback();
            }
        },

        onDestroy: function(callback) {
            this.destroy_callback = callback;
        },
        
        isAdjacent: function(entity) {
        	if ((this.gridX+this.data.collision[0]-1) <= entity.gridX &&
        		(this.gridX+this.data.collision[2]+1) >= entity.gridX &&
        		(this.gridY+this.data.collision[0]-1) <= entity.gridY && 
        		(this.gridY+this.data.collision[3]+1) >= entity.gridY)
            {
            	return true;
            }
            return false;
        },  
        
        isNear: function(entity,d) {
        	if ((this.gridX+this.data.collision[0]-d) <= entity.gridX &&
        		(this.gridX+this.data.collision[2]+d) >= entity.gridX &&
        		(this.gridY+this.data.collision[0]-d) <= entity.gridY && 
        		(this.gridY+this.data.collision[3]+d) >= entity.gridY)
            {
            	return true;
            }
            return false;
        },  
        
        isMoving: function () {
        	return false;
        }
    });

    return House;
});