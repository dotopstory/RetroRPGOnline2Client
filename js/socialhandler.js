define(['jquery'], function() {
  var SocialHandler = Class.extend({
    init: function(game) {
		var self = this;
		
		this.game = game;
		this.toggle = false;
		
		this.partymembers = [];
		$('#partyleave').click(function(event){
			self.game.client.sendPartyLeave();
			$('#partynames').html("");
			self.show();
		});
		$('#partyclose').click(function(e){
				self.show();			
		});

		this.guildmembers = [];
		$('#guildleave').click(function(event){
			self.game.client.sendLeaveGuild();
			$('#guildnames').html("");
			self.show();
		});
		$('#guildclose').click(function(e){
				self.show();			
		});
	
    },

    inviteParty: function (invitee)
    {
		var self = this;
		
		$('#partyconfirmtitle').html("Party " + invitee.name + "?");
	   
	    $('#partyconfirmyes').click(function(event){
		    self.game.client.sendPartyInvite(invitee.id, 1);
		    $('#partyconfirm').css('display', 'none');
	    });
	    $('#partyconfirmno').click(function(event){
		    self.game.client.sendPartyInvite(invitee.id, 2);
		    $('#partyconfirm').css('display', 'none');
	    });
	     $('#partyconfirm').css('display', 'block');
    },

    inviteGuild: function (guildId, guildName, invitorName)
    {
		var self = this;
		
		$('#guildconfirmtitle').html("Join Guild " + guildName + "?");
	   
	    $('#guildconfirmyes').click(function(event){
		    self.game.client.sendGuildInviteReply(guildId, true);
		    $('#guildconfirm').css('display', 'none');
	    });
	    $('#guildconfirmno').click(function(event){
		    self.game.client.sendGuildInviteReply(guildId, false);
		    $('#guildconfirm').css('display', 'none');
	    });
	     $('#guildconfirm').css('display', 'block');
    },

    show: function() {
        this.toggle = !this.toggle;
    	if (this.toggle)
    	{
            this.displayParty();
			this.displayGuild();
			$('#socialwindow').css('display', 'block');
        }
        else
        {
            $('#socialwindow').css('display', 'none');
        }
    },
    setPartyMembers: function(members){
      this.partymembers = members;
      this.displayParty();
    },
    
    setGuildMembers: function(members){
      this.guildmembers = members;
      this.displayGuild();
    },

    displayParty: function () {
      if (this.partymembers.length <= 1)
      {
      	  $('#partynames').html("No party.");
          return;
      }

      var htmlStr = "<table><tr><th>Name</th></tr>";
      htmlStr += "<tr><td>" + this.partymembers[0] + " (L)</td></tr>";
      for(var i=1; i < this.partymembers.length; ++i){
          htmlStr += "<tr><td>" + this.partymembers[i] + "</td></tr>";
      }
      htmlStr += "</table>";
      $('#partynames').html(htmlStr);
    	    
    },

    displayGuild: function () {
      if (this.guildmembers.length <= 0)
      {
      	  $('#guildnames').html("No guild.");
          return;
      }

      var htmlStr = "<table><tr><th>Name</th></tr>";
      htmlStr += "<tr><td>" + this.guildmembers[0] + " (L)</td></tr>";
      for(var i=1; i < this.guildmembers.length; ++i){
          htmlStr += "<tr><td>" + this.guildmembers[i] + "</td></tr>";
      }
      htmlStr += "</table>";
      $('#guildnames').html(htmlStr);
    	    
    },	
    
    isPartyLeader: function (name) {
    	return name === this.partymembers[0];
    },
    
    isPartyMember: function (name) {
    	return (this.partymembers.indexOf(name) > -1);	    
    },

    isGuildLeader: function (name) {
    	return name === this.guildmembers[0];	    
    },
    
    isGuildMember: function (name) {
    	return (this.guildmembers.indexOf(name) > -1);	    
    }
	
  });
  return SocialHandler;
});

