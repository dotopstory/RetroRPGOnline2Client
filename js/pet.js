define(['mob', 'timer'], function(Mob, Timer) {
    var Pet = Mob.extend({
        init: function(id, kind, name, mapIndex) {
            this._super(id, kind, name);
            this.playerId = null;
            
            this.setMoveRate(250);
            this.moveSpeed = 250;
            this.mapIndex = mapIndex;
            this.name = name;
        },
        

    });
    return Pet;
});

