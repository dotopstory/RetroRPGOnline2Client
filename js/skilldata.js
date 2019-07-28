/* global Types */
define(['text!../shared/data/skills.json'], function(SkillsJSON) {

	Skill = {};
	Skill.Data = [];
	Skill.Names = {};
	var skillsParse = JSON.parse(SkillsJSON);
	for (var i in skillsParse)
	{
		var value = skillsParse[i];
		
		Skill.Data.push({
		    name:value.name,
		    type:value.type ? value.type : "cast",
		    skillType:value.skillType,
		    target:value.target ? value.target : "enemy",
		    duration:value.duration ? value.duration : 0,
		    perLevel: value.perLevel,
		    baseLevel: value.baseLevel ? value.baseLevel : value.perLevel,
		    recharge: value.recharge ? value.recharge : 0,
		    aoe: value.aoe ? value.aoe : 0,
		    iconOffset: value.iconOffset,
		    detail: value.detail
		});
		Skill.Names[value.name] = Skill.Data[i];
	}
    return Skill;
});

