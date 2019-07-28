define(['jquery'], function() {
  var GuildHandler = Class.extend({
    init: function(game) {
	this.game = game;
	this.toggle = false;
	this.members = [];
	
	var self = this;    
	$('#guildleave').click(function(event){
	    self.game.client.sendLeaveGuild();
	    $('#guildnames').html("");
	    self.show();
	});
	$('#guildclose').click(function(e){
            self.show();			
	});
    },

    inviteconfirm: function (guildId, guildName, invitorName)
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
            $('#guild').css('display', 'block');
            this.display();
        }
        else
        {
            $('#guild').css('display', 'none');
        }
    },
    setMembers: function(members){
      this.members = members;
      this.display();
    },
    
    display: function () {
      if (this.members.length <= 0)
      {
      	  $('#guildnames').html("No guild.");
          return;
      }

      var htmlStr = "<table><tr><th>Name</th></tr>";
      htmlStr += "<tr><td>" + this.members[0] + " (L)</td></tr>";
      for(var i=1; i < this.members.length; ++i){
          htmlStr += "<tr><td>" + this.members[i] + "</td></tr>";
      }
      htmlStr += "</table>";
      $('#guildnames').html(htmlStr);
    	    
    },
    
    isLeader: function (name) {
    	//log.info("name="+name+",this.members[0]="+this.members[0]);
    	return name === this.members[0];	    
    },
    
    isMember: function (name) {
    	return (this.members.indexOf(name) > -1);	    
    }
  });
  return GuildHandler;
});