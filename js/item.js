/* global Types */

define(['entity'], function(Entity) {

    var Item = Entity.extend({
        init: function(id, kind, type, skillKind, skillLevel, durability, durabilityMax, experience) {
    	    this._super(id, kind);

            //this.itemKind = kind;
    	    this.type = type;
    	    this.wasDropped = false;
    	    this.skillKind = skillKind;
            this.skillLevel = skillLevel;
            this.durability = durability;
            this.durabilityMax = durabilityMax;
            this.experience = experience;
    	    this.count = 1;
        },
        
        hasShadow: function() {
            return true;
        },

        onLoot: function(player) {
            if(this.type === "weapon") {
                player.switchWeapon(this.itemKind);
            } else if(this.type === "armor"){
                if(player.level < 100){
                    player.armorloot_callback(this.itemKind);
                }
            }
        },

        getItemSpriteName: function() {
             if (ItemTypes.isCard(this.kind))
             {
             	 return ItemTypes.KindData[this.kind].sprite;
             }
             if (ItemTypes.KindData[this.kind].sprite !== "")
             {
             	     log.info("item-"+ ItemTypes.KindData[this.kind].sprite);
             	     return "item-"+ ItemTypes.KindData[this.kind].sprite;
             }
             return null;
        },
        

        getInfoMsg: function(){
            
            return this.getInfoMsgEx(this.kind, this.count, this.skillKind, this.skillLevel, this.durability, this.durabilityMax);
        },
        getInfoMsgEx: function(itemKind, enchantedPoint, skillKind, skillLevel, durability, durabilityMax) {
            var msg = '';
            if(ItemTypes.isWeapon(itemKind) || ItemTypes.isArcherWeapon(itemKind) || ItemTypes.isArmor(itemKind)){
                msg = ItemTypes.getName(itemKind) + ": Lv " + ItemTypes.getWeaponLevel(itemKind) + (enchantedPoint ? "+" + enchantedPoint + " " : " ") + durability + "/" + durabilityMax;
                return msg;
            }
            var name = ItemTypes.getName(itemKind);
            return (name) ? name : '';
        }
    });
  Item.getInfoMsgEx = Item.prototype.getInfoMsgEx;
  return Item;
});