/* global Detect, Class, _, log, Types, font */

define(['camera', 'item', 'items', 'character', 'player', 'timer', 'mob', 'npc', 'pet', 'util'],
    function(Camera, Item, ItemData, Character, Player, Timer, Mob, Npc, Pet, util) {

        var Renderer = Class.extend({
            init: function(game, canvas, buffer, backgroundunscaled, foregroundunscaled, atmospherebuffer, background, animated, foreground, textcanvas, toptextcanvas, atmosphere, atmosphere2) {
                this.game = game;

                this.context = (canvas && canvas.getContext) ? canvas.getContext("2d") : null;
                var buffer = document.createElement('canvas');
				buffer.id = "buffer";
				this.buffer = (buffer && buffer.getContext) ? buffer.getContext("2d") : null;
                
				//var backgroundunscaled = document.createElement('canvas');
				//backgroundunscaled.id = "backgroundunscaled";
				//var foregroundunscaled = document.createElement('canvas');
				//foregroundunscaled.id = "foregroundunscaled";
				
				this.backgroundunscaled = (backgroundunscaled && backgroundunscaled.getContext) ? backgroundunscaled.getContext("2d") : null;
                this.foregroundunscaled = (foregroundunscaled && foregroundunscaled.getContext) ? foregroundunscaled.getContext("2d") : null;

                this.background = (background && background.getContext) ? background.getContext("2d") : null;
                this.foreground = (foreground && foreground.getContext) ? foreground.getContext("2d") : null;
                //this.animated = (animated && animated.getContext) ? animated.getContext("2d") : null;
                
                this.toptextcontext = (toptextcanvas && toptextcanvas.getContext) ? toptextcanvas.getContext("2d") : null;
                
                //this.atmospherebuffer = (atmospherebuffer && atmospherebuffer.getContext) ? atmospherebuffer.getContext("2d") : null;
                //this.atmosphere = (atmosphere && atmosphere.getContext) ? atmosphere.getContext("2d") : null; 
                //this.atmosphere2 = (atmosphere2 && atmosphere2.getContext) ? atmosphere2.getContext("2d") : null; 
                
                this.canvas = canvas;
                this.backbuffercanvas = buffer;
                this.backunscaledcanvas = backgroundunscaled;
                this.foreunscaledcanvas = foregroundunscaled;
                
                this.backcanvas = background;
                //this.animatedcanvas = animated;
                this.forecanvas = foreground;
                this.textcanvas = textcanvas;
                this.toptextcanvas = toptextcanvas;
                //this.atmospherecanvas = atmosphere;
                //this.atmospherecanvas2 = atmosphere2;
                //this.atmospherebuffercanvas = atmospherebuffer;
                
                this.bgrcanvas = document.getElementById("background");

                this.backgroundOffsetX = 0;
                this.backgroundOffsetY = 0;
                
                this.initFPS();
                this.tilesize = 16;
                this.zoom = 1;
                
                this.upscaledRendering = true; //this.context.mozImageSmoothingEnabled !== undefined;
				this.rescaling = true;
                this.supportsSilhouettes = this.upscaledRendering;
                this.isFirefox = Detect.isFirefox();
                this.isCanary = Detect.isCanaryOnWindows();
                this.isEdge = Detect.isEdgeOnWindows();
                this.isSafari = Detect.isSafari();
                this.tablet = Detect.isTablet(window.innerWidth);
                this.mobile = Detect.isMobile();
                
                //this.setContainerDimensions();
                //this.rescale();
                
                this.lastTime = new Date();
                this.frameCount = 0;
                this.maxFPS = this.FPS;
                this.realFPS = 0;
                this.fullscreen = true;
                
                //Turn on or off Debuginfo (FPS Counter)
                this.isDebugInfoVisible = false;
                this.animatedTileCount = 0;
                this.highTileCount = 0;
                

                this.forceRedraw = true;
                
                //this.createMonsterGlow(12*this.scale);
                
                this.delta = 0;
                this.last = Date.now();
		
                //this.bloodParticles = [];
                
                this.announcements = [];
                
				//this.waterParticles = [];
				//this.rainCanvas = document.createElement('canvas');
				//this.rainCanvas.width = this.canvas.width;
				//this.rainCanvas.height = this.canvas.height;
				//this.rainCtx = this.rainCanvas.getContext('2d');
				
				//var canvas = document.getElementById('canvas');
				//var before = document.getElementById('atmosphere2')
				//canvas.insertBefore(this.rainCanvas, before);
						
				this.contextDirtyRects = [];
				this.textcontextDirtyRects = [];
				
				this.setWinDimension();
                this.createCamera();
                this.scale = this.getScaleFactor();                
                this.initFont();
                
                this.loadItemImages();
            },
            
            loadItemImages: function()
            {
            	this.itemImages = {};
            	
            	for (var id in ItemTypes.KindData)
            	{
            		var itemData = ItemTypes.KindData[id];
            		if (itemData)
            		{
				if (!this.itemImages[itemData.sprite])
				{
				    this.itemImages[itemData.sprite] = new Image;
				    this.itemImages[itemData.sprite].src = "./img/"+this.scale+"/"+itemData.sprite;
				}
            		}
            	}
            },

	    setWinDimension: function () {
	    	    this.winHeight = window.innerHeight;
	    	    this.winWidth = window.innerWidth;
	    },
	    
            calcZoom: function () {
                
                var zoom;                
                if (this.winWidth > this.winHeight)
                {
                	zoom = this.winWidth / (this.camera.gridW * this.tilesize * this.scale);
                }
                else
                {
                	zoom = this.winHeight / (this.camera.gridW * this.tilesize * this.scale);
                }
                
                this.zoomExact = zoom;
                this.zoom = (Math.ceil( zoom * 1000 ) / 1000);
                

            	var zoomPercent = -(this.zoom-1) * 100;
                
				$('body').css('zoom', this.zoom);
				
				$('#backgroundunscaled').css('zoom', this.scale*this.zoom/this.zoom);
				$('#foregroundunscaled').css('zoom', this.scale*this.zoom/this.zoom);
				
				//$('#toptextcanvas').css('zoom', 1/this.zoom);
				//$('#entities').css('zoom', 1/this.zoom);

                $('#attackContainer').css('right',5 * this.scale);           
            },
            
            getWidth: function() {
                return this.canvas.width;
            },

            getHeight: function() {
                return this.canvas.height;
            },

            setTileset: function(tileset) {
                this.tileset = tileset;
            },

            getScaleFactor: function() {
                var w = window.innerWidth,
                    h = window.innerHeight,
                    scale;

                if(Detect.isMobile()) {
                	if (w < 1000)
                	{
				if (window.devicePixelRatio > 1)
					scale = Math.min(Math.floor(window.devicePixelRatio),2);
				else
					scale = 1;
                	}
                	else if (w <=1500 || h <= 870)
                		scale = 2;
                	else
                		scale = 2;
                } else if(w <= 1500 || h <= 870) {
                    scale = 2;
                } else {

                    scale = 2;
                }

                return scale;
            },
            
            getUiScaleFactor: function() {
                var w = window.innerWidth,
                    h = window.innerHeight,
                    scale;

                if(Detect.isMobile()) {
                	if (w < 1000)
                		scale = 1;
                	else if (w <=1500 || h <= 870)
                		scale = 2;
                	else
                		scale = 3;
                } else if(w <= 1500 || h <= 870) {
                    scale = 2;
                } else {
                    scale = 3;
                }

                return scale;
            },

            getUiXScaleFactor: function() {
                var w = window.innerWidth,
                    h = window.innerHeight,
                    scale;

                if(Detect.isMobile()) {
                	if (w < 1000)
                		scale = 1;
                	else if (w <=1500 || h <= 870)
                		scale = 3;
                	else
                		scale = 3;
                } else if(w <= 1500 || h <= 870) {
                    scale = 3;
                } else {
                    scale = 3;
                }

                return scale;
            },
            
            getProportionFactor: function () {
                var w = window.innerWidth,
                    h = window.innerHeight;
            	if (w > h)
                    return w/h;
            	else
            	    return h/w;
            },

	    disableSmoothing: function() {
                this.context.imageSmoothingEnabled = false;
                //this.background.imageSmoothingEnabled = false;
                //this.foreground.imageSmoothingEnabled = false;
                this.backgroundunscaled.imageSmoothingEnabled = false;
                this.foregroundunscaled.imageSmoothingEnabled = false;

                this.toptextcontext.imageSmoothingEnabled = false;
                //this.atmosphere.imageSmoothingEnabled = false;
                //this.atmosphere2.imageSmoothingEnabled = false;
                //this.atmospherebuffer.imageSmoothingEnabled = false;
                this.buffer.imageSmoothingEnabled = false;
                
                this.context.mozImageSmoothingEnabled = false;
                //this.background.mozImageSmoothingEnabled = false;
                //this.foreground.mozImageSmoothingEnabled = false;
                this.backgroundunscaled.mozImageSmoothingEnabled = false;
                this.foregroundunscaled.mozImageSmoothingEnabled = false;

                this.toptextcontext.mozImageSmoothingEnabled = false;
                //this.atmosphere.mozImageSmoothingEnabled = false;
                //this.atmosphere2.mozImageSmoothingEnabled = false;
                //this.atmospherebuffer.mozImageSmoothingEnabled = false;
                this.buffer.mozImageSmoothingEnabled = false;
	    	    
	    },
	    
            rescale: function() {
                this.scale = this.getScaleFactor();
                
                this.initFPS();
                //this.initFont();
                //this.disableSmoothing();
                
                if(this.game.map && this.game.map.tilesets) {
					if (!this.upscaledRendering)
						this.setTileset(this.game.map.tilesets[this.scale - 1]);
					else
						this.setTileset(this.game.map.tilesets[0]);
                }

                if(this.game.ready && this.game.renderer) {
                    this.game.setSpriteScale(this.scale);
                    this.game.inventoryHandler.scale = this.getUiScaleFactor();
                }
                
            },

            createCamera: function() {
                this.camera = new Camera(this.game, this);
            },
            
            resizeCanvases: function() {
            	//alert(this.zoom);
            	//this.disableSmoothing();
            	
            	var uw = this.camera.gridW * this.tilesize;
            	var uh = this.camera.gridH * this.tilesize;

                this.backbuffercanvas.width = uw;
                this.backbuffercanvas.height = uh;
                this.backbuffercanvas.style.width = uw;
                this.backbuffercanvas.style.height = uh;

                var width = uw * this.scale;
                var height = uh * this.scale;
                this.canvas.width = Math.round(width * this.zoom);
                this.canvas.height = Math.round(height * this.zoom);

            	this.canvas.style.width = this.canvas.width+"px";
                this.canvas.style.height = this.canvas.height+"px";
                
                log.debug("#entities set to "+this.canvas.width+" x "+this.canvas.height);

                //this.backbuffercanvas.width = this.canvas.width; // + 2 * this.tilesize;// * this.zoom;
                //this.backbuffercanvas.height = this.canvas.height; //+ 2 * this.tilesize;// * this.zoom;
                //this.backbuffercanvas.style.width = this.canvas.width; // + 2 * this.tilesize;// * this.zoom;
                //this.backbuffercanvas.style.height = this.canvas.height; // + 2 * this.tilesize;// * this.zoom;

                
                /*this.backbuffercanvas.width = uw;
                this.backbuffercanvas.height = uh;
                this.backbuffercanvas.style.width = uw+"px";
                this.backbuffercanvas.style.height = uh+"px";*/
                
                this.backunscaledcanvas.width = uw;
                this.backunscaledcanvas.height = uh;
                this.backunscaledcanvas.style.width = uw+"px";
                this.backunscaledcanvas.style.height = uh+"px";

                this.foreunscaledcanvas.width = uw;
                this.foreunscaledcanvas.height = uh;
                this.foreunscaledcanvas.style.width = uw+"px";
                this.foreunscaledcanvas.style.height = uh+"px";
				log.debug("unzoom #backunscaledcanvas set to "+uw+" x "+uh);
				log.debug("unzoom #foreunscaledcanvas set to "+uw+" x "+uh);

                log.debug("#backbuffercanvas set to "+this.backbuffercanvas.width+" x "+this.backbuffercanvas.height);

                this.backcanvas.width = this.canvas.width;
                this.backcanvas.height = this.canvas.height;
                this.backcanvas.style.width = this.canvas.width+"px";
                this.backcanvas.style.height = this.canvas.height+"px";

                log.debug("#background set to "+this.backcanvas.width+" x "+this.backcanvas.height);

                //this.animatedcanvas.width = this.canvas.width;
                //this.animatedcanvas.height = this.canvas.height;
                //this.animatedcanvas.style.width = this.canvas.width+"px";
                //this.animatedcanvas.style.height = this.canvas.height+"px";
                
                //log.debug("#animated set to "+this.animatedcanvas.width+" x "+this.animatedcanvas.height);
                
                this.forecanvas.width = this.canvas.width;
                this.forecanvas.height = this.canvas.height;
                this.forecanvas.style.width = this.canvas.width+"px";
                this.forecanvas.style.height = this.canvas.height+"px";
                
                log.debug("#foreground set to "+this.forecanvas.width+" x "+this.forecanvas.height);

                /*this.atmospherecanvas.width = this.canvas.width;
                this.atmospherecanvas.height = this.canvas.height;
                this.atmospherecanvas.style.width = this.canvas.width+"px";
                this.atmospherecanvas.style.height = this.canvas.height+"px";
                
                log.debug("#atmosphere set to "+this.atmospherecanvas.width+" x "+this.atmospherecanvas.height);

                this.atmospherecanvas2.width = this.canvas.width;
                this.atmospherecanvas2.height = this.canvas.height;
                this.atmospherecanvas2.style.width = this.canvas.width+"px";
                this.atmospherecanvas2.style.height = this.canvas.height+"px";
                
                log.debug("#atmosphere2 set to "+this.atmospherecanvas2.width+" x "+this.atmospherecanvas2.height);
                */
                
                this.toptextcanvas.width = this.canvas.width;
                this.toptextcanvas.height = this.canvas.height;
                this.toptextcanvas.style.width = this.canvas.width+"px";
                this.toptextcanvas.style.height = this.canvas.height+"px";
                
                log.debug("#toptextcontext set to " + this.canvas.width + " x " + this.canvas.height);

                
                /*this.atmospherebuffercanvas.width = this.canvas.width/this.scale;
                this.atmospherebuffercanvas.height = this.canvas.height/this.scale;
                this.atmospherebuffercanvas.style.width = this.canvas.width/this.scale+"px";
                this.atmospherebuffercanvas.style.height = this.canvas.height/this.scale+"px";
                
                log.debug("#atmospherebuffercanvas set to " + this.atmospherebuffercanvas.width + " x " + this.atmospherebuffercanvas.height);
                */
                
                
                if (this.scale <= 2)
                {                
					this.gui = document.getElementById('gui');
					var zoom = (1/this.zoom);
					
					var guizoom;
					if (this.scale==2)
						guizoom = 1.75;
						else if (this.scale==1)
							guizoom = 1.5;
					
					var w = $(window).width() / guizoom;
					var h = $(window).height() / guizoom;
						
					this.gui.width = w;
					this.gui.height = h;
					this.gui.style.width = w+"px";
					this.gui.style.height = h+"px";
					log.debug("#gui set to " + this.gui.width + " x " + this.gui.height);
                }                
                
					
				//this.context.scale(this.zoom, this.zoom);
				//this.toptextcontext.scale(this.zoom, this.zoom);

				if (this.scale <= 2)
					this.gui.style.transform = "scale("+zoom*guizoom+")";
				
				this.disableSmoothing();
            },

            initFPS: function() {
                this.FPS = 60;
            },

            initFont: function() {
                this.defaultFont = this.setFontSize(12);
                this.context.font = this.defaultFont;
                this.background.font = this.defaultFont;
                this.toptextcontext.font = this.defaultFont;                
            },

            setFontSize: function(size) {
                var fontsize;
                switch(this.scale)
                {
		    case 1:
			fontsize = 2 * ~~(size * 0.75 / 2); break;
		    case 2:
			fontsize = size; break;
		    case 3:
			fontsize = 2 * Math.ceil(size * 1.25 / 2); break;
		}
            	var font = fontsize+"px GraphicPixel";
                this.font = font;
                return font;
            },

            pushAnnouncement: function (text, duration) {
            	this.announcements.push({'text': text, 'date': Date.now(), 'duration': duration});
            },
            
            drawAnnouncements: function () {
            	var i = 0;

				var s = this.scale;
				this.toptextcontext.save();
				//this.toptextcontext.translate(this.camera.x * s, this.camera.y * s);
            	var i = 0;
				for (var id in this.announcements)
            	{
            		var announcement = this.announcements[id];
            		var now = Date.now();
            		if (announcement.date+announcement.duration < now)
            		{
            			this.announcements.splice(id,1);
            			continue;
            		}
					else
					{
						this.font = this.defaultFont;
						this.drawText(this.toptextcontext, announcement.text, this.camera.gridW2 * this.tilesize,
							this.camera.gridH2 * this.tilesize/2+(i++*10),true,"yellow","black", false);
            		}
            	}
            	this.toptextcontext.restore();
            },
            
            drawText: function(ctx, text, x, y, centered, color, strokeColor, camera) {
            	
            	this.strokeSize = 3;
                camera = camera || false;
                
                switch(this.scale) {
                    case 1:
                        this.strokeSize = 1; break;
                    case 2:
                        this.strokeSize = 2; break;
                }

                if(text && x && y) {
                    ctx.save();
                    if(centered) {
                        ctx.textAlign = "center";
                    }
                    ctx.font = this.font;
                    ctx.strokeStyle = strokeColor || "#373737";
                    ctx.lineWidth = this.strokeSize;
                    ctx.strokeText(text, x * this.scale, y * this.scale);
                    ctx.fillStyle = color || "white";
                    ctx.fillText(text, x * this.scale, y * this.scale);
                    this.drawTextDirtyRect(ctx,text,x,y,camera);
                    this.font = this.defaultFont;
                    ctx.restore();
                    
                }
            },

            drawTextDirtyRect: function(ctx, text, x, y, camera) {
                    var metrics = ctx.measureText(text);
                    var rect;
                    this.fontSize = parseInt(ctx.font.substr(0,ctx.font.indexOf('px')));
                    if (camera)
                    {
						rect = {
						x: 0,
						y: ((y-this.camera.y) * this.scale) - (this.fontSize)/2-this.strokeSize*3-this.scale*2,
						w: (metrics.width+this.strokeSize*4),
						h: (this.fontSize+this.strokeSize*4)+this.scale*2,
						};
						  switch(ctx.textAlign) {
							case 'center':
							  rect.x = ((x-this.camera.x) * this.scale) - (metrics.width+2*this.strokeSize) / 2;
							  break;
							case 'left':
							  rect.x = ((x-this.camera.x) * this.scale);
							  break; 
							case 'right':
							  rect.x = ((x-this.camera.x) * this.scale) - (metrics.width+2*this.strokeSize);
							  break;
						  }
					}
					else
					{
						rect = {
						x: 0,
						y: (y * this.scale) - (this.fontSize)/2-this.strokeSize*3-this.scale*2,
						w: (metrics.width+this.strokeSize*4),
						h: (this.fontSize+this.strokeSize*4)+this.scale*2,
						};
						  switch(ctx.textAlign) {
							case 'center':
							  rect.x = (x * this.scale) - (metrics.width+2*this.strokeSize) / 2;
							  break;
							case 'left':
							  rect.x = (x * this.scale);
							  break; 
							case 'right':
							  rect.x = (x * this.scale) - (metrics.width+2*this.strokeSize);
							  break;
						  }
					}
					this.textcontextDirtyRects.push(rect);
            },
            
            drawCellRect: function(ctx, x, y, color) {
                ctx.save();
                ctx.lineWidth = 2*this.scale;

                ctx.translate(x+2, y+2);
                //if (this.mobile)
                //ctx.clearRect(-8, -8, (this.tilesize * this.scale) + 16, (this.tilesize * this.scale) + 16);
                ctx.strokeStyle = color;
                ctx.strokeRect(0, 0, (this.tilesize * this.scale) - 4, (this.tilesize * this.scale) - 4);
                ctx.restore();
            },
            drawRectStroke: function(ctx, x, y, width, height, color) {
                ctx.fillStyle = color;
                ctx.fillRect(x * this.scale, y * this.scale, (this.tilesize * this.scale)*width, (this.tilesize * this.scale)*height);
                ctx.fill();
                ctx.lineWidth = 5;
                ctx.strokeStyle = 'black';
                ctx.strokeRect(x * this.scale, y * this.scale, (this.tilesize * this.scale)*width, (this.tilesize * this.scale)*height);
            },
            drawRect: function(ctx, x, y, width, height, color) {
                ctx.fillStyle = color;
                ctx.fillRect(x * this.scale, y * this.scale, (this.tilesize * this.scale)*width, (this.tilesize * this.scale)*height);
                ctx.fill();
            },

            drawCellHighlight: function(ctx, x, y, color) {
                var s = this.scale,
                    ts = this.tilesize,
                    tx = x * ts * s,
                    ty = y * ts * s;

                this.drawCellRect(ctx, tx, ty, color);
                this.contextDirtyRects.push(this.getTargetBoundingRect(tx,ty));
            },

            drawTargetCell: function(ctx) {
                var mouse = this.game.getMouseGridPosition();
                var x = mouse.x, y = mouse.y;
                if(this.game.targetCellVisible && !(mouse.x === this.game.selectedX && mouse.y === this.game.selectedY)) {
                    this.drawCellHighlight(ctx, mouse.x, mouse.y, this.game.targetColor);
                    this.contextDirtyRects.push(this.getTargetBoundingRect(x,y));
                }
                
            },

            drawAttackTargetCell: function(ctx) {
                var mouse = this.game.getMouseGridPosition(),
                    //entity = this.game.getEntityAt(mouse.x, mouse.y);
                    entity = this.game.player.target;

                if(entity instanceof Mob && entity.kind != 70 || entity instanceof Player) // Obscure Mimics.
                {
                    this.drawCellRect(ctx, entity.x * this.scale, entity.y * this.scale, "rgba(255, 0, 0, 0.5)");
                    this.contextDirtyRects.push(this.getTargetBoundingRect(entity.x * this.scale, entity.y * this.scale));
                }
                
            },

            drawOccupiedCells: function() {
                var positions = this.game.entityGrid;

                if(positions) {
                    for(var i=0; i < positions.length; i += 1) {
                        for(var j=0; j < positions[i].length; j += 1) {
                            if(!_.isNull(positions[i][j])) {
                                this.drawCellHighlight(i, j, "rgba(50, 50, 255, 0.5)");
                            }
                        }
                    }
                }
            },

            drawPathingCells: function(ctx) {
                var grid = this.game.pathingGrid;

                if(grid && this.game.debugPathing) {
                    for(var y=0; y < grid.length; y += 1) {
                        for(var x=0; x < grid[y].length; x += 1) {
                            if(grid[y][x] === 1 && this.game.camera.isVisiblePosition(x, y)) {
                                this.drawCellHighlight(ctx, x, y, "rgba(50, 50, 255, 0.5)");
                            }
                        }
                    }
                }
            },

            drawSelectedCell: function(ctx) {
                var sprite = this.game.cursors["target"],
                    anim = this.game.targetAnimation,
                    os = this.upscaledRendering ? 1 : this.scale,
                    ds = this.upscaledRendering ? this.scale : 1;

                if(!this.game.selectedCellVisible)
                    return;

                if(this.mobile) {
                    if(this.game.drawTarget) {
                        var x = this.game.selectedX,
                            y = this.game.selectedY;

                        //this.context.clearRect(x-this.tilesize, y-this.tilesize, this.tilesize*2, this.tilesize*2);
                        this.drawCellHighlight(ctx, x, y, "rgb(51, 255, 0)");
                        this.lastTargetPos = { x: x,
                            y: y };
                        this.contextDirtyRects.push(this.getTargetBoundingRect());
                        this.game.drawTarget = false;
                    }
                } else {
                    /*if(this.game.player.hasTarget()) {
                     var x = this.game.selectedX,
                     y = this.game.selectedY;

                     this.drawCellHighlight(x, y, "rgb(255, 51, 0)");
                     } */

                    if(sprite && anim) {
                        var    frame = anim.currentFrame,
                            s = this.scale,
                            x = frame.x * os,
                            y = frame.y * os,
                            w = sprite.width * os,
                            h = sprite.height * os,
                            ts = 16,
                            dx = this.game.selectedX * ts * s,
                            dy = this.game.selectedY * ts * s,
                            dw = w * ds,
                            dh = h * ds;

                        if (!sprite.isLoaded) sprite.load();
                        ctx.save();
                        ctx.translate(dx, dy);
                        ctx.drawImage(sprite.image, x, y, w, h, 0, 0, dw, dh);
                        this.contextDirtyRects.push(this.getTargetBoundingRect());
                        ctx.restore();
                    }
                }
                
            },

            clearScaledRect: function(ctx, x, y, w, h) {
                var s = this.scale;

                ctx.clearRect(x * s, y * s, w * s, h * s);
            },

            drawCursor: function() {
                mx = this.game.mouse.x,
                    my = this.game.mouse.y,
                    s = this.scale,
                    os = this.upscaledRendering ? 1 : this.scale;

                this.toptextcontext.save();
                if (!this.game.currentCursor.isLoaded) this.game.currentCursor.load();
                if(this.game.currentCursor && this.game.currentCursor.isLoaded) {
                    this.toptextcontext.drawImage(this.game.currentCursor.image, 0, 0, 14 * os, 14 * os, mx, my, 14*s, 14*s);
                }
                this.toptextcontext.restore();
                this.textcontextDirtyRects.push({x:mx,y:my,w:14*s,h:14*s});
            },

            drawScaledImage: function(ctx, image, x, y, w, h, dx, dy) {
                var ss = this.upscaledRendering ? 1 : this.scale;

                /*_.each(arguments, function(arg) {
                 if(_.isUndefined(arg) || _.isNaN(arg) || _.isNull(arg) || arg < 0) {
                 log.error("x:"+x+" y:"+y+" w:"+w+" h:"+h+" dx:"+dx+" dy:"+dy, true);
                 throw Error("A problem occured when trying to draw on the canvas");
                 }
                 });*/

                ctx.drawImage(image,
                    x,
                    y,
                    w,
                    h,
                    dx * ss,
                    dy * ss,
                    w * ss,
                    h * ss);
                
                /*log.info(x * s + "," +
                    y * s + "," +
                    w * s + "," +
                    h * s + "," +
                    dx * this.scale + "," +
                    dy * this.scale + "," +
                    w * this.scale + "," +
                    h * this.scale);*/
		/*var data = [
                    "drawImage",
                    image.src,
	            x * s,
                    y * s,
                    w * s,
                    h * s,
                    dx * this.scale,
                    dy * this.scale,
                    w * this.scale,
                    h * this.scale];

                log.info(JSON.stringify(data));
		SendNative(data);*/                
            },

            drawTile: function(ctx, tileid, tileset, setW, gridW, cellid) {
                var s = this.upscaledRendering ? 1 : this.scale;
                if(tileid !== -1) { // -1 when tile is empty in Tiled. Don't attempt to draw it.
                    /*this.drawScaledImage(ctx,
                    	tileset,
                        getX(tileid + 1, (setW / s)) * this.tilesize,
                        ~~(tileid / (setW / s)) * this.tilesize,
                        this.tilesize,
                        this.tilesize,
                        getX(cellid + 1, gridW) * this.tilesize,
                        ~~(cellid / gridW) * this.tilesize,
                    	this.tilesize,
                    	this.tilesize);*/
                    ctx.drawImage(tileset,
                        getX(tileid + 1, (setW / s)) * this.tilesize,
                        ~~(tileid / (setW / s)) * this.tilesize,
                        this.tilesize,
                        this.tilesize,
                        getX(cellid + 1, gridW) * this.tilesize,
                        ~~(cellid / gridW) * this.tilesize,
                    	this.tilesize,
                    	this.tilesize);
                }
                //if (getX(tileid + 1, (setW / s)) * this.tilesize % 16 != 0)
                //	alert(getX(tileid + 1, (setW / s)) * this.tilesize);
                //if (getX(cellid + 1, gridW) * this.tilesize % 16 != 0)
                	//alert(getX(cellid + 1, gridW) * this.tilesize);
            },

			clearTile: function(ctx, gridW, cellid) {
				var s = this.upscaledRendering ? 1 : this.scale,
					ts = this.tilesize,
					x = getX(cellid + 1, gridW) * ts * s,
					y = Math.floor(cellid / gridW) * ts * s,
					w = ts * s,
					h = w;
			
				ctx.clearRect(x, y, h, w);
			},
				
            /*
            drawItemInfo: function(ctx){
                var self = this;
                var s = this.scale;
                var ds = this.upscaledRendering ? this.scale : 1;
                var os = this.upscaledRendering ? 1 : this.scale;

                ctx.save();
                ctx.translate(this.camera.x*s, this.camera.y*s);
                this.drawRectStroke(ctx, 4, 4, 29, 4, "rgba(142, 214, 255, 0.8)");

                ItemTypes.forEachArmorKind(function(kind, kindName){
                    var item = self.game.sprites[kindName];
                    if(item){
                        var itemAnimData = item.animationData["idle_down"];
                        if(itemAnimData){
                            var ix = item.width * os,
                                iy = item.height * itemAnimData.row * os,
                                iw = item.width * os,
                                ih = item.height * os,
                                rank = Types.getArmorRank(kind);

                            if(rank > Types.getArmorRank(190)){
                                return;
                            }

                            if(kind !== 175){
                                ctx.drawImage(item.image, ix, iy, iw, ih,
                                    item.offsetX * s + ((rank%19)*3+2)*self.tilesize,
                                    item.offsetY * s + (Math.floor(rank/19)*3+2)*self.tilesize,
                                    iw * ds, ih * ds);
                            }
                        }
                    }
                });

                ItemTypes.forEachWeaponKind(function(kind, kindName){
                    var item = self.game.sprites[kindName];
                    if (!item.isLoaded) item.load();
                    if(item){
                        var itemAnimData = item.animationData["idle_down"];
                        if(itemAnimData){
                            var ix = item.width * os,
                                iy = item.height * itemAnimData.row * os,
                                iw = item.width * os,
                                ih = item.height * os,
                                rank = Types.getWeaponRank(kind);

                            if(rank > Types.getWeaponRank(191)){
                                return;
                            }

                            ctx.drawImage(item.image, ix, iy, iw, ih,
                                item.offsetX * s + ((rank%19)*3+2)*self.tilesize,
                                item.offsetY * s + (Math.floor(rank/19)*3+2)*self.tilesize,
                                iw * ds, ih * ds);

                        }
                    }
                });
                ctx.restore();
            },
            */

            drawEntitiesCircle: function() {
                var ac = this.game.activeCircle;

                if (!ac) return;

                var os = this.upscaledRendering ? 1 : this.scale,
                    ds = this.upscaledRendering ? this.scale : 1;

                this.context.save();
                for (var i = 0; i < ac.length; ++i)
                {
                    var filename = "item-"+ItemTypes.KindData[ac[i].inv.item].key;
                    var item = this.game.sprites[filename];
                    if (!item.isLoaded) item.load();
                    var s = this.scale,
                        dw = ac[i].w * ds / .9,
                        dh = ac[i].h * ds / .9;

                    this.context.drawImage(item.image, 0, 0, ac[i].w * 0.9, ac[i].h * 0.9, ac[i].x, ac[i].y, dw, dh);
                }
                this.context.restore();
            },

            createBodyColorCanvas: function (entity)
            {	
            	var bodyTintCanvas = document.createElement('canvas');		
		var armorLoaded = function () {
			bodyTintCanvas.id = "armorcolorcanvas";
			bodyTintCanvas.width = entity.sprite.image.width;
			bodyTintCanvas.height = entity.sprite.image.height;
			var bodyTintCtx = bodyTintCanvas.getContext('2d');
			bodyTintCtx.globalAlpha = 0.5;
			
			bodyTintCtx.fillStyle = "#"+entity.armorColor;
			bodyTintCtx.fillRect(0,0,entity.sprite.image.width,entity.sprite.image.height);
			bodyTintCtx.globalCompositeOperation = "destination-atop";
								
			bodyTintCtx.drawImage(entity.sprite.image,0,0);
			entity.spriteBodyColor = bodyTintCanvas;
			
		}
		if (!entity.sprite.isLoaded) entity.sprite.load(armorLoaded);
		else armorLoaded();
            },

            removeBodyColorCanvas: function ()
            {
		var elem = document.getElementById("armorcolorcanvas");
		if (elem)
			elem.parentNode.removeChild(elem);            	
            },

            createWeaponColorCanvas: function (entity)
            {
            	var weapon = this.game.sprites[entity.getWeaponSprite()];
            	if (!weapon) return;
            	var weaponLoaded = function () {
			var weaponTintCanvas = document.createElement('canvas');
			weaponTintCanvas.id = "weaponcolorcanvas";
			weaponTintCanvas.width = weapon.image.width;
			weaponTintCanvas.height = weapon.image.height;
			var weaponTintCtx = weaponTintCanvas.getContext('2d');
			weaponTintCtx.globalAlpha = 0.5;
			
			weaponTintCtx.fillStyle = "#"+entity.weaponColor;
			weaponTintCtx.fillRect(0,0,weapon.image.width,weapon.image.height);
			weaponTintCtx.globalCompositeOperation = "destination-atop";
			
			
			weaponTintCtx.drawImage(weapon.image,0,0);
			entity.spriteWeaponColor = weaponTintCanvas;	            	 	 
            	};
            	if (!weapon.isLoaded) weapon.load(weaponLoaded);
            	else weaponLoaded();
            },

            removeWeaponColorCanvas: function ()
            {
		var elem = document.getElementById("weaponcolorcanvas");
		if (elem)
			elem.parentNode.removeChild(elem);            	
            },
           
	    drawItem: function(entity) {
			var itemData = ItemTypes.KindData[entity.kind],
			os = this.upscaledRendering ? 1 : this.scale,
			ds = this.upscaledRendering ? this.scale : 1;
          
		    var s = this.scale,
			x = itemData.offset[0]*this.scale*this.tilesize,
			y = itemData.offset[1]*this.scale*this.tilesize,
			w = this.scale*this.tilesize,
			h = this.scale*this.tilesize,
			dx = entity.x * s,
			dy = entity.y * s,
			dw = w,
			dh = h;
	
		    this.context.save();
		    if(entity.isVisible()) {                        
			try {
				if (entity instanceof Item)
				{                            		
					this.context.drawImage(this.itemImages[itemData.sprite], x, y, w, h, dx, dy, dw, dh);
				}
			}
			catch (err) { log.info(err.message); log.info(err.stack); }
	            }
				
		    this.context.restore();
	
		    entity.dirtyRect = this.getEntityBoundingRect(entity);

	    },
	    
            drawEntity: function(entity) {
                var sprite = entity.sprite,
                    shadow = this.game.shadows["small"],
                    anim = entity.currentAnimation,
                    os = this.upscaledRendering ? 1 : this.scale,
                    ds = this.upscaledRendering ? this.scale : 1;
                    
                if(anim && sprite) {
                    var frame = anim.currentFrame,
                        s = this.scale,
                        x = frame.x * os,
                        y = frame.y * os,
                        w = sprite.width * os,
                        h = sprite.height * os,
                        ox = sprite.offsetX * s,
                        oy = sprite.offsetY * s,
                        dx = entity.x * s,
                        dy = entity.y * s,
                        dw = w * ds,
                        dh = h * ds;


                    this.context.save();
                    				
                    if(entity.isFading) {    
                        this.context.globalAlpha = entity.fadingAlpha;
                    }
                    
                    var tx,ty;
                    if(entity.flipSpriteX) {
                        tx = dx + s * this.tilesize;
                        ty = dy;
                        this.context.translate(tx, ty);
                        this.context.scale(-1, 1);
                    }
                    else if(entity.flipSpriteY) {
                        tx = dx;
                        ty = dy + dh;
                        this.context.translate(tx, ty);
                        this.context.scale(1, -1);
                    }
                    else {
                    	tx = dx;
                    	ty = dy;
                    	this.context.translate(tx, ty);
                    }

                    if(entity.isVisible()) {
                        if(!(entity instanceof Pet) && entity.hasShadow()) {
                            if (!shadow.isLoaded) shadow.load();
                            this.context.drawImage(shadow.image, 0, 0, shadow.width * os, shadow.height * os,
                                0,
                                entity.shadowOffsetY * ds,
                                shadow.width * os * ds, shadow.height * os * ds);
                        }
                        
                        try {
                            if (!sprite.isLoaded) sprite.load();
                            if (!entity.mount) {                            	    
				// Colorize Player Entities.
				if (entity instanceof Player && entity.armorColor != "ffffff")
				{
					this.context.drawImage(sprite.image, x, y, w, h, ox, oy, dw, dh);									
					this.context.drawImage(entity.spriteBodyColor, x, y, w, h, ox, oy, dw, dh);
				}                     
                            	else {
                            	    this.context.drawImage(sprite.image, x, y, w, h, ox, oy, dw, dh);
                            	}
                            	
                            }
                        }
                        catch (err) { log.info(err.message); log.info(err.stack); }
                                

                        if((entity instanceof Item && entity.kind !== 39) || (entity instanceof Mob && entity.flags.isCashedUp && entity.kind != 70)) { // Exclude Mimics.
                            var sparks = this.game.sprites["sparks"],
                                anim = this.game.sparksAnimation,
                                frame = anim.currentFrame,
                                sx = sparks.width * frame.index * os,
                                sy = sparks.height * anim.row * os,
                                sw = sparks.width * os,
                                sh = sparks.width * os;

                            if (!sparks.isLoaded) sparks.load();
                            this.context.drawImage(sparks.image, sx, sy, sw, sh,
                                sparks.offsetX * s,
                                sparks.offsetY * s,
                                sw * ds, sh * ds);
                        }
                    }

                    if(entity instanceof Character && !entity.isDead && entity.hasWeapon()) {
                        var weapon = this.game.sprites[entity.getWeaponName()];
                        if(weapon) {
                            if (!weapon.isLoaded) weapon.load();
                            var weaponAnimData = weapon.animationData[anim.name],
                                index = frame.index < weaponAnimData.length ? frame.index : frame.index % weaponAnimData.length,
                                wx = weapon.width * index * os,
                                wy = weapon.height * anim.row * os,
                                ww = weapon.width * os,
                                wh = weapon.height * os;
								
                            	// Colorize Weapon.
				this.context.drawImage(weapon.image, wx, wy, ww, wh,
					weapon.offsetX * s,
					weapon.offsetY * s,
					ww * ds, wh * ds);
				if (entity.spriteWeaponColor && entity.weaponColor != "ffffff") {
					this.context.drawImage(entity.spriteWeaponColor, wx, wy, ww, wh,
						weapon.offsetX * s,
						weapon.offsetY * s,
						ww * ds, wh * ds);
				}
                        }
                    }
                    if(entity instanceof Player){
                        var medal = null;
                        if(entity.admin){
                            medal = this.game.sprites["goldmedal"];
                            if (!medal.isLoaded) medal.load();
                        }

                        if(medal){
                            this.context.drawImage(medal.image, 0, 0, medal.width * os, medal.height * os,
                                4 * ds,
                                -56 * ds,
                                medal.width * os * ds, medal.height * os * ds);
                        }
                    }
                    if(entity.invincible){
                        var benef = this.game.sprites["shieldbenef"];
                        if (!benef.isLoaded) benef.load();
                        if(benef){
                            var benefAnimData5 = benef.animationData[anim.name];
                            if(benefAnimData5){
                                var index = this.game.benefAnimation.currentFrame.index < benefAnimData5.length ? this.game.benefAnimation.currentFrame.index : this.game.benefAnimation.currentFrame.index % benefAnimData5.length,
                                    bx = benef.width * index * os,
                                    by = benef.height * benefAnimData5.row * os,
                                    bw = benef.width * os,
                                    bh = benef.height * os;

                                this.context.drawImage(benef.image, bx, by, bw, bh,
                                    benef.offsetX * s,
                                    benef.offsetY * s,
                                    bw * ds, bh * ds);
                            }
                        }
                    }
                    if(entity.isStun){
                        var benef = this.game.sprites["stuneffect"];
                        if (!benef.isLoaded) benef.load();
                        if(benef){
                            var index = entity.stunAnimation.currentFrame.index,
                                bx = benef.width * index * os,
                                by = benef.height * entity.stunAnimation.row,
                                bw = benef.width * os,
                                bh = benef.height * os;

                            this.context.drawImage(benef.image, bx, by, bw, bh,
                                benef.offsetX * s,
                                (benef.offsetY - entity.sprite.height)*s,
                                bw * ds, bh * ds);
                        }
                    }
                    if(entity.isCritical){
                        var benef = this.game.sprites["criticaleffect"];
                        if (!benef.isLoaded) benef.load();
                        if(benef){
                            var index = entity.criticalAnimation.currentFrame.index,
                                bx = benef.width * index * os,
                                by = benef.height * entity.criticalAnimation.row * os,
                                bw = benef.width * os,
                                bh = benef.height * os;

                            this.context.drawImage(benef.image, bx, by, bw, bh,
                                benef.offsetX * s,
                                benef.offsetY * s,
                                bw * ds, bh * ds);
                        }
                    }
                    if(entity.isHeal){
                        var benef = this.game.sprites["healeffect"];
                        if (!benef.isLoaded) benef.load();
                        if(benef){
                            var index = entity.healAnimation.currentFrame.index,
                                bx = benef.width * index * os,
                                by = benef.height * entity.healAnimation.row * os,
                                bw = benef.width * os,
                                bh = benef.height * os;

                            this.context.drawImage(benef.image, bx, by, bw, bh,
                                benef.offsetX * s,
                                benef.offsetY * s,
                                bw * ds, bh * ds);
                        }
                    }

                    if(entity.mount){
                        var mountSprite = this.game.sprites[entity.mountName];
                        entity.mount.setSprite(mountSprite);
                        if (!mountSprite.isLoaded) mountSprite.load();

                        var spriteMount = entity.mount.sprite;

                        // dirty hack to show before moving.
                        if (!entity.mount.currentAnimation)
                        {
                            entity.mount.animate("idle", entity.mount.idleSpeed);
                        }

                        if (entity.orientation != Types.Orientations.UP)
                        {
                            this.context.drawImage(sprite.image, x, y, w, h, ox + entity.mountOffsetX, oy + entity.mountOffsetY, dw, dh);
                        }

                        if(spriteMount && entity.mount.currentAnimation) {
                            var frame = entity.mount.currentAnimation.currentFrame,
                                mx = frame.x * os,
                                my = frame.y * os,
                                mw = spriteMount.width * os,
                                mh = spriteMount.height * os,
                                mox = spriteMount.offsetX * s,
                                moy = spriteMount.offsetY * s,
                                mdw = mw * ds,
                                mdh = mh * ds;
                            this.context.drawImage(spriteMount.image, mx, my, mw, mh, mox, moy, mdw, mdh);
                            
                        }
                        if (entity.orientation == Types.Orientations.UP)
                        {
                            this.context.drawImage(sprite.image, x, y, w, h, ox + entity.mountOffsetX, oy + entity.mountOffsetY, dw, dh);
                        }
                    }

                    this.context.restore();

                    /*if(entity.isFading) {
                        this.context.restore();
                    }*/

                    entity.dirtyRect = this.getEntityBoundingRect(entity);
                    //this.drawEntityName(entity);
                }
            },

            drawEntities: function(dirtyOnly) {
                var self = this;

                /*if (!(this.mobile))
                {
                	this.game.forEachVisibleEntityByDepth(function(entity) {
                		self.drawEntityGlow(self.context, entity);
                	});
                }*/
                
                
                this.game.forEachVisibleEntityByDepth(function(entity) {
                    
                    if(entity) {
                    	if (entity instanceof Item)    
                    		self.drawItem(entity);
                    	else
                    		self.drawEntity(entity);
                    }
                });
            },
            
            drawDirtyEntities: function() {
                this.drawEntities(true);
            },
           
		getEntityBoundingRect: function(entity) {
		    var rect = {},
			s = this.scale,
			spr;

                    if(entity instanceof Player && entity.mount) 
                    {
			var weapon = this.game.sprites[entity.getWeaponName()];
			spr = weapon;
		    }
		    else if (entity instanceof Player && entity.hasWeapon())
		    {
			var weapon = this.game.sprites[entity.getWeaponName()];
			spr = weapon;
		    } 
		    else
		    {
			spr = entity.sprite;
		    }
		    if (!spr) spr = this.game.sprites["clotharmor"];
 		    
		    if (spr && !spr.isLoaded) spr.load();
		    
		    if(entity instanceof Player && entity.mount && spr)
		    {
			rect.x = (entity.x+spr.offsetX-this.camera.x-10)*s;
			rect.y = (entity.y+spr.offsetY-this.camera.y-35)*s;
			rect.w = (spr.width+20)*s;
			rect.h = (spr.height+40)*s;
			return rect;
		    }
		    else if (entity instanceof Item)
		    {
			rect.x = (entity.x-this.camera.x)*s;
			rect.y = (entity.y-this.camera.y)*s;
			rect.w = (this.tilesize) * s;
			rect.h = (this.tilesize) * s;
			return rect;
		    }
		    else if(spr) {
			rect.x = (entity.x+spr.offsetX-this.camera.x-2)*s;
			rect.y = (entity.y+spr.offsetY-this.camera.y-1)*s;
			rect.w = (spr.width+4) * s;
			rect.h = (spr.height+4) * s;
			return rect;
		    }		    	    
		},
	
            getTileBoundingRect: function(tile) {
                var rect = {},
                    gridW = this.game.map.width,
                    s = this.scale,
                    ts = this.tilesize,
                    cellid = tile.index;

                rect.x = ((getX(cellid + 1, gridW) * ts) - this.camera.x) * s;
                rect.y = ((Math.floor(cellid / gridW) * ts) - this.camera.y) * s;
                rect.w = ts * s;
                rect.h = ts * s;
                rect.left = rect.x;
                rect.right = rect.x + rect.w;
                rect.top = rect.y;
                rect.bottom = rect.y + rect.h;

                return rect;
            },

            getTargetBoundingRect: function(x, y) {
                var rect = {},
                    s = this.scale,
                    ts = this.tilesize,
                    tx = typeof(x) === 'undefined' ? this.game.selectedX : x,
                    ty = typeof(y) === 'undefined' ? this.game.selectedY : y;

                rect.x = ((tx * ts) - this.camera.x-2) * s;
                rect.y = ((ty * ts) - this.camera.y-2) * s;
                rect.w = (ts+4) * s;
                rect.h = (ts+4) * s;
                //log.info(JSON.stringify(rect));
                //rect.left = rect.x;
                //rect.right = rect.x + rect.w;
                //rect.top = rect.y;
                //rect.bottom = rect.y + rect.h;

                return rect;
            },

            isIntersecting: function(rect1, rect2) {
                return !((rect2.left > rect1.right) ||
                (rect2.right < rect1.left) ||
                (rect2.top > rect1.bottom) ||
                (rect2.bottom < rect1.top));
            },

            drawEntityNames: function() {
                var self = this;
                this.game.forEachVisibleEntityByDepth(function(entity) {
                    if(entity) {
                        self.drawEntityName(entity);
                    }
                });
            },

            drawEntityName: function(entity) {
                var ctx = this.toptextcontext;
                ctx.save();
                ctx.globalAlpha = 0.7;
                //"#00CCFF" : "#78AB46
                this.setFontSize(12);
                if(entity.name && entity instanceof Player && entity.isMoving && !entity.isDead) {
                    var color =  (entity.isWanted || this.game.player.pvpSide > -1 && this.game.player.pvpSide != entity.pvpSide && this.game.map.index == 1) ? "red" : (entity.id === this.game.playerId) ? "#ffff00" : entity.admin ? "#ff0000" : "#fcda5c";
                    color = (entity.influence > 0) ? '#00ff00' : color;
                    color = (entity.influence < 0) ? '#ff0000' : color;
                    
                    var name = entity.name;

                    this.drawText(this.toptextcontext, name,
                        (entity.x + 8),
                        (entity.y + entity.nameOffsetY),
                        true,
                        color, "#373737",true);
                    if (entity.guild && entity.guild.name)
                    {
						this.drawText(this.toptextcontext, "["+entity.guild.name+"]",
							(entity.x + 8),
							(entity.y + entity.nameOffsetY-3*scale),
							true,
							"cyan", "#373737",true);                    		    
					}
                }
                if(entity instanceof Mob && entity.kind != 70) { // Mimic
                    var color;
                    var mobLvl = entity.level;
                    var playerLvl;

                    /*if (this.game.player)
                    {
                        playerLvl = this.game.player.level;
                        if ( mobLvl < playerLvl-6)
                            color = "white";
                        else if (playerLvl-mobLvl >= -5 || mobLvl-playerLvl <= 9)
                        {
                            switch (mobLvl)
                            {
                                case (playerLvl-5):
                                case (playerLvl-4):
                                    color = "cyan";
                                    break;
                                case (playerLvl-3):
                                case (playerLvl-2):
                                    color = "blue";
                                    break;
                                case (playerLvl-1):
                                case (playerLvl):
                                case (playerLvl+1):
                                    color = "green";
                                    break;
                                case (playerLvl+2):
                                case (playerLvl+3):
                                    color = "yellow";
                                    break;
                                case (playerLvl+4):
                                case (playerLvl+5):
                                    color = "orange";
                                    break;
                                case (playerLvl+6):
                                case (playerLvl+7):
                                    color = "red";
                                    break;
                                case (playerLvl+8):
                                case (playerLvl+9):
                                    color = "purple";
                                    break;
                                default:
                                    color = "white";
                            }
                        }
                        else
                            color = "grey";
                    }
                    else
                    {
                        color = "white";
                    }*/
                    color = "white";
                    //var name = entity.title + " " + entity.kind;
                   
                    var name;
                    if (!(entity instanceof Pet))
                    	name = "Lv"+entity.level;
                    else
                    	name = entity.title;

                    this.drawText(ctx, name,
                        (entity.x + 8),
                        (entity.y - 10),
                        true,
                        color, "#373737",true);
                }
                if(entity instanceof Npc) {
                    var color;
                    var name;
                    if (this.game.questhandler.npcHasQuest(entity.kind))
                    {
                        color = "cyan";
                        name = entity.title + " ?";
                    }
                    else
                    {
                        color = "white";
                        name = entity.title;
                    }

                    this.drawText(ctx, name,
                        (entity.x + 8),
                        (entity.y - 10),
                        true,
                        color,
                         "#373737",true);
                }
		if(entity instanceof Item) {
			var item = entity;
			var tag;
			if(ItemTypes.isConsumableItem(item.kind) || ItemTypes.isCraft(item.kind)) {
			    if (item.count > 1)
				tag = item.count;
			}
			else {
			    tag = ItemTypes.KindData[item.kind].modifier + '+' + item.count;
			}			    
			if (tag)
			{
			    this.drawText(ctx, tag,
				entity.x + 8,
				entity.y - this.scale,
				true,
				"white",
				"#373737",
				true);
			}
			
		}                
                ctx.restore();
            },

            drawCoordinates: function () {
				var realX = this.game.player.gridX;
				var realY = this.game.player.gridY;

				if (this.game.player && (realX != this.prevPlayerGridX || realY != this.prevPlayerGridY))
				{
					this.prevPlayerGridX = realX;
					this.prevPlayerGridY = realY;
				}
				$('#playerCoords').html("x:"+realX+",y:"+realY);
            },

            drawOldTerrain: function () {
                var self = this,
                    m = this.game.map;
                var p = this.game.player;
                var c = this.camera;

                if (!this.forceRedraw && this.backgroundOffsetX == 0 && this.backgroundOffsetY == 0)
               		return;

				var vw = Math.round(this.canvas.width / this.zoom);
				var vh = Math.round(this.canvas.height / this.zoom);
                
				// Draw Old Background.
                this.buffer.save();
                this.backgroundunscaled.save();
				this.drawBackground(this.buffer, "#12100D");
                this.buffer.drawImage(this.backgroundunscaled.canvas, this.backgroundOffsetX, this.backgroundOffsetY);
                this.setCameraView(this.buffer, 1);
                this.drawTerrain(this.buffer);
                this.drawAnimatedTiles(false, this.buffer);
                this.backgroundunscaled.drawImage(this.buffer.canvas, 0, 0);	
                this.buffer.restore();
                this.backgroundunscaled.restore();
                
                
				// Draw Old Foreground.
                this.foregroundunscaled.save();
				this.buffer.save();
                this.clearScreen(this.buffer);
				this.buffer.drawImage(this.foregroundunscaled.canvas, this.backgroundOffsetX, this.backgroundOffsetY);
                this.setCameraView(this.buffer, 1);
                this.drawHighTiles(this.buffer);
                
				this.clearScreen(this.foregroundunscaled);
                this.foregroundunscaled.drawImage(this.buffer.canvas, 0, 0);
				//this.clearScreen(this.foreground);
                this.foregroundunscaled.restore();
				this.buffer.restore();

            },

            drawTerrain: function(ctx) {
                var self = this,
                    m = this.game.map,
                    p = this.game.player,
                    tilesetwidth = this.tileset.width / m.tilesize;
                    
                //alert(tilesetwidth);

                   
                var optimized = !this.forceRedraw;

                ctx.save();

                var g = this.game,
                    m = this.game.map;
                //var startTime = new Date();
                if(g.started && m.isLoaded) {
					if (optimized)
					{
						g.camera.forEachNewTile(function(x, y) {
					        tileIndex = m.GridPositionToTileIndex(x, y);
					        //if (tileIndex)
					        //{
							if(_.isArray(m.data[tileIndex])) {
								_.each(m.data[tileIndex], function(id) {
									if(!m.isHighTile(id-1) && !m.isAnimatedTile(id-1)) { // Don't draw unnecessary tiles
										//self.clearTile(ctx, m.width, tileIndex);
										self.drawTile(ctx, id-1, self.tileset, tilesetwidth, m.width, tileIndex);
									}
								});
							}
							else {
								var id = m.data[tileIndex]-1;
								if(_.isNaN(id)) {
									//throw Error("Tile number for index:"+tileIndex+" is NaN");
								} else {
									if(!m.isHighTile(id) && !m.isAnimatedTile(id)) { // Don't draw unnecessary tiles
										//self.clearTile(ctx, m.width, tileIndex);
										self.drawTile(ctx, id, self.tileset, tilesetwidth, m.width, tileIndex);
									}
								}
							}
							//}
						}, 0, m);
					}
					else
					{
						g.camera.forEachVisibleValidPosition(function(x, y) {
					        tileIndex = m.GridPositionToTileIndex(x, y);
					        //if (tileIndex)
					        //{
							if(_.isArray(m.data[tileIndex])) {
								_.each(m.data[tileIndex], function(id) {
									if(!m.isHighTile(id-1) && !m.isAnimatedTile(id-1)) { // Don't draw unnecessary tiles
										self.drawTile(ctx, id-1, self.tileset, tilesetwidth, m.width, tileIndex);
									}
								});
							}
							else {
								var id = m.data[tileIndex]-1;
								if(_.isNaN(id)) {
									//throw Error("Tile number for index:"+tileIndex+" is NaN");
								} else {
									if(!m.isHighTile(id) && !m.isAnimatedTile(id)) { // Don't draw unnecessary tiles
										self.drawTile(ctx, id, self.tileset, tilesetwidth, m.width, tileIndex);
									}
								}
							}
							//}
						}, 0, m);
					}          	


                }
                //var endTime = new Date();
                //log.info("Renderer: " + (endTime.getTime()-startTime.getTime()) + "ms");
            
               ctx.restore();


            },

            drawHighTerrain: function(ctx) {
                //var p = this.game.player;

                //if (!p || !p.isMoving() || this.forceRedraw)
                //{
                    ctx.save();
                    //this.clearScreen(ctx);
                    //this.setCameraView(ctx);
                    this.drawHighTiles(ctx);
                    ctx.restore();
                //}
            },

            drawAnimatedTiles: function(dirtyOnly, ctx) {
                //if (!this.camera.isattached)
                //    return;

                var self = this,
                    m = this.game.map,
                    tilesetwidth = this.tileset.width / m.tilesize;

                this.animatedTileCount = 0;
                this.game.forEachAnimatedTile(function (tile) {
                    if(dirtyOnly) {
                        if(tile.isDirty) {
                            self.drawTile(ctx, tile.id, self.tileset, tilesetwidth, m.width, tile.index);
                            tile.isDirty = false;
                        }
                    } else {
                        self.drawTile(ctx, tile.id, self.tileset, tilesetwidth, m.width, tile.index);
                        self.animatedTileCount += 1;
                    }
                });
            },

            drawDirtyAnimatedTiles: function(ctx) {
                this.drawAnimatedTiles(true, ctx);
            },

            drawHighTiles: function(ctx) {
                var self = this,
                    m = this.game.map,
                    tilesetwidth = this.tileset.width / m.tilesize;

                this.game.forEachVisibleTile(function (id, index) {
                    self.clearTile(ctx, m.width, index);
                    if(m.isHighTile(id)) {
                        self.drawTile(ctx, id, self.tileset, tilesetwidth, m.width, index);
                        //self.highTileCount += 1;
                    }
                }, 0, !this.forceRedraw);
            },

            drawBackground: function(ctx, color) {
                ctx.fillStyle = color;
                ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            },

            drawFPS: function() {
                var nowTime = new Date(),
                    diffTime = nowTime.getTime() - this.lastTime.getTime();

                if (diffTime >= 1000) {
                    this.realFPS = this.frameCount;
                    this.frameCount = 0;
                    this.lastTime = nowTime;

	            $('#fps').html("FPS: " + this.realFPS);                    
                }
                this.frameCount++;

            },

            drawDebugInfo: function() {
                    this.drawFPS();
            },

            drawCombatInfo: function() {
                var self = this;

                this.game.infoManager.forEachInfo(function(info) {
                    self.toptextcontext.save();
                    self.toptextcontext.globalAlpha = info.opacity;
                    self.setFontSize(info.fontSize);
                    self.drawText(self.toptextcontext, info.value, (info.x + 8), Math.floor(info.y), true, info.fillColor, info.strokeColor, true);
                    self.toptextcontext.restore();
                });
            },

            createEllipseGradient: function (startColor, endColor, radius) {
			// Create Glow for the first time.            	    
			  var canvas = document.createElement('canvas');
			  var context = canvas.getContext('2d');

			  canvas.width = radius*2;
			  canvas.height = radius*2;
			  context.save();
			  context.beginPath();

		      context.ellipse(radius, radius/2, radius, radius/2, 0, 0, 2 * Math.PI);
		      context.fillStyle = endColor;
		      
		      context.fill();
            	      
		      context.restore();
		      
		      context.lineWidth = 1;
		      context.strokeStyle = startColor;
		      context.stroke();
		   
		      return canvas;
            },

            drawEllipseGradientMob: function (ctx, entity, glowIndex) {
		    var s = this.scale;
		    var ts = this.tilesize;
		    var r = this.mobGlow[glowIndex].radius;
		    var x = Math.round(entity.x+ts/2)*s-r;
		    var y = Math.round(entity.y+ts/2)*s-r/4;
            	    //this.clearDirtyRect({x:x,y:y,w:r*2,h:r+1});
		    ctx.drawImage(this.mobGlow[glowIndex].canvas,x,y);
            	    
            },
                        
            /*drawSphereGradient: function (ctx, entity, glowIndex, startColor, endColor, radius) {
            	    // Create Glow for the first time.
            	    if (!entity.glow) entity.glow = [];
            	    var glow = entity.glow[glowIndex];
            	    if (!glow || glow.startColor != startColor || glow.endColor != endColor || glow.radius != radius)
            	    {
					  glow = entity.glow[glowIndex] = ctx.canvas;
					  glow.startColor = startColor;
					  glow.endColor = endColor;
					  glow.radius = radius;
            	    }
					var s = this.scale;
					var ts = this.tilesize;
					var x = Math.round(entity.x+ts/2)*s-radius;
					var y = Math.round(entity.y+ts/2)*s-radius;
							
            	   var ellipse = this.createEllipseGradient(startColor, endColor, radius);
            	   ctx.drawImage(ellipse.getContext('2d').canvas,x,y);
            },*/
            
            drawEntityGlow: function (ctx, entity) {
				if (entity)
				{
				   /*if (entity instanceof Player)
				   {
					   this.drawEntityGlowOnObject(ctx, entity, 0, (entity.armor.point ? entity.armor.point : 0) ,20 * this.scale);
						   this.drawEntityGlowOnObject(ctx, entity, 1, (entity.weapon.point ? entity.weapon.point : 0),30 * this.scale);
					   }
					   if (entity instanceof Item && ItemTypes.isArmor(entity.kind) || ItemTypes.isArcherArmor(entity.kind))
					   {    
						   this.drawEntityGlowOnObject(ctx, entity, 0, entity.count , 15 * this.scale);
					   }
					   if (entity instanceof Item && ItemTypes.isWeapon(entity.kind) || ItemTypes.isArcherWeapon(entity.kind))
					   {    
						   this.drawEntityGlowOnObject(ctx, entity, 0, entity.count , 100);
					   }*/
				   if (entity instanceof Mob && !(entity instanceof Pet))
				   {
					this.drawEllipseGradientMob(ctx, entity, this.getEntityColor(entity));   
				   }
				   
				}
            },
            
            createMonsterGlow: function(radius) {
            	    var colors = [
            	    	    ["rgba(255,255,255,0.5)", "rgba(255,255,255,0.3)"],
            	    	    ["rgba(0,255,255,0.5)", "rgba(0,255,255,0.3)"],
            	    	    ["rgba(0,0,255,0.5)", "rgba(0,0,255,0.3)"],
            	    	    ["rgba(0,99,0,0.5)", "rgba(0,99,0,0.3)"],
            	    	    ["rgba(255,255,0,0.5)", "rgba(255,255,0,0.3)"],
            	    	    ["rgba(255,128,0,0.5)", "rgba(255,128,0,0.3)"],
            	    	    ["rgba(255,0,0,0.5)", "rgba(255,0,0,0.3)"],
            	    	    ["rgba(160,32,240,0.5)", "rgba(160,32,240,0.3)"],
            	    	    ["rgba(128,128,128,0.5)", "rgba(128,128,128,0.3)"],
            	    ];
            	    
                    this.mobGlow = [];
                    for (var id in colors)
                    {
                    	   this.mobGlow.push({canvas: this.createEllipseGradient(colors[id][0], colors[id][1], radius), radius:radius})	    
                    }                 	    
            },
            
            getEntityColor: function(entity) {
                    var mobLvl = entity.level;
                    var playerLvl;

                    if (this.game.player)
                    {
                        playerLvl = this.game.player.level;
                        if (mobLvl < playerLvl-5)
                            point = 0;
                        else if (playerLvl-mobLvl >= -5 || mobLvl-playerLvl <= 9)
                        {
                            switch (mobLvl)
                            {
                                case (playerLvl-5):
                                case (playerLvl-4):
                                    point=1;
                                    break;
                                case (playerLvl-3):
                                case (playerLvl-2):
                                    point=2;
                                    break;
                                case (playerLvl-1):
                                case (playerLvl):
                                case (playerLvl+1):
                                    point=3;
                                    break;
                                case (playerLvl+2):
                                case (playerLvl+3):
                                    point=4;
                                    break;
                                case (playerLvl+4):
                                case (playerLvl+5):
                                    point=5;
                                    break;
                                case (playerLvl+6):
                                case (playerLvl+7):
                                    point=6;
                                    break;
                                case (playerLvl+8):
                                case (playerLvl+9):
                                    point=7;
                                    break;
                                default:
                                    point=0;
                            }
                        }
                        else
                            point=8;

                    }
                    else
                    {
                    	point=1;
                    }
                    return point;
            },
                        
            setCameraView: function(ctx, scale) {
                //this.camera.setRealCoords();
                ctx.translate(-this.camera.x * scale, -this.camera.y * scale);
                
            },
            
            setCameraViewUnscaled: function(ctx) {
                ctx.translate(-this.camera.x, -this.camera.y);
            },
          
            clearScreen: function(ctx) {
                ctx.save();
                ctx.setTransform(1,0,0,1,0,0);
            	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            	ctx.restore();
            },

            clearBuffer: function(ctx) {
                ctx.save();
                ctx.setTransform(1,0,0,1,0,0);
            	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            	ctx.restore();
            },

            getPlayerImage: function() {
                var canvas = document.createElement('canvas'),
                    ctx = canvas.getContext('2d'),
                    os = this.upscaledRendering ? 1 : this.scale,
                    player = this.game.player,
                    sprite = player.getArmorSprite(),
                    spriteAnim = sprite.animationData["idle_down"],
                // character
                    row = spriteAnim.row,
                    w = sprite.width * os,
                    h = sprite.height * os,
                    y = row * h,
                // weapon
                    weapon = this.game.sprites[this.game.player.getWeaponName()],
                    ww = weapon.width * os,
                    wh = weapon.height * os,
                    wy = wh * row,
                    offsetX = (weapon.offsetX - sprite.offsetX) * os,
                    offsetY = (weapon.offsetY - sprite.offsetY) * os,
                // shadow
                    shadow = this.game.shadows["small"],
                    sw = shadow.width * os,
                    sh = shadow.height * os,
                    ox = -sprite.offsetX * os,
                    oy = -sprite.offsetY * os;

                canvas.width = w;
                canvas.height = h;

                ctx.clearRect(0, 0, w, h);
                ctx.drawImage(shadow.image, 0, 0, sw, sh, ox, oy, sw, sh);
                ctx.drawImage(sprite.image, 0, y, w, h, 0, 0, w, h);
                ctx.drawImage(weapon.image, 0, wy, ww, wh, offsetX, offsetY, ww, wh);

                return canvas.toDataURL("image/png");
            },

            renderStaticCanvases: function() {
				var p = this.game.player;
				var c = this.camera;
				var ts = this.tilesize;
				
					
				if (p && p.isMoving())
				{
					c.setRealCoords();
				}
				
				// TODO - Make this use old terrain.
				if ((p && p.isMoving() && c.unclipped && !this.prevUnclipped) || !this.game.optimized
					|| (this.backgroundOffsetX > 0 && this.backgroundOffsetY > 0))
				{
					this.forceRedraw = true;
				}
				
				var vw = Math.round(this.canvas.width / this.zoom);
				var vh = Math.round(this.canvas.height / this.zoom);

				if (this.forceRedraw)
				{
					log.info("forceRedraw");
					
					this.clearScreen(this.foregroundunscaled);
					this.drawBackground(this.backgroundunscaled, "#12100D");
					
					this.backgroundunscaled.save();
					this.setCameraView(this.backgroundunscaled, 1);
					this.drawTerrain(this.backgroundunscaled);
					this.drawAnimatedTiles(false, this.backgroundunscaled);
					this.backgroundunscaled.restore();
					//this.background.save();
					//this.background.drawImage(this.backgroundunscaled.canvas, 0, 0, this.backgroundunscaled.canvas.width, this.backgroundunscaled.canvas.height, 0, 0,
						//vw,
						//vh);
					//this.background.restore();

					this.foregroundunscaled.save();
					this.setCameraView(this.foregroundunscaled, 1);
					this.drawHighTerrain(this.foregroundunscaled);
					this.foregroundunscaled.restore();
					//this.foreground.save();
					//this.clearScreen(this.foreground);
					//this.foreground.drawImage(this.foregroundunscaled.canvas, 0, 0, this.foregroundunscaled.canvas.width, this.foregroundunscaled.canvas.height, 0, 0,
					//	vw,
					//	vh);
					//this.foreground.restore();
					
					this.backgroundOffsetX = 0;
					this.backgroundOffsetY = 0;
					
				}
				else if (p && p.isMoving() && c.unclipped)
				{
					this.drawOldTerrain();
					this.backgroundOffsetX = 0;
					this.backgroundOffsetY = 0;
					
				}
				//this.prevOrientation = p.Orientation;
				this.prevUnclipped = c.unclipped;

			    c.updateTick();				
            },

            renderFrame: function() {
                if (this.game.ready && this.game.player && this.game.mapStatus >= 3)
                    this.renderFrame2();
            },
            
            clearDirtyRects: function() {
		    var self = this;
		    
		    this.game.forEachEntity(function(entity) {
			if(entity.dirtyRect) {
			    self.clearDirtyRect(self.context, entity.dirtyRect);
			    entity.dirtyRect = null;
			}
		    });
		    
		    for(var i = this.contextDirtyRects.length; i > 0 ; --i)
		    {
		    	var dirtyRect = this.contextDirtyRects[i-1];
		    	self.clearDirtyRect(self.context, dirtyRect);
		    	dirtyRect = null;
		    }
		    this.contextDirtyRects = [];
		    
		    for(var i = this.textcontextDirtyRects.length; i > 0 ; --i)
		    {
		    	var dirtyRect = this.textcontextDirtyRects[i-1];
		    	self.clearDirtyRect(self.toptextcontext, dirtyRect);
		    	dirtyRect = null;
		    }
		    this.textcontextDirtyRects = [];
		    
            },
			clearDirtyRect: function(ctx, r) {
				//ctx.fillStyle = "#ff0000";
				//ctx.fillRect(r.x, r.y, r.w, r.h);
				ctx.clearRect(r.x, r.y, r.w, r.h);
			},
        
            renderFrame2: function() {
				this.delta = Date.now() - this.last;
				//var isDesktop = !(this.tablet || this.mobile);
				
				/*if ((isDesktop && this.delta >= 50) || // 20 FPS
					(!isDesktop && this.delta >= 100)) // 10 FPS
				{
					this.renderParticleEffects = true;
			    }
			    else
			    	this.renderParticleEffects = false;*/
                
                // Render night is up here because it relies on forceRedraw.
				/*if (this.renderParticleEffects && isDesktop)
				{
					this.atmosphere.save();
					//this.renderNight(this.atmosphere);
					this.atmosphere.restore();
				}*/
	
				// forceRedraw gets set to false here.
				this.renderStaticCanvases();

				/*
				// TODO - Make work. Needs to be in a seperate layer.
				this.background.save();
				this.setCameraView(this.background);
				this.drawAnimatedTiles(false, this.background);
				this.background.restore();
                                */
                                
				this.context.save();
				if (this.forceRedraw)
				{
					this.clearScreen(this.context);
					this.clearScreen(this.toptextcontext);
				}
				else
				{
					this.clearDirtyRects();
				}
				this.setCameraView(this.context, this.scale);
				if(!this.game.usejoystick || (this.game.started && this.game.cursorVisible)) {
					this.drawSelectedCell(this.context);
					this.drawTargetCell(this.context);
					this.drawAttackTargetCell(this.context);
				}					
				this.drawEntities(false);
				this.context.restore();	
                
				/*if (this.renderParticleEffects && isDesktop)
				{
					this.renderRain(this.rainCanvas);
				}*/

				/*if (this.renderParticleEffects && isDesktop)
				{
					this.atmosphere2.save();
					this.renderClouds();
					this.atmosphere2.restore();
				} */         

				this.toptextcontext.save();

				this.drawPathingCells(this.toptextcontext);
				
				this.drawAnnouncements();
				
				this.setCameraView(this.toptextcontext, this.scale);
				
				this.drawEntityNames();
				
				this.drawCombatInfo();
				//this.drawInventory();
				this.drawDebugInfo();
				this.drawCoordinates();
				
									
				this.toptextcontext.restore();
				// Overlay UI elements
				if((!this.game.usejoystick && (this.game.cursorVisible || !this.tablet || this.isFirefox)))
				{
					this.drawCursor();
				}

				this.last = Date.now();
				this.forceRedraw = false;
            },

        });


        var getX = function(id, w) {
            if(id === 0) {
                return 0;
            }
            return (id % w === 0) ? w - 1 : (id % w) - 1;
        };

        return Renderer;
    });
