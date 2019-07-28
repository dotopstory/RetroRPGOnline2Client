define(['dialog', 'tabbook', 'tabpage', 'item'], function(Dialog, TabBook, TabPage, Item) {
    function fixed(value, length) {
        var buffer = '00000000' + value;
        return buffer.substring(buffer.length - length);
    }

    function getGame(object) {
        return object ? (object.game ? object.game : getGame(object.parent)) : null;
    }

    var Equipment = Class.extend({
        init: function(parent, index, type) {
            this.parent = parent;
            this.index = index;
            this.itemKind = null;
            this.itemName = null;
            this.enchantLevel = 0;
            this.skillKind = 0;
            this.skillLevel = 0;
            this.durability = 0;
            this.durabilityMax = 0;
            var name = '#enchantDialog' + type;
            
            this.background = $(name + 'Background');
            this.body = $(name);
            this.number = $(name + 'Number');

            this.rescale();
            var self = this;

        },
        
        rescale: function() {
            this.scale = this.parent.parent.scale;

            if (this.itemKind) {
                this.restore();
            }
        },
        
        getIndex: function() {
            return this.index;
        },
        getItemKind: function() {
            return this.itemKind;
        },
        setItemKind: function(value) {
            if (value==null)
            {
            	    this.itemKind = null;
            	    this.itemName = '';            	    
            }
            else
            {
            	    this.itemKind = value;
            	    this.itemName = ItemTypes.KindData[value].name;
            }
        },
        getItemName: function() {
            return this.itemName;
        },
        getComment: function() {
            var game = getGame(this);
            var enchantPrice = ItemTypes.getEnchantPrice(this.itemKind, this.enchantLevel, this.experience);
            return Item.getInfoMsgEx(this.itemKind, this.enchantLevel, this.skillKind, this.skillLevel, this.durability, this.durabilityMax) +
                '\r\nEnchant Price: ' + enchantPrice + ' Gold';
        },

        assign: function(itemKind, enchantLevel, skillKind, skillLevel, durability, durabilityMax, experience) {
            if (!itemKind)
            	return;

            this.setItemKind(itemKind);
            this.enchantLevel = enchantLevel;
            this.skillKind = skillKind;
            this.skillLevel = skillLevel;
            this.durability = durability;
            this.durabilityMax = durabilityMax;
            this.durabilityPercent = durability/durabilityMax*100;
            this.experience = experience;
            this.itemName = ItemTypes.KindData[itemKind].name;
            this.restore();
        },
        clear: function() {
            this.setItemKind(null);
            this.enchantLevel = 0;
            this.skillKind = 0;
            this.skillLevel = 0;
            this.durability = 0;
            this.durabilityMax = 0;
            this.release();
        },
        release: function() {
            this.body.css('background-image', '');
            this.body.html("");
            this.body.attr('title', '');
            this.number.html("");
        },
        restore: function() {
            var self = this;
            
            var itemData = ItemTypes.KindData[this.itemKind];
            this.scale = this.parent.parent.scale;
	    this.body.css({'background-image': "url('img/" + this.scale + "/" + itemData.sprite + "')",
		 'background-position': '-'+(itemData.offset[0]*this.scale*16)+'px -'+(itemData.offset[1]*this.scale*16)+'px'});
            this.body.attr('title', this.getComment());
            this.body.html(this.durabilityPercent.toFixed() + "%");
	    this.number.html(ItemTypes.getLevelByKind(this.itemKind) +"+"+this.enchantLevel);

	    this.body.off('click').on('click', function(event) {
		self.parent.selectEquipment(self);
	    });	    
        }
    });
    
    var Inventory = Class.extend({
        init: function(parent, index) {
            this.parent = parent;
            this.index = index;
            this.itemKind = null;
            this.itemName = null;
            this.itemCount = 0;
            this.enchantLevel = 0;
            this.skillKind = 0;
            this.skillLevel = 0;
            this.durability = 0;
            this.durabilityMax = 0;

            var name = '#enchantDialogInventory' + fixed(this.index, 2);
            
            this.background = $(name + 'Background');
            this.body = $(name + 'Body');
            this.number = $(name + 'Number');

            this.rescale();
            var self = this;
                        	    
        },
        
        rescale: function() {
            this.scale = this.parent.parent.scale;
            if (this.scale == 1)
            {
		    this.background.css({
			'position': 'absolute',
			'left': '' + (15 + Math.floor(this.index % 6) * 17) + 'px',
			'top': '' + (26 + Math.floor(this.index / 6) * 23) + 'px',
			'width': '16px',
			'height': '16px',
			'background-image': 'url("img/1/storedialogsheet.png")',
			'background-position': '-300px -180px'
		    });
		    this.body.css({
			'position': 'absolute',
			'width': '16px',
			'height': '15px',
			'bottom': '1px',
			'line-height': '16px',
			'text-shadow': '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black',
			'color': 'rgba(255,255,0,1.0)',
			'font-size': '6px',
			'text-align': 'center',			
		    });
		    this.number.css({
		    	'margin-top': '15px',
			'color': '#fff',
			'font-size': '6px',
			'text-align': 'center'
		    });
            }
            else if (this.scale == 2)
            {
		    this.background.css({
			'position': 'absolute',
			'left': '' + (30 + Math.floor(this.index % 6) * 33) + 'px',
			'top': '' + (52 + Math.floor(this.index / 6) * 45) + 'px',
			'width': '32px',
			'height': '32px',
			'background-image': 'url("img/2/storedialogsheet.png")',
			'background-position': '-600px -360px'
		    });
		    this.body.css({
			'position': 'absolute',
			'width': '32px',
			'height': '30px',
			'bottom': '2px',
			'line-height': '32px',
			'text-shadow': '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black',
			'color': 'rgba(255,255,0,1.0)',
			'font-size': '12px',
			'text-align': 'center',			
		    });
		    this.number.css({
		    	'margin-top': '30px',
			'color': '#fff',
			'font-size': '12px',
			'text-align': 'center'
		    });
            }
            else if (this.scale == 3)
            {
		    this.background.css({
			'position': 'absolute',
			'left': '' + (45 + Math.floor(this.index % 6) * 50) + 'px',
			'top': '' + (78 + Math.floor(this.index / 6) * 68) + 'px',
			'width': '48px',
			'height': '48px',
			'background-image': 'url("img/3/storedialogsheet.png")',
			'background-position': '-900px -540px'
		    });
		    this.body.css({
			'position': 'absolute',
			'width': '48px',
			'height': '45px',
			'bottom': '3px',
			'line-height': '48px',
			'text-shadow': '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black',
			'color': 'rgba(255,255,0,1.0)',
			'font-size': '18px',
			'text-align': 'center',			
		    });
		    this.number.css({
		    	'margin-top': '45px',
			'color': '#fff',
			'font-size': '18px',
			'text-align': 'center'
		    });		
            }
            if (this.itemKind) {
                this.restore();
            }
        },
        
        getIndex: function() {
            return this.index;
        },
        getItemKind: function() {
            return this.itemKind;
        },
        setItemKind: function(value) {
            if (value==null)
            {
            	    this.itemKind = null;
            	    this.itemName = '';            	    
            }
            else
            {
            	    this.itemKind = value;
            	    this.itemName = ItemTypes.KindData[value].name;
            }
        },
        getItemName: function() {
            return this.itemName;
        },
        getComment: function() {
            var game = getGame(this);
            var enchantPrice = ItemTypes.getEnchantPrice(this.itemKind, this.enchantLevel, this.experience);
            return Item.getInfoMsgEx(this.itemKind, this.enchantLevel, this.skillKind, this.skillLevel, this.durability, this.durabilityMax, this.experience) +
                '\r\nEnchant Price: ' + enchantPrice + ' Gold';
        },

        assign: function(itemKind, itemCount, skillKind, skillLevel, durability, durabilityMax, experience) {
            this.setItemKind(itemKind);
            this.enchantLevel = itemCount;
            this.skillKind = skillKind;
            this.skillLevel = skillLevel;
            this.durability = durability;
            this.durabilityMax = durabilityMax;
            this.durabilityPercent = durability/durabilityMax*100;
            this.experience = experience;
            this.itemName = ItemTypes.KindData[itemKind].name;
            this.itemCount = itemCount;
            this.restore();
        },
        clear: function() {
            this.setItemKind(null);
            this.itemCount = 0;
            this.skillKind = 0;
            this.skillLevel = 0;
            this.release();
        },
        release: function() {
            this.body.css('background-image', '');
            this.body.html('');
            this.body.attr('title', '');
            this.number.html("");
        },
        restore: function() {
	    var self = this;

            this.scale = this.parent.parent.scale;
            var itemData = ItemTypes.KindData[this.itemKind];
	    this.body.css({'background-image': "url('img/" + this.scale + "/" + itemData.sprite + "')",
		 'background-position': '-'+(itemData.offset[0]*this.scale*16)+'px -'+(itemData.offset[1]*this.scale*16)+'px'});
            
            this.body.attr('title', this.getComment());
		if (ItemTypes.isObject(this.itemKind) || ItemTypes.isCraft(this.itemKind))
			this.number.html(this.itemCount);
		else
		{
			this.number.html(ItemTypes.getLevelByKind(this.itemKind) +"+"+this.itemCount);
			this.body.html(this.durabilityPercent.toFixed() + "%");
		}

	    this.body.off('click').on('click', function(event) {
		self.parent.selectInventory(self);
	    });            
        }
    });

    var InventoryFrame = Class.extend({
        init: function(parent) {
            this.parent = parent;
            this.inventories = [];
            this.equipment = [];
            
            for(var index = 0; index < 18; index++) {
                this.inventories.push(new Inventory(this, index));
            }
            this.equipment.push(new Equipment(this, 0, "Weapon"));
            this.equipment.push(new Equipment(this, 1, "Armor"));
            this.equipment.push(new Equipment(this, 2, "Boots"));
            this.equipment.push(new Equipment(this, 3, "Gloves"));

            this.basketBackground = $('#enchantDialogBasketBackground');
            this.basket = $('#enchantDialogBasket');
            this.enchantButton = $('#enchantDialogEnchantButton');
            this.enchantButton.html("Enchant");

            this.goldBackground = $('#enchantDialogGoldBackground');
            this.goldIcon = $('#enchantDialogGoldBody');
            //this.goldNumber = $('#enchantDialogGoldNumber');	    
	    
            this.selectedInventory = null;
            this.selectedEquipment = null;
        },

        rescale: function(scale) {
            this.scale = scale;
	    if (scale == 1)
	    {
		    this.basketBackground.css({
			'position': 'absolute',
			'left': '44px',
			'top': '125px',
			'width': '16px',
			'height': '16px',
			'background-image': 'url("img/1/storedialogsheet.png")',
			'background-position': '-300px -180px'
		    });

		    this.basket.css({
			'position': 'absolute',
			'width': '16px',
			'height': '15px'
		    });
		    this.enchantButton.css({
			'position': 'absolute',
			'left': '65px',
			'top': '125px',
			'width': '30px',
			'height': '12px',
			'color': '#fff',
			'font-size': '6px',
			'line-height': '9px',
			'background-image': 'url("img/1/storedialogsheet.png")',
			'background-position': '-317px -180px',
			'text-align': 'center'			
		    });
		    this.goldBackground.css({
			'position': 'absolute',
			'left': '15px',
			'top': '125px',
			'width': '16px',
			'height': '16px',
			'background-image': 'url("img/1/storedialogsheet.png")',
			'background-position': '-300px -180px'
		    });
		    this.goldIcon.css({
			'position': 'absolute',
			'width': '16px',
			'height': '15px',
			'background-image': 'url("img/1/item-gold.png")'
		    });
		    /*this.goldNumber.css({
			'position': 'absolute',
			'margin-top': '15px',
			'color': '#fff',
			'text-align': 'center'
		    });*/			    
	    }
	    else if (scale == 2)
	    {
		    this.basketBackground.css({
			'position': 'absolute',
			'left': '88px',
			'top': '250px',
			'width': '32px',
			'height': '32px',
			'background-image': 'url("img/2/storedialogsheet.png")',
			'background-position': '-600px -360px'
		    });
		    this.basket.css({
			'position': 'absolute',
			'width': '32px',
			'height': '30px',
		    });
		    this.enchantButton.css({
			'position': 'absolute',
			'left': '130px',
			'top': '246px',
			'width': '60px',
			'height': '23px',
			'color': '#fff',
			'font-size': '12px',
			'line-height': '18px',
			'background-image': 'url("img/2/storedialogsheet.png")',
			'background-position': '-634px -360px',
			'text-align': 'center'
		    });
		    this.goldBackground.css({
			'position': 'absolute',
			'left': '30px',
			'top': '246px',
			'width': '32px',
			'height': '32px',
			'background-image': 'url("img/2/storedialogsheet.png")',
			'background-position': '-600px -360px'
		    });
		    this.goldIcon.css({
			'position': 'absolute',
			'width': '32px',
			'height': '30px',
			'background-image': 'url("img/2/item-gold.png")'
		    });
		    /*this.goldNumber.css({
			'position': 'absolute',
			'margin-top': '30px',
			'color': '#fff',
			'text-align': 'center'
		    });*/			    
		    		    	    
	    }
	    else if (scale == 3)
	    {
		    this.basketBackground.css({
			'position': 'absolute',
			'left': '132px',
			'top': '375px',
			'width': '48px',
			'height': '48px',
			'background-image': 'url("img/3/storedialogsheet.png")',
			'background-position': '-900px -540px'
		    });	    	    
		    this.basket.css({
			'position': 'absolute',
			'width': '48px',
			'height': '45px'
		    });
		    this.enchantButton.css({
			'position': 'absolute',
			'left': '195px',
			'top': '369px',
			'width': '84px',
			'height': '34px',
			'color': '#fff',
			'font-size': '18px',
			'line-height': '27px',
			'background-image': 'url("img/3/storedialogsheet.png")',
			'background-position': '-947px -540px',
			'text-align': 'center'
		    });
		    this.goldBackground.css({
			'position': 'absolute',
			'left': '45px',
			'top': '375px',
			'width': '48px',
			'height': '48px',
			'background-image': 'url("img/3/storedialogsheet.png")',
			'background-position': '-900px -540px'
		    });
		    this.goldIcon.css({
			'position': 'absolute',
			'width': '48px',
			'height': '45px',
			'background-position': '0px 0px',
			'background-image': 'url("img/3/item-gold.png")'
		    });
		    /*this.goldNumber.css({
			'position': 'absolute',
			'margin-top': '45px',
			'color': '#fff',
			'text-align': 'center'
		    });*/		    
	    }
	    
            for(var index = 0; index < 18; index++) {
                this.inventories[index].rescale();
            }
        },

        getInventory: function(index) {
            return this.inventories[index];
        },
        getEquipment: function(index) {
            return this.equipment[index];
        },

        open: function() {
            this.release();
            
            for(var index = 0; index < this.inventories.length; index++) {
                this.inventories[index].release();
            }
            for(var index = 0; index < this.equipment.length; index++) {
                this.equipment[index].release();
            }

            var game = getGame(this);
            if(game && game.ready) {
                for(var inventoryNumber = 6; inventoryNumber < game.inventoryHandler.maxInventoryNumber; inventoryNumber++) {
                    var item = game.inventoryHandler.inventories[inventoryNumber];
                    if(item && item.kind) {
                        if(ItemTypes.isWeapon(item.kind) || ItemTypes.isArcherWeapon(item.kind) || ItemTypes.isArmor(item.kind))
                            this.inventories[inventoryNumber-6].assign(item.kind, item.count, item.skillKind, item.skillLevel, item.durability, item.durabilityMax, item.experience);
                        else
                            this.inventories[inventoryNumber-6].clear();
                    }
                }
                var item = game.equipmentHandler.equipment[0];
                if (item)
                	this.equipment[0].assign(item.kind, item.count, item.skillKind, item.skillLevel, item.durability, item.durabilityMax, item.experience);
		else
			this.equipment[0].clear();
                
		item = game.equipmentHandler.equipment[1];
		if (item)
			this.equipment[1].assign(item.kind, item.count, item.skillKind, item.skillLevel, item.durability, item.durabilityMax, item.experience);
		else
			this.equipment[1].clear();
            } 
            
            this.enchantButton.html("Enchant");
            var self = this;
            this.enchantButton.off('click').on('click', function(event) {
                if(self.selectedInventory) {
                    var game = getGame(self);
                    if(game && game.ready) {
                        var enchantPrice = ItemTypes.getEnchantPrice(self.selectedInventory.itemKind, self.selectedInventory.enchantLevel, self.selectedInventory.experience);
                        var enchantString = 'Cost ' + enchantPrice + ' to upgrade to +' + (self.selectedInventory.enchantLevel+1);
                        self.parent.confirm(enchantString, function(result) {
                            if(result && game.enchantDialog.visible) {
                                game.client.sendStoreEnchant(1, self.selectedInventory.getIndex()+6);
                                self.release();
                            }
                        });
                    }
                }
                if(self.selectedEquipment) {
                    var game = getGame(self);
                    if(game && game.ready) {
                        var enchantPrice = ItemTypes.getEnchantPrice(self.selectedEquipment.itemKind, self.selectedEquipment.enchantLevel, self.selectedEquipment.experience);
                        var enchantString = 'Cost ' + enchantPrice + ' to upgrade to +' + (self.selectedEquipment.enchantLevel+1);
                        self.parent.confirm(enchantString, function(result) {
                            if(result && game.enchantDialog.visible) {
                                game.client.sendStoreEnchant(2, self.selectedEquipment.getIndex());
                                self.release();
                            }
                        });
                    }
                }
            });            
        },
        
        selectInventory: function(inventory) {
            if(this.selectedInventory) {
                this.selectedInventory.restore();
            }
            if(this.selectedEquipment) {
                this.selectedEquipment.restore();
            }
            if (inventory.itemKind == null)
            {
               this.release();
               return;
            }        	
            
            this.selectedInventory = inventory;
            inventory.release();

            this.scale = this.parent.scale;
            var itemData = ItemTypes.KindData[inventory.itemKind];
	    this.basket.css({'background-image': "url('img/" + this.scale + "/" + itemData.sprite + "')",
		 'background-position': '-'+(itemData.offset[0]*this.scale*16)+'px -'+(itemData.offset[1]*this.scale*16)+'px'});

            this.basket.attr('title', inventory.getComment());
            this.enchantButton.css('cursor', 'pointer');
            
            var enchantPrice = ItemTypes.getEnchantPrice(inventory.itemKind, inventory.enchantLevel, inventory.experience);
            $('#enchantDialogCostLabel').html(enchantPrice+' gold');
            
        },
        selectEquipment: function(equipment) {
            if(this.selectedInventory) {
                this.inventories[this.selectedInventory.getIndex()].restore();
            }
            if(this.selectedEquipment) {
                this.equipment[this.selectedEquipment.getIndex()].restore();
            }
            if (equipment.itemKind == null)
            {
               this.release();
               return;
            }        	
            
            this.selectedEquipment = equipment;
            equipment.release();

            this.scale = this.parent.scale;
            var itemData = ItemTypes.KindData[equipment.itemKind];
	    this.basket.css({'background-image': "url('img/" + this.scale + "/" + itemData.sprite + "')",
		 'background-position': '-'+(itemData.offset[0]*this.scale*16)+'px -'+(itemData.offset[1]*this.scale*16)+'px'});

            this.basket.attr('title', equipment.getComment());
            this.enchantButton.css('cursor', 'pointer');
            
            var enchantPrice = ItemTypes.getEnchantPrice(equipment.itemKind, equipment.enchantLevel, equipment.experience);
            $('#enchantDialogCostLabel').html(enchantPrice+' gold');
            
        },
        release: function() {
            if(this.selectedInventory) {
                this.selectedInventory.restore();
                this.selectedInventory = null;
                
                this.basket.css('background-image', '');
                this.basket.attr('title', '');
                this.enchantButton.css('cursor', 'default');
                $('#enchantDialogCostLabel').html('');
            }
            if(this.selectedEquipment) {
                this.selectedEquipment.restore();
                this.selectedEquipment = null;
                
                this.basket.css('background-image', '');
                this.basket.attr('title', '');
                this.enchantButton.css('cursor', 'default');
                $('#enchantDialogCostLabel').html('');
            }

        }
    });



    var EnchantDialog = Dialog.extend({
        init: function(game) {
            this._super(game, '#enchantDialog');
            this.setScale();

            this.inventoryFrame = new InventoryFrame(this);
            
            this.closeButton = $('#enchantDialogCloseButton');
            this.modal = $('#enchantDialogModal');
            this.modalNotify = $('#enchantDialogModalNotify');
            this.modalNotifyMessage = $('#enchantDialogModalNotifyMessage');
            this.modalNotifyButton1 = $('#enchantDialogModalNotifyButton1');
            this.modalConfirm = $('#enchantDialogModalConfirm');
            this.modalConfirmMessage = $('#enchantDialogModalConfirmMessage');
            this.modalConfirmButton1 = $('#enchantDialogModalConfirmButton1');
            this.modalConfirmButton2 = $('#enchantDialogModalConfirmButton2');
            this.confirmCallback = null;
            this.scale=0;
            

            var self = this;

            this.closeButton.click(function(event) {
            	
                self.hide();
            });
            this.modalNotifyButton1.click(function(event) {
                self.modal.hide();
                self.modalNotify.hide();
            });
            this.modalConfirmButton1.click(function(event) {
                self.modal.hide();
                self.modalConfirm.hide();

                if(self.confirmCallback) {
                    self.confirmCallback(true);
                }
            });
            this.modalConfirmButton2.click(function(event) {
                self.modal.hide();
                self.modalConfirm.hide();

                if(self.confirmCallback) {
                    self.confirmCallback(false);
                }
            });
        },
        
        hide: function() {
            this.inventoryFrame.clear();
            this._super();
        },
        
        setScale: function() {
	    if (this.game.renderer) {
		if (this.game.renderer.mobile) {
		    this.scale = 1;
		} else {
		    this.scale = this.game.renderer.getUiScaleFactor();
		}
	    } else {
		this.scale = 2;
	    }
        	
        },        
        rescale: function() {
        	this.setScale();
		if (this.scale == 1)
		{
		    this.closeButton.css({
			'position': 'absolute',
			'left': '116px',
			'top': '32px',
			'width': '11px',
			'height': '11px',
			'background-image': 'url("img/1/storedialogsheet.png")',
			'background-position': '-32px -174px',
			'cursor': 'pointer'
		    });
				
		}
		else if (this.scale == 2)
		{
		    this.closeButton.css({
			'position': 'absolute',
			'left': '233px',
			'top': '64px',
			'width': '21px',
			'height': '21px',
			'background-image': 'url("img/2/storedialogsheet.png")',
			'background-position': '-64px -348px',
			'cursor': 'pointer'
		    });
			
		}    
		else if (this.scale == 3)
		{	
		    this.closeButton.css({
			'position': 'absolute',
			'left': '348px',
			'top': '96px',
			'width': '32px',
			'height': '32px',
			'background-image': 'url("img/3/storedialogsheet.png")',
			'background-position': '-96px -520px',
			'cursor': 'pointer'
		    });
		}
		this.inventoryFrame.rescale(this.scale);
        },

        show: function() {
            this.rescale();
            this.inventoryFrame.open();

            this._super();
        },
        
        notify: function(message) {
            this.modalNotifyMessage.text(message);
            this.modalNotify.show();
            this.modal.show();
        },
        confirm: function(message, callback) {
            this.confirmCallback = callback;

            this.modalConfirmMessage.text(message);
            this.modalConfirm.show();
            this.modal.show();
        }
    });

    return EnchantDialog;
});

