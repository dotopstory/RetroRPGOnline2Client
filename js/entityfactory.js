/* global Types, log, _ */
define(['item', 'mob', 'npc', 'pet', 'player', 'chest', 'gather', 'pvpbase'],
	function(Item, Mob, Npc, Pet, Player, Chest, Gather, PvpBase) {

    var EntityFactory = {};

    EntityFactory.createEntity = function(kind, id, name, mapIndex, skillKind, skillLevel) {
        if(!id) {
            log.info("ERROR - kind is undefined: "+kind+" "+id+" "+name, true);
            return null;
        }
        
        if (isChest(id))
        	return new Chest(id, kind);
        
        // If Items.
        if (isItem(id))
        	return new Item(id, kind, "item", skillKind, skillLevel);
        
        // If Gather
        if (isGather(id))
        {
            return new Gather(id, kind);
        }

        if (isPlayer(id))
        	return new Player(id, name, game);
        
        // If NPC
        if (isNpcPlayer(id))
        {
            return new Player(id, name, game);
        }

        // If Mobs.
        if (isMob(id))
        	return new Mob(id, kind, name);

        if (isNpc(id))
        	return new Npc(id, kind, name);

        // If Pets
        if (isPet(id))
        {
            return new Pet(id, kind, name, mapIndex);
        }

        return null;
    };
    return EntityFactory;
});
