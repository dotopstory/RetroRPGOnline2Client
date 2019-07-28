define(['dialog', 'tabbook', 'tabpage', 'item', 'craftdata','inventorystore'], function(Dialog, TabBook, TabPage, Item, CraftData, InventoryStore) {
    function fixed(value, length) {
        var buffer = '00000000' + value;
        return buffer.substring(buffer.length - length);
    }

    function getGame(object) {
        return object ? (object.game ? object.game : getGame(object.parent)) : null;
    }

    var SCALE = 2;
    function setScale(scale) {
    	    SCALE = scale;
    }
    
    var InventoryFrame = Class.extend({
        init: function(parent) {
            this.parent = parent;
            this.inventories = [];
            
            for(var index = 0; index < 24; index++) {
                this.inventories.push(new InventoryStore(this, index));
            }
            
            this.basketBackground = $('#storeDialogBasketBackground');
            this.basket = $('#storeDialogBasket');

            this.sellButton = $('#auctionDialogSellButton');

            this.goldBackground = $('#storeDialogGoldBackground');
            this.goldIcon = $('#storeDialogGoldBody');
            this.goldNumber = $('#storeDialogGoldNumber');
                        
            this.selectedInventory = null;

            var self = this;
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
			'background-image': 'url("img/2/storedialogsheet.png")',
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
		    this.goldNumber.css({
			'position': 'absolute',
			'margin-top': '16px',
			'color': '#fff',
			'text-align': 'center'
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
		    this.goldNumber.css({
			'position': 'absolute',
			'margin-top': '32px',
			'color': '#fff',
			'text-align': 'center'
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
			'height': '48px',
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
		    this.goldNumber.css({
			'position': 'absolute',
			'margin-top': '48px',
			'color': '#fff',
			'text-align': 'center'
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

            for(var index = 0; index < this.inventories.length; index++) {
                this.inventories[index].release();
            }
            
            this.goldNumber.html(0);
            var game = getGame(this);
            if(game && game.ready) {
                for(var inventoryNumber = 0; inventoryNumber < game.inventoryHandler.maxInventoryNumber; inventoryNumber++) {
                    var item = game.inventoryHandler.inventories[inventoryNumber];
                    if(item && item.kind) {
                        if(ItemTypes.isWeapon(item.kind) || ItemTypes.isArcherWeapon(item.kind) || ItemTypes.isArmor(item.kind)) {
                            this.inventories[inventoryNumber].assign(item.kind, item.count, item.skillKind, item.skillLevel, item.durability, item.durabilityMax, item.experience);  
                        } else {
                            this.inventories[inventoryNumber].assign(item.kind, item.count, 0, 0, 0);
                        }
                    }
                    else
                    	    this.inventories[inventoryNumber].clear();
                }
            }
            this.basketBackground.hide();
            this.basket.hide();            
        },
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
                if(game && game.ready && game.craftDialog.visible) {
                    //alert("auction buy");
                    game.client.sendCraft(self.item.key);
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
			'width': '75px',
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
			'height': '38px',
			'border-radius': '3px',
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
			'width': '150px',
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
			'width': '54px',
			'height': '22px',
			'background-image': 'url("img/2/storedialogsheet.png")',
			'background-position': '-634px -360px',
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
			'width': '225px',
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
            this.body.css('display', value===true ? 'block' : 'none');            
            var game = getGame(this);
            this.buyButton.text('Craft');            
        },

        assign: function(item) {
            var game = getGame(this);
            this.item = item;

            var itemData = ItemTypes.KindData[item.kind];
            this.scale = this.parent.scale;
	    this.basket.css({'background-image': "url('img/" + this.scale + "/" + itemData.sprite + "')",
		 'background-position': '-'+(itemData.offset[0]*this.scale*16)+'px -'+(itemData.offset[1]*this.scale*16)+'px'});
            
            var itemDesc = item.name;
            var extraText = " - cost:";
            for (var k in item.input)
            {
            	extraText += "  " + ItemTypes.KindData[ item.input[k][0]].name + " x" + item.input[k][1];
            }

            this.basket.attr('title', itemDesc + extraText);
            this.extra.text(itemDesc + extraText);
            this.price.text('');
        },
        
        clear: function() {
            this.basket.css('background-image', 'none')
            this.basket.attr('title', '');
            this.extra.text('');
            this.price.text('');
        	
        }
    });

    var CraftPage = TabPage.extend({
        init: function(id, itemType, items, scale) {
            this._super(id + 'Page', id + 'Button');
            this.itemType = itemType;
            this.racks = [];
            this.items = items;
            this.scale = scale;

            for(var index = 0; index < 6; index++) {
                this.racks.push(new StoreRack(this, id + index, index));
            }
            
            this.items = [];
	    var i = 0;
	    for(var k in CraftData.Kinds) {
		var craft = CraftData.Kinds[k];
		if (craft.type == this.itemType)
		{
			var item = ItemTypes.KindData[craft.output];
			if (item) {
			    this.items.push({
				index: i++,
				key: k,
				name: item.name ? item.name : '',
				kind: craft.output,
				itemCount: 1,
				itemSkillKind: 0,
				itemSkillLevel: 0,
				input: craft.input,
			    });
		        }
		        else
		        {
			    this.items.push({
				index: i++,
				key: k,
				name: craft.name,
				kind: craft.output,
				itemCount: 1,
				itemSkillKind: 0,
				itemSkillLevel: 0,
				input: craft.input,
			    });
		        }	
		}

	    }
	    this.reload();
            
        },
        
        rescale: function (scale) {
            this.scale = scale;
            for(var index = 0; index < 6; index++) {
                this.racks[index].rescale();
            }         	
        },
        
        getPageCount: function() {
            if (this.items)
            	    return Math.ceil(this.items.length / 6);
            return 0;
        },
        getPageIndex: function() {
            return this.pageIndex;
        },
        setPageIndex: function(value) {
            this.pageIndex = value;
            this.reload();
        },

        open: function() {
            this.setPageIndex(0);
        },
        reload: function() {            
            if (!this.items || this.items.length == 0)
        	return;
        
            for(var index = this.pageIndex * 6; index < Math.min((this.pageIndex + 1) * 6, this.items.length); index++) {
                var rack = this.racks[index - (this.pageIndex * 6)];

                rack.assign(this.items[index]);
                rack.setVisible(true);
            }
            for(var index = this.items.length; index < (this.pageIndex + 1) * 6; index++) {
                var rack = this.racks[index - (this.pageIndex * 6)];

                rack.setVisible(false);
            }
        },
        
    });
    
    var CraftPotionPage = CraftPage.extend({
        init: function(scale) {
            this._super('#storeDialogStorePotion', 1, [], scale);
        }
    });
    var CraftArmorPage = CraftPage.extend({
        init: function(scale) {
            this._super('#storeDialogStoreArmor', 2, [], scale);
        }
    });

    var CraftWeaponPage = CraftPage.extend({
        init: function(scale) {
            this._super('#storeDialogStoreWeapon', 3, [], scale);
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

            for(var index = 0; index < 2; index++) {
                this.numbers[4 - index].attr('class', 'storeDialogPageNavigatorNumber' + (value % 10));
                value = Math.floor(value / 10);
            }            
        },
        getIndex: function() {
            return this.index;
        },
        setIndex: function(value) {
            this.index = value;

            for(var index = 0; index < 2; index++) {
                this.numbers[1 - index].attr('class', 'storeDialogPageNavigatorNumber' + (value % 10));
                value = Math.floor(value / 10);
            }

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
            this.pagePotion = new CraftPotionPage(this.scale);
            this.pageArmor = new CraftArmorPage(this.scale);
            this.pageWeapon = new CraftWeaponPage(this.scale);
            
            this.add(this.pagePotion);
            this.add(this.pageArmor);
            this.add(this.pageWeapon);

            this.pageNavigator = new PageNavigator(parent.scale);

            var self = this;

            this.pageNavigator.onChange(function(sender) {
                var activePage = self.getActivePage();
                if(activePage && self.parent.game.craftDialog.visible) {
                     activePage.setPageIndex(sender.getIndex() - 1);
                }
            });
        },

        rescale: function() {
        	this.scale = this.parent.scale;
        	this.pageArmor.rescale(this.scale);
        	this.pageWeapon.rescale(this.scale);
        	this.pagePotion.rescale(this.scale);
        	
        	this.pageNavigator.rescale(this.scale);
        },
        
        setPageIndex: function(value) {
            if (!this.parent.game.craftDialog.visible)
            	    return;

            this._super(value);
            var activePage = this.getActivePage();
            //log.info("activePage.getPageCount()="+activePage.getPageCount());
            if(activePage) {
                if(activePage.getPageCount() > 0) {
                    this.pageNavigator.setCount(activePage.getPageCount());
                    this.pageNavigator.setIndex(activePage.getPageIndex() + 1);
                    this.pageNavigator.setVisible(true);
                } else {
                    this.pageNavigator.setVisible(false);
                }
            }
        },

        open: function() {
            for(var index = 0; index < this.pages.length; index++) {
                var page = this.pages[index]; 
                page.open();
            }
            this.setPageIndex(0);
        },

        
    });

    var CraftDialog = Dialog.extend({
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

        show: function() {
            this.rescale();
            
            this.inventoryFrame.open();
            this.storeFrame.open();

            $("#storeDialogStorePotionButton").html('<div>Misc</div>');
            $('#storeDialogStorePotionButton').css("display","block");
 
            $('#storeDialogSellButton').css("display","none");
            $('#auctionDialogSellButton').css("display","none");

            $('#dialogInventory').css('display', 'block');
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

    return CraftDialog;
});

