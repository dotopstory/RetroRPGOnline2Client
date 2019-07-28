
define(['entity','house'], function(Entity, House) {

    var PvpBase = House.extend({
        init: function(id, kind, gridX, gridY, pvpSide) {
            this._super(id, kind, gridX, gridY);
        	
            this.setGridPosition(gridX, gridY);
        	
        	this.pvpSide = pvpSide;
        	
        },
    });
    return PvpBase;
});
