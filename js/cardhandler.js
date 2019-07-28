define(['jquery'], function($) {
    var CardHandler = Class.extend({
    	init: function (game, player) {
    		this.game = game;
    		this.cardIndex = 0;
    		this.deckIndex = 0;
    		this.cards = player.cards;
    		this.deck = player.deck;
    		this.cardGambleDialogPopuped = false;
    		this.minBet = 1000;
    		
    		var self = this;
    		
    		$('#cardprev').click(function(event) {
    			if (self.cardIndex <= 0)
    				return;
    			else
    			{
    				self.cardIndex -= 10;
    				self.showCards();
    			}
    		});
    		$('#cardnext').click(function(event) {
    			if ((self.cardIndex +10) >= self.cards.length)
    				return;
    			else
    			{
    				self.cardIndex += 10;
    				self.showCards();
    			}
    		});
    		
    		$('#deckPrev').click(function(event) {
    			if (self.deckIndex <= 0)
    				return;
    			else
    			{
    				self.deckIndex -= 10;
    				self.showDeck();
    			}
    		});
    		$('#deckNext').click(function(event) {
    			if ((self.deckIndex+10) >= self.deck.length)
    				return;
    			else
    			{
    				self.deckIndex += 10;
    				self.showDeck();
    			}
    		});
    		
    		for (var i=0; i < 10; ++i)
    		{
    			$('#card'+i).click(function (e) {
    				var offset = parseInt(this.id.slice(4));
    				self.game.client.sendCardsToDeck(self.cardIndex+offset);
    				return false;
    			});
    			
    			$('#deck'+i).click(function (e) {
    				var offset = parseInt(this.id.slice(4));
    				self.game.client.sendDeckToCards(self.deckIndex+offset);
    				return false;
    			});    			
    		}   
    	},

	playCardsInit: function ()
	{
		fakedeck = [1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9];
		this.totalCards = fakedeck.length;
		this.scale = 3;
		this.deckCoords = {x: 600, y: 0};
		
		this.maxCardsInHand = 10;
		
		this.deckElem = [];
		this.handElem = [];
		this.castedElem = [];
		
		this.round = 0;
		this.currentRound = 0;
		
		this.playerMaxHealth = 30;
		this.playerHealth = 30;
		
		var endTurn = function(e)
		{
			// Opponents Turn.
		  
			playersTurn();
		  
		  // Tests.
			updatePlayerHealth(2);
			updateMobHealth(castedElem[0],1);
		
		};
		var endTurnElem = document.getElementById("cardendturn");
		endTurnElem.addEventListener("click", endTurn)
		
		this.updatePlayerHealth(0);
		
		this.generateDeck(fakedeck);
		this.generateHand(fakedeck);		
	},
	
	generateDeck: function ()
	{
		shuffle(this.deck);
		var len = this.deck.length;
		for (var i=0; i < len; ++i)
		  {
			var cardElem = document.createElement('div');
			
			cardElem.id = "gamecard"+i;
			cardElem.className = "gamecard";
			cardElem.style.left = this.deckCoords.x + (i*scale*2)+"px";
			cardElem.style.zIndex = i;
			cardElem.style.backgroundColor = "rgb("+(255-(i*scale))+",0,0)";
			document.getElementById('cardgame').appendChild(cardElem);
		  
			var cardContent = document.createElement('div');
			cardContent.id = "cardcontent"+i;
			cardContent.className = "cardcontent"
			cardElem.appendChild(cardContent);
			
			var contentCastScore = document.createElement('div');
			contentCastScore.id = 'contentcastscore'+i;
			contentCastScore.className = 'contentcastscore';
			contentCastScore.innerHTML = this.deck[i];
			cardContent.appendChild(contentCastScore);
			
			var contentPicture = document.createElement('div');
			contentPicture.id = 'contentpicture'+i;
			contentPicture.className = 'contentpicture';
			cardContent.appendChild(contentPicture);
		  
			var contentDesc = document.createElement('div');
			contentDesc.id = 'contentdesc'+i;
			contentDesc.className = 'contentdesc';
			contentDesc.innerHTML = this.deck[i] + " sample";
			cardContent.appendChild(contentDesc);
	
			var contentStat = document.createElement('div');
			contentStat.id = 'contentstat'+i;
			contentStat.className = 'contentstat';
			contentStat.innerHTML = this.deck[i] + " / " + this.deck[i];
			cardContent.appendChild(contentStat);

			cardElem.dataset.castValue = this.deck[i];
			this.deckElem.push(cardElem);
		  }		
	},
		
	cardHandOrder: function()
	{
	  for (var i=0; i < handElem.length; ++i)
	  {
	    var j = parseInt(handElem[i].id.slice(8));
	    var card = document.getElementById("gamecard"+j);
	    if (!card)
	    	continue;
	    card.style.zIndex = 10+i;
	    card.style.left = 50*i+"px";
	    card.style.bottom = "0px";
	  }
	},
	
	cardCastedOrder: function()
	{
	  for (var i=0; i < castedElem.length; ++i)
	  {
	    var j = parseInt(castedElem[i].id.slice(8));
	    var card = document.getElementById("gamecard"+j);
	    if (!card)
		continue;
	    card.style.zIndex = 10+i;
	    card.style.left = 100*i+"px";
	    card.style.bottom = "250px";
	  }
	},
	
	showCardInHand: function (card, i) 
	{
		var self = this;
		
	    var cardHandCast = function(e) 
		{
		  var i = parseInt(this.id.slice(8));
		  var castValue = this.dataset.castValue;
		  if (castValue > self.currentRound)
			return false;
		
		  self.castedElem.push(this);
		  self.handElem.splice(self.handElem.indexOf(this),1);	
		
		  this.removeEventListener('mouseover',self.cardHandZoom);
		  this.removeEventListener('mouseout',self.cardHandZoomOut);
		  this.removeEventListener('click',self.cardHandCast);
		  
		  self.currentRound -= castValue;
		  self.updateRound();
		  
		  this.style.zoom = 1.0;
		  
		  self.cardCastedOrder();
		  self.cardHandOrder();
		  
		  e.preventDefault();
		  //e.stopPropagation();
		  return false;
		};
		
	    var cardHandZoom = 	function (e)
		{
		  this.style.zIndex = 20;
		  this.style.zoom = 1.25;
		  this.oldLeft = this.style.left;
		  this.style.left = parseInt(this.style.left) / 1.25+"px";
		  e.preventDefault();
		  //e.stopPropagation();
		  return false;
		};
	    var cardHandZoomOut = function (e)
		{
		  this.style.left = parseInt(this.oldLeft) + "px";
		  this.style.zoom = 1.0;
		  self.cardHandOrder();
		  e.preventDefault();
		  //e.stopPropagation();
		  return false;
		};
		
	    card.childNodes[0].style.display = "block";  
	    var j = parseInt(card.id.slice(8));
	    card.style.left = 50*i+"px";
	    card.style.bottom = "0px";
	    card.style.zIndex = 10+i;
	    card.addEventListener("mouseover", cardHandZoom);
	    card.addEventListener("mouseout", cardHandZoomOut);
	    card.addEventListener("click", cardHandCast);      
	},

	playersTurn: function ()
	{
	  var self = this;
	  var cardAttack = function (e) {
		  if (this.dataset.isAttacked == "true")
			return;
		  this.dataset.isAttacked = true;  
		  // Send Attack
	  };
		
      self.currentRound = ++self.round;
	  for (var i=0; i < self.castedElem.length; i++)
	  {
		self.castedElem[i].dataset.isAttacked = false;
	    self.castedElem[i].addEventListener("click", cardAttack);      
	  }
	  
	  self.updateRound();
	  
	  if (self.handElem.length >= self.maxCardsInHand)
		return;
	  else if (self.deckElem.length == 0)
	  {
		self.updatePlayerHealth(1);
	    return;
	  }
		var topDeck = (self.deckElem.length-1);
	  var cardElem = self.deckElem.splice(topDeck,1);
	  self.handElem.push(cardElem[0]);
	  
	  var topHand = self.handElem.length-1;
	  showCardInHand(self.handElem[topHand], topHand);
	},
	
	updateRound: function () {
	  var roundElem = document.getElementById('cardcurrentround');
	  roundElem.innerHTML = this.currentRound + '/' + this.round;
	},

	
	updatePlayerHealth: function (damage)
	{
	  this.playerHealth -= damage;
	  if (this.playerHealth <= 0)
	  {
		// Player has died end game.
	  
	  }
	  var cardlifeElem = document.getElementById("cardlife");
		cardlifeElem.innerHTML = this.playerHealth + " / " + this.playerMaxHealth;
	},

	updateMobHealth: function (card, damage)
	{
	  if (!card)
	  	  return;
	
	  var mobStats = card.childNodes[0].childNodes[3].innerHTML.split(" / ");
	  var attack = mobStats[0];
	  var health = mobStats[1];
	  health -= damage;
	  if (health <= 0)
	  {
		alert("Mob is dead");
	    document.getElementById('cardgame').removeChild(card);
	    //attackElem.splice(card)
	    var i = this.castedElem.indexOf(card);
	    this.castedElem.splice(i,1);
	    this.cardCastedOrder();
	    return;
	  }  
	  var mobStats = card.childNodes[0].childNodes[3].innerHTML = attack + " / " + health;
	  
	},
	

	generateHand: function ()
	{
	  var topDeck = (this.deck.length-1);
	  var bottomHand = (this.deck.length-7)
		
	  // Get the players hand out the deck.
	  for (var i=topDeck; i >= bottomHand; --i)
	  {
	    this.handElem.push(deckElem[i]);
	    this.deckElem.splice(i,1);
	  }
		
	  // Show the hand and make it zoom friendly.
	  for (var i=0; i < this.handElem.length; ++i)
	  {
		this.showCardInHand(this.handElem[i], i);
	  }		
	},
	
	
	inviteconfirm: function (invitee)
	{
		var self = this;
		
		$('#cardsconfirmtitle').html("Play cards with " + invitee.name + "?");
		   
		$('#cardsconfirmyes').click(function(event){
			self.game.client.sendCardBattleRequestOk(invitee.id);
			$('#cardsconfirm').css('display', 'none');
		});
		$('#cardsconfirmno').click(function(event){
			self.game.client.sendCardBattleRequestCancel(invitee.id);
			$('#cardsconfirm').css('display', 'none');
		});
		$('#cardsconfirm').css('display', 'block');
	},
	
        showcardGambleDialog: function(opponent, bet) {
          var self = this;
          if(this.game.started) {
            $('#cardGambleDialog').addClass('active');
            $('#cardGambleCount').val(bet);
            $('#cardGambleCount').focus();
            $('#cardGambleCount').select();
            $('#cardGambleCount').attr({
            		"max": Math.max(this.game.inventoryHandler.getItemCount(400), self.minBet),
            		"min": Math.min(this.game.inventoryHandler.getItemCount(400), self.minBet),
            });
          $('#cardGambleAccept').click(function(event) {
          	var bet = parseInt($('#cardGambleCount').val());
          	if (bet > 0)
          	{
          		self.game.client.sendCardBattleBetOk(opponent.id, bet);
          	}
          	self.hidecardGambleDialog();
          });
          $('#cardGambleCancel').click(function(event) {
          	self.game.client.sendCardBattleBetCancel(opponent.id);
          	self.hidecardGambleDialog();
          });
            this.cardGambleDialogPopuped = true;
          }
        },
        hidecardGambleDialog: function() {
          if(this.game.started) {
            $('#cardGambleDialog').removeClass('active');
            $('#cardGambleCount').blur();

            this.cardGambleDialogPopuped = false;
          }
        },

    	showCards: function ()
    	{
    		var self = this;
    		var s = this.game.renderer.scale;
    		var ts = this.game.renderer.tilesize;
    		
    		for (var i=0; i < 10; ++i)
    		{
    			var card = this.cards[this.cardIndex+i];
    			if (card == null || card == 0)
    			{
    				$('#card'+i).html('');
    				$('#card'+i).css('background', 'none no-repeat 0 0');
    				continue;
    			}
    			var text = ItemTypes.KindData[card].level;
    			$('#card'+i).html(text);
    			
    			var imgName = ItemTypes.KindData[card].spriteName;
    			var si = (s > 1) ? s-1 : 0;
    			var sprite = this.game.spritesets[si][imgName];
				var x = ((sprite.animationData['idle_down'].length - 1) * sprite.width) * si;
				var y = ((sprite.animationData['idle_down'].row) * sprite.height + ts/4) * si;
    			
    			var imgPath  = 'img/2/'+ imgName + '.png';
    			$('#card'+i).css('background', 'url('+imgPath+') no-repeat -'+x+'px -'+y+'px');
    		}
    		$('#cardinfo').html(this.cardIndex + " / " + this.cards.length);
    	},

    	showDeck: function ()
    	{
    		var self = this;
    		var s = this.game.renderer.scale;
    		var ts = this.game.renderer.tilesize;
    		
    		for (var i=0; i < 10; ++i)
    		{
    			var deckCard = this.deck[this.deckIndex+i];
    			if (deckCard == null || deckCard == 0)
    			{
    				$('#deck'+i).html('');
    				$('#deck'+i).css('background', 'none no-repeat 0 0');
    				continue;
    			}
    			var text = ItemTypes.KindData[deckCard].level;
    			$('#deck'+i).html(text);
    			
    			var imgName = ItemTypes.KindData[deckCard].spriteName;
    			var si = (s > 1) ? s-1 : 0;
    			var sprite = this.game.spritesets[si][imgName];
				var x = ((sprite.animationData['idle_down'].length - 1) * sprite.width) * si;
				var y = ((sprite.animationData['idle_down'].row) * sprite.height + ts/4) * si;
    			
    			var imgPath  = 'img/2/'+ imgName + '.png';
    			$('#deck'+i).css('background', 'url('+imgPath+') no-repeat -'+x+'px -'+y+'px');
    		} 		
    		$('#deckinfo').html(this.deckIndex + " / " + this.deck.length);
    	},
    });
    return CardHandler;
});
