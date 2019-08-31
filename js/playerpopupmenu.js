define(['jquery'], function() {
    var PlayerPopupMenu = Class.extend({
        init: function(game){
            this.width = parseInt($('#playerPopupMenuContainer').css('width'));
            this.height = parseInt($('#playerPopupMenuContainer').css('height'));
            this.game = game;
            this.selectedPlayer = null;

            var self = this;
            $('#playerPopupMenuPartyInvite').click(function(event){
                if(self.selectedPlayer){
        	    self.game.client.sendPartyInvite(self.selectedPlayer.id, 0);
                    self.close();
                }
            });
            $('#playerPopupMenuPartyLeader').click(function(event){
                if(self.selectedPlayer){
                    self.game.client.sendPartyLeader(self.selectedPlayer.id);
                    self.close();
                }
            });
            $('#playerPopupMenuPartyKick').click(function(event){
                if(self.selectedPlayer){
                    self.game.client.sendPartyKick(self.selectedPlayer.id);
                    self.close();
                }
            });
            $('#playerPopupMenuAttack').click(function(event){
                if(self.selectedPlayer){
                    //self.game.player.engage(self.selectedPlayer);
                    //self.game.makePlayerAttack(self.selectedPlayer);
                    //self.game.processInput(self.selectedPlayer.gridX, self.selectedPlayer.gridY);
                    if (self.game.player.pvpTarget && self.game.player.pvpTarget == self.selectedPlayer)
                    {
                        $('#playerPopupMenuAttack').html('Attack');
                    	//self.game.player.pvpTarget = null;
                    }
                    else
                    {
			//$('#playerPopupMenuAttack').html('Disengage');                    	    
                        self.game.player.pvpTarget = self.selectedPlayer;
                        // Player has 60 seconds of battle time.
                        setTimeout(function () {
				if (self.game.player)                        		
					self.game.player.pvpTarget = null;
                        	clearInterval(self.game.makePlayerAttackAuto);
                    	},60000); 
                    }
                }
                self.close();
            }); 
            
            $('#playerPopupMenuCardBattle').click(function(event){
                if(self.selectedPlayer){
                    self.game.client.sendCardBattleRequest(self.selectedPlayer.id);
                    self.close();
                }
            });
        },
        click: function(player){
            var s = this.game.renderer.scale;
            var x = (player.x - this.game.camera.x) * s - $('#playerPopupMenuContainer').width()/2;
            var y = (player.y - this.game.camera.y) * s - $('#playerPopupMenuContainer').height()/2;
            var ph = this.game.socialHandler;

            
            /*if(x < 0){
                x = 0;
            } else if(x + this.width > this.game.renderer.getWidth()){
                x = this.game.renderer.getWidth() - this.width;
            }*/

            /*if(y < 0){
                y = 0;
            } else if(y + this.height > this.game.renderer.getHeight()){
                y = this.game.renderer.getHeight() - this.height;
            }*/

            this.selectedPlayer = player;
            
            if (ph.isPartyLeader(this.game.player.name) && ph.isPartyMember(this.selectedPlayer.name))
            {
                $('#playerPopupMenuPartyKick').css('display', 'block');
                $('#playerPopupMenuPartyLeader').css('display', 'block');
            }
            else
            {
            	$('#playerPopupMenuPartyKick').css('display', 'none');
            	$('#playerPopupMenuPartyLeader').css('display', 'none');
            }
            
            if ((ph.isPartyLeader(this.game.player.name) && !ph.isPartyMember(this.selectedPlayer.name)) || ph.partymembers.length == 0)
            {
            	$('#playerPopupMenuPartyInvite').css('display', 'block');    
            }
            else
            {
            	$('#playerPopupMenuPartyInvite').css('display', 'none');    
            }
            
            if (this.selectedPlayer.level >= 20 && this.game.player.level >= 20 && this.game.mapIndex != 0)
            {
            	    $('#playerPopupMenuAttack').css('display','block');
            }
            else
            {
            	    $('#playerPopupMenuAttack').css('display', 'none');
            }
            
            // TODO change back to 40 when testing finished.
            if (this.game.player.deck.length >= 10)
            {
            		$('#playerPopupMenuCardBattle').css('display','none');	
            }
            else
            {
            		$('#playerPopupMenuCardBattle').css('display','none');
            }

            $('#playerPopupMenuContainer').css('display', 'block');
            $('#playerPopupMenuContainer').css('top', '' + y + 'px');
            $('#playerPopupMenuContainer').css('left', '' + x + 'px');
            $('#playerPopupMenuName').html(player.name);
        },
        close: function(){
            this.selectedPlayer = null;
            $('#playerPopupMenuContainer').css('display', 'none');
        },
    });

    return PlayerPopupMenu;
});
