/* global Types, Class */

define([], function() {
    var BankHandler = Class.extend({
        init: function(game) {
            this.game = game;
            this.maxBankNumber = 18;
            this.banks = {};
        },
        
        initBank: function(bankCount, bankSlot, bankKind, bankNumber, bankSkillKind, bankSkillLevel, bankDurability, bankDurabilityMax, bankExperience, gold) {
            for(var i=0; i < bankCount; i++){
            	    var bank = {}; 
		    bank.kind = bankKind[i] ? bankKind[i] : 0;
		    bank.count = bankNumber[i] ? bankNumber[i] : 0;
		    bank.skillKind = bankSkillKind[i] ? bankSkillKind[i] : 0;
		    bank.skillLevel = bankSkillLevel[i] ? bankSkillLevel[i] : 0;
		    bank.durability = bankDurability[i] ? bankDurability[i] : 0;
		    bank.durabilityMax = bankDurabilityMax[i] ? bankDurabilityMax[i] : 0;
		    bank.experience = bankExperience[i] ? bankExperience[i] : 0;
		    this.banks[bankSlot[i]] = bank;
            }
            this.setGold(gold);
            //log.info("bank="+JSON.stringify(this.banks));
        },
        
        setBank: function(index, bankKind, bankNumber, bankSkillKind, bankSkillLevel, bankDurability, bankDurabilityMax, bankExperience) {                
	    if (bankKind == null)
	    {
	        this.banks[index] = null;
	        delete this.banks[index];
	    }
	    else
	    {
		    var bank = {};
		    bank.kind = bankKind ? bankKind : 0 ;
		    bank.count = bankNumber ? bankNumber : 0;
		    bank.skillKind = bankSkillKind ? bankSkillKind : 0;
		    bank.skillLevel = bankSkillLevel ? bankSkillLevel : 0;
		    bank.durability = bankDurability ? bankDurability : 0;
		    bank.durabilityMax = bankDurabilityMax ? bankDurabilityMax : 0;
		    bank.experience = bankExperience ? bankExperience : 0;
		    this.banks[index] = bank;
	    }
        },

        setGold: function(gold) {
            this.gold = parseInt(gold);
            $('.bankGold').html(this.gold);
        },
        
        isBankFull: function() {
        	for (var i=0; i < this.maxBankNumber; i++)
        	{
        		if (!this.banks[i])
        			return false;
        	}
        	return true;
        },
        
    });
    
    return BankHandler;
});

