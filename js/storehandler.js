define(['jquery'], function() {
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
            $('#store').css('display', 'block');
        }
        else
        {
            $('#store').css('display', 'none');
        }
    }

  });
  return StoreHandler;
});

