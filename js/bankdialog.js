define(['dialog', 'tabbook', 'tabpage', 'item', 'inventorystore'], function(Dialog, TabBook, TabPage, Item, InventoryStore) {
    function fixed(value, length) {
        var buffer = '00000000' + value;
        return buffer.substring(buffer.length - length);
    }

    function getGame(object) {
        return object ? (object.game ? object.game : getGame(object.parent)) : null;
    }

    var Inventory = InventoryStore.extend({
        init: function(parent, index) {
            var self = this;
            this._super(parent, index);           	    
	    this.body.click(function(event) {
		    var game = getGame(self);
		    if(game && game.ready && game.bankDialog.visible) {    
		    	    self.parent.select(self);
		    }
	    });
        }
    });

    var Bank = Class.extend({
        init: function(parent, index) {
            this.parent = parent;
            this.index = index;
            this.itemKind = null;
            this.itemName = null;
            this.itemCount = 0;
            this.enchantLevel = 0;
            this.skillKind = 0;
            this.skillLevel = 0;
            var name = '#bankDialogBank' + fixed(this.index, 2);
            this.background = $(name + 'Background');
            this.body = $(name + 'Body');
            this.number = $(name + 'Number');

            this.rescale();
            var self = this;
                        	    
	    this.body.click(function(event) {
                    var game = getGame(self);
                    if(game && game.ready && game.bankDialog.visible) {    
                    	    self.parent.select(self);
                    }
	    });
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
			'text-align': 'center',
			'text-shadow': '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black',
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
			'text-align': 'center',
			'text-shadow': '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black',
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
			'text-align': 'center',
			'text-shadow': '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black',
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
            	    this.itemKind = 0;
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
            return Item.getInfoMsgEx(this.itemKind, this.enchantLevel, this.skillKind, this.skillLevel, this.durability, this.durabilityMax);
        },

        assign: function(itemKind, itemCount, skillKind, skillLevel, durability, durabilityMax, experience) {
            this.setItemKind(itemKind);
            this.enchantLevel = itemCount;
            this.skillKind = skillKind;
            this.skillLevel = skillLevel;
            this.itemName = ItemTypes.KindData[itemKind].name;
            this.itemCount = itemCount;
            this.durability = durability;
            this.durabilityMax = durabilityMax;
            this.durabilityPercent = durability/durabilityMax*100;
            this.experience = experience;
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
            this.body.html("");
            this.body.attr('title', '');
            this.number.html("");
        },
        restore: function() {
            var itemData = ItemTypes.KindData[this.itemKind];
            this.scale = this.parent.parent.scale;
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
            
        }
    });

    var InventoryFrame = Class.extend({
        init: function(parent) {
            this.parent = parent;
            this.inventories = [];
            
            for(var index = 0; index < 18; index++) {
                this.inventories.push(new Inventory(this, index));
            }

            this.basketBackground = $('#storeDialogBasketBackground');
            this.goldBackground = $('#dialogGoldBackground');
            this.goldIcon = $('#dialogGoldBody');
            this.goldNumber = $('#dialogGoldNumber');
            
            this.selectedInventory = null;
            
	    $('#dialogGoldBody').click(function(event) {
	    	var game = getGame(self);
	    	game.app.showDropDialog(-1);
	    });            
        },

        rescale: function(scale) {
	    if (scale == 1)
	    {
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
		    this.goldNumber.css({
			'position': 'absolute',
			'margin-top': '15px',
			'color': '#fff',
			'text-align': 'center'
		    });			    
	    }
	    else if (scale == 2)
	    {
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
		    this.goldNumber.css({
			'position': 'absolute',
			'margin-top': '30px',
			'color': '#fff',
			'text-align': 'center'
		    });			    
		    		    	    
	    }
	    else if (scale == 3)
	    {
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
		    this.goldNumber.css({
			'position': 'absolute',
			'margin-top': '45px',
			'color': '#fff',
			'text-align': 'center'
		    });		    
	    }
	    
            for(var index = 0; index < 18; index++) {
                this.inventories[index].rescale();
            }
                    
        },

        getInventory: function(index) {
            return this.inventories[index];
        },

        open: function() {
            for(var index = 0; index < this.inventories.length; index++) {
                this.inventories[index].release();
            }

            var game = getGame(this);
            if(game && game.ready) {
                for(var inventoryNumber = 6; inventoryNumber < game.inventoryHandler.maxInventoryNumber; inventoryNumber++) {
                    var item = game.inventoryHandler.inventories[inventoryNumber];
                    if(item && item.kind) {
                        if(ItemTypes.isWeapon(item.kind) || ItemTypes.isArcherWeapon(item.kind) || ItemTypes.isArmor(item.kind)) {
                            //log.info(JSON.stringify(item));
                            this.inventories[inventoryNumber-6].assign(item.kind, item.count, item.skillKind, item.skillLevel, item.durability, item.durabilityMax, item.experience);
                        } else if (ItemTypes.isCraft(item.kind)) {
                            this.inventories[inventoryNumber-6].assign(item.kind, item.count, 0, 0, 0);
                        }
                    }
                }
            }            
            this.basketBackground.hide();  
        },
        select: function(inventory) {
            var game = getGame(this);
            if (!game.bankHandler.isBankFull())
            {
                this.parent.game.client.sendBankStore(inventory.getIndex()+6);
            	inventory.release();
            }
        },
    });


    var BankFrame = Class.extend({
        init: function(parent) {
            this.parent = parent;
            this.banks = [];
            
            for(var index = 0; index < 24; index++) {
                this.banks.push(new Bank(this, index));
            }
            
            this.goldBackground = $('#bankDialogBankGoldBackground');
            this.goldIcon = $('#bankDialogBankGoldBody');
            this.goldNumber = $('#bankDialogBankGoldNumber');
            
            this.selectedBank = null;

	    $('#bankDialogBankGoldBody').click(function(event) {
	    	var game = getGame(self);
	    	game.app.showDropDialog(-2);
	    });
        },

        rescale: function(scale) {
	    if (scale == 1)
	    {
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
		    this.goldNumber.css({
			'position': 'absolute',
			'margin-top': '15px',
			'color': '#fff',
			'text-align': 'center'
		    });			    
	    }
	    else if (scale == 2)
	    {
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
		    this.goldNumber.css({
			'position': 'absolute',
			'margin-top': '30px',
			'color': '#fff',
			'text-align': 'center'
		    });			    
		    		    	    
	    }
	    else if (scale == 3)
	    {
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
		    this.goldNumber.css({
			'position': 'absolute',
			'margin-top': '45px',
			'color': '#fff',
			'text-align': 'center'
		    });		    
	    }
	    
            for(var index = 0; index < this.banks.length; index++) {
                this.banks[index].rescale();
            }            
        },

        getInventory: function(index) {
            return this.bank[index];
        },

        open: function() {
            for(var index = 0; index < this.banks.length; index++) {
                this.banks[index].release();
            }

            var game = getGame(this);
            if(game && game.ready) {
                for(var bankNumber = 0; bankNumber < game.bankHandler.maxBankNumber; bankNumber++) {
                    var item = game.bankHandler.banks[bankNumber];
                    if(item && item.kind) {
                        if(ItemTypes.isWeapon(item.kind) || ItemTypes.isArcherWeapon(item.kind) || ItemTypes.isArmor(item.kind)) {
                            this.banks[bankNumber].assign(item.kind, item.count, item.skillKind, item.skillLevel, item.durability, item.durabilityMax, item.experience);
                        } else if (ItemTypes.isCraft(item.kind)) {
                            this.banks[bankNumber].assign(item.kind, item.count, 0, 0, 0);
                        }
                    }
                }
            }
        },
        select: function(bank) {
            var game = getGame(this);
            if (!game.inventoryHandler.isInventoryEquipmentFull())
            {
                this.parent.game.client.sendBankRetrieve(bank.getIndex());
                bank.release();
            }
        },
    });


    var BankDialog = Dialog.extend({
        init: function(game) {
            this._super(game, '#bankDialog');
            this.scale=0;
            this.setScale();

            this.inventoryFrame = new InventoryFrame(this);
            this.bankFrame = new BankFrame(this);
            
            this.closeButton = $('#bankDialogCloseButton');

            var self = this;

            this.closeButton.click(function(event) {
                self.hide();
            });
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
			'left': '247px',
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
			'left': '494px',
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
			'left': '737px',
			'top': '96px',
			'width': '32px',
			'height': '32px',
			'background-image': 'url("img/3/storedialogsheet.png")',
			'background-position': '-96px -520px',
			'cursor': 'pointer'
		    });
		}
		this.inventoryFrame.rescale(this.scale);
		this.bankFrame.rescale(this.scale);
        },

        show: function() {
            this.rescale();
            this.inventoryFrame.open();
            this.bankFrame.open();
            $('#dialogInventory').css('display', 'block');
            $('#storeDialogSellButton').css("display","none");
            $('#auctionDialogSellButton').css("display","none");
            //$('#dialogGoldBackground').css("display","none");
            this._super();
        },

        
        hide: function() {
            $('#dialogInventory').css('display','none');
            this._super();
        },
        
    });

    return BankDialog;
});
