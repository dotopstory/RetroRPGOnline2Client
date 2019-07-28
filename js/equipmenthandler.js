/* global Types, Class */

define([], function() {
    var EquipmentHandler = Class.extend({
        init: function(game) {
            this.game = game;
            this.equipment = {};
            this.maxEquipmentNumber = 2;
        },
        
        initEquipment: function(equipmentCount, equipmentSlot, equipmentKind, equipmentNumber, equipmentSkillKind, equipmentSkillLevel, equipmentDurability, equipmentDurabilityMax, equipmentExperience) {
            for(var i=0; i < equipmentCount; i++){
		    var equipment = {}; 
		    equipment.kind = equipmentKind[i] ? equipmentKind[i] : 0;
		    equipment.count = equipmentNumber[i] ? equipmentNumber[i] : 0;
		    equipment.skillKind = equipmentSkillKind[i] ? equipmentSkillKind[i] : 0;
		    equipment.skillLevel = equipmentSkillLevel[i] ? equipmentSkillLevel[i] : 0;
		    equipment.durability = equipmentDurability[i] ? equipmentDurability[i] : 0;
		    equipment.durabilityMax = equipmentDurabilityMax[i] ? equipmentDurabilityMax[i] : 0;
		    equipment.experience = equipmentExperience[i] ? equipmentExperience[i] : 0;
		    this.equipment[ equipmentSlot[i]] = equipment;
            }
            //log.info("equipment="+JSON.stringify(this.equipment));
        },
        
        setEquipment: function(index, equipmentKind, equipmentNumber, equipmentSkillKind, equipmentSkillLevel, equipmentDurability, equipmentDurabilityMax, equipmentExperience) {                
	    if (equipmentKind==0)
	    	    this.equipment[index] = null;
	    else 
	    {	    
		    var equipment = {};
		    equipment.kind = equipmentKind ? equipmentKind : 0 ;
		    equipment.count = equipmentNumber ? equipmentNumber : 0;
		    equipment.skillKind = equipmentSkillKind ? equipmentSkillKind : 0;
		    equipment.skillLevel = equipmentSkillLevel ? equipmentSkillLevel : 0;
		    equipment.durability = equipmentDurability ? equipmentDurability : 0;
		    equipment.durabilityMax = equipmentDurabilityMax ? equipmentDurabilityMax : 0;
		    equipment.experience = equipmentExperience ? equipmentExperience : 0;
		    this.equipment[index] = equipment;
	    }
        },        
    });

    return EquipmentHandler;
});

