
/* global Mob, Types, Item, log, _, TRANSITIONEND, Class */

define(['jquery', 'localforage', 'mob', 'item', 'mobdata'], function($, localforage, Mob, Item, MobData) {

    var App = Class.extend({
        init: function() {        	
            this.currentPage = 1;
            this.blinkInterval = null;
            this.ready = false;
            //this.watchNameInputInterval = setInterval(this.toggleButton.bind(this), 100);
            this.initFormFields();
            this.dropDialogPopuped = false;
            this.auctionsellDialogPopuped = false;
            
            this.inventoryNumber = 0;
            
            this.classNames = ["loadcharacter",
            	"createcharacter",
            	"changePassword"];
            this.frontPage = this.classNames[0];
            
		   localforage.getItem('hash', function(e, val) {
		   	   log.info("val="+val);
			   document.getElementById('loginhash').value = val;		   
		   });
		   localforage.getItem('usr', function(e, val) {
		   	   log.info("val="+val);
			   document.getElementById('loginnameinput').value = val;		   
		   });            
		   document.getElementById('loginpwinput').value = "";
		   
		   var self = this;
            $('#createback').click(function(event){
            	self.loadWindow('registerwindow', 'loginwindow');
            });
            
            this.$loginInfo = $('#loginInfo');
            
            $('#cmdQuit').click(function(event){
            		navigator.app.exitApp();
            });
        },

        setGame: function(game) {
            this.game = game;
            this.isMobile = this.game.renderer.mobile;
            this.isTablet = this.game.renderer.tablet;
            this.isDesktop = !(this.isMobile || this.isTablet);
            this.supportsWorkers = !!window.Worker;
            this.ready = true;
            
            this.menuClicked = true;
            this.initMenuButton();
            this.initCombatBar();

            //this.chatlogClicked = true;
            //this.initChatLog();            
        },

        initFormFields: function() {
            var self = this;

            // Play button
            this.$play = $('.play');
            this.getPlayButton = function() { return this.getActiveForm().find('.play span'); };
            this.setPlayButtonState(true);
            
            // Login form fields
            this.$loginnameinput = $('#loginnameinput');
            this.$loginpwinput = $('#loginpwinput');
            this.loginFormFields = [this.$loginnameinput, this.$loginpwinput];
            
            
            // Create new character form fields
            this.$nameinput = $('#nameinput');
            this.$pwinput = $('#pwinput');
            this.$pwinput2 = $('#pwinput2');
            this.$email = $('#emailinput');
            this.createNewCharacterFormFields = [this.$nameinput, this.$pwinput, this.$pwinput2, this.$email];

            // Create change password form fields
            this.$pwnameinput = $('#cpnameinput');
            this.$pwinputold = $('#cppwinputold');
            this.$pwinputnew = $('#cppwinput');
            this.$pwinputnew2 = $('#cppwinput2');
            this.createNewPasswordFormFields = [this.$pwnameinput, this.$pwinputold, this.$pwinputnew, this.$pwinputnew2];
            
        },

        center: function() {
            window.scrollTo(0, 1);
        },

        canStartGame: function() {
            //if(this.isDesktop) {
            //    return (this.game && this.game.map && this.game.map.isLoaded);
            //} else {
                return this.game;
            //}
        },

        tryStartingGame: function() {
            if(this.starting) return;        // Already loading

            var action;
            if ($('#loginwindow').is(':visible'))
            	    action = 'loadcharacter'
            if ($('#registerwindow').is(':visible'))
            	    action = 'createcharacter'
            
            var self = this;
            
            if (action == this.classNames[0])
            {
		    var username = this.$loginnameinput.val();
		    var userpw = this.$loginpwinput.val();
		    var server = "world";
		    var hash = null;
		    if (userpw == '')
		    	hash = $('#loginhash').val();
		    log.info("hash="+hash);
		    if(!this.validateLoginForm(username, userpw)) return;
		    
		    this.preStartGame(action, username, userpw, hash, '', '', 0, server);
                
            }
            else if (action == this.classNames[1])
            {
		    var username = this.$nameinput.val();
		    var userpw = this.$pwinput.val();
		    var userpw2 = this.$pwinput2.val();
		    var email = this.$email.val();
		    var pClass = $('#classSwitch2').val();
		    
		    if(!this.validateCreateForm(username, userpw, userpw2, email)) return;
		    
		    this.preStartGame(action, username, userpw, hash, email, '', pClass, 'world');
            }
            /*else if (action == this.classNames[2])
            {
		    var username = this.$pwnameinput.val();
		    var userpwold = this.$pwinputold.val();
		    var userpwnew = this.$pwinputnew.val();
		    var userpwnew2 = this.$pwinputnew2.val();;
                
		    if(!this.validateChangePasswordForm(username, userpwold, userpwnew, userpwnew2, email)) return;
		    
		    this.preStartGame(action, username, userpwold, '', userpwnew, 0, 'world');
            }*/
        },

        /*tryLoginGame: function(username, userpw, server)
        {
            if(this.starting) return;

            var self = this;
            
            this.preStartGame("loadcharacter", username, userpw, '', '', 0, server);
        },*/
        

        preStartGame: function (action, username, userpw, hash, email, newpw, pClass, server) {
	    var self = this;
            this.setPlayButtonState(false);

	    if(!this.ready || !this.canStartGame()) {
		var watchCanStart = setInterval(function() {
		    log.debug("waiting...");
		    if(self.canStartGame()) {
			clearInterval(watchCanStart);
			self.startGame(action, username, userpw, hash, email, newpw, pClass, server);
		    }
		}, 100);
	    } else {

		this.startGame(action, username, userpw, hash, email, newpw, pClass, server);
	    }        	
        },
        
        startGame: function(action, username, userpw, hash, email, newuserpw, pClass, server) {
            var self = this;

            $('#gameheading').css('display','none');            
            //StatusBar.hide();            
            //$('body').css('background', '#000');
            
            if(username && !this.game.started) {
                var optionsSet = false,
                    config = this.config;
                this.useAPI = config.local ? config.useLocalAPI : config.useAPI;
                //>>includeStart("devHost", pragmas.devHost);
                if(config.local) {
                    log.debug("Starting game with local dev config.");
                    this.game.setServerOptions(config.local.host, config.local.port, username, userpw, hash, email, newuserpw, pClass);
                } else {
                    log.debug("Starting game with default dev config.");
                    this.game.setServerOptions(config.dev.host, config.dev.port, username, userpw, hash, email, newuserpw, pClass);
                }
                optionsSet = true;
                //>>includeEnd("devHost");

                //>>includeStart("prodHost", pragmas.prodHost);
                if(!optionsSet) {
                    log.debug("Starting game with build config.");
                    this.game.setServerOptions(config.build.host, config.build.port, username, userpw, hash, email, newuserpw, pClass);
                }
                //>>includeEnd("prodHost");

                self.game.useServer = server;

                
                this.center();
                this.game.run(action, function(result) {
                    if(result.success === true) {
                    	self.start();
                    } else {
                        
                        self.setPlayButtonState(true);
                        /*
                       
                        case 'timeout':
                        default:
                            if (self.fail_callback)
                                self.fail_callback(reply.status);
                        break;
                        */
                        switch(result.reason) {
                            
                            case "timeout":
                                self.addValidationError(null, "Timeout whilst attempting to establish connection to RSO servers.");
                            break;
                            
                            case 'invalidlogin':
                                // Login information was not correct (either username or password)
                                self.addValidationError(null, 'The username or password you entered is incorrect.');
                                //self.getUsernameField().focus();
                            break;
                            
                            case 'userexists':
                                // Attempted to create a new user, but the username was taken
                                self.addValidationError(null, 'The username you entered is not available.');
                            break;
                            
                            case 'invalidusername':
                                // The username contains characters that are not allowed (rejected by the sanitizer)
                                self.addValidationError(null, 'The username you entered contains invalid characters.');
                            break;
                            
                            case 'loggedin':
                                // Attempted to log in with the same user multiple times simultaneously
                                self.addValidationError(null, 'A player with the specified username is already logged in.');
                            break;
                            
                            case 'ban':
                                self.addValidationError(null, 'You have been banned.');
                            break;
                            
                            case 'full':
                                self.addValidationError(null, "All TTA gameservers are currently full.")
                            break;
                            
                    	    case 'passwordChanged':
                    	    	self.loadWindow('passwordwindow', 'loginwindow');	    
                    	    break;
                    	    
                            default:
                                self.addValidationError(null, 'Failed to launch the game: ' + (result.reason ? result.reason : '(reason unknown)'));
                            break;
                        }
                    }
                });
            }
        },

        start: function() {
            var self = this;
        	this.hideIntro();
            $('body').addClass('started'); //ASKY Doesn't use this, look furhter into whether this is necessary or not.
            //if(this.firstTimePlaying) {
                //this.toggleInstructions();
            //}
            var $playButton = this.getPlayButton();
            $playButton.click(function () { self.tryStartingGame(); });
            
        },
        
        setPlayButtonState: function(enabled) {
            var self = this;
            var $playButton = this.getPlayButton();

            if(enabled) {
                this.starting = false;
                this.$play.removeClass('loading');
                $playButton.click(function () {
                	//$('#loginsubmit').click();
                	self.tryStartingGame(); 
                });
                if(this.playButtonRestoreText) {
                    this.$loginInfo.text(this.playButtonRestoreText);
                }
            } else {
                // Loading state
                this.starting = true;
                this.$play.addClass('loading');
                $playButton.unbind('click');
                this.playButtonRestoreText = this.$loginInfo.text();
                this.$loginInfo.text('Loading...');
            }
            
            
            /*$('#boardbutton').click(function(event){
              if(self.game && self.ready){
                self.game.chathandler.hide();
                self.game.boardhandler.show();
              }
            });
            $('#gamebutton').click(function(event){
              if(self.game && self.ready){
                self.game.chathandler.show();
                self.game.boardhandler.hide();
              }
            });*/      
        },
        
        getActiveForm: function() { 
            if(this.createNewCharacterFormActive()) {
            	    log.info("createcharacter");
            	    return $('#createcharacter');
            }
            else if(this.changePasswordFormActive()) {
            	    log.info("changePassword");
            	    return $('#changePassword');
            }
            else {
            	    log.info("loadcharacter");
            	    return $('#loadcharacter');
            }
        },

        loginFormActive: function() {
            return $('#loginwindow').is(":visible");
        },

        createNewCharacterFormActive: function() {
            return $('#registerwindow').is(":visible");
        },
        
       changePasswordFormActive: function() {
            return $('#passwordwindow').is(":visible");
        },

        /**
         * Performs some basic validation on the login / create new character forms (required fields are filled
         * out, passwords match, email looks valid). Assumes either the login or the create new character form
         * is currently active.
         */
         
        validateLoginForm: function(username, userpw) {
            this.clearValidationErrors();

            if(!username) {
                this.addValidationError(this.$loginnameinput, 'Please enter a username.');
                return false;
            }

            /*if(!userpw) {
                this.addValidationError(this.$loginpwinput, 'Please enter a password.');
                return false;
            }*/
            return true;
        }, 
        
        validateCreateForm: function(username, userpw, userpw2, email) {
            this.clearValidationErrors();

            if(!username) {
                this.addValidationError(this.$nameinput, 'Please enter a username.');
                return false;
            }

            if(!userpw) {
                this.addValidationError(this.$pwinput, 'Please enter a password.');
                return false;
            }

		if(!userpw2) {
		    this.addValidationError(this.$pwinput2, 'Please confirm your password by typing it again.');
		    return false;
		}
	
		if(userpw !== userpw2) {
		    this.addValidationError(this.$pwinput2, 'The passwords you entered do not match. Please make sure you typed the password correctly.');
		    return false;
		}
	
		// Email field is not required, but if it's filled out, then it should look like a valid email.
		/*if(email && !this.validateEmail(email)) {
		    this.addValidationError(this.$email, 'The email you entered appears to be invalid. Please enter a valid email (or leave the email blank).');
		    return false;
		}*/


            return true;
        },

        validateChangePasswordForm: function (username, passwordold, userpw, userpw2)
        {        	
            this.clearValidationErrors();

            if(!username) {
                this.addValidationError(this.$pwnameinput, 'Please enter a username.');
                return false;
            }

            if(!passwordold) {
                this.addValidationError(this.$pwinputold, 'Please enter your old password.');
                return false;
            }

            if(!userpw) {
                this.addValidationError(this.$pwinputnew, 'Please enter a new password.');
                return false;
            }

		if(!userpw2) {
		    this.addValidationError(this.$pwinputnew2, 'Please confirm your password by typing it again.');
		    return false;
		}
	
		if(userpw !== userpw2) {
		    this.addValidationError(this.$pwinputnew2, 'The new password you entered do not match. Please make sure you typed the same.');
		    return false;
		}

            return true;
        },

        /*validateEmail: function(email) {
            // Regex borrowed from http://stackoverflow.com/a/46181/393005
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        },*/

        addValidationError: function(field, errorText) {
            $('<span/>', {
                'class': 'validation-error blink',
                text: errorText
            }).appendTo('.validation-summary');

            if(field) {
                field.addClass('field-error').select();
                field.keypress(function (event) {
                    field.removeClass('field-error');
                    $('.validation-error').remove();
                    $(this).unbind(event);
                });
            }
        },

        clearValidationErrors: function() {
            //var fields = this.loginFormActive() ? this.loginFormFields : this.createNewCharacterFormFields;
            var fields;
            if (this.loginFormActive())
            	    fields = this.loginFormFields;
            else if (this.createNewCharacterFormActive())
            	    fields = this.createNewCharacterFormFields;
            else if (this.changePasswordFormActive())
            	    fields = this.createNewPasswordFormFields;

            if (fields)
            {
		    $.each(fields, function(i, field) {
			if (field.hasClass('field-error'))
			    field.removeClass('field-error');
		    });
		    $('.validation-error').remove();
            }
        },
        
        getZoom: function() {
            var zoom = this.game.renderer.zoom;
            
            /*if (this.game.renderer.isFirefox)
            {
                var matrixRegex = /matrix\((-?\d*\.?\d+),\s*0,\s*0,\s*(-?\d*\.?\d+),\s*0,\s*0\)/,
                matches = $('body').css('-moz-transform').match(matrixRegex);            	    
                zoom = matches[1];
            }*/
            //log.info("ZOOM="+zoom);
            return zoom;
        },
        
        setMouseCoordinates: function(event) {
            var width = this.game.renderer.getWidth(),
                height = this.game.renderer.getHeight(),
                mouse = this.game.mouse;
            
            var offsetHeight = $('#canvas').offset().top;
            var offsetWidth = $('#canvas').offset().left;
            var zoom = this.getZoom() || 1;            	    
            mouse.x = Math.floor((event.pageX) / zoom - offsetWidth);
            mouse.y = Math.floor((event.pageY) / zoom - offsetHeight);

            //log.info(mouse.x+","+mouse.y);
            
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
        },
        
        initPlayerBar: function() {
            var self = this;
            var scale = self.game.renderer.getScaleFactor(),
                ts = self.game.renderer.tilesize,
                player = self.game.player;
                        	
            if (player && !Detect.isMobile()) {
		    var weapon = self.game.sprites[player.getWeaponName()];
		    var armor = self.game.sprites[player.getArmorSprite()];
		
		    width1 = weapon ? weapon.width * scale : 0;
		    height1 = weapon ? weapon.height * scale : 0;
	
		    width2 = armor ? armor.width * scale: 0;
		    height2 = armor ? armor.height * scale : 0;

		    width3 = Math.max(width1, width2);
		    height3 = Math.max(height1, height2);
	
		    
		    switch (scale) {
			case 1:
			    $('#characterLook2').css('left', (- parseInt(width3 / 2)) + 'px');
			    $('#characterLook2').css('top', (- parseInt(height3 / 2)) + 'px');
			    break;
			case 2:
			    $('#characterLook2').css('left', (- parseInt(width3 / 2)) + 'px');
			    $('#characterLook2').css('top', (- parseInt(height3 / 2)) + 'px');
			    break;
			case 3:
			    $('#characterLook2').css('left', (- parseInt(width3 / 2)) + 'px');
			    $('#characterLook2').css('top', (- parseInt(height3 / 2)) + 'px');
			    break;
		    }
	
		    
		    $('#characterLook2').css('width', '' + width3 + 'px');
		    $('#characterLook2').css('height', '' + height3 + 'px');
	
		    $('#characterLookArmor2').css('left', '' + parseInt((width3 - width2) / 2) + 'px');
		    $('#characterLookArmor2').css('top', '' + parseInt((height3 - height2) / 2) + 'px');
		    $('#characterLookArmor2').css('width', '' + width2 + 'px');
		    $('#characterLookArmor2').css('height', '' + height2 + 'px');
		    $('#characterLookArmor2').css('background-size', '' + (width2 * 5) + 'px');
		    $('#characterLookArmor2').css('background-position', '0px -' + (height2 * 8) + 'px');
	
		    $('#characterLookWeapon2').css('left', '' + parseInt((width3 - width1) / 2) + 'px');
		    $('#characterLookWeapon2').css('top', '' + parseInt((height3 - height1) / 2) + 'px');
		    $('#characterLookWeapon2').css('width', '' + width1 + 'px');
		    $('#characterLookWeapon2').css('height', '' + height1 + 'px');
		    $('#characterLookWeapon2').css('background-size', '' + (width1 * 5) + 'px');
		    $('#characterLookWeapon2').css('background-position', '0px -' + (height1 * 8) + 'px');
	
		    $('#characterLookArmor2').css('background-image', 'url("img/' + scale + '/' + player.getArmorSprite() + '.png")');
		    $('#characterLookWeapon2').css('background-image', 'url("img/' + scale + '/' + player.getWeaponName() + '.png")');
            }
        },
        
        //Init the hud that makes it show what creature you are mousing over and attacking
        initTargetHud: function(){
            var self = this;
            var scale = self.game.renderer.getScaleFactor(),
                guiScale = self.game.renderer.getUiScaleFactor(),
            	zoom = self.game.renderer.zoom,
                //healthMaxWidth = $("#target .health").width() - (12 * scale),
                timeout,
                ts = self.game.renderer.tilesize;
                
            //var oh = $('#toptextcanvas').offset().top;
            //var ow = $('#toptextcanvas').offset().left;
            //$('#inspector').css('top', $('#inspector').offset().top + oh+(ts*scale));
            //$('#inspector').css('left', $('#inspector').offset().left + ow + $('#toptextcanvas').width()/2);
            //$('#target').css('top', $('#target').offset().top + oh +(ts*scale));
            //$('#target').css('left', $('#target').offset().left + ow+(ts*scale));
            
            if (this.game.player) {
		    this.game.player.onSetTarget(function(target, name, level, mouseover){		    		    
		        var el = '#target';
		        
		    	if (target.kind == 70) return; // Exclude Mimics.

			if (target.title)
			{
				$(el+' .name').text(target.title);
			}
			else
			{
				$(el+' .name').text(name);
			}	
			
			$(el+' .name').css('text-transform', 'capitalize');		    	
			if(target.healthPoints) {
			    $(el+" .health").css('width', Math.round(target.healthPoints/target.maxHp*90*scale)+'px');
			} else{
			    $(el+" .health").css('width', 60*guiScale+"px");
			}
	
			if(level) {                                                  
			    $(el+' .level').text(level);
			}
			
			$(el).fadeIn('fast');
		    	
			if (self.game.renderer.mobile) return;

			
			//if(mouseover) el = '#inspector';
			var sprite = target.sprite;
			if (!sprite) return;
			var x, y;
			if (!self.game.renderer.isFirefox) {
			    if (isItem(target.id)) {
				x = ((sprite.animationData['idle'].length - 1) * sprite.width),
				    y = ((sprite.animationData['idle'].row) * sprite.height);
			    } else if (isMob(target.id)) {
				
			    	
			    	if (sprite.animationData['idle_down'])
				{
				    log.info("idle_down="+sprite.animationData['idle_down'].length+","+sprite.animationData['idle_down'].row);
				    log.info("sprite="+sprite.width+","+sprite.height+","+sprite.offsetX+","+sprite.offsetY);
				    x = (((sprite.animationData['idle_down'].length-1) * sprite.width) * scale) - (sprite.offsetX * sprite.scale) - (5 * guiScale),
				    y = (((sprite.animationData['idle_down'].row) * sprite.height) * scale) - (sprite.offsetY * sprite.scale) - (10 * guiScale);
				    //if (scale > 1)
				    //	    x += sprite.width / 4;
				}
			    } else {
				return;
			    }
			}

	
			/*if(el === '#inspector'){
			    $(el + ' .details').text((target instanceof Mob ? "Level - " + target.level : (target instanceof Item ? target.getInfoMsg(): "1")));
			}*/
			// 36
			// 12
			
			//$(el+' .headshot div').height(sprite.height);
			//$(el+' .headshot div').width(sprite.width);
			//alert(sprite.width + " " + sprite.height);
			$(el+' .headshot div').css('left', '50%').css('top', '50%');
			$(el+' .headshot div').css('margin-left', -11*scale+'px').css('margin-top', -11*guiScale+'px');
			/*if (scale == 3)
				$(el+' .headshot div').css('margin-left', '11px').css('margin-top', '11px');
			else if (scale == 2)
				$(el+' .headshot div').css('margin-left', '7px').css('margin-top', '7px');
			else
				$(el+' .headshot div').css('margin-left', '3px').css('margin-top', '3px');
			*/	
			/*$(el+' .headshot').css('margin',1*scale+'px');*/
			
			$(el+' .headshot div').css('background', 'url(img/'+scale+'/'+(target instanceof Item ? 'item-'+name : name)+'.png) no-repeat -'+x+'px -'+y+'px');

		    });
            }

            this.game.onUpdateTarget(function(target){
            	log.info("targetHealth: "+target.healthPoints+" "+target.maxHp);
                //$("#target .health").css('width', Math.round(target.healthPoints/target.maxHp*90*scale)+'px');
                $("#target .health").css('width', Math.round(target.healthPoints/target.maxHp*60*guiScale)+'px');
                /*if(self.game.player.inspecting && self.game.player.inspecting.id === target.id){
                    $("#inspector .health").css('width', Math.floor(target.healthPoints/target.maxHp*100) + "%");
                }*/
            });

            if (this.game.player) {
		    this.game.player.onRemoveTarget(function(targetId){
			$('#target').fadeOut('fast');
			if(self.game.player.inspecting && self.game.player.inspecting.id === targetId){
			    $('#inspector').fadeOut('fast');
			    self.game.player.inspecting = null;
			}
			$("#target .health").css('width', (60*guiScale)+'px');
			
			$('#combatContainer').fadeOut('fast');			
		    });
		    
            }
        },
        initFatigueBar: function() {
            var maxWidth = $("#fatigue").width();

            this.game.onPlayerFatigueChange(function(fatigue, maxFatigue) {
                var barWidth = Math.round((maxWidth / maxFatigue) * (fatigue > 0 ? fatigue : 0));
                $('#fatigue').css('width', barWidth + "px");
                $('#fatiguetext').html("<p>Energy: " + fatigue + "/" + maxFatigue + "</p>");
            }); 
        },

        initExpBar: function(){
            var maxWidth = parseInt($('#expbar').width());
			var widthRate = 1.0;
			/*if (this.game.renderer.tablet)
				widthRate = 1.2;
			else if (this.game.renderer.mobile)
				widthRate = 0.9;*/              
            var self = this;
            
            this.game.onPlayerExpChange(function(level, expInThisLevel, expForLevelUp){
            	if (!expInThisLevel && !expForLevelUp)
            	{
            		$('#exp').css('width', "0px");
            		$('#expbar').attr("title", "Exp: 0%");
               		$('#expbar').html("Exp: 0%");
               		return;
                }

            	var rate = expInThisLevel/expForLevelUp;
                    if(rate > 1){
                        rate = 1;
                    } else if(rate < 0){
                        rate = 0;
                    }       
                $('#exp').css('width', 100*rate + "%");
               	$('#expbar').attr("title", "Exp: " + (rate*100).toFixed(0) + "%");
               	$('#expbar').html("Exp: " + (rate*100).toFixed(0) + "%");
               	$('#explevel').html(level);                
            });
        },

        initHealthBar: function() {
	    var healthMaxWidth = $("#health").width();
	    log.info("healthMaxWidth="+healthMaxWidth);

            this.game.onPlayerHealthChange(function(hp, maxHp) {
                var barWidth = Math.round((healthMaxWidth / maxHp) * (hp > 0 ? hp : 0));
                $("#health").css('width', barWidth + "px");
                $('#healthtext').html("<p>HP: " + hp + "/" + maxHp + "</p>");
            });

            this.game.onPlayerHurt(this.blinkHealthBar.bind(this));
        },


        blinkHealthBar: function() {
            var $hitpoints = $('#health');

            $hitpoints.addClass('white');
            setTimeout(function() {
                $hitpoints.removeClass('white');
            }, 500);
        },

        initMenuButton: function() {
        	var self = this;
        	log.info("initMenuButton");
        	
			$( document ).ready(function() {
				$("#menucontainer").css("display", "none");
			});

        	$("#charactermenu").click(function(e) {
        		if (self.menuClicked)
        		{
        			$("#menucontainer").fadeIn();
        			//$("#menucontainer").removeClass("menufadein").addClass("menufadeout");
				}
				else
				{
					$("#menucontainer").fadeOut();
					//$("#menucontainer").css("display", "block");
					//$("#menucontainer").removeClass("menufadeout").addClass("menufadein");				
				}
				self.menuClicked = !self.menuClicked;
        	});

			$( document ).ready(function() {
				$("#menucontainer").on('click', 'div', function(e){
					$("#menucontainer").fadeOut();
        			//$("#menucontainer").css("display", "none");
        			//$("#menucontainer").removeClass("menufadein").addClass("menufadeout");

					//alert("fuck");
					//e.preventDefault();
				});
			});
        	$("#menucontainer").click(function(e){
				$("#menucontainer").fadeOut();
				//if (self.menuClicked) {
				//	$("#menucontainer").css("display", "none");
				//	$("#menucontainer").removeClass("menufadein").addClass("menufadeout");        				
				//}
				/*else {
					$("#menucontainer").css("display", "block");
					$("#menucontainer").removeClass("menufadeout").addClass("menufadein");
				}*/
				//self.menuClicked = !self.menuClicked;
        	});
        },

        initCombatBar: function () {
        	var container = "#combatContainer";
		$(container).children().click(function(e) {
			$(container).children().removeClass('lightup');
			$(this).addClass("lightup");
		});
		$(container).children().eq(1).addClass("lightup");
        },
        
        hideIntro: function() {
            clearInterval(this.watchNameInputInterval);
            $('body').removeClass('intro');
            setTimeout(function() {
                $('body').addClass('game');
            }, 500);
        },

        showChat: function() {
            if(this.game.started) {
                $('#chatbox').addClass('active');
                $('#chatinput').focus();
                //$('#chatbutton').addClass('active');
                $('#chatbutton').addClass('active');
            }
        },

        hideChat: function() {
            if(this.game.started) {
                $('#chatbox').removeClass('active');
                $('#chatinput').blur();
                //$('#chatbutton').removeClass('active');
                $('#chatbutton').removeClass('active');
            }
        },

        showChatLog: function() {
            if(this.game.started) {
                $('#chatbutton').addClass('active');
                $('#chatLog').css('display','none');
            }
        },

        hideChatLog: function() {
            if(this.game.started) {
                $('#chatbutton').removeClass('active');
                $('#chatLog').css('display','block');
            }
        },
        
        showDropDialog: function(inventoryNumber) {
          if(this.game.started) {
            $('#dropDialog').addClass('active');
            $('#dropCount').focus();
            $('#dropCount').select();

            this.inventoryNumber = inventoryNumber;
            this.dropDialogPopuped = true;
          }
        },
        hideDropDialog: function() {
          if(this.game.started) {
            $('#dropDialog').removeClass('active');
            $('#dropCount').blur();

            this.dropDialogPopuped = false;
          }
        },
        
        
        showAuctionSellDialog: function(inventoryNumber) {
          if(this.game.started) {
            $('#auctionSellDialog').addClass('active');
            $('#auctionSellCount').focus();
            $('#auctionSellCount').select();

            this.inventoryNumber = inventoryNumber;
            this.auctionsellDialogPopuped = true;
          }
        },
        hideAuctionSellDialog: function() {
          if(this.game.started) {
            $('#auctionSellDialog').removeClass('active');
            $('#auctionSellCount').blur();

            this.auctionsellDialogPopuped = false;
          }
        },
        
        
        
        hideWindows: function() {
            this.game.closeItemInfo();
        },
        
        loadWindow: function(origin, destination) {
        	$('#'+origin).hide();
        	$('#'+destination).show()
        },

        resizeUi: function() {
            if(this.game) {
                if(this.game.started) {
                    this.game.resize();
                    this.initHealthBar();
                    this.initTargetHud();
                    this.initExpBar();
                    this.initPlayerBar();
                    this.game.updateBars();
                } else {
                    var newScale = this.game.renderer.getScaleFactor();
                    this.game.renderer.rescale(newScale);

                }
            }
        },
        
	petconfirm: function (invitee)
	{
			var self = this;
			
			$('#petconfirmtitle').html("Swap pet with " + invitee.name + "?");
		   
		$('#petconfirmyes').click(function(event){
			self.game.client.sendPetInvite(1);
			$('#petconfirm').css('display', 'none');
		});
		$('#petconfirmno').click(function(event){
			self.game.client.sendPetInvite(0);
			$('#petconfirm').css('display', 'none');
		});
		 $('#petconfirm').css('display', 'block');
	},
            
    });

    return App;
});
