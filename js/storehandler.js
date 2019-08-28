define(['config', 'jquery'], function(config) {
  var StoreHandler = Class.extend({
    init: function(game,app) {
	this.game = game;
	this.app = app;
	this.toggle = false;
	var self = this;    
	$('#storeclose').click(function(e){
            self.show();			
	});        
    },

    show: function() {
        this.toggle = !this.toggle;
    	if (this.toggle)
    	{
			window.location.replace(config.build.productpage + this.game.player.name); 
        }
    }

  });
  return StoreHandler;
});

