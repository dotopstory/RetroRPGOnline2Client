
/* global Types */
app = null;
gLatency = 200;

define(['jquery', 'app', 'entrypoint', 'util', 'characterdialog',
    'button2', 'dialog', 'game', 'bubble'], function($, App, EntryPoint) {
    //global app, game;

    var initApp = function(server) {

    	var startEvents = function () {
	    if (typeof(StatusBar) !== 'undefined')
	    	    StatusBar.hide();
	}
 	document.addEventListener("deviceready", startEvents, false);

    	 $(document).ready(function() {

            app = new App();
            app.center();

            DragDataInv = null;

            if(Detect.isWindows()) {
                // Workaround for graphical glitches on text
                $('body').addClass('windows');
            }

            if(Detect.isOpera()) {
                // Fix for no pointer events
                $('body').addClass('opera');
            }

            if(Detect.isFirefoxAndroid()) {
                // Remove chat placeholder
                $('#chatinput').removeAttr('placeholder');
            }

            $('.barbutton').click(function() {
                $(this).toggleClass('active');
            });
            /*
            $('#rankingbutton').click(function(event){
                if(app.game && app.ready && app.game.ready){
                    app.game.client.sendRanking('get');
                    app.hideAllSubwindow();
                    app.game.rankingHandler.show();
                }
            });
            $('#questbutton').click(function(event){
                if(app.game && app.ready && app.game.ready){
                    app.game.client.sendQuest(0, "show");
                    app.hideAllSubwindow();
                    app.game.questhandler.show();
                }
            });
            $('#chatbutton').click(function() {
                if($('#chatbutton').hasClass('active')) {
                    app.showChat();
                } else {
                    app.hideChat();
                }
            });*.




            $('#instructions').click(function() {
                app.hideWindows();
            });

            /* $('#playercount').click(function() {
             app.togglePopulationInfo();
             }); */

            $('#population').click(function() {
                app.togglePopulationInfo();
            });

            $('.clickable').click(function(event) {
                //event.stopPropagation();
            });

            $('#change-password').click(function() {
                app.loadWindow('loginWindow', 'passwordWindow');
            });

			$('#shortcutbutton').click(function() {
				$('#attackContainer').show();
				$('#shortcutbutton').hide();
			});

            $('#attackContainer .frame-close-button').click(function() {
				$('#shortcutbutton').show();
				$('#attackContainer').hide();
            });

            // Create New Character fields
            /*$('#nameinput').bind("keyup", function() {
                app.toggleButton();
            });
            $('#pwinput').bind("keyup", function() {
                app.toggleButton();
            });
            $('#pwinput2').bind("keyup", function() {
                app.toggleButton();
            });
            $('#emailinput').bind("keyup", function() {
                app.toggleButton();
            });

            // Change Password Fields.
            $('#cpnameinput').bind("keyup", function() {
                app.toggleButton();
            });
            $('#cppwinputold').bind("keyup", function() {
                app.toggleButton();
            });
            $('#cppwinput').bind("keyup", function() {
                app.toggleButton();
            });
            $('#cppwinput2').bind("keyup", function() {
                app.toggleButton();
            });*/


            //$('#notifications div').bind(TRANSITIONEND, app.resetMessagesPosition.bind(app));

            $('.close').click(function() {
                app.hideWindows();
            });

            $('.play').click(function(event) {
                 app.tryStartingGame();
            });

            //document.addEventListener("touchstart", function() {},false);

            //$('#resize-check').bind("transitionend", app.resizeUi.bind(app));
            //$('#resize-check').bind("webkitTransitionEnd", app.resizeUi.bind(app));
            //$('#resize-check').bind("oTransitionEnd", app.resizeUi.bind(app));

            log.info("App initialized.");

            initGame(server);

            return app;
        });
    };

    var initGame = function() {
        require(['game', 'button2'], function(Game, Button2) {
            var canvas = document.getElementById("entities"),
            	backgroundbuffer = document.getElementById("backgroundbuffer"),
            	backgroundunscaled = document.getElementById("backgroundunscaled"),
            	foregroundunscaled = document.getElementById("foregroundunscaled"),
            	atmospherebuffer = document.getElementById("atmospherebuffer"),
                background = document.getElementById("background"),
                animated = document.getElementById("animated"),
                foreground = document.getElementById("foreground"),
                textcanvas = document.getElementById("textcanvas"),
                toptextcanvas = document.getElementById("toptextcanvas"),
                atmosphere = document.getElementById("atmosphere"),
                atmosphere2 = document.getElementById("atmosphere2"),
                input = document.getElementById("chatinput");

            game = new Game(app);
            game.setup('#bubbles', canvas, backgroundbuffer, backgroundunscaled, foregroundunscaled, atmospherebuffer, background, animated, foreground, textcanvas, toptextcanvas, atmosphere, atmosphere2, input);

            app.setGame(game);

            game.useServer == "world";

            game.onNbPlayersChange(function(worldPlayers, totalPlayers){
                if (worldPlayers !== 1) {

                    $('#users').html(worldPlayers + " ONLINE");
                } else {

                    $('#users').html(worldPlayers + " ONLINE");
                }
            });
            game.onGuildPopulationChange( function(guildName, guildPopulation) {
                var setGuildPlayersString = function(string) {
                    $("#guild-population").find("span:nth-child(2)").text(string);
                };
                $('#guild-population').addClass("visible");
                $("#guild-population").find("span").text(guildPopulation);
                $('#guild-name').text(guildName);
                if(guildPopulation == 1) {
                    setGuildPlayersString("player");
                } else {
                    setGuildPlayersString("players");
                }
            });

            game.onGameStart(function() {
		var entry = new EntryPoint();
		entry.execute(game);
            });

            game.onDisconnect(function(message) {
                $('#errorwindow').find('p').html(message+"<em>Disconnected. Please reload the page.</em>");
                $('#errorwindow').show();
            });

            game.onPlayerDeath(function() {
                //$('body').addClass('death');
                $('#diedwindow').show();
            });



            /*$('#questbutton').click(function(event){
             if(app.game && app.ready && app.game.ready){
             app.game.client.sendQuest(0, "show");
             app.hideAllSubwindow();
             app.game.questhandler.show();
             }
             }); */
            game.onNotification(function(message) {
                app.showMessage(message);
            });

            app.initHealthBar();
            app.initFatigueBar();
            app.initExpBar();
            app.initPlayerBar();

            $('#nameinput').attr('value', '');
            $('#pwinput').attr('value', '');
            $('#pwinput2').attr('value', '');
            $('#emailinput').attr('value', '');
            $('#chatbox').attr('value', '');

            var ax, ay, bx, by;
            if(game.renderer.mobile || game.renderer.tablet) {
                $('#canvas .clickable').on('touchstart', function(event) {
                    app.center();
                    app.setMouseCoordinates(event.originalEvent.touches[0]);
                    app.hideWindows();

       		   if (!game.usejoystick)
	               game.click();

                    game.player.disableKeyboardNpcTalk = false;
                });
                $('#canvas .clickable').on('touchend', function(event) {
		   game.player.disableKeyboardNpcTalk = true;

                });
            } else {
                $('#canvas .clickable').click(function(event) {
                    app.center();
                    app.setMouseCoordinates(event);
                    if(game && !app.dropDialogPopuped && !app.auctioSellDialogPopuped)
                    {
                        //game.pvpFlag = event.shiftKey;
                        if (!game.usejoystick)
                        	game.click();
                    }
                    app.hideWindows();
                    event.stopPropagation();
                });
            }

            $(document).ready(function () {
		    $('#gui').on('click', function(event) {
				event.preventDefault();
		    });
		    game.inventoryHandler.loadInventoryEvents();
            });
            $('#respawn').click(function(event) {
                game.audioManager.playSound("revive");
                game.respawn();
                $('#diedwindow').hide();
            });
            this.scale = game.renderer.getScaleFactor();

            Button2.configure = {background: {top: this.scale * 314, width: this.scale * 14}, kinds: [0, 3, 2]};

            var self = this;
            // Character Button
            this.characterButton = new Button2('#character', {background: {left: this.scale * 238 }});
            this.characterButton.onClick(function(sender, event) {
                app.toggleCharacter();
            });
            game.characterDialog.button = this.characterButton;
            app.toggleCharacter = function() {
				if(game && game.ready) {
					game.characterDialog.show(1);
				}
            };

            // Skill button
            this.skillButton = new Button2('#skill', {background: {left: this.scale * 238 }});
            this.skillButton.onClick(function(sender, event) {
                app.toggleSkill();
            });
            //game.skillDialog.button = this.skillButton;
            app.toggleSkill = function() {
				if(game && game.ready) {
					game.characterDialog.show(0);
				}
            };

            // Quest Button
            this.questButton = new Button2('#help', {background: {left: this.scale * 280}});
            this.questButton.onClick(function(sender, event) {
                game.questhandler.toggleShowLog();
            });

            // Inventory Button
            this.inventoryButton = new Button2('#moreinventory', {background: {left: this.scale * 196}});
            this.inventoryButton.onClick(function(sender, event) {
                app.toggleInventory();
            });
            app.toggleInventory = function() {
                if(game && game.ready) {
                    game.inventoryHandler.toggleAllInventory();
                }
            }

            // Settings Button
            this.settingsButton = new Button2('#settings', {background: {left: this.scale * 98}, downed: false});
            this.settingsButton.onClick(function(sender, event) {
                game.settingsHandler.show();
            });
            game.settingsButton = this.settingsButton;


            // Warp Button
            this.warpButton = new Button2('#warp', {background: {left: this.scale * 322}});
            this.warpButton.onClick(function(sender, event) {
                app.toggleWarp();
            });
            game.warpButton = this.warpButton;
            app.toggleWarp = function() {
                if(game && game.ready) {
                    game.warpManager.toggle();
                }
            };

            // Chat Button
            this.chatButton = new Button2('#chat', {background: {left: this.scale * 364}});
            this.chatButton.onClick(function(sender, event) {
                app.toggleChat();
                event.preventDefault();
            });
            game.chatButton = this.chatButton;
            app.toggleChat = function() {
                if(game && game.ready) {
			if(!$('#chatbutton').hasClass('active')) {
				app.showChat();
			} else {
				app.hideChat();
			}
                }
            }

            // Chatlog Button
            /*this.chatButton = new Button2('#chatbutton', {background: {left: this.scale * 364}});
            this.chatButton.onClick(function(sender, event) {
                app.toggleChat();
            });
            game.chatButton = this.chatButton;
            app.toggleChat = function() {
                if(game && game.ready) {
					if(!$('#chatbutton').hasClass('active')) {
						app.showChatLog();
					} else {
						app.hideChatLog();
					}
                }
            }

	      // Joystick Button
            this.joystickButton = new Button2('#joystickbutton', {background: {left: this.scale * 364}});
            this.joystickButton.onClick(function(sender, event) {
                app.toggleJoystick()
            });
            game.joystickButton = this.joystickButton;
            app.toggleJoystick = function() {
                if(game && game.ready) {
                	game.usejoystick = !game.usejoystick;
                }
            }*/

	      // Party Button
            this.socialButton = new Button2('#social', {background: {left: this.scale * 364}});
            this.socialButton.onClick(function(sender, event) {
                app.toggleSocial()
            });
            game.socialButton = this.socialButton;
            app.toggleSocial = function() {
                if(game && game.ready) {
                	game.socialHandler.show();
                }
            }

			// Leader Button
            this.leaderboardButton = new Button2('#leaderboard', {background: {left: this.scale * 364}});
            this.leaderboardButton.onClick(function(sender, event) {
                app.toggleLeaderboard()
            });
            game.leaderboardButton = this.leaderboardButton;
            app.toggleLeaderboard = function() {
                if(game && game.ready) {
                	game.leaderboardHandler.show();
                }
            }

            this.storeButton = new Button2('#store', {background: {left: this.scale * 364}});
            this.storeButton.onClick(function(sender, event) {
                app.toggleStore()
            });
            game.storeButton = this.storeButton;
            app.toggleStore = function() {
                if(game && game.ready) {
                	game.storeHandler.show();
                }
            }

            $(document).mousemove(function(event) {
                app.setMouseCoordinates(event);
                if(game.started) {
                    // game.pvpFlag = event.shiftKey;
                    game.movecursor();
                }
            });
            $(document).bind('mousedown', function(event){
                if(event.button === 2){
                    return false;
                }
            });
            $(document).bind('mouseup', function(event) {
                if(event.button === 2 && game.ready) {
                    app.setMouseCoordinates(event);
                    game.rightClick();
                    return false;
                }
            });
            $(document).bind('click', function(event) {
                if(event.button === 2) {
                    return false;
                }
            });

            $(document).keyup(function(e) {
                var key = e.which;

                if (game.player && game.started && !$('#chatbox').hasClass('active'))
                {
                    switch(key) {
                        case Types.Keys.LEFT:
                        case Types.Keys.A:
                        case Types.Keys.KEYPAD_4:
                            game.player.moveLeft = false;
                            game.player.disableKeyboardNpcTalk = false;
                            break;
                        case Types.Keys.RIGHT:
                        case Types.Keys.D:
                        case Types.Keys.KEYPAD_6:
                            game.player.moveRight = false;
                            game.player.disableKeyboardNpcTalk = false;
                            break;
                        case Types.Keys.UP:
                        case Types.Keys.W:
                        case Types.Keys.KEYPAD_8:
                            game.player.moveUp = false;
                            game.player.disableKeyboardNpcTalk = false;
                            break;
                        case Types.Keys.DOWN:
                        case Types.Keys.S:
                        case Types.Keys.KEYPAD_2:
                            game.player.moveDown = false;
                            game.player.disableKeyboardNpcTalk = false;
                            break;
                        default:
                            break;
                    }
                }
            });

            $(document).keydown(function(e) {
                var key = e.which,
                    $chat = $('#chatinput');

                if(key === Types.Keys.ENTER) {
                    if($('#chatbox').hasClass('active')) {
                        app.hideChat();
                    } else {
                        app.showChat();
                    }
                }

                if (game.player && game.started && !$('#chatbox').hasClass('active')) {
                    pos = {
                        x: game.player.gridX,
                        y: game.player.gridY
                    };
                    //var isSleeping = false;
                    switch(key) {
                    	   /*
                    	// Movement keys are disabled because it sends too many movement packets.
                        case Types.Keys.LEFT:
                        case Types.Keys.A:
                        case Types.Keys.KEYPAD_4:
                        	if (!game.player.moveLeft)
                        		game.moveKey(1);
                            break;
                        case Types.Keys.RIGHT:
                        case Types.Keys.D:
                        case Types.Keys.KEYPAD_6:
                        	if (!game.player.moveRight)
                        		game.moveKey(3);
                            break;
                        case Types.Keys.UP:
                        case Types.Keys.W:
                        case Types.Keys.KEYPAD_8:
                        	if (!game.player.moveUp)
                        		game.moveKey(2);
                            break;
                        case Types.Keys.DOWN:
                        case Types.Keys.S:
                        case Types.Keys.KEYPAD_2:
                        	if (!game.player.moveDown)
                        		game.moveKey(4);
                            break;
                            */
                        //case Types.Keys.SPACE:
                            //game.makePlayerAttackNext();
                            //break;
                        /*case Types.Keys.I:
                            $('#achievementsbutton').click();
                            break;
                        case Types.Keys.H:
                            $('#helpbutton').click();
                            break;
                        case Types.Keys.M:
                            $('#mutebutton').click();
                            break;*/
                        default:
                            break;
                    }
                    if (game.player.moveDown || game.player.moveUp || game.player.moveLeft || game.player.moveRight)
                    {
                            clearInterval(game.autoattack);
                            clearInterval(game.makePlayerAttackAuto);
                            clearInterval(game.autotalk);
                            //game.player.disengage();
                    }
                }
            });

            $(document).keyup(function(e) {
                var key = e.which;

                /*
		if (game.player && game.started && !$('#chatbox').hasClass('active')) {
			switch(key) {
				case Types.Keys.LEFT:
				case Types.Keys.A:
				case Types.Keys.KEYPAD_4:
					game.stopMove = true;
				case Types.Keys.RIGHT:
				case Types.Keys.D:
				case Types.Keys.KEYPAD_6:
					game.stopMove = true;
					break;
				case Types.Keys.UP:
				case Types.Keys.W:
				case Types.Keys.KEYPAD_8:
					game.stopMove = true;
					break;
				case Types.Keys.DOWN:
				case Types.Keys.S:
				case Types.Keys.KEYPAD_2:
					game.stopMove = true;
				default:
					break;
			}
		}
		*/
            });

            /*
            $('#attackButton').on("touchstart mousedown", function(e) {
                if (!game.player || game.player.isDead)
                	return;

                e.preventDefault();
                setTimeout(function() {
                		game.makePlayerInteractNext();
                }, game.inputLatency);
            });
            $('#attackButton').on("mouseup touchend", function(e) {
            	clearInterval(game.autoattack);
            });
            */




            $('#chatinput').keydown(function(e) {
                var key = e.which,
                    $chat = $('#chatinput'),
                    placeholder = $(this).attr("placeholder");

                //   if (!(e.shiftKey && e.keyCode === 16) && e.keyCode !== 9) {
                //        if ($(this).val() === placeholder) {
                //           $(this).val('');
                //            $(this).removeAttr('placeholder');
                //            $(this).removeClass('placeholder');
                //        }
                //    }

                if(key === 13) {
                    if($chat.val() !== '') {
                        if(game.player) {
                            game.say($chat.val());
                        }
                        $chat.val('');
                        app.hideChat();
                        $('#foreground').focus();
                        return false;
                    } else {
                        app.hideChat();
                        return false;
                    }
                }

                if(key === 27) {
                    app.hideChat();
                    return false;
                }
            });

            $('#chatinput').focus(function(e) {
                var placeholder = $(this).attr("placeholder");

                if(!Detect.isFirefoxAndroid()) {
                    $(this).val(placeholder);
                }

                if ($(this).val() === placeholder) {
                    this.setSelectionRange(0, 0);
                }
            });


            $('#dropAccept').click(function(event) {
                try {
                    var count = parseInt($('#dropCount').val());
                    if(count > 0) {
                    	if (app.inventoryNumber == -1) // Send to bank.
                    	{
                    		if (count > game.inventoryHandler.gold) count=game.inventoryHandler.gold;
                    		game.client.sendGold(1,count);
                    	}
                    	else if (app.inventoryNumber == -2) // Send to inventory.
                    	{
                    		if (count > game.inventoryHandler.gold) count=game.bankHandler.gold;
                    		game.client.sendGold(2,count);
                    	}
                    	else
                    	{
				if(count > game.inventoryHandler.inventoryCount[app.inventoryNumber])
				    count = game.inventoryHandler.inventoryCount[app.inventoryNumber];

				game.client.sendInventory(1, "empty", app.inventoryNumber, count);

				game.inventoryHandler.inventoryCount[app.inventoryNumber] -= count;
				if(game.inventoryHandler.inventoryCount[app.inventoryNumber] === 0)
				    game.inventoryHandler.inventory[app.inventoryNumber] = null;
                    	}
                    }
                } catch(e) {
                }

                setTimeout(function () {
                    app.hideDropDialog();
                }, 100);

            });

            $('#dropCancel').click(function(event) {
                setTimeout(function () {
                    app.hideDropDialog();
                }, 100);

            });

            $('#auctionSellAccept').click(function(event) {
                try {
                    var count = parseInt($('#auctionSellCount').val());
                    if(count > 0) {
                        game.client.sendAuctionSell(app.inventoryNumber,count);
                        game.inventoryHandler.inventory[app.inventoryNumber] = null;
                    }
                } catch(e) {
                }

                setTimeout(function () {
                    app.hideAuctionSellDialog();
                }, 100);

            });

            $('#auctionSellCancel').click(function(event) {
                setTimeout(function () {
                    app.hideAuctionSellDialog();
                }, 100);

            });



            $('#nameinput').focusin(function() {
                $('#name-tooltip').addClass('visible');
            });

            $('#nameinput').focusout(function() {
                $('#name-tooltip').removeClass('visible');
            });

            $('#nameinput').keypress(function(event) {
                $('#name-tooltip').removeClass('visible');
            });

            /*$('#mutebutton').click(function() {
                game.audioManager.toggle();
            });

            $('#helpbutton').click(function() {
                game.questhandler.toggleShowLog();
            });*/

            $(document).bind("keydown", function(e) {
                var key = e.which,
                    $chat = $('#chatinput');

                if(key === 13) { // Enter
                    if(game.started) {
                        $chat.focus();
                        return false;
                    } else {
                        if (app.loginFormActive() || app.createNewCharacterFormActive() ||
                            app.changePasswordFormActive())
                        {
                            $('input').blur();      // exit keyboard on mobile
                            app.tryStartingGame();
                            return false;           // prevent form submit
                        }
                    }
                }

                //if($('#chatinput:focus').size() === 0 && $('#nameinput:focus').size() === 0) {
                    if (app.loginFormActive() || app.createNewCharacterFormActive() ||
                    	app.changePasswordFormActive() || $chat.is(":focus"))
                    {
                    	//game.keyDown(key);
                    	//alert("aborting since not started");
                    	//log.info("login or create new character true");
                        return true;
                    }
                    /*
                    if(key === 27) { // ESC
                        app.hideWindows();
                        _.each(game.player.attackers, function(attacker) {
                            attacker.stop();
                        });
                        return false;
                        //use E and F for arrow keys and E F for WSAD
                    }
                    if(game.ready &&
                        !app.dropDialogPopuped &&
            	    	!app.auctionsellDialogPopuped &&
                		!game.cardHandler.cardGambleDialogPopuped &&
                        !game.statehandler.buyingArcher &&
                        !game.statehandler.changingPassword  &&
                        !game.shopHandler.shown &&
                        !game.storeDialog.visible &&
                        !game.cardHandler.cardGamblePopuped) {
                        if (key >= 49 && key <= 54) { // 1 to 6 for now
                            game.keyDown(key);
                            return false;

                        } else if (key === 107) { // +
                            game.chathandler.incChatWindow();
                        } else if (key === 109) {
                            game.chathandler.decChatWindow();
                        } else if ([81, 69, 82, 84, 89].indexOf(key) >= 0 && game.ready && game.player) { // q, e, r, t, y
                            game.player.skillHandler.execute(key);
                            return false;
                        }
                        if (key === 32) { // Space
                            game.togglePathingGrid();
                            return false;
                        }

                        if (key == 66) {  // B for Backpack
				//if(game && game.ready) {
					game.inventoryHandler.toggleAllInventory();
				//}
                        }

                        if (key == 67) { // C for Character
				//if(game && game.ready) {
				    if(game.characterDialog.visible) {
					game.characterDialog.hide();
				    } else {
					game.client.sendCharacterInfo();
				    }
				//}
                        }

                        if (key == 76) // L for Quest Log.
                        {
                             game.questhandler.toggleShowLog();
                        }

                        if (key == 77) // M for Music
                        {
                            //if(game && game.ready) {
				    if(game.audioManager.toggle()) {
					game.soundButton.down();
				    } else {
					game.soundButton.up();
				    }
			    //}
                        }
                        */
                        // The following may be uncommented for debugging purposes.
                        //
                        /*
                         if (key === 70) { // F
                         game.toggleDebugInfo();
                         return false;
                         } */
                    //}
                //}
            });

            /*$('#healthbar').click(function(e) {
                var hb = $('#healthbar'),
                    hp = $('#hitpoints'),
                    hpg = $('#hpguide');

                var hbp = hb.position(),
                    hpp = hp.position();

                if((e.offsetX >= hpp.left) && (e.offsetX < hb.width())) {
                    if(hpg.css('display') === 'none') {
                        hpg.css('display', 'block');

                        setInterval(function () {
                            if(((game.player.hitPoints / game.player.maxHitPoints) <= game.hpGuide) &&
                                (game.healShortCut >= 0) &&
                                ItemTypes.isConsumableItem(game.player.inventory[game.healShortCut]) &&
                                (game.player.inventoryCount[game.healShortCut] > 0)
                            ) {
                                game.eat(game.healShortCut);
                            }
                        }, 100);
                    }
                    hpg.css('left', e.offsetX + 'px');

                    game.hpGuide = (e.offsetX - hpp.left) / (hb.width()- hpp.left);
                }

                return false;
            });*/

            if(game.renderer.tablet) {
                $('body').addClass('tablet');
            }
        });
        $('#healthbar').bind('mousedown', function (event) {
            if(event.button === 2) {
                return false;
            }
        });

        $('#healthbar').bind('mouseup', function (event) {
            if(event.button === 2) {
                if(game.autoEattingHandler) {
                    clearInterval(game.autoEattingHandler);

                    $('#hpguide').css('display', 'none');
                }
                return false;
            }
        });

        $('#hpguide').bind('mousedown', function (event) {
            if(event.button === 2) {
                return false;
            }
        });

        $('#hpguide').bind('mouseup', function (event) {
            if(event.button === 2) {
                if(game.autoEattingHandler) {
                    clearInterval(game.autoEattingHandler);

                    $('#hpguide').css('display', 'none');
                }
                return false;
            }
        });

    	/*$(window).blur(function(){
    	  if (game && game.client && game.player && game.started);
    	  	  //game.client.sendHasFocus(0);
    	});
    	$(window).focus(function(){
    	  if (game && game.client && game.player && game.started);
    	  	  //game.client.sendHasFocus(1);
    	});*/

	document.addEventListener('DOMContentLoaded', function () {
	  // check whether the runtime supports screen.lockOrientation
	  if (screen.lockOrientation) {
	    // lock the orientation
	    screen.lockOrientation('landscape');
	  }

	  // ...rest of the application code...
	});


	if(typeof console === "undefined"){
	      console = {};
	}
    };

    document.getElementById('armorColor').addEventListener('change', function(e) {
    	var color = rgb2hex(e.target.style.backgroundColor);
    	game.client.sendColorTint("armorColor", color);
		game.player.armorColor = color;

		game.renderer.removeBodyColorCanvas(game.player);
		game.renderer.createBodyColorCanvas(game.player);

    });

    document.getElementById('weaponColor').addEventListener('change', function(e) {
    	var color = rgb2hex(e.target.style.backgroundColor);
    	game.client.sendColorTint("weaponColor", color);
		game.player.weaponColor = color;

		game.renderer.removeWeaponColorCanvas(game.player);
		game.renderer.createWeaponColorCanvas(game.player);

    });

    return initApp();
});
