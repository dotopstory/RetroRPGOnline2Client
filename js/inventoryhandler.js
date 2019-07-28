/* global Types, Class */

define(['button2', 'item'], function(Button2, Item) {
    var InventoryHandler = Class.extend({
        init: function(game) {
            this.game = game;

            this.maxInventoryNumber = 24;
            this.inventory = [];
            this.inventoryCount = [];
            this.inventories = {};
            this.inventoryDisplay = [];
            this.scale = this.game.renderer.getUiScaleFactor();
            log.info("this.scale="+this.scale);
            
            this.moreInventoryButton = new Button2('#moreinventorybutton', {background: {left: 196 * this.scale, top: 314 * this.scale, width: 17 * this.scale}, kinds: [0, 2], visible: false});

            this.healingCoolTimeCallback = null;
            
            this.isShowAllInventory = false;

            var self = this;
            for(var i=0; i<4; i++) {            	
                $('#scinventory' + i).bind("click", function(event) {
                	if(self.game.ready){
						var inventoryNumber = parseInt(this.id.slice(11));
						var inventory = self.game.inventoryHandler.inventory[inventoryNumber];
						if(inventory) {
							if(ItemTypes.isConsumableItem(inventory)) {
								self.game.eat(inventoryNumber);
							}
						}
					}
                });
                $('#scinventorybackground' + i).bind("click", function(event) {
					if(self.game.ready){
						var inventoryNumber = parseInt(this.id.slice(21));
						var inventory = self.game.inventoryHandler.inventory[inventoryNumber];
						if(inventory) {
							if(ItemTypes.isConsumableItem(inventory)) {
								self.game.eat(inventoryNumber);
							}
						}
					}
                });            	    
                
            }
            
		    this.closeButton = $('#inventoryCloseButton');
		    this.closeButton.click(function(event) {
			self.toggleAllInventory();
		    });
		
        },
        
        loadInventoryEvents: function () {
            var self = this;
            DragDataInv = {};
            for(var i=0; i<24; i++) {

                $('#inventory' + i).on("click tap", function(event) {
		    if(self.game.ready){
			var inventoryNumber = parseInt(this.id.slice(9));
			var inventory = self.game.inventoryHandler.inventory[inventoryNumber];
			if(inventory) {
			    if(ItemTypes.isConsumableItem(inventory)) {
				self.game.eat(inventoryNumber);
			    }
			    else
			    {
				self.game.equip(inventoryNumber);
			    }
			}
		    }
                });

                
                $('#inventory'+i).attr('draggable',true);
                $('#inventory'+i).draggable = true;
                
		$('#inventory'+i).on('dragstart touchstart', function(event) {
		    var inventoryNumber = parseInt(this.id.slice(9));		    
		    DragDataInv.invNumber = inventoryNumber;
		    //log.info("start");
		});
		    
		    $('#inventory'+i).on('dragover touchover', function(event) {
		        event.preventDefault();		    		    
		    });
		    
		    $('#inventory'+i).on('dragend touchend', function(event) {
			//log.info("end");
			var touch = event.originalEvent.changedTouches ? event.originalEvent.changedTouches[0] : null;
			var elem = document.getElementById("toptextcanvas");
			var touchedElem;
			if (touch)
				touchedElem = document.elementFromPoint(touch.clientX, touch.clientY);
			else
				touchedElem = document.elementFromPoint(event.clientX, event.clientY);
			var invCheck = DragDataInv && DragDataInv.invNumber >= 0;
			
			if(elem==touchedElem && invCheck) {
			    self.game.dropItem(DragDataInv.invNumber);
			    DragDataInv.invNumber = null;
			}
		    });
		    
            }            
        },
        
        moveShortcuts: function(x,y) {
	    this.container.css({
		"left":this.game.mouse.x + "px",
		"top":this.game.mouse.y + "px"
	    });        	
        },
                
        showInventoryButton: function() {
        	var scale = this.scale;
        	this.moreInventoryButton.setBackground({left: 196 * scale, top: 314 * scale, width: 17 * scale});        	
        },
        
        inventoryDisplayShow: function () {
            var length = this.inventoryDisplay.length;
	    for(var i=0; i<length; i++){

		this.setInventory(
			this.inventoryDisplay[i].slot,
			this.inventoryDisplay[i].inv,
			this.inventoryDisplay[i].num,
			this.inventoryDisplay[i].skillkind,
			this.inventoryDisplay[i].skilllevel,
			this.inventoryDisplay[i].durability,
			this.inventoryDisplay[i].durabilityMax,
			this.inventoryDisplay[i].experience);
	    }

        },
        
        setGold: function(gold) {
            this.gold = gold;
            $('.inventoryGold').html(this.gold);
        },
        
        initInventory: function(inventoryCount, inventorySlot, inventoryKind, inventoryNumber, inventorySkillKind, inventorySkillLevel, inventoryDurability, inventoryDurabilityMax, inventoryExperience, gold) {
            this.inventoryDisplay = [];
            for(var i=0; i<inventoryCount; i++){
                var setInvObj = {
                	slot: inventorySlot[i],
                	inv: (inventoryKind[i] == null ? 0: inventoryKind[i]),
                	num: inventoryNumber[i],
                	skillkind: inventorySkillKind[i],
                	skilllevel: inventorySkillLevel[i],
                	durability: inventoryDurability[i],
                	durabilityMax: inventoryDurabilityMax[i],
                	experience: inventoryExperience[i],
                	name: (inventoryKind[i] > 0) ? ItemTypes.KindData[inventoryKind[i]].name : ''}

                this.inventoryDisplay.push(setInvObj);
            }
            this.setGold(gold);
            this.inventoryDisplayShow();
        },
        setInventory: function(inventoryNumber, itemKind, number, itemSkillKind, itemSkillLevel, itemDurability, itemDurabilityMax, itemExperience) {
        	log.info("this.scale="+this.scale);
            this.inventory[inventoryNumber] = itemKind;
            
            if(number){
                  this.inventoryCount[inventoryNumber] = number;
            } else{
                  this.inventoryCount[inventoryNumber] = 0;
            }

            // TODO - Work out why not emptying item shortcuts.
            if(itemKind > 0 && number > 0)
            {
            	  var itemData = ItemTypes.KindData[itemKind];
                  var spriteName = itemData.sprite;

                  if(inventoryNumber >= 0 && inventoryNumber < 4) {
                      if (itemKind > 0) {
                      	      
                      	      $('#scinventory' + inventoryNumber).css({'background-image': "url('img/" + this.scale + "/" + spriteName + "')",
                      	         'background-position': '-'+(itemData.offset[0]*this.scale*24)+'px -'+(itemData.offset[1]*this.scale*24)+'px',
                      	      	 'background-size':(144*this.scale)+"px "+(24*this.scale)+"px"});

                      	      $('#scinventory' + inventoryNumber).attr('title', Item.getInfoMsgEx(itemKind, number, itemSkillKind, itemSkillLevel));
                      	      $('#scinventorynumber' + inventoryNumber).html(number);                    
                      }
                  }
                 
                  if (itemKind > 0) {
                      	  $('#inventory' + inventoryNumber).css({'background-image': "url('img/" + this.scale + "/" + spriteName + "')",
                      	      'background-position': '-'+(itemData.offset[0]*this.scale*16)+'px -'+(itemData.offset[1]*this.scale*16)+'px'});
                  	  
                  	  $('#inventory' + inventoryNumber).attr('title', Item.getInfoMsgEx(itemKind, number, itemSkillKind, itemSkillLevel, itemDurability, itemDurabilityMax));
                  	  $('#inventorynumber' + inventoryNumber).html(number);
                  	  //$('#sellInventory' + inventoryNumber).css('background-image', "url('img/" + this.scale + "/item-" + spriteName + ".png')");                  	  	  
                  }
                  
		  if (ItemTypes.isConsumableItem(itemKind) || ItemTypes.isCraft(itemKind))
		  {
			  if (number > 1)
				  $('#inventorynumber' + inventoryNumber).html(number);
			  $('#inventory' + inventoryNumber).html();
		  }
		  else
		  {
			  $('#inventorynumber' + inventoryNumber).html(ItemTypes.getLevelByKind(itemKind) + '+' + number);
			  $('#inventory' + inventoryNumber).html((itemDurability/itemDurabilityMax*100).toFixed() + "%");
	          }
            }
            else
            {
		  $('#scinventory' + inventoryNumber).css('background-image', "none");
		  $('#scinventory' + inventoryNumber).attr('title', '');
		  $('#scinventorynumber' + inventoryNumber).html("");
  
		  $('#inventory' + inventoryNumber).css('background-image', "none");
		  $('#inventory' + inventoryNumber).attr('title', '');  
		  $('#inventorynumber' + inventoryNumber).html('');
		  $('#inventory' + inventoryNumber).html('');
            }
            
	    if (itemKind==0)
	    	    this.inventories[inventoryNumber] = null;
	    else 
	    {	    
		    var inventory = {};
		    inventory.kind = itemKind ? itemKind : 0;
		    inventory.count = number ? number : 0;
		    inventory.skillKind = itemSkillKind ? itemSkillKind : 0;
		    inventory.skillLevel = itemSkillLevel ? itemSkillLevel : 0;
		    inventory.durability = itemDurability ? itemDurability : 0;
		    inventory.durabilityMax = itemDurabilityMax ? itemDurabilityMax : 0;
		    inventory.experience = itemExperience ? itemExperience : 0;
		    this.inventories[inventoryNumber] = inventory;
            }
        },


        setMaxInventoryNumber: function(maxInventoryNumber){
            var i = 0;
            this.maxInventoryNumber = maxInventoryNumber;
            /*for(i=0; i<18; i++){
                $('#inventorybackground' + i).css('display', 'none');
                $('#inventorynumber' + i).css('display', 'none');
            }*/
            
            for(i=0; i<24; i++){
                $('#inventorybackground' + i).css('display', 'block');
                $('#inventorynumber' + i).css('display', 'block');
            }
            //if(maxInventoryNumber > 6){
                //this.moreInventoryButton.show();
            //}
        },
        
        makeEmptyInventory: function(inventoryNumber){
            if(inventoryNumber && inventoryNumber < this.maxInventoryNumber){
                if(inventoryNumber >= 0 && inventoryNumber < 24) {
            		this.inventory[inventoryNumber] = null;
                
            		$('#inventorybackground' + inventoryNumber).attr('class', '');
			
					$('#inventory' + inventoryNumber).css('background-image', 'none');
					$('#inventory' + inventoryNumber).attr('title', '');
					$('#inventorynumber' + inventoryNumber).html('');
					$('#sellInventory' + inventoryNumber).css('background-image', 'none');
			
					this.inventories[inventoryNumber] = null;
					this.game.storeDialog.inventoryFrame.inventories[inventoryNumber].clear();
                }
            }
        },
        decInventory: function(invNum){
            var self = this;
                        
            if(this.healingCoolTimeCallback === null){ 
            	var cooltimeNames = ['#scinventory'+invNum+'Cooltime','#inventory'+invNum+'Cooltime'];
		
			var cooltime = $(cooltimeNames[0]);
			var cooltime2 = $(cooltimeNames[1]);
			// Not very classy but will work for now.
			cooltime.css('display', 'block');
			cooltime2.css('display', 'block');
			cooltime.html(4);
			cooltime2.html(4);
			setTimeout(function(){
			    cooltime.html(3);
			    cooltime2.html(3);
			}, 1000);
			setTimeout(function(){
			    cooltime.html(2);
			    cooltime2.html(2);
			}, 2000);
			setTimeout(function(){
			    cooltime.html(1);
			    cooltime2.html(1);
			}, 3000);
			this.healingCoolTimeCallback = setTimeout(function(){
			    cooltime.css('display', 'none');
			    cooltime2.css('display', 'none');
			    self.healingCoolTimeCallback = null;
			}, 4000);

                this.inventoryCount[invNum] -= 1;
                if(this.inventoryCount[invNum] <= 0){
                    this.inventory[invNum] = null;
                }
                this.inventories[invNum].count -= 1;
                if(this.inventories[invNum].count <= 0) {
                    this.inventories[invNum] = null;
                }
                return true;
            }
            return false;
        },
        
        toggleAllInventory: function () {
        	this.isShowAllInventory = !this.isShowAllInventory;
        	if (this.isShowAllInventory)
        	{
        		this.showAllInventory();
        	}
        	else
        	{
        		this.hideAllInventory();	
        	}
        },
        
        showAllInventory: function(){
            $('#allinventorywindow').css('display', 'block');
        },
        hideAllInventory: function(){
            $('#allinventorywindow').css('display', 'none');
        },
        getItemInventorSlotByKind: function (kind) {
            for(i=0; i<this.maxInventoryNumber; i++){
            	    if (this.inventories[i] && kind == this.inventories[i].kind)
            	    	    return i;
            }
        },

        isInventoryEquipmentFull: function() {
        	for (var i=6; i < this.maxInventoryNumber; ++i)
        	{
        		if (this.inventories[i] == null || this.inventories[i].kind == 0) {
        			return false;
        		}
        	}
        	return true;
        },
        
        hasItem: function (kind, count) {
        	for(i=6; i<this.maxInventoryNumber; i++)
			{
				if (this.inventories[i] && this.inventories[i].kind == kind &&
					this.inventories[i].count >= count)
				{
					return true;	
				}
			}
			return false;
        },
        
        getItemCount: function (kind) {
        	for(i=0; i<this.maxInventoryNumber; i++)
			{
				if (this.inventories[i] && this.inventories[i].kind == kind)
				{
					return this.inventories[i].count;	
				}
			}
			return null;
        },     
    });
    
    return InventoryHandler;
});
