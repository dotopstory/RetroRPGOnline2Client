define([], function() {
  var Gamepad = Class.extend({
    init: function(game) {
      this.game = game;
      var self = this;

	self.storeDialogSide = [null, '#storeDialogStorePotionButton', '#storeDialogStoreArmorButton', '#storeDialogStoreWeaponButton'];
	self.storeDialogHighlight = ['#storeDialogInventory{0}Background', '#storeDialogStorePotion', '#storeDialogStoreArmor', '#storeDialogStoreWeapon'];
	self.storeDialogBuyButton = [null, "#storeDialogStorePotion{0}BuyButton","#storeDialogStoreArmor{0}BuyButton", "#storeDialogStoreWeapon{0}BuyButton"];
	
	self.auctionDialogHighlight = ['#storeDialogInventory{0}Background', '#storeDialogStorePotion', '#storeDialogStoreArmor', '#storeDialogStoreWeapon'];

	self.menuButtons = ["#moreinventorybutton","#characterButton",
		"#helpbutton","#warpbutton","#socialbutton",
		"#settingsbutton","#leaderboardbutton","#chatbutton2"];

	self.shortcutButtons = ['#scinventory2','#scinventory3','#scinventory0','#scinventory1','#skill0','#skill1','#skill2','#skill3','#skill4', '#skill5'];

	
	self.pxgamepad = new PxGamepad();
	
	self.pxgamepad.start();

	if (self.pxgamepad.getGamepad())
	{
		self.game.joystickSide = 0;
		self.game.joystickIndex = 0;
		self.enableSelectItem();
	}
	
	self.pxgamepad.on('dpadLeft', function() {
	   //if (!self.selectMenu())
	       self.dialogNavigate('left');
	   //if(!self.dialogOpen() && self.game.player) self.game.player.moveLeft = true;
	   
	});
	self.pxgamepad.on('dpadUp', function() {
	   //if (!self.selectMenu())
	       self.dialogNavigate('up');
	   //if(!self.dialogOpen() && self.game.player) self.game.player.moveUp = true;
	});
	self.pxgamepad.on('dpadDown', function() {
	   //if (!self.selectMenu())
               self.dialogNavigate('down');
	   //if(!self.dialogOpen() && self.game.player) self.game.player.moveDown = true;
	});
	self.pxgamepad.on('dpadRight', function() {
	   //if (!self.selectMenu())
	       self.dialogNavigate('right');
	   //if(!self.dialogOpen() && self.game.player) self.game.player.moveRight = true;
	});
	self.pxgamepad.off('dpadLeft', function() {
	   //if(!self.dialogOpen() && self.game.player) self.game.player.moveLeft = false;
	});
	self.pxgamepad.off('dpadUp', function() {
	   //if(!self.dialogOpen() && self.game.player) self.game.player.moveUp = false;
	});
	self.pxgamepad.off('dpadDown', function() {
	   //if(!self.dialogOpen() && self.game.player) self.game.player.moveDown = false;
	});
	self.pxgamepad.off('dpadRight', function() {
	   //if(!self.dialogOpen() && self.game.player) self.game.player.moveRight = false;
	});
	self.pxgamepad.on('y', function() {
	   if (!$("#menucontainer").is(':visible'))
	   {
	   	$('#charactermenu').trigger("click");
	   	self.game.joystickSide = 0;
	   	self.game.joystickIndex = 0;
	   	self.dialogNavigate();
	   }
	   else
	   {
		self.disableSelectItem();
		$("#charactermenu").trigger("click");
	   }
	});


	
	self.pxgamepad.on('a', function() {
	    if(self.dialogOpen())
	    {
	    	if ($('body').hasClass('death'))
	    	{
	    	    $("#respawn").trigger('click');
	    	}
	    	else if ($("#partyconfirm").is(':visible'))
		{
		    if (self.game.joystickIndex==0)			
		        $('#partyconfirmyes').trigger("click");
		    else
		    	$('#partyconfirmno').trigger("click");
		}
	    	if ($("#playerPopupMenuContainer").is(':visible'))
		{
		    $(self.playerMode).trigger("click");
		}
		else if ($("#dropDialog").is(':visible'))
		{
		    $("#dropAccept").trigger("click");	
		}	
		
		else if ($("#characterDialog").is(':visible'))
		{
		    if (self.game.joystickSide==0)
		    {
		    	if (self.game.joystickIndex==0)
		    	{
			    if (self.game.ready){
				self.game.unequip(1);
				$("#characterItemWeapon").css("background-image","none");
			    }
			}
		        else
		        {
			    if (self.game.ready){
				self.game.unequip(2);
				$("#characterItemArmor").css("background-image","none");
			    }
			}
		    }
		    else
		    {
		    	$("#characterSkill"+self.game.joystickIndex+"Body").trigger("click");
		    }
		}
	    	else if ($("#allinventorywindow").is(':visible'))
	    	{
		    if(self.game.ready){
			var inventory = self.game.inventoryHandler.inventory[self.game.joystickIndex];
			if(inventory) {
			    if(ItemTypes.isConsumableItem(inventory)) {
				self.game.eat(self.game.joystickIndex);
			    }
			    else
			    {
				self.game.equip(self.game.joystickIndex);
			    }
			}
		    }	    		
	    	}
		else if ($("#menucontainer").is(':visible'))
		{
		    self.disableSelectItem();
		    $(self.menuButtons[self.game.joystickIndex]).trigger("click");
		    if (self.game.joystickIndex == 0)
		    {
		        self.game.joystickIndex = 6;
		    }
		    else if (self.game.joystickIndex == 1)
		    {
		        self.game.joystickIndex = 0;
		    }
		    	    
		    self.dialogNavigate();
		    self.enableSelectItem();
		    //$("#menucontainer").css('display','none');
		}	    	    
		else if (self.game.storeDialog.visible)
		{
		    if (self.game.joystickSide==0)
		    {
			    var index = fixed(self.game.joystickIndex,2);
			    $("#storeDialogInventory"+index+"Body").trigger("click");
			    $("#storeDialogSellButton").trigger("click");
	            }
	            else if (self.game.joystickSide > 0)
	            {
	            	var index = self.storeDialogBuyButton[self.game.joystickSide].format(self.game.joystickIndex);
	            	 $(index).trigger("click");
	            }
		}
		else if ($('#enchantDialogModalConfirm').is(':visible'))
		{
			$('#enchantDialogModalConfirmButton1').trigger("click");
		}
		else if (self.game.enchantDialog.visible)
		{
			 var index = fixed(self.game.joystickIndex,2);
			 $("#enchantDialogInventory"+index+"Body").trigger("click");
			 $("#enchantDialogEnchantButton").trigger("click");
		}
		else if (self.game.bankDialog.visible)
		{
			if (self.game.joystickSide==0)
			{
				var index = fixed(self.game.joystickIndex,2);
				$("#bankDialogInventory"+index+"Body").trigger("click");
			}
			else if (self.game.joystickSide==1)
			{
				var index = fixed(self.game.joystickIndex,2);
				$("#bankDialogBank"+index+"Body").trigger("click");
			}
		}
		else if (self.game.auctionDialog.visible)
		{
		    if (self.game.joystickSide==0)
		    {
		        if ($("#auctionSellDialog").is(':visible'))
		        {
		    	    $("#auctionSellAccept").trigger("click");
		    	}
		    	else
		    	{
			    var index = fixed(self.game.joystickIndex,2);
			    $("#storeDialogInventory"+index+"Body").trigger("click");
			    $("#auctionDialogSellButton").trigger("click");
			}
	            }
	            else if (self.game.joystickSide > 0)
	            {
	            	var index = self.storeDialogBuyButton[self.game.joystickSide].format(self.game.joystickIndex);
	            	 $(index).trigger("click");
	            }
		}
	    }
	    else
	    {
	    		if (self.game.player.pClass == Types.PlayerClass.ARCHER)
	    		{
	    			self.game.click();
	    		}
	    		else
	    		{
					//setTimeout(function() {
			        self.game.makePlayerInteractNext();
					//}, self.game.inputLatency);
	    		}

	    		//$(self.attackButtons[self.game.joystickIndex]).trigger("mousedown");
		//if (self.game)
		//    self.game.makePlayerInteractNext();
	    }
	});
		
	self.pxgamepad.on('x', function() {
	    if (self.dialogOpen()) 
	    {
	    	if ($("#allinventorywindow").is(':visible'))
	    	{
		    if(self.game.ready){
			var inventory = self.game.inventoryHandler.inventory[self.game.joystickIndex];
			self.game.dropItem(self.game.joystickIndex);
		    }	    		
	    	}	    	    
	    }
	    else
	    {
	    	    var inventory = self.game.inventoryHandler.inventory[0];
	    	    if (inventory) self.game.eat(0);
	    }
	});

	self.pxgamepad.on('y', function() {
	    var inventory = self.game.inventoryHandler.inventory[1];
	    if (inventory) self.game.eat(1);
	});

	self.pxgamepad.on('b', function() {
	    if(self.dialogOpen())
	    {
	    	if ($("#partyconfirm").is(':visible'))
		{
		    $('#partyconfirm').css('display', 'none');	
		}
		if ($("#playerPopupMenuContainer").is(':visible'))
		{
		    self.game.playerPopupMenu.close();
		}
	    	else if ($("#chatbox").is(':visible'))
	    	{
	    	    $("#chatbox").css('display','none');
	    	}
		else if ($("#characterDialog").is(':visible'))
		{
	    	    self.disableSelectItem();
	    	    $("#characterCloseButton").trigger("click");			
		}
	    	else if ($("#allinventorywindow").is(':visible'))
	    	{
	    	    self.disableSelectItem();
	    	    $("#inventoryCloseButton").trigger("click");
	    	}
	    	else if ($("#questlog").is(':visible'))
	    	{
	    	    self.disableSelectItem();
	    	    $("#questCloseButton").trigger("click");
	    	}
	    	else if ($("#party").is(':visible'))
	    	{
	    	    self.disableSelectItem();
	    	    $("#partyclose").trigger("click");
	    	}
	    	else if ($("#guild").is(':visible'))
	    	{
	    	    self.disableSelectItem();
	    	    $("#guildclose").trigger("click");
	    	}
	    	else if ($("#settings").is(':visible'))
	    	{
	    	    self.disableSelectItem();
	    	    $("#settingsclose").trigger("click");
	    	}
	    	else if ($("#leaderboard").is(':visible'))
	    	{
	    	    self.disableSelectItem();
	    	    $("#leaderboardclose").trigger("click");
	    	}
		else if ($("#menucontainer").is(':visible'))
		{
	            self.disableSelectItem();
		    $("#menu").trigger("click");	
		}	
		else if ($("#dropDialog").is(':visible'))
		{
	            self.disableSelectItem();
		    $("#dropCancel").trigger("click");	
		}	
		
		else if (self.game.storeDialog.visible || self.game.auctionDialog.visible)
		{
		    
		    self.disableSelectItem();			
		    if ($("#auctionSellDialog").is(':visible'))
		    	$("#auctionSellCancel").trigger("click");		    		
		    else if ($("#storeDialogModalConfirmButton2").is(':visible'))
		    	$("#storeDialogModalConfirmButton2").trigger("click");
		    else if ($("#storeDialogCloseButton").is(':visible'))
		    	$("#storeDialogCloseButton").trigger("click");
		    else if ($("#storeDialogModalNotifyButton1").is(':visible'))
		    	$("#storeDialogModalNotifyButton1").trigger("click");
		}
		else if ($('#enchantDialogModalConfirm').is(':visible'))
		{
			$('#enchantDialogModalConfirmButton2').trigger("click");
		}
		else if (self.game.enchantDialog.visible)
		{
		    //self.disableSelectItem();			
		    $("#enchantDialogCloseButton").trigger("click");
		}
		else if (self.game.bankDialog.visible)
		{
		    self.disableSelectItem();			
		    $("#bankDialogCloseButton").trigger("click");
		}
		self.game.joystickIndex = 0;
	    }
	    else
	    {
	    	$(self.shortcutButtons[self.game.joystickIndex]).trigger("click");
	    }
	});

	
	self.pxgamepad.on('leftTop', function() {
		selectJoystickSide('left');
	});

	self.pxgamepad.on('rightTop', function() {
		selectJoystickSide('right');
	});
		
	var selectJoystickSide = function(side)
	{
		if (self.dialogOpen())
		{
			if ($("#characterDialog").is(':visible'))
			{
				self.disableSelectItem();
				if (side == 'left') {
					self.game.joystickSide = 0; 
					self.game.joystickIndex = 0;
					$("#characterDialogFramePageNavigatorMovePreviousButton").trigger("click");
				}
				else if (side == 'right') {
					self.game.joystickSide = 1;
					self.game.joystickIndex = 0;
					$("#characterDialogFramePageNavigatorMoveNextButton").trigger("click");
				}
				self.enableSelectItem();				
			}
			else if (self.game.storeDialog.visible || self.game.auctionDialog.visible)
			{
				self.disableSelectItem();
				if (side == 'left') self.game.joystickSide = (self.game.joystickSide+3) % 4; 
				else if (side == 'right') self.game.joystickSide = ++self.game.joystickSide % 4;
				if (self.storeDialogSide[self.game.joystickSide])
				{
					$(self.storeDialogSide[self.game.joystickSide]).trigger("click");
					self.game.joystickIndex = 0;
				}
				else
				{
					self.game.joystickIndex = 6;
				}
				self.enableSelectItem();
			}
			else if (self.game.bankDialog.visible)
			{
				self.disableSelectItem();
				if (side == 'left') self.game.joystickSide = 0; 
				else if (side == 'right') self.game.joystickSide = 1;
				self.game.joystickIndex = 0;
				self.enableSelectItem();
				
			}
		}		
	};	

        // Default.
	selectJoystickSide();
	
	self.game.joystickSide = 0;
	self.game.joystickIndex = 0;
			
    },
    
    interval: function () {
	var self = this;
	
	if (!self.pxgamepad.getGamepad())
	    return;
    
	self.pxgamepad.update();
	
	   if (self.dialogOpen())
	   {
	       if(self.game.player)
	       {
		   self.game.player.moveLeft = false;
		   self.game.player.moveRight = false;
		   self.game.player.moveUp = false;
		   self.game.player.moveDown = false;
	       }
	   }
	   else
	   {
		   if (self.pxgamepad.leftStick.x < -0.5)
		   {
		       if(self.game.player) self.game.player.moveLeft = true;
		   }
		   else
		   {
		       if(self.game.player) self.game.player.moveLeft = false;
		   }
			   
		   if (self.pxgamepad.leftStick.x > 0.5)
		   {
		       if(self.game.player) self.game.player.moveRight = true;
		   }
		   else
		   {
		       if(self.game.player) self.game.player.moveRight = false;
		   }
		
		   if (self.pxgamepad.leftStick.y > 0.5)
		   {
		       if(self.game.player) self.game.player.moveDown = true;
		   }
		   else
		   {
		       if(self.game.player) self.game.player.moveDown = false;
		   }
		
		   if (self.pxgamepad.leftStick.y < -0.5)
		   {
		       if(self.game.player) self.game.player.moveUp = true;
		   }
		   else
		   {
		       if(self.game.player) self.game.player.moveUp = false;
		   }
		   

		   // Right stick - Cursor.
		   var width = self.game.renderer.getWidth(),
			height = self.game.renderer.getHeight(),
			mouse = self.game.mouse;			   
		   var speed = 20;
		   
		   if (self.pxgamepad.rightStick.x < -0.1)
		   {
		       if(self.game) self.game.mouse.x += self.pxgamepad.rightStick.x * speed;
		   }
			   
		   if (self.pxgamepad.rightStick.x > 0.1)
		   {
		       if(self.game) self.game.mouse.x += self.pxgamepad.rightStick.x * speed;
		   }
		
		   if (self.pxgamepad.rightStick.y > 0.1)
		   {
		       if(self.game) self.game.mouse.y += self.pxgamepad.rightStick.y * speed;
		   }
		
		   if (self.pxgamepad.rightStick.y < -0.1)
		   {
		       if(self.game) self.game.mouse.y += self.pxgamepad.rightStick.y * speed;
		   }            
		    if(mouse.x <= 0) {
			mouse.x = 0;
		    } else if(mouse.x >= width) {
			mouse.x = width - 1;
		    }
		
		    if(mouse.y <= 0) {
			mouse.y = 0;
		    } else if(mouse.y >= height) {
			mouse.y = height - 1;
		    }			       
		    self.game.movecursor();
		    self.game.updateCursorLogic();

		   
	   }
	
    },
    
    dialogOpen: function () {
	return self.game.storeDialog.visible ||
		self.game.enchantDialog.visible ||
		self.game.bankDialog.visible ||
		self.game.auctionDialog.visible ||
		$("#menucontainer").is(':visible') ||
		$("#allinventorywindow").is(':visible') ||
		$("#characterDialog").is(':visible') ||
		$("#playerPopupMenuContainer").is(':visible') ||
		//$('body').hasClass('death') ||
		$("#partyconfirm").is(':visible') ||
		$("#questlog").is(':visible') ||
		$("#party").is(':visible') ||
		$("#settings").is(':visible') ||
		$("#leaderboard").is(':visible') ||
		$("#guild").is(':visible') ||
		$("#dropDialog").is(':visible');
    },
    
    disableSelectItem: function () {
	this.selectItem("none");
    },
    
    enableSelectItem: function () {
	this.selectItem("1px solid red");
    },
    
    selectItem: function (border) {
	var self = this;
	if ($("#partyconfirm").is(':visible'))
	{
		if (self.game.joystickIndex == 0)
		{
			$('#partyconfirmyes').css('border',border);
		}
		if (self.game.joystickIndex == 1)
		{
			$('#partyconfirmno').css('border',border);
		}
	}
	else if ($("#playerPopupMenuContainer").is(':visible'))
	{
		if (self.game.joystickIndex == 0)
		{
			
			if ($("#playerPopupMenuAttack").is(':visible'))
				self.playerMode = "#playerPopupMenuAttack";
		}
		if (self.game.joystickIndex == 1)
		{
			if ($("#playerPopupMenuPartyInvite").is(':visible'))
				self.playerMode = "#playerPopupMenuPartyInvite";
			if ($("#playerPopupMenuPartyLeader").is(':visible'))
				self.playerMode = "#playerPopupMenuPartyLeader";			
		}
		if (self.game.joystickIndex == 2)
		{
			if ($("#playerPopupMenuPartyKick").is(':visible'))
				self.playerMode = "#playerPopupMenuPartyKick";			
		}
		$(self.playerMode).css('border',border);
	}
	else if ($("#characterDialog").is(':visible'))
	{
		if (self.game.joystickSide == 0)
		{
			if (self.game.joystickIndex == 0)
				$("#characterItemWeapon").css('border',border);
			else
				$("#characterItemArmor").css('border',border);
		}
		else
		{
			$("#characterSkill"+self.game.joystickIndex).css('border',border);
		}
	}
	else if ($("#allinventorywindow").is(':visible'))
	{
		$("#inventorybackground"+self.game.joystickIndex).css('border',border);		
	}
	else if ($("#menucontainer").is(':visible'))
	{
		$(self.menuButtons[self.game.joystickIndex]).css('border',border);	
	}
	else if (self.game.storeDialog.visible || self.game.auctionDialog.visible) 
	{
		if (self.game.joystickSide == 0)
			$(self.storeDialogHighlight[self.game.joystickSide].format(fixed(self.game.joystickIndex,2))).css('border',border);
		else
			$(self.storeDialogHighlight[self.game.joystickSide]+self.game.joystickIndex).css('border',border);
	}
	else if (self.game.enchantDialog.visible)
	{
		 index = fixed(self.game.joystickIndex,2);
		 $("#enchantDialogInventory"+index+"Background").css('border',border);		
	}
	else if (self.game.bankDialog.visible)
	{
		if (self.game.joystickSide == 0)
		{
			index = fixed(self.game.joystickIndex,2);
		 	$("#bankDialogInventory"+index+"Background").css('border',border);
		} 
		else if (self.game.joystickSide == 1)
		{
			index = fixed(self.game.joystickIndex,2);
		 	$("#bankDialogBank"+index+"Background").css('border',border);
			
		}
	}
	else
	{
		$(self.shortcutButtons[self.game.joystickIndex]).css('border',border);
	}
    },
    
    isActive: function () {
    	return (this.pxgamepad.getGamepad() !== null);	    
    },
    
    dialogNavigate: function (direction) {
     var self = this;
     
     if ($("#playerPopupMenuContainer").is(':visible'))
     {
	 self.disableSelectItem();
	 switch (direction)
	 {
		case 'up':
		    if ($("#playerPopupMenuPartyKick").is(':visible'))
		    	self.game.joystickIndex = (self.game.joystickIndex+2) % 3;    
		    else
		    	self.game.joystickIndex = (self.game.joystickIndex+1) % 2;
		    break;
		case 'down':
		    if ($("#playerPopupMenuPartyKick").is(':visible'))
		    	self.game.joystickIndex = (self.game.joystickIndex+1) % 3;
		    else
		    	self.game.joystickIndex = (self.game.joystickIndex+1) % 2;
		    break;
	 }
	 self.enableSelectItem();	          	     
     }
     else if ($("#partyconfirm").is(':visible'))
     {
	 self.disableSelectItem();
	 switch (direction)
	 {
		case 'up':
		    self.game.joystickIndex = (self.game.joystickIndex+1) % 2;
		    break;
		case 'down':
		    self.game.joystickIndex = (self.game.joystickIndex+1) % 2;
		    break;
	 }
	 self.enableSelectItem();	     
     }     	     
     else if ($("#characterDialog").is(':visible'))
     {
     	 if (self.game.joystickSide == 0)
     	 {
		 self.disableSelectItem();
		 switch (direction)
		 {
			case 'left':
			    self.game.joystickIndex = 0;
			    break;
			case 'right':
			    self.game.joystickIndex = 1;
			    break;
		 }
		 self.enableSelectItem();
     	 }
     	 else
         {
		 self.disableSelectItem();
		 // TODO - Fix so selecting is correct.
		 switch (direction)
		 {
			case 'up':
			    self.game.joystickIndex = (self.game.joystickIndex <= 3) ? self.game.joystickIndex+8 : self.game.joystickIndex-4;
			    break;
			case 'down':
			    self.game.joystickIndex = (self.game.joystickIndex >= 8) ? self.game.joystickIndex-8 : self.game.joystickIndex+4;
			    break;
			case 'left':
				self.game.joystickIndex = (self.game.joystickIndex % 4 <= 0) ? self.game.joystickIndex+3 : self.game.joystickIndex-1; 
			    break;
			case 'right':
			    self.game.joystickIndex = (self.game.joystickIndex % 4 >= 3) ? self.game.joystickIndex-3 : self.game.joystickIndex+1;
			    break;
		 }
		 self.enableSelectItem();
         }
     }
     else if ($("#allinventorywindow").is(':visible'))
     {
	 self.disableSelectItem();
	 switch (direction)
	 {
		case 'up':
		    self.game.joystickIndex = (self.game.joystickIndex+18) % 24;
		    break;
		case 'down':
		    self.game.joystickIndex = (self.game.joystickIndex+6) % 24;
		    break;
		case 'left':
		    self.game.joystickIndex = (self.game.joystickIndex+23) % 24;
		    break;
		case 'right':
		    self.game.joystickIndex = (self.game.joystickIndex+1) % 24;
		    break;
	 }
	 self.enableSelectItem();     	     
     }
     else if ($("#menucontainer").is(':visible'))
     {
	 self.disableSelectItem();
	 switch (direction)
	 {
		case 'up':
		    self.game.joystickIndex = (self.game.joystickIndex+7) % 8;
		    break;
		case 'down':
		    self.game.joystickIndex = ++self.game.joystickIndex % 8;
		    break;
	 }
	 self.enableSelectItem();
     }
     else if (self.game.storeDialog.visible || self.game.auctionDialog.visible)
     { 
	 if (self.game.joystickSide == 0)
	 {
		 self.disableSelectItem();
		 switch (direction)
		 {
			case 'up':
			    self.game.joystickIndex = (self.game.joystickIndex+18) % 24;
			    break;
			case 'down':
			    self.game.joystickIndex = (self.game.joystickIndex+6) % 24;
			    break;
			case 'left':
			    self.game.joystickIndex = (self.game.joystickIndex+23) % 24;
			    break;
			case 'right':
			    self.game.joystickIndex = (self.game.joystickIndex+1) % 24;
			    break;
		 }
		 self.enableSelectItem();
	 }
	 else if (self.game.joystickSide > 0)
	 {
		 self.disableSelectItem();
		 switch (direction)
		 {
			case 'up':
			    self.game.joystickIndex = (self.game.joystickIndex+5) % 6;
			    break;
			case 'down':
			    self.game.joystickIndex = ++self.game.joystickIndex % 6;
			    break;
			case 'left':
			    $('#storeDialogPageNavigatorMovePreviousButton').trigger("click");
			    break;
			case 'right':
			    $('#storeDialogPageNavigatorMoveNextButton').trigger("click");
			    break;
		 }
		 self.enableSelectItem();
	 }
     }
     else if (self.game.enchantDialog.visible)
     {
	 if (self.game.joystickSide == 0)
	 {
		 self.disableSelectItem();
		 switch (direction)
		 {
			case 'up':
			    self.game.joystickIndex = (self.game.joystickIndex+12) % 18;
			    break;
			case 'down':
			    self.game.joystickIndex = (self.game.joystickIndex+6) % 18;
			    break;
			case 'left':
			    self.game.joystickIndex = (self.game.joystickIndex+17) % 18;
			    break;
			case 'right':
			    self.game.joystickIndex = (self.game.joystickIndex+1) % 18;
			    break;
		 }
		 self.enableSelectItem();
	 }	     	     
     }    	    
     else if (self.game.bankDialog.visible)
     {
	 if (self.game.joystickSide == 0 || self.game.joystickSide == 1)
	 {
		 self.disableSelectItem();
		 switch (direction)
		 {
			case 'up':
			    self.game.joystickIndex = (self.game.joystickIndex+12) % 18;
			    break;
			case 'down':
			    self.game.joystickIndex = (self.game.joystickIndex+6) % 18;
			    break;
			case 'left':
			    self.game.joystickIndex = (self.game.joystickIndex+17) % 18;
			    break;
			case 'right':
			    self.game.joystickIndex = (self.game.joystickIndex+1) % 18;
			    break;
		 }
		 self.enableSelectItem();
	 }	     	     
     } 
     else {
	 self.disableSelectItem();
	 switch (direction)
	 {
		case 'up':
		    self.game.joystickIndex = (self.game.joystickIndex <= 1) ? self.game.joystickIndex+8 : self.game.joystickIndex-2;
		    break;
		case 'down':
		    self.game.joystickIndex = (self.game.joystickIndex >= 8) ? self.game.joystickIndex-8 : self.game.joystickIndex+2;
		    break;
		case 'left':
		    self.game.joystickIndex = ((self.game.joystickIndex % 2) ? self.game.joystickIndex-1 : self.game.joystickIndex+1) % 10;
		    break;
		case 'right':
		    self.game.joystickIndex = ((self.game.joystickIndex % 2) ? self.game.joystickIndex-1 : self.game.joystickIndex+1) % 10;
		    break;
	 }
	 self.enableSelectItem();     	     
     }
    },
    
    selectMenu: function () {
    	   var self = this;
	   if (!self.dialogOpen() && !$("#menucontainer").is(':visible'))
	   {
		$('#charactermenu').trigger("click");
		//$("#menucontainer").show();
		self.game.joystickSide = 0;
		self.game.joystickIndex = 0;
		self.dialogNavigate();
		return true;
	   }
	   return false;
    },
  });
  return Gamepad;
});
