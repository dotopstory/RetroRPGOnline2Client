
define(['text!../shared/data/items2.json', 'item', '../shared/js/itemtypes'], function(ItemsJson, Item) {
	var Items = {};
	var KindData = {};
	KindData[0] = null;
	var itemParse = JSON.parse(ItemsJson);
	//log.info(JSON.stringify(itemParse));
	$.each( itemParse, function( itemKey, itemValue ) {
		if (itemValue.type == "weapon" || itemValue.type == "weaponarcher") {
			Items[itemKey+1] = Item.extend({
				init: function(id, skillKind, skillLevel) {
					this._super(id, itemKey, itemValue.type, skillKind, skillLevel);
				}
			});
		}
		else if (itemValue.type == "armor" || itemValue.type == "armorarcher" ||
			 itemValue.type == "object" || itemValue.type == "craft" ||
		 	  itemValue.type == "boots" || itemValue.type == "gloves") {
			Items[itemKey+1] = Item.extend({
				init: function(id) {
					this._super(id, itemKey, itemValue.type);
				}				
			});
		}
		KindData[itemKey+1] = {
			name: itemValue.name,
			type: (itemValue.type) ? itemValue.type : "object",
			damageType: (itemValue.damageType) ? itemValue.damageType : "none",
			typemod: (itemValue.typemod) ? itemValue.typemod : "none",
			modifier: (itemValue.modifier) ? itemValue.modifier : 0,
			hand: (itemValue.hand) ? itemValue.hand : 0,
			sprite: (itemValue.sprite) ? itemValue.sprite : "mainweaponarmor.png",
			offset: (itemValue.offset) ? itemValue.offset : [0,0],
			buy: (itemValue.buy) ? itemValue.buy : 0,
			buycount: (itemValue.buycount) ? itemValue.buycount : 0
		};
	});
	ItemTypes.setKindData(KindData);
	//ItemTypes.setupStore();
    return Items;
});
