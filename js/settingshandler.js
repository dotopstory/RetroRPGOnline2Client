define(['jquery','lib/virtualjoystick'], function() {
  var SettingsHandler = Class.extend({
    init: function(game,app) {
	this.game = game;
	this.app = app;
	this.toggle = false;
	var self = this;    
	$('#settingsclose').click(function(e){
            self.show();			
	});
	
	$('#buttonsound').click(function(e) {
		if ($(this).hasClass('active')) {
			$(this).html("Off");
			$(this).removeClass('active');
		}
		else {
			$(this).html("On");
			$(this).addClass('active');
		}

		if(self.game && self.game.ready) {
		    self.game.audioManager.toggle();
		}   			
	});
	
	$('#buttonchat').click(function(e) {
		if ($(this).hasClass('active')) {
			$(this).html("Off");
			$(this).removeClass('active');
		}
		else {
			$(this).html("On");
			$(this).addClass('active');
		}
                if(self.game && self.game.ready) {
			if($(this).hasClass('active')) {
				app.hideChatLog();
			} else {
				app.showChatLog();
			}                	
                }   		
        });
	
	$('#buttonjoystick').click(function(e) {
		if ($(this).hasClass('active')) {
			$(this).html("Off");
			$(this).removeClass('active');
		}
		else {
			$(this).html("On");
			$(this).addClass('active');
		}

                if(self.game && self.game.ready) {
                	self.game.usejoystick = !self.game.usejoystick;
                	if (!self.game.usejoystick)
                		VirtualJoystick._touchIdx = null;
                	if (self.game.joystick == null)
                	{
                    	log.info("Loading Joystick");
                    	self.game.joystick = new VirtualJoystick({
                    	game            : self.game,
						container		: document.getElementById('canvas'),
						mouseSupport	: true,
						//stationaryBase  : true,
						//baseX : 50 * self.renderer.scale,
						//baseY : $('#container').height() - (60 * self.renderer.scale),
						
						//limitStickTravel: true,
						//stickRadius: 20 * self.renderer.scale,
						});                		
                	}
                	else
                	{
                		self.game.joystick = null;
                	}
                }   		
        });

	$('#buttonoptimized').click(function(e) {
		if ($(this).hasClass('active')) {
			$(this).html("Off");
			$(this).removeClass('active');
		}
		else {
			$(this).html("On");
			$(this).addClass('active');
		}

                if(self.game && self.game.ready) {
			self.game.optimized = !self.game.optimized;                	
                }   		
        });

    	$('.cgamezoom').change(function() {
    		var tilesW = parseInt($('#gamezoom').val());

    		self.game.ready = false;
    		self.game.camera.rescale(tilesW);
			
			self.game.renderer.rescaling = true;
    		self.game.renderer.calcZoom();
			self.game.renderer.rescale();	
			self.game.renderer.resizeCanvases();
			self.game.camera.setRealCoords();
			self.game.ready = true;
			
			self.game.renderer.forceRedraw = true;
			//var self2 = self;
			self.game.renderer.clearBuffer(self.game.renderer.buffer);
			//setTimeout(function () {
					//self.game.renderer.forceRedraw = true;
					self.game.renderer.drawOldTerrain();
					self.game.renderer.rescaling = false;
			//},250);
    	});
    },

    show: function() {
    	var self = this;
        this.toggle = !this.toggle;
    	if (this.toggle)
    	{
            $('#settings').css('display', 'block');
        
			if (self.game.renderer.mobile)
				$('#gamezoom option[value="17"]').attr("selected", true);
			else
				$('#gamezoom option[value="21"]').attr("selected", true);
            
        }
        else
        {
            $('#settings').css('display', 'none');
        }
    }

  });
  return SettingsHandler;
});

