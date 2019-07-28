/* global Types */
define(['text!../shared/data/houses.json'], function(HousesJson) {

	var HouseData = {};
	HouseData.Kinds = {};
	HouseData.Properties = {};
	var gatherParse = JSON.parse(HousesJson);
	$.each( gatherParse, function( key, value ) {
		HouseData.Properties[key.toLowerCase()] = {
			key: key.toLowerCase(),
			kind: value.kind,
			name: value.name ? value.name : key,
			sprite: value.sprite ? value.sprite : key.toLowerCase(),
			hp: value.xp ? value.hp : 0,
			collision: value.collision ? value.collision : [0,0,1,1],
		};
		HouseData.Kinds[value.kind] = HouseData.Properties[key.toLowerCase()];
	});
    return HouseData;
});

