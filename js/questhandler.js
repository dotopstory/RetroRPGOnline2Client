
/* global Types, Class, _, questSerial */

define(['text!../shared/data/newquests_english.json', 'jquery'], function(QuestsJson) {
  
		
  var questdata = JSON.parse(QuestsJson);
  
  var QuestHandler = Class.extend({
    init: function(game) {
      this.game = game;
      this.hideDelay = 5000; //How long the notification shows for.
      this.progressHideDelay = 1000;
      this.quests = questdata;
      this.showlog = false;
      
      var i=0;
      _.each(this.quests, function(quest){
      		quest.found = false;
      		quest.completed = false;
      		quest.id = i++;
      		quest.progCount = 0;
      });
      
      var self = this;
	    this.closeButton = $('#questCloseButton');
	    this.closeButton.click(function(event) {
	        self.toggleShowLog();
	    });      
    },
    show: function(){
    },
    
    npcHasQuest: function(npcId) {
	    for(var questSerial in this.quests){
		var quest = this.quests[questSerial];
		if(quest.npcId === npcId && (!quest.found || !quest.completed))
			return true;
	    }
	    return false;
    },
    
    getNPCQuest: function(questId) {
	    return _.find(this.quests, function(q) { 
		return q.id === questId; 
	    });
    },
    
    initQuest: function(questFound, questProgress){
      var i=0;
      _.each(this.quests, function(quest){
        quest.found = questFound[i];
        if(questProgress[i] === 999){
          quest.completed = true;
        } else{
          quest.completed = false;
        }
        i++;
      });
    },

    questAlarmShow: function (str, delay) {

		//var scale = this.game.renderer.getScaleFactor();
		//if (scale>1) scale--;
		var imgNames =  str.match(/\[img\](.*?)\[\/img\]/g);
		var desc = str.replace(/\[img\](.*?)\[\/img\]/g,"<div class=\"alarmimg\" id=\"alarmimg$1\" style=\"background-image: url('img/1/$1.png')\"></div>");
    	    
            $('#questalarm').html(desc);
            $('#questalarm').fadeIn();
		_.each(imgNames, function(name) {
			name = name.replace("[img]","").replace("[/img]","");
			var sprite = this.game.spritesets[0][name];
			var x = ((sprite.animationData['idle_down'].length - 1) * sprite.width);
			var y = ((sprite.animationData['idle_down'].row) * sprite.height);
			
			$('#alarmimg'+name).css("width",sprite.width);
			$('#alarmimg'+name).css("height",sprite.height);

			var offset = '-'+x+'px -'+y+'px';
			$('#alarmimg'+name).css("background-position", offset);
		});

            setTimeout(function() {
                $('#questalarm').fadeOut();
            }, delay);
    	    
    },
    
    toggleShowLog: function () {
    	    this.showlog = !this.showlog;
	if (this.showlog)
	{
	    this.questReloadLog();		
            this.questShowLog();	
	}
	else
	{
	    this.questHideLog();
	}
    },
    
    questReloadLog: function() {
	var self = this;
	$("#questLogInfo tbody").find("tr:gt(0)").remove();
	
         _.each(this.quests, function(quest){
		//var scale = self.game.renderer.getScaleFactor();
		//if (scale>1) scale--;
		var imgNames =  quest.desc.match(/\[img\](.*?)\[\/img\]/g);
		var questDesc = quest.desc.replace(/\[img\](.*?)\[\/img\]/g,"<div class=\"img\" id=\"img$1\" style=\"background-image: url('img/1/$1.png')\"></div>");
  			
	     var progress  = (quest.type==2) ? (quest.progCount+" / "+quest.mobCount) : ' ';
	     quest.progress = progress;
	     if(quest.found && !quest.completed){
	         $('#questLogInfo tbody').append(
	         	 '<tr><td>'+quest.name+'</td>' +
	         	 '<td>'+questDesc+'</td>' +
	         	 '<td>'+progress+'</td></tr>');
	     }
	     
		_.each(imgNames, function(name) {
			name = name.replace("[img]","").replace("[/img]","");
			var sprite = this.game.spritesets[0][name];
			var x = ((sprite.animationData['idle_down'].length - 1) * sprite.width);
			var y = ((sprite.animationData['idle_down'].row) * sprite.height);
			
			$('#img'+name).width(sprite.width);
			$('#img'+name).height(sprite.height);
	
			var offset = '-'+x+'px -'+y+'px';
			$('#img'+name).css("background-position", offset);
		});	     
	});    	    
    },
    
    questShowLog: function() {
    	    //alert("called");
    	 $('#questlog').css('display', 'block');
    	 $('#questCloseButton').css('display', 'block');

	SendNative(["QuestLogOpen"].concat(this.quests));
    },
    
    questHideLog: function() {
    	 $('#questlog').css('display', 'none');
    	 $('#questCloseButton').css('display', 'none');
    	 SendNative(["QuestLogClose"]);
    },
    
    handleQuest: function(data) {
        var i=1;
        var type = data[0];
        var questId, quest;
        var htmlStr = '';
        

        
        if(type === "show") {
          _.each(this.quests, function(quest) {
              quest.found = data[i++];
                  if(data[i++] === 999){
                      quest.completed = true;
                  } else{
                      quest.completed = false;
                  }
              });
        } else if(type === "found") {
            questId = data[1];
            quest = this.getNPCQuest(questId);
            quest.found = true;
            
            htmlStr = '<p><h2>' + quest.name + ' Quest Found</h2></p><p>' + quest.desc + '</p>';
            this.questAlarmShow(htmlStr, this.hideDelay);
            this.questReloadLog();
            
		
       } else if(type === "complete") {
            questId = data[1];
            quest = this.getNPCQuest(questId);
            quest.completed = true;
                        
            htmlStr = '<p><h2>' + quest.name + ' Quest Completed</h2></p><p>' + quest.desc + '</p>';
            this.questAlarmShow(htmlStr, this.hideDelay);
            this.questReloadLog();
        } else if(type === "progress") {
            questId = data[1];
            quest = this.getNPCQuest(questId);
            
            if (quest.type == 2 || quest.type == 3)
            {
            	    htmlStr = '<h2>' + quest.name + ' Quest Progress</h2><p>' + quest.desc + '<br>' + data[2] + ' / ' + quest.mobCount + ' killed' + '</p>';
            	    this.questAlarmShow(htmlStr, this.progressHideDelay);
            	    this.quests[questId].progCount = data[2];
	    }
	    this.questReloadLog();
        }
        
	if (this.showlog)
	{
            this.questReloadLog();
            this.questShowLog();
	}        
    },
    talkToNPC: function(npc){
	    for(var questSerial in this.quests){
		var quest = this.quests[questSerial];
		//alert(JSON.stringify(quest));
		if(quest.npcId === npc.kind && !quest.completed){
		    //if(!quest.found) {
			//this.game.client.sendQuest(quest.id, "found");
			this.game.client.sendTalkToNPC(npc.kind, quest.id);
			//this.quests[questSerial].found = true;
			//if (quest.completed)
			//	return null;
			
			return npc.talk(quest, false);
		    //} /*else if(quest.found && quest.completed) {
			//return npc.talk(quest.id, true);
		   
		} /*else if (quest.npcId === npc.kind && quest.completed)
		{
			//this.game.client.sendTalkToNPC(npc.kind, quest.id);
			return npc.talk(quest, true);			
		}*/
	    }
    }
  });
  return QuestHandler;
});
