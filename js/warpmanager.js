define([], function() {
    var WarpManager = Class.extend({
        init: function(game) {
            var self = this;
            this.enabled = false;            
            this.game = game;
        },
        
        toggle: function() {
            if(this.enabled) {
                this.enabled = false;

		var p = this.game.player;
	
		if (p.warpX && p.warpY)
		{
			this.teleportToTown();
			/*this.teleportTo(p.warpX, p.warpY);
		    p.warpX = null;
		    p.warpY = null;*/
		}  
		else
		{
			this.teleportToTown();	
		}
            } else {
                this.enabled = true;
                this.teleportToTown();
            }
            return this.enabled;
        },
        
        teleportToTown: function () {
    		var p = this.game.player; 
    		p.warpX = p.gridX;
    		p.warpY = p.gridY;
    		
            var destX = Math.floor(Math.random() * 8) + 245;
    		var destY = Math.floor(Math.random() * 8) + 65;
    		
        	this.game.teleportMaps(0, destX, destY);
        },
    });
    return WarpManager;
});
