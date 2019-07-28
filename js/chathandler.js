
define(['jquery'], function() {
    var ChatHandler = Class.extend({
        init: function(game, kkhandler) {
            var self = this;
            this.game = game;
            //this.client = game.client;
            this.kkhandler = kkhandler;
            this.chatLog = $('#chatLog');
            //handle global announcements server sided so
            //they're always synced.
        },
        show: function(){
          $('#chatLog').css('display', 'block');
        },
        processSendMessage: function(message) {
          return this.processSenders(null, message);
        },
        processReceiveMessage: function(entityId, message) {
          return this.processRecievers(entityId, message);
        },
        
        handleAddSpawn: function (data) {
		log.info("sendAddSpawn");
		var m = this.game.getMouseGridPosition();
		if (data.length == 2)
			this.game.client.sendAddSpawn(parseInt(data[1]), m.x, m.y);        	
        },
        
        handleSaveSpawns: function (data) {
        	this.game.client.sendSaveSpawns();
        },
        
        handleIdEntity: function (data) {
		var m = this.game.getMouseGridPosition();
		var entity = this.game.getEntityAt(m.x, m.y);
		if (entity)
		{
			this.addToChatLog("entity name: " + entity.name + ", id: " + entity.id +
			    ", kind: " + entity.kind + ", pos: (" + m.x + "," + m.y + ")");
		}        	
        },
        
        handleWarp: function (data) {
		var p = this.game.player;
		if (p.warpX && p.warpY)
		{
			this.teleportTo(p.warpX, p.warpY);	
		}        	
        },
        
        handlePartyInvite: function(data) {
        	var m = this.game.getMouseGridPosition();
        	var entity;
        	if (data.length == 2) 
        	{
        		log.info("name_search="+data[1]);
        		entity = this.game.getEntityByName(data[1]);
        	}	
        	else
        	{
        		entity = this.game.getEntityAt(m.x, m.y);
                }
        	if (entity == this.game.player)
        		return;
        	if (entity && entity.id)
        		this.game.client.sendPartyInvite(entity.id, 0);
        	
        },
        
        handlePartyLeader: function(data) {
        	var m = this.game.getMouseGridPosition();
        	var entity = this.game.getEntityAt(m.x, m.y);
        	if (entity)
        		this.game.client.sendPartyLeader(entity.id);        	
        },
        
        handlePartyLeave: function(data) {
        	this.game.client.sendPartyLeave();
        },
        
        handlePartyKick: function(data) {
        	var m = this.game.getMouseGridPosition();
        	var entity = this.game.getEntityAt(m.x, m.y);
        	if (entity)
        		this.game.client.sendPartyKick(entity.id);        	
        },

        handlePetCreate: function (data) {
		if (data.length == 3)
		{
			var target = this.game.getEntityByName(data[1]);
			if (target)
			    this.game.client.sendPetCreate(target.id, parseInt(data[2]));
		}
        },

        handleAutoPotion: function (data) {
			if (data.length == 2)
			{
				this.game.useAutoPotion = parseInt(data[1]);
			}
        },
        
        handleRemovePet: function (data) {
        	if (data.length == 2)
        	{
				var m = this.game.getMouseGridPosition();
				var entity = this.game.getEntityAt(m.x, m.y);
				if (entity.playerId)
					entity = this.game.getEntityById(entity.playerId);
				if (entity)
					this.game.client.sendRemovePet(entity.id, parseInt(data[1]));	
        		
        	}
        },
        
        processSenders: function(entityId, message) {
                var data = message.split(" ",5);
                if (!data) data[0] = message;
                
                switch (data[0])
                {
                    case "/as":
                        this.handleAddSpawn(data);
                    	return true;
                    case "/savespawns":
                    	this.handleSaveSpawns(data);
                    	return true;
                    case "/id":
                    	this.handleIdEntity(data);
                        return true;
                    case "/warp":
                    	this.handleWarp(data);
                    	return true;
                    case "/party":
                    case "/invite":
                    	this.handlePartyInvite(data);
                    	return true;
                    case "/leader":
                    	this.handlePartyLeader(data);
                    	return true;
                    case "/leave":
                    	this.handlePartyLeave(data);
                    	return true;
                    case "/kick":
                    	this.handlePartyKick(data);
                    	return true;
                    case "/pet":
                    	this.handlePetCreate(data);    
                    	return true;
                    case "/autopotion":
                    	this.handleAutoPotion(data);
                    	return true;
                    case "/rmpet":
                    	this.handleRemovePet(data);
                    	return true;
                }
                			//#cli guilds
			var regexp = /^\/guild\ (invite|create|accept)\s+([^\s]*)|(guild:)\s*(.*)$|^\/guild\ (leave)$/i;
			var args = message.match(regexp);
			if(args != undefined){
				switch(args[1]){
					case "invite":
						if(this.game.player.hasGuild()){
							this.game.client.sendGuildInvite(args[2]);
						}
						else{
							this.addNotification("You are not in a guild.");
						}
						break;
					case "create":
						this.game.client.sendNewGuild(args[2]);
						break;
					case undefined:
						if(args[5]==="leave"){
							this.game.client.sendLeaveGuild();
						}
						else if(this.game.player.hasGuild()){
							this.game.client.talkToGuild(args[4]);
						}
						else{
							this.addNotification("You got no-one to talk to…");
						}
						break;
					case "accept":
						var status;
						if(args[2] === "yes") {
							status = this.game.player.checkInvite();
							if(status === false){
								this.addNotification("You were not invited anyway…");
							}
							else if (status < 0) {
								this.addNotification("Sorry to say it's too late…");
								setTimeout(function(){self.addNotification("Find someone and ask for another invite.")},2500);
							}
							else{
								this.game.client.sendGuildInviteReply(this.game.player.invite.guildId, true);
							}
						}
						else if(args[2] === "no"){
							status = this.game.player.checkInvite();
							if(status!==false){
								this.game.client.sendGuildInviteReply(this.game.player.invite.guildId, false);
								this.game.player.deleteInvite();
							}
							else{
								this.addNotification("Whatever…");
							}
						}
						else{
							this.addNotification("“guild accept” is a YES or NO question!!");
						}
						break;
				}
				return true;
			}
        	var pattern = message.substring(0, 3),
                self = this,
                commandPatterns = {
                      	"/g ": function(message) {
                      		if(self.game.player.hasGuild()){
                      			self.game.client.talkToGuild(message);
                      		}
                      		else{
                      			self.addNotification("You got no-one to talk to…");
                      		}
                      		return true;
						},
                		"/w ": function(message) {
                            var name = self.game.player.name,
                                rights = self.game.player.rights;  
                                   
                            //'hacking' this will cause no issues
                            //as they grant no advantages
                            switch (rights) {
                                case 2:
                                    name = "[Admin]" + name;
                                break;
                                
                                case 1:
                                    name = "[Moderator]" + name;
                                break;
                                //no default needed.
                            }
                            
                            self.game.client.sendChat("/s " + name + ": " + message);
                            return true;
                      },
                      "// ": function(message) {
                          self.game.client.sendChat("// " + self.game.player.name + ": " + message);
                          return true;
                      },
                      /*"/re": function(message) {
                      	  self.teleportToTown();
                          return true;
                      },
                      "/to": function(message) {
                      	  self.teleportToTown();
                          return true;
                      },*/                      
                      "///": function(message) {
                          self.game.client.sendChat("/// " + self.game.player.name + ": " + message);
                          return true;
                      },
                      /*"/te": function(message) {
                      	  self.teleportTo(parseInt(data[1]), parseInt(data[2]));
                          return true;
                      },*/
                };
                if (pattern in commandPatterns) {
                      if (typeof commandPatterns[pattern] == "function") {
                          return commandPatterns[pattern](message.substring(3));
                      }
                }
            return false;
        },
        processRecievers: function(entityId, message) {
        		if (message.indexOf("/") !== 0)
        			return false;

        		//var regexp = /^\/guild\ (invite|create|accept)\s+([^\s]*)|(guild:)\s*(.*)$|^\/guild\ (leave)$/i;
        		//var args = message.match(regexp);
        		//if (args) return false;

        		var data = message.split(" ",5);
                if (!data) data[0] = message;
                
                switch (data[0])
                {
                    case "/rn":
                        this.addRatingNotification(message.substr(4));
                    	return true;
                }
                
        	var pattern = message.substring(0, 3),
                self = this,
                commandPatterns = {
                        // World chat
                        "/1 ": function(entityId, message) {
                            self.addToChatLog(message);
                            return true;
                        },
                        "// ": function(entityId, message){
                            self.addToChatLog('<font color="#00BFFF">' + message + '</font>');
                            return true;
                        },
                        "///": function(entityId, message){
                            var i=0;
                            var splitMsg = message.split(' ');
                            var msg = "";
                            for(i=0; i<splitMsg.length; i++){
                                  if(i !== 3){
                                      msg += splitMsg[i] + " ";
                                  }
                                  // OPTIMIZED VERSION !!! NON TESTED
                                  //if(i !== 3)
                                  //    msg += splitMsg[i] + " ";
                            }
                            self.addToChatLog('<font color="#FFA500">' + msg + '</font>');
                            return true;
                        },
                };
                if (pattern in commandPatterns) {
                      if (typeof commandPatterns[pattern] == "function") {
                          return commandPatterns[pattern](entityId, message.substring(3));
                      }
                }
            return false;
        },
        bumpOffLog: function(){
            var self = this;
            $(this.chatLog).find("p:first").remove();
        },
        addToChatLog: function(message){
            var self = this;
            var el = $('<p style="color: white">' + message + '</p>');
            $(el).appendTo(this.chatLog);
            $(this.chatLog).scrollTop(999999);
            SendNative(["AddToChatLog", message]);
            setTimeout(function () { self.bumpOffLog() }, 10000);
        },
        addNotification: function(message){
            var self = this;
            var el = $('<p style="color: rgba(128, 255, 128, 1)">' + message + '</p>');
            $(el).appendTo(this.chatLog);
            $(this.chatLog).scrollTop(999999);
            SendNative(["AddToNotificationLog", message]);
            setTimeout(function () { self.bumpOffLog() }, 10000);
        },
        addNormalChat: function(entity, message) {
            var self = this;

            if (!entity) return;
            
            var el = $('<p style="color: rgba(255, 255, 0, 1)">' + entity.name + ': ' + message + '</p>');
            
            
            $(el).appendTo(this.chatLog);
            $(this.chatLog).scrollTop(999999);
            SendNative(["AddToNormalChat", entity.name, message]);
            setTimeout(function () { self.bumpOffLog() }, 10000);
        },
        
        addGameNotification: function(notificationType, message) {
            var self = this;
        	var el = $('<p style="color: rgba(255, 255, 0, 1)">' + notificationType + ': ' + message + '</p>');
            $(el).appendTo(this.chatLog);
            $(this.chatLog).scrollTop(999999);
            SendNative(["AddToGameNotification", notificationType, message]);
            setTimeout(function () { self.bumpOffLog() }, 10000);
        },

        addRatingNotification: function(message) {
            var self = this;
            var el = $('<p style="color: rgba(255, 255, 0, 1)">' + message + '</p>');
            $(el).appendTo(this.chatLog);
            $(this.chatLog).scrollTop(999999);
            /*(setTimeout(function() {
            		window.location.replace("https://play.google.com/store/apps/details?id=com.taptapadventure");
            },5000);*/
            setTimeout(function () { self.bumpOffLog() }, 10000);
        }

    });
    return ChatHandler;
});
