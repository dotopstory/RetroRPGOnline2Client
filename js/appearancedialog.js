define(['dialog', 'tabbook', 'tabpage', 'appearancedata'], function(Dialog, TabBook, TabPage, AppearanceData) {
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
		
            this.buyButton.text('Unlock');

            var self = this;
            this.buyButton.on('click', function(event) {
                log.info("buyButton");
                var game = getGame(self);
                if(game && game.ready && game.appearanceDialog.visible) {
                    game.client.sendAppearanceUnlock(self.item.index);
                }
            });
            
            this.body.on('click', function(event) {
                var game = getGame(self);
                if(game && game.ready && game.appearanceDialog.visible) {
                	//alert(self.parent.itemType+","+AppearanceData[self.item.index].sprite);
                	game.appearanceDialog.appearanceFrame.update(self.parent.itemType, AppearanceData[self.item.index].sprite);
                	//game.appearanceDialog.appearanceFrame.show();
                	game.appearanceDialog.show();
                	
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
            this.buyButton.text('Unlock');            
        },

        assign: function(item) {
            var game = getGame(this);
            this.item = item;

            this.scale = this.parent.scale;
	    this.basket.css({'background-image': "url('img/" + this.scale + "/item-" + item.sprite + ".png')"});
            
            this.basket.attr('title', item.name);
            this.extra.text(item.name);
            this.price.text(item.buyPrice);
        },
        
        clear: function() {
            this.basket.css('background-image', 'none')
            this.basket.attr('title', '');
            this.extra.text('');
            this.price.text('');
        	
        }
    });

    var AppearancePage = TabPage.extend({
        init: function(id, itemType, scale) {
            this._super(id + 'Page', id + 'Button');
            this.itemType = itemType;
            this.racks = [];
            this.items = [];
            this.scale = scale;

            for(var index = 0; index < 6; index++) {
                this.racks.push(new StoreRack(this, id + index, index));
            }
            
	    //this.reload();
            
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
            var game = getGame(this);
            this.reload();
        },

        open: function() {
            this.setPageIndex(0);
        },
        
        onData: function(data) {
            this.items = [];
            var game = getGame(this);
            var categoryType;
            if (game && game.player)
            {    
		    if (game.player.pClass ==  Types.PlayerClass.FIGHTER || game.player.pClass ==  Types.PlayerClass.DEFENDER)
		    {
			if (this.itemType==1)
			    categoryType="armor";
			if (this.itemType==2)
			    categoryType="weapon";
		    }
		    else if (game.player.pClass ==  Types.PlayerClass.ARCHER)
		    {
			if (this.itemType==1)
			    categoryType="armorarcher";
			if (this.itemType==2)
			    categoryType="weaponarcher";
		    }
		    for(var k=0; k < AppearanceData.length; ++k) {
			var item = AppearanceData[k];
			if (!item)
			    continue;
		
			if (item.type == categoryType)
			{
			    if (data && data[k] == 0)
			    {
				    this.items.push({
					index: k,
					name: item.name,
					sprite: item.sprite,
					buyPrice: item.buy
				    });
			    }
			    
			}		
		    }
	    } 
	    this.reload();
	    this.parent.updateNavigator();
        },
        
        reload: function()
        {
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
    
    var AppearanceArmorPage = AppearancePage.extend({
        init: function(scale) {
            this._super('#storeDialogStoreArmor', 1, scale);
        }
    });

    var AppearanceWeaponPage = AppearancePage.extend({
        init: function(scale) {
            this._super('#storeDialogStoreWeapon', 2, scale);
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
            this.pageArmor = new AppearanceArmorPage(this.scale);
            this.pageWeapon = new AppearanceWeaponPage(this.scale);
            
            this.add(this.pageArmor);
            this.add(this.pageWeapon);

            this.pageNavigator = new PageNavigator(parent.scale);

            var self = this;

            this.pageNavigator.onChange(function(sender) {
                var activePage = self.getActivePage();
                if(activePage && self.parent.game.appearanceDialog.visible) {
                     activePage.setPageIndex(sender.getIndex() - 1);
                }
            });
        },

        rescale: function() {
        	this.scale = this.parent.scale;
        	this.pageArmor.rescale(this.scale);
        	this.pageWeapon.rescale(this.scale);
        	
        	this.pageNavigator.rescale(this.scale);
        },
        
        setPageIndex: function(value) {
            if (!this.parent.game.appearanceDialog.visible)
            	    return;

            this._super(value);
            this.updateNavigator();
        },
        
        updateNavigator: function () {
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
            
            var game = getGame(this);
            this.setPageIndex(1);
            game.client.sendAppearanceUpdate();
            
        },

        
    });

    var AppearanceFrame = Class.extend({
    	init: function (game) {
    	    this.game = game;
        },

        update: function(type, name)
        {
            if (type==1)
            {
            	this.armor = name;    	    
            }
            if (type==2)
            {
            	this.weapon = name;    
            }
        },
        show: function()
        {
            var self = this;
            var scale = self.game.renderer.getScaleFactor(),
                ts = self.game.renderer.tilesize,
                player = self.game.player;
                        	
            if (player) {
		    var weapon = self.game.sprites[self.armor];
		    var armor = self.game.sprites[self.weapon];
		
		    if (!self.game.sprites[self.armor].isLoaded) self.game.sprites[self.armor].load();
		    if (!self.game.sprites[self.weapon].isLoaded) self.game.sprites[self.weapon].load();
		    
		    width1 = weapon ? weapon.width * scale : 0;
		    height1 = weapon ? weapon.height * scale : 0;
	
		    width2 = armor ? armor.width * scale: 0;
		    height2 = armor ? armor.height * scale : 0;
	
	
		    width3 = Math.max(width1, width2);
		    height3 = Math.max(height1, height2);
	
		    /*
		    switch (scale) {
			case 1:
			    $('#characterLook3').css('left', (- parseInt(width3 / 2)) + 'px');
			    $('#characterLook3').css('top', (- parseInt(height3 / 2)) + 'px');
			    break;
			case 2:
			    $('#characterLook3').css('left', (- parseInt(width3 / 2)) + 'px');
			    $('#characterLook3').css('top', (- parseInt(height3 / 2)) + 'px');
			    break;
			case 3:
			    $('#characterLook3').css('left', (- parseInt(width3 / 2)) + 'px');
			    $('#characterLook3').css('top', (- parseInt(height3 / 2)) + 'px');
			    break;
		    }
		    */
		    
		    $('#characterLook3').css('width', '144px');
		    $('#characterLook3').css('height', '144px');
		    
		    $('#characterLookArmor3').css('left', '0px');
		    $('#characterLookArmor3').css('top', '0px');
		    $('#characterLookArmor3').css('width', '' + width1 + 'px');
		    $('#characterLookArmor3').css('height', '' + height1 + 'px');
		    $('#characterLookArmor3').css('background-size', width1*5 + 'px');
		    $('#characterLookArmor3').css('background-position', '0px -' + (height1 * 8) + 'px');
	
		    $('#characterLookWeapon3').css('left', '0px');
		    $('#characterLookWeapon3').css('top', '0px');
		    $('#characterLookWeapon3').css('width', '' + width1 + 'px');
		    $('#characterLookWeapon3').css('height', '' + height1 + 'px');
		    $('#characterLookWeapon3').css('background-size', width1*5 + 'px');
		    $('#characterLookWeapon3').css('background-position', '0px -' + (height1 * 8) + 'px');
	
		    $('#characterLookArmor3').css('background-image', 'url("img/' + scale + '/' + self.armor + '.png")');
		    $('#characterLookWeapon3').css('background-image', 'url("img/' + scale + '/' + self.weapon + '.png")');
            }        	
        }       
    });
    
    var AppearanceDialog = Dialog.extend({
        init: function(game) {
            this._super(game, '#storeDialog');
            this.setScale();

            this.storeFrame = new StoreFrame(this);
            this.appearanceFrame = new AppearanceFrame(game);
            
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
            
			$('#changeLookArmorPrev').bind("click", function(event) {
				if (self.armorLooks)
				{
					self.looksArmorIndex = (--self.looksArmorIndex < 0) ? self.armorLooks.length-1 : self.looksArmorIndex % self.armorLooks.length;
					self.game.player.armorSpriteId = self.armorLooks[self.looksArmorIndex]
					var armorSprite = self.game.player.getArmorSprite();
					self.game.player.setSpriteName(armorSprite);
					self.game.player.setSprite(self.game.sprites[armorSprite]);
					self.updateLook();
					self.game.app.initPlayerBar();
					self.game.client.sendLook(1,self.game.player.armorSpriteId);
					self.game.changeArmorColor();
				}
			});
			$('#changeLookArmorNext').bind("click", function(event) {
				if (self.armorLooks)
				{
					self.looksArmorIndex = ++self.looksArmorIndex % self.armorLooks.length;
					self.game.player.armorSpriteId = self.armorLooks[self.looksArmorIndex]
					var armorSprite = self.game.player.getArmorSprite();
					self.game.player.setSpriteName(armorSprite);
					self.game.player.setSprite(self.game.sprites[armorSprite]);
					self.updateLook();
					self.game.app.initPlayerBar();
					self.game.client.sendLook(1,self.game.player.armorSpriteId);
					self.game.changeArmorColor();
				}
			});
			$('#changeLookWeaponPrev').bind("click", function(event) {
				if (self.weaponLooks)
				{
					self.looksWeaponIndex = (--self.looksWeaponIndex < 0) ? self.weaponLooks.length-1 : self.looksWeaponIndex % self.weaponLooks.length;
					self.game.player.weaponSpriteId = self.weaponLooks[self.looksWeaponIndex]
					self.game.player.setWeaponName(self.game.player.getWeaponSprite());
					self.updateLook();
					self.game.app.initPlayerBar();
					self.game.client.sendLook(2,self.game.player.weaponSpriteId);
					self.game.changeWeaponColor();
				}
			});
			$('#changeLookWeaponNext').bind("click", function(event) {
				if (self.weaponLooks)
				{
					self.looksWeaponIndex = ++self.looksWeaponIndex % self.weaponLooks.length;
					self.game.player.weaponSpriteId = self.weaponLooks[self.looksWeaponIndex]
					self.game.player.setWeaponName(self.game.player.getWeaponSprite());
					self.updateLook();
					self.game.app.initPlayerBar();
					self.game.client.sendLook(2,self.game.player.weaponSpriteId);
					self.game.changeWeaponColor();
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
		this.storeFrame.rescale();
        },

        hide: function() {
            $('#storeDialogInventory').css("display","block");
            $('#looksDialogPlayer').css("display","none");
            
            $('#appearanceDialog').css("display","none");        	
            this._super();	
        },
        
        assign: function(datas) {
            var game = this.game,
                weapon, armor,
                width1, height1, width2, height2, width3, height3;
               
		this.player = {
		    weapon: game.equipmentHandler.equipment[1] ? game.equipmentHandler.equipment[1] : null,
		    armor: game.equipmentHandler.equipment[0] ? game.equipmentHandler.equipment[0] : null,
		    spriteCount: datas[0],
		};

		$('#armorColor').css('background-color','#'+game.player.armorColor);
		$('#weaponColor').css('background-color','#'+game.player.weaponColor);
		
		game.player.appearances = [];
		for (var i=0; i < this.player.spriteCount; ++i)
		{
	        	game.player.appearances.push(datas[1+i]);
	        }
            var categoryTypeArmor, categoryTypeWeapon;
	    if (game.player.pClass ==  Types.PlayerClass.FIGHTER || game.player.pClass ==  Types.PlayerClass.DEFENDER)
	    {
		    categoryTypeArmor="armor";
		    categoryTypeWeapon="weapon";
	    }
	    else if (game.player.pClass ==  Types.PlayerClass.ARCHER)
	    {
		    categoryTypeArmor="armorarcher";
		    categoryTypeWeapon="weaponarcher";
	    }


	    this.armorLooks = [0];
	    this.weaponLooks = [0];
            this.looksArmorIndex = 0;
            this.looksWeaponIndex = 0;
            
	    for(var i=0; i < game.player.appearances.length; i++)
            {
            	var appearanceIndex = game.player.appearances[i];
            	if (AppearanceData[appearanceIndex].type == categoryTypeArmor)
            		this.armorLooks.push(appearanceIndex);
            	else if (AppearanceData[appearanceIndex].type == categoryTypeWeapon)
            		this.weaponLooks.push(appearanceIndex);
            	if (appearanceIndex == self.game.player.armorSpriteId)
            		this.looksArmorIndex = (this.armorLooks.length-1);
            	if (appearanceIndex == self.game.player.weaponSpriteId)
            		this.looksWeaponIndex = (this.weaponLooks.length-1);
            }
            
            this.scale = this.game.renderer.getUiScaleFactor();

            this.updateLook();
        },
        
        updateLook: function() {
            var weapon = this.game.sprites[this.game.player.getWeaponSprite()];
            var armor = this.game.sprites[this.game.player.getArmorSprite()];
                                    
			width1 = weapon ? weapon.width * this.scale : 0;
			height1 = weapon ? weapon.height * this.scale : 0;
	
			width2 = armor ? armor.width * this.scale: 0;
			height2 = armor ? armor.height * this.scale : 0;

            width3 = Math.max(width1, width2);
            height3 = Math.max(height1, height2);

            switch (this.scale) {
                case 1:
                    $('#characterLook').css('left', '' + (63 - parseInt(width3 / 2)) + 'px');
                    $('#characterLook').css('top', '' + 32 + 'px');
                    break;
                case 2:
                    $('#characterLook').css('left', '' + (126 - parseInt(width3 / 2)) + 'px');
                    $('#characterLook').css('top', '' + 64 + 'px');
                    break;
                case 3:
                    $('#characterLook').css('left', '' + (189 - parseInt(width3 / 2)) + 'px');
                    $('#characterLook').css('top', '' + 96 + 'px');
                    break;
            }


            $('#characterLook').css('width', '' + width3 + 'px');
            $('#characterLook').css('height', '' + height3 + 'px');
            switch (this.scale) {
                case 1:
                    $('#characterLookShadow').css('left', '' + parseInt(((width3 - width2) / 2) + ((width2 - 16) / 2)) + 'px');
                    $('#characterLookShadow').css('top', '' + parseInt(((height3 - height2) / 2) + (height2 - 19)) + 'px');
                    break;
                case 2:
                    $('#characterLookShadow').css('left', '' + parseInt(((width3 - width2) / 2) + ((width2 - 32) / 2)) + 'px');
                    $('#characterLookShadow').css('top', '' + parseInt(((height3 - height2) / 2) + (height2 - 38)) + 'px');
                    break;
                case 3:
                    $('#characterLookShadow').css('left', '' + parseInt(((width3 - width2) / 2) + ((width2 - 48) / 2)) + 'px');
                    $('#characterLookShadow').css('top', '' + parseInt(((height3 - height2) / 2) + (height2 - 57)) + 'px');
                    break;
            }


            $('#characterLookArmor').css('left', '' + parseInt((width3 - width2) / 2) + 'px');
            $('#characterLookArmor').css('top', '' + parseInt((height3 - height2) / 2) + 'px');
            $('#characterLookArmor').css('width', '' + width2 + 'px');
            $('#characterLookArmor').css('height', '' + height2 + 'px');
            $('#characterLookArmor').css('background-size', '' + (width2 * 5) + 'px');
            $('#characterLookArmor').css('background-position', '0px -' + (height2 * 8) + 'px');

            $('#characterLookWeapon').css('left', '' + parseInt((width3 - width1) / 2) + 'px');
            $('#characterLookWeapon').css('top', '' + parseInt((height3 - height1) / 2) + 'px');
            $('#characterLookWeapon').css('width', '' + width1 + 'px');
            $('#characterLookWeapon').css('height', '' + height1 + 'px');
            $('#characterLookWeapon').css('background-size', '' + (width1 * 5) + 'px');
            $('#characterLookWeapon').css('background-position', '0px -' + (height1 * 8) + 'px');

            //$('#characterLookArmor').css('background-image', 'url("img/' + this.scale + '/' + player.armor.name + '.png")');  
	  		$('#characterLookArmor').css({'background-image': "url('img/" + this.scale + "/" + this.game.player.getArmorSprite() + ".png')"});
	  		$('#characterLookWeapon').css({'background-image': "url('img/" + this.scale + "/" + this.game.player.getWeaponSprite() + ".png')"});
	  		//$('#characterLookWeapon').css('background-image', 'url("img/' + this.scale + '/' + player.weapon.name + '.png")');
        },
        
        show: function() {
            this.rescale();
            
            this.storeFrame.open();
            game.client.sendAppearanceUpdate();
            game.client.sendLooks();

            $('#storeDialogStorePotionButton').css("display","none");
            $('#storeDialogInventory').css("display","none");
            $('#looksDialogPlayer').css("display","block");
            $('#appearanceDialog').css("display","block");
            $('#storeDialogSellButton').css("display","none");
            $('#auctionDialogSellButton').css("display","none");

            this.appearanceFrame.update(1, game.player.getArmorSprite());
            this.appearanceFrame.update(2, game.player.getWeaponSprite());
            this.appearanceFrame.show();
            
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

    return AppearanceDialog;
});

