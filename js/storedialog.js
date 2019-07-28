define(['dialog', 'tabbook', 'tabpage', 'item', 'inventorystore'], function(Dialog, TabBook, TabPage, Item, InventoryStore) {

    function getGame(object) {
        return object ? (object.game ? object.game : getGame(object.parent)) : null;
    }

    var SCALE = 2;
    function setScale(scale) {
    	    SCALE = scale;
    }
    
    var Inventory = InventoryStore.extend({
        init: function(parent, index) {
            var self = this;
            this._super(parent, index);
                        	    
	    this.body.on('click',function(event) {
                    var game = getGame(self);
                    if(game && game.ready && game.storeDialog.visible) {
	    		    
			if (!ItemTypes.isConsumableItem(self.itemKind)) {
				self.parent.select(self);
			}
		    }
	    });
        },
        
        getComment: function() {
            var game = getGame(this);
            var sellPrice = ~~(ItemTypes.getEnchantSellPrice(this.itemKind, this)/5);
            return Item.getInfoMsgEx(this.itemKind, this.itemCount, this.skillKind, this.skillLevel, this.durability, this.durabilityMax) +
                (ItemTypes.isConsumableItem(this.itemKind) ? '\r\nCan not sell.' : '\r\nSell: ' + sellPrice + ' Gold');
        }
    });

    var InventoryFrame = Class.extend({
        init: function(parent) {
            this.parent = parent;
            this.inventories = [];
            
            for(var index = 0; index < 24; index++) {
                this.inventories.push(new Inventory(this, index));
            }
            
            this.basketBackground = $('#storeDialogBasketBackground');
            this.basket = $('#storeDialogBasket');
            this.sellButton = $('#storeDialogSellButton');


            this.goldBackground = $('#storeDialogGoldBackground');
            this.goldIcon = $('#storeDialogGoldBody');

            this.selectedInventory = null;

            var self = this;

            this.sellButton.click(function(event) {
                if(self.selectedInventory) {
                    var game = getGame(self);
                    if(game && game.ready && game.storeDialog.visible) {
                    	game.client.sendStoreSell(self.selectedInventory.getIndex());
                        self.release();
                    }
                }
            });
        },
        
        rescale: function(scale) {
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
			'height': '15px',
		    });
		    this.sellButton.css({
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
			'height': '15px',
			'background-image': 'url("img/1/storedialogsheet.png")',
			'background-position': '-300px -180px'
		    });
		    this.goldIcon.css({
			'position': 'absolute',
			'width': '16px',
			'height': '15px',
			'background-image': 'url("img/1/item-gold.png")'
		    });		    
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
		    this.sellButton.css({
			'position': 'absolute',
			'left': '130px',
			'top': '246px',
			'width': '56px',
			'height': '23px',
			'color': '#fff',
			'font-size': '12px',
			'line-height': '18px',
			'background-image': 'url("img/2/storedialogsheet.png")',
			'background-position': '-632px -360px',
			'text-align': 'center'
		    });
		    this.goldBackground.css({
			'position': 'absolute',
			'left': '30px',
			'top': '246px',
			'width': '32px',
			'height': '30px',
			'background-image': 'url("img/2/storedialogsheet.png")',
			'background-position': '-600px -360px'
		    });
		    this.goldIcon.css({
			'position': 'absolute',
			'width': '32px',
			'height': '30px',
			'background-image': 'url("img/2/item-gold.png")'
		    });		    		    	    
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
			'height': '45px',
		    });
		    this.sellButton.css({
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
			'height': '45px',
			'background-image': 'url("img/3/storedialogsheet.png")',
			'background-position': '-900px -540px'
		    });
		    this.goldIcon.css({
			'position': 'absolute',
			'width': '48px',
			'height': '48px',
			'background-position': '0px 0px',
			'background-image': 'url("img/3/item-gold.png")'
		    });		    
	    }
	    
            for(var index = 0; index < 24; index++) {
                this.inventories[index].rescale(scale);
            }
        },

        getInventory: function(index) {
            return this.inventories[index];
        },

        open: function() {
            this.sellButton.html("Sell");

            this.release();

            for(var index = 0; index < this.inventories.length; index++) {
                this.inventories[index].release();
            }
            
            var game = getGame(this);
            if(game && game.ready) {
            	//this.goldNumber.html(game.inventoryHandler.gold);
                for(var inventoryNumber = 0; inventoryNumber < game.inventoryHandler.maxInventoryNumber; inventoryNumber++) {
                    var item = game.inventoryHandler.inventories[inventoryNumber];
                    if(item && item.kind) {
                        if(ItemTypes.isWeapon(item.kind) || ItemTypes.isArcherWeapon(item.kind) || ItemTypes.isArmor(item.kind)) {
                            this.inventories[inventoryNumber].assign(item.kind, item.count, item.skillKind, item.skillLevel, item.durability, item.durabilityMax, item.experience);
                        } else {
                            this.inventories[inventoryNumber].assign(item.kind, item.count, 0, 0, 0, 0, 0);
                        }
                    }
                    else
                    	    this.inventories[inventoryNumber].clear();
                }
            }
            
            this.basketBackground.show();
            this.basket.show();            
        },
        select: function(inventory) {
            if (inventory.itemKind == null)
            {
               if(this.selectedInventory)
               	       this.selectedInventory.restore();
               this.release();
               return;
            }
            if(this.selectedInventory) {
                this.selectedInventory.restore();
            }
            this.selectedInventory = inventory;
            inventory.release();
            var itemData = ItemTypes.KindData[inventory.itemKind];
            this.basket.css({
                'background-image': 'url("img/'+this.parent.scale+'/'+itemData.sprite+'")',
                'background-position': '-'+(itemData.offset[0]*this.parent.scale*16)+'px -'+(itemData.offset[1]*this.parent.scale*16)+'px'
            });
            
            this.basket.attr('title', inventory.getComment());
            this.sellButton.css('cursor', 'pointer');
        },
        release: function() {
            if(this.selectedInventory) {
                this.selectedInventory.restore();
                this.selectedInventory = null;

                this.basket.css('background-image', '');
                this.basket.attr('title', '');
                this.sellButton.css('cursor', 'default');
            }
        }
    });

    var StoreRack = Class.extend({
        init: function(parent, id, index) {
            this.parent = parent;
            this.id = id;
            this.index = index;
            this.body = $(id);
            this.basketBackground = $(id + 'BasketBackground');
            this.basket = $(id + 'Basket');
            this.extra = $(id + 'Extra');
            this.price = $(id + 'Price');
            this.buyButton = $(id + 'BuyButton');
            this.item = null;

            this.rescale();
		    
            this.buyButton.text('Buy');

            var self = this;
            this.buyButton.bind('click', function(event) {
                var game = getGame(self);
                if(game && game.ready && game.storeDialog.visible) {
                    game.client.sendStoreBuy(self.parent.itemType, self.item.kind, 1);
                }
            }); 
        },

        rescale: function() {
            var scale = this.parent.scale;
            var id = this.id;
            this.body = $(id);
            this.basketBackground = $(id + 'BasketBackground');
            this.basket = $(id + 'Basket');
            this.extra = $(id + 'Extra');
            this.price = $(id + 'Price');
            this.buyButton = $(id + 'BuyButton');        
        	if (scale == 1)
        	{
		    this.body.css({
			'position': 'absolute',
			'left': '0px',
			'top': '' + (this.index * 20) + 'px',
			'width': '134px',
			'height': '19px',
			'border-radius': '1px',
			'background-color': 'rgba(150, 150, 150, 0.35)',
			'display': 'none'
		    });
		    this.basketBackground.css({
			'position': 'absolute',
			'left': '4px',
			'top': '2px',
			'width': '16px',
			'height': '16px',
			'background-image': 'url("img/1/storedialogsheet.png")',
			'background-position': '-300px -180px'
		    });
		    this.basket.css({
			'position': 'absolute',
			'width': '16px',
			'height': '16px'
		    });
		    this.extra.css({
			'position': 'absolute',
			'left': '22px',
			'top': '2px',
			'width': '50px',
			'height': '11px',
			'color': 'white',
			'font-size': '6px'
		    });
		    this.price.css({
			'position': 'absolute',
			'left': '70px',
			'top': '4px',
			'width': '25px',
			'height': '11px',
			'line-height': '11px',
			'color': 'white',
			'text-align': 'right'
		    });
		    this.buyButton.css({
			'position': 'absolute',
			'left': '103px',
			'top': '4px',
			'width': '27px',
			'height': '11px',
			'background-image': 'url("img/1/storedialogsheet.png")',
			'background-position': '-317px -180px',
			'line-height': '11px',
			'color': 'white',
			'text-align': 'center',
			'cursor': 'pointer'
		    });
	     }
	     else if (scale == 2) {
		    this.body.css({
			'position': 'absolute',
			'left': '0px',
			'top': '' + (this.index * 40) + 'px',
			'width': '268px',
			'height': '39px',
			'border-radius': '2px',
			'background-color': 'rgba(150, 150, 150, 0.35)',
			'display': 'none'
		    });
		    this.basketBackground.css({
			'position': 'absolute',
			'left': '8px',
			'top': '4px',
			'width': '32px',
			'height': '32px',
			'background-image': 'url("img/2/storedialogsheet.png")',
			'background-position': '-600px -360px'
		    });
		    this.basket.css({
			'position': 'absolute',
			'width': '32px',
			'height': '32px',
		    });
		    this.extra.css({
			'position': 'absolute',
			'left': '44px',
			'top': '4px',
			'width': '100px',
			'height': '22px',
			'color': 'white',
			'font-size': '10px'
		    });
		    this.price.css({
			'position': 'absolute',
			'left': '140px',
			'top': '8px',
			'width': '50px',
			'height': '22px',
			'line-height': '22px',
			'color': 'white',
			'text-align': 'right'
		    });
		    this.buyButton.css({
			'position': 'absolute',
			'left': '206px',
			'top': '8px',
			'width': '55px',
			'height': '22px',
			'background-image': 'url("img/2/storedialogsheet.png")',
			'background-position': '-632px -360px',
			'line-height': '22px',
			'color': 'white',
			'text-align': 'center',
			'cursor': 'pointer'
		    });	     	     
	     }
	     else if (scale == 3) {
		    this.body.css({
			'position': 'absolute',
			'left': '0px',
			'top': '' + (this.index * 60) + 'px',
			'width': '402px',
			'height': '57px',
			'border-radius': '3px',
			'background-color': 'rgba(150, 150, 150, 0.35)',
			'display': 'none'
		    });
		    this.basketBackground.css({
			'position': 'absolute',
			'left': '12px',
			'top': '6px',
			'width': '48px',
			'height': '48px',
			'background-image': 'url("img/3/storedialogsheet.png")',
			'background-position': '-900px -540px'
		    });
		    this.basket.css({
			'position': 'absolute',
			'width': '48px',
			'height': '45px',
		    });
		    this.extra.css({
			'position': 'absolute',
			'left': '66px',
			'top': '6px',
			'width': '150px',
			'height': '33px',
			'color': 'white',
			'font-size': '15px'
		    });
		    this.price.css({
			'position': 'absolute',
			'left': '210px',
			'top': '12px',
			'width': '75px',
			'height': '33px',
			'line-height': '33px',
			'color': 'white',
			'text-align': 'right'
		    });
		    this.buyButton.css({
			'position': 'absolute',
			'left': '309px',
			'top': '12px',
			'width': '81px',
			'height': '33px',
			'background-image': 'url("img/3/storedialogsheet.png")',
			'background-position': '-947px -540px',
			'line-height': '33px',
			'color': 'white',
			'text-align': 'center',
			'cursor': 'pointer'
		    });	     	     
	     }
	     if (this.item) {
	     	     this.assign(this.item);
	     }
        },

        getVisible: function() {
            return this.body.css('display') === 'block';
        },
        setVisible: function(value) {
            this.body.css('display', value ? 'block' : 'none');
            this.buyButton.text('Buy');
        },

        assign: function(item) {            
            var game = getGame(this);
            this.item = item;
            var itemData = ItemTypes.KindData[item.kind];
            item.spriteName = itemData.sprite;
            this.basket.css({
                'background-image': 'url("img/'+this.parent.scale+'/' + item.spriteName + '")',
                'background-position': '-'+(itemData.offset[0]*this.parent.scale*16)+'px -'+(itemData.offset[1]*this.parent.scale*16)+'px'
            });
            
            var itemDesc = Item.getInfoMsgEx(item.kind, 1, 0, 0, 900, 900);
            this.basket.attr('title', itemDesc);
            this.extra.text((item.buyCount > 0 ? 'x' + item.buyCount : '')+" "+itemDesc);
            this.price.text(item.buyPrice + 'g');
        }
    });

    var StorePage = TabPage.extend({
        init: function(parent, id, itemType, items, scale) {
            this._super(id + 'Page', id + 'Button');
            this.itemType = itemType;
            this.racks = [];
            this.items = items;
            this.scale = scale;
            this.pageIndex = 1;

            this.parent = parent;
            
            for(var index = 0; index < 6; index++) {
                this.racks.push(new StoreRack(this, id + index, index));
            } 
        },
        
        rescale: function (scale) {
            this.scale = scale;
            for(var index = 0; index < 6; index++) {
                this.racks[index].rescale();
            }         	
        },
        
        getPageCount: function() {
            log.info("this.items.length="+this.items.length);
            return Math.ceil(this.items.length / 6);
        },
        getPageIndex: function() {
            return this.pageIndex;
        },
        setPageIndex: function(value) {
            this.pageIndex = value;
            this.reload();
        },

        open: function(min,max) {            
            this.items = ItemTypes.Store.getItems(this.itemType, min, max);
            log.info(JSON.stringify(this.items));
            var game = getGame(this);
            var categoryType = "object";
	    if (game.player.pClass ==  Types.PlayerClass.FIGHTER || game.player.pClass ==  Types.PlayerClass.DEFENDER)
	    {
		if (this.itemType==2)
		    categoryType="armor";
		if (this.itemType==3)
		    categoryType="weapon";
	    }
	    else if (game.player.pClass ==  Types.PlayerClass.ARCHER)
	    {
		if (this.itemType==2)
		    categoryType="armor";
		if (this.itemType==3)
		    categoryType="weaponarcher";
	    }            
            for (var id in this.items) {
            	    var item = this.items[id];
            	    if (item.type !== categoryType && !ItemTypes.isConsumableItem(id))
            	    	    this.items.splice(id,1); 
            }
            this.setPageIndex(0);
        },
        reload: function() {
            for(var index = this.pageIndex * 6; index < Math.min((this.pageIndex + 1) * 6, this.items.length); index++) {
                var rack = this.racks[index - (this.pageIndex * 6)];

                rack.assign(this.items[index]);
                rack.setVisible(true);
            }
            for(var index = this.items.length; index < (this.pageIndex + 1) * 6; index++) {
                var rack = this.racks[index - (this.pageIndex * 6)];

                rack.setVisible(false);
            }
        }
    });
    
    var StorePotionPage = StorePage.extend({
        init: function(parent, scale) {
            this._super(parent, '#storeDialogStorePotion', 1, 
            	    null, scale);
        }
    });

    var StoreArmorPage = StorePage.extend({
        init: function(parent, scale) {
            this._super(parent, '#storeDialogStoreArmor', 2,
            	    null, scale);
        }
    });

    var StoreWeaponPage = StorePage.extend({
        init: function(parent, scale) {
            this._super(parent, '#storeDialogStoreWeapon', 3,
            	    null, scale);
        }
    });

    var PageNavigator = Class.extend({
        init: function(scale) {
            this.body = $('#storeDialogPageNavigator');
            this.movePreviousButton = $('#storeDialogPageNavigatorMovePreviousButton');
            this.numbers = [];
            for(var index = 0; index < 5; index++) {
                this.numbers.push($('#storeDialogPageNavigatorNumber' + index));
            }
            this.moveNextButton = $('#storeDialogPageNavigatorMoveNextButton');

            this.changeHandler = null;
            
            this.rescale(scale);

            var self = this;

            this.movePreviousButton.click(function(event) {
                if(self.index > 1) {
                    self.setIndex(self.index - 1);
                }
            });
            this.moveNextButton.click(function(event) {
                if(self.index < self.count) {
                    self.setIndex(self.index + 1);
                }
            });
        },

        rescale: function(scale) {
        	if (scale == 1)
        	{
		    this.body.css({
			'position': 'absolute',
			'left': '51px',
			'top': '175px',
			'width': '138px',
			'height': '20px'
		    });
		    this.movePreviousButton.css({
			'position': 'absolute',
			'left': '0px',
			'top': '1px',
			'width': '8px',
			'height': '9px',
		    });
		    for(var index = 0; index < this.numbers.length; index++) {
			this.numbers[index].css({
			    'position': 'absolute',
			    'left': '' + (15 + (index * 12)) + 'px',
			    'top': '0px',
			    'width': '9px',
			    'height': '10px'
			});
		    }
		    this.numbers[2].attr('class', 'storeDialogPageNavigatorNumberS');
		    this.moveNextButton.css({
			'position': 'absolute',
			'left': '79px',
			'top': '1px',
			'width': '8px',
			'height': '9px'
		    });        		
        	}
        	if (scale == 2)
        	{
		    this.body.css({
			'position': 'absolute',
			'left': '103px',
			'top': '350px',
			'width': '138px',
			'height': '20px'
		    });
		    this.movePreviousButton.css({
			'position': 'absolute',
			'left': '0px',
			'top': '1px',
			'width': '16px',
			'height': '18px',
		    });
		    for(var index = 0; index < this.numbers.length; index++) {
			this.numbers[index].css({
			    'position': 'absolute',
			    'left': '' + (30 + (index * 24)) + 'px',
			    'top': '0px',
			    'width': '18px',
			    'height': '20px'
			});
		    }
		    this.numbers[2].attr('class', 'storeDialogPageNavigatorNumberS');
		    this.moveNextButton.css({
			'position': 'absolute',
			'left': '158px',
			'top': '1px',
			'width': '16px',
			'height': '18px'
		    });        		
        	}
        	if (scale == 3)
        	{
		    this.body.css({
			'position': 'absolute',
			'left': '155px',
			'top': '525px',
			'width': '207px',
			'height': '30px'
		    });
		    this.movePreviousButton.css({
			'position': 'absolute',
			'left': '0px',
			'top': '1px',
			'width': '24px',
			'height': '27px',
		    });
		    for(var index = 0; index < this.numbers.length; index++) {
			this.numbers[index].css({
			    'position': 'absolute',
			    'left': '' + (45 + (index * 36)) + 'px',
			    'top': '0px',
			    'width': '27px',
			    'height': '30px'
			});
		    }
		    this.numbers[2].attr('class', 'storeDialogPageNavigatorNumberS');
		    this.moveNextButton.css({
			'position': 'absolute',
			'left': '237px',
			'top': '1px',
			'width': '24px',
			'height': '27px'
		    });        		
        	}
        },
        
        getCount: function() {
            return this.count;
        },
        setCount: function(value) {
            this.count = value;

            this.numbers[3].attr('class', 'storeDialogPageNavigatorNumber' + ~~(value / 10))
            this.numbers[4].attr('class', 'storeDialogPageNavigatorNumber' + (value % 10));
        },
        getIndex: function() {
            return this.index;
        },
        setIndex: function(value) {
            this.index = value;
            
            this.numbers[0].attr('class', 'storeDialogPageNavigatorNumber' + ~~(value / 10))
            this.numbers[1].attr('class', 'storeDialogPageNavigatorNumber' + (value % 10));
            

            this.movePreviousButton.attr('class', this.index > 1 ? 'enabled' : '');
            this.moveNextButton.attr('class', this.index < this.count ? 'enabled' : '');

            if(this.changeHandler) {
                this.changeHandler(this);
            }
        },
        getVisible: function() {
            return this.body.css('display') === 'block';
        },
        setVisible: function(value) {
            this.body.css('display', value ? 'block' : 'none');
        },

        onChange: function(handler) {
            this.changeHandler = handler;
        }
    });

    var StoreFrame = TabBook.extend({
        init: function(parent) {
            this._super('#storeDialogStore');

            this.parent = parent;
            this.scale = this.parent.scale;
            this.pagePotion = new StorePotionPage(this, this.scale);
            this.pageArmor = new StoreArmorPage(this, this.scale);
            this.pageWeapon = new StoreWeaponPage(this, this.scale);
            
            this.add(this.pagePotion);
            this.add(this.pageArmor);
            this.add(this.pageWeapon);

            this.pageNavigator = new PageNavigator(parent.scale);

            var self = this;

            this.pageNavigator.onChange(function(sender) {
                var activePage = self.getActivePage();
                if(activePage && self.parent.game.storeDialog.visible) {
                    log.info("self.parent.game.storeDialog.visible");
                    //log.info("sender.getIndex()="+sender.getIndex());
                    activePage.setPageIndex(sender.getIndex() - 1);
                }
            });
            
            this.minLevel = 1;
            this.maxLevel = 100;
        },

        rescale: function() {
        	this.scale = this.parent.scale;
        	this.pagePotion.rescale(this.scale);
        	this.pageArmor.rescale(this.scale);
        	this.pageWeapon.rescale(this.scale);
        	
        	this.pageNavigator.rescale(this.scale);
        },
        
        setPageIndex: function(value) {
            if (!this.parent.game.storeDialog.visible)
            {
            	    return;
            }
            
            this._super(value);

            var activePage = this.getActivePage();
            
            if(activePage) {
                if(activePage.getPageCount() > 0) {
                    //log.info("activePage.getPageCount()="+activePage.getPageCount());
                    this.pageNavigator.setCount(activePage.getPageCount());
                    this.pageNavigator.setIndex(activePage.getPageIndex() + 1);
                    this.pageNavigator.setVisible(true);
                } else {
                    this.pageNavigator.setVisible(false);
                }
            }
        },

        open: function(min,max) {
            this.minLevel = min;
            this.maxLevel = max;

            for(var index = 0; index < this.pages.length; index++) {
                this.pages[index].open(min,max);
            }
            this.setPageIndex(0);
            this.pages[0].open(min,max);
        }
    });

    var StoreDialog = Dialog.extend({
        init: function(game) {
            this._super(game, '#storeDialog');
            this.setScale();

            this.inventoryFrame = new InventoryFrame(this);
            this.storeFrame = new StoreFrame(this);
            
            this.closeButton = $('#storeDialogCloseButton');
            this.modal = $('#storeDialogModal');
            this.modalNotify = $('#storeDialogModalNotify');
            this.modalNotifyMessage = $('#storeDialogModalNotifyMessage');
            this.modalNotifyButton1 = $('#storeDialogModalNotifyButton1');
            this.modalConfirm = $('#storeDialogModalConfirm');
            this.modalConfirmMessage = $('#storeDialogModalConfirmMessage');
            this.modalConfirmButton1 = $('#storeDialogModalConfirmButton1');
            this.modalConfirmButton2 = $('#storeDialogModalConfirmButton2');
            this.confirmCallback = null;
            this.scale=this.setScale();

            var self = this;

            this.closeButton.click(function(event) {
                var activePage = self.storeFrame.getActivePage();
                if (activePage) 
                    activePage.setVisible(false);            		    
            	self.hide();
            });
            this.modalNotifyButton1.click(function(event) {
                self.modal.css('display', 'none');
                self.modalNotify.css('display', 'none');
            });
            this.modalConfirmButton1.click(function(event) {
                self.modal.css('display', 'none');
                self.modalConfirm.css('display', 'none');

                if(self.confirmCallback) {
                    self.confirmCallback(true);
                }
            });
            this.modalConfirmButton2.click(function(event) {
                self.modal.css('display', 'none');
                self.modalConfirm.css('display', 'none');

                if(self.confirmCallback) {
                    self.confirmCallback(false);
                }
            });
            
            $('#storeDialogStorePotionPage').css('display','none');
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
			'left': '292px',
			'top': '30px',
			'width': '11px',
			'height': '11px',
			'cursor': 'pointer'
		    });
				
		}
		else if (this.scale == 2)
		{
		    this.closeButton.css({
			'position': 'absolute',
			'left': '584px',
			'top': '60px',
			'width': '22px',
			'height': '22px',
			'cursor': 'pointer'
		    });
			
		}    
		else if (this.scale == 3)
		{	
		    this.closeButton.css({
			'position': 'absolute',
			'left': '872px',
			'top': '90px',
			'width': '32px',
			'height': '32px',
			'cursor': 'pointer'
		    });
		}
		this.inventoryFrame.rescale(this.scale);
		this.storeFrame.rescale();
        },

        show: function(min, max) {
            this.rescale();
            this.inventoryFrame.open();
            this.storeFrame.open(min, max);

            $("#storeDialogStorePotionButton").html('<div>Potions</div>');

            $('#auctionDialogSellButton').css("display","none");
            $('#storeDialogStorePotionButton').css("display","block");

            $('#storeDialogSellButton').css("display","block");
            
            $('#dialogInventory').css('display','block');
            this._super();
            
            
        },
        
        hide: function() {
            $('#dialogInventory').css('display','none');
            this._super();
        },
        
        notify: function(message) {
            this.modalNotifyMessage.text(message);
            this.modalNotify.css('display', 'block');
            this.modal.css('display', 'block');
        },
        confirm: function(message, callback) {
            this.confirmCallback = callback;

            this.modalConfirmMessage.text(message);
            this.modalConfirm.css('display', 'block');
            this.modal.css('display', 'block');
        },
    });

    return StoreDialog;
});

