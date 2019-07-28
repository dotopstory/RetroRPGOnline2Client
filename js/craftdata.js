/* global Types */
define(['text!../shared/data/craft.json'], function(CraftJson) {

	var CraftData = {};
	CraftData.Kinds = {};
	var craftParse = JSON.parse(CraftJson);
	$.each( craftParse, function( key, value ) {
		CraftData.Kinds[key] = {
			name: value.name,
			type: value.type,
			input: value.input,
			output: value.output,

		};
	});
    return CraftData;
});


