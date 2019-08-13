
define(['jquery', 'area', 'detect', 'mapworker'], function($, Area, Detect, worker) {

    var Map = Class.extend({
        init: function(loadMultiTilesheets, game) {
            this.game = game;
            this.data = [];
            this.isLoaded = false;
            this.tilesetsLoaded = false;
            this.mapLoaded = false;
            this.loadMultiTilesheets = loadMultiTilesheets;
            this.count = 0;
            

        },
        
        loadMap: function(filename) {
            var useWorker = false;
            this.isLoaded = false;
            this._loadMap(useWorker, filename);
            this._initTilesets();
            this.filename = filename;
        },
        
        _checkReady: function() {
        	var self = this;
        	log.info("_checkReady");
            var checkInterval = setInterval(function() {
				if(self.tilesetsLoaded && self.width > 0 && self.height > 0) {
					clearInterval(checkInterval);
					self.isLoaded = true;
					self._generate();
					if(self.ready_func) {
						self.ready_func();
					}
					
				}
            },250);
        },
        
        _generate: function () {
        	var self = this;
		
		self._generateCollisionGrid();
		self._generatePlateauGrid();
        },
        
        _loadMap: function(useWorker,filename) {
            var self = this,
                filepath = "./maps/"+filename;

            if(useWorker) {
                log.info("Loading map with web worker.");
                var worker = new Worker('js/mapworker.js');
                worker.postMessage(1);

                worker.onmessage = function(event) {
                    var map = event.data;
                    self._initMap(map);
                    self.grid = map.grid;
                    self.plateauGrid = map.plateauGrid;
                    self.mapLoaded = true;
                    self._checkReady();
                };
            } else {
                log.info("Loading map via Ajax.");
                
                var jqxhr = $.getJSON(filepath, function (data) {
			self.data = data;
			self._initMap(self.data);
			self._checkReady();
			
                });
            }
        },

        _initTilesets: function() {
            var tileset1, tileset2;

            if(this.game.renderer.upscaledRendering === true) {
                this.tilesetCount = 1;
                tileset1 = this._loadTileset('img/1/tilesheet.png');
            } else {
                if(this.game.renderer.mobile) {
                    this.tilesetCount = 1;
                    tileset2 = this._loadTileset('img/1/tilesheet.png');
                } else if (this.game.renderer.tablet) {
                    this.tilesetCount = 1;
                    tileset2 = this._loadTileset('img/1/tilesheet.png');
                } else {
                    this.tilesetCount = 1;
                    tileset2 = this._loadTileset('img/1/tilesheet.png');
                    //tileset3 = this._loadTileset('img/3/tilesheet.png');
                }
            }

            this.tilesets = [tileset1, tileset2];
        },

        _initMap: function(map) {
            this.width = map.width;
            this.height = map.height;
            this.tilesize = map.tilesize;
            this.data = map.data;
            this.blocking = map.blocking || [];
            this.plateau = map.plateau || [];
            this.musicAreas = map.musicAreas || [];
            this.collision = map.collision;
            this.high = map.high;
            this.animated = map.animated;

            this.doors = this._getDoors(map);
            this.checkpoints = this._getCheckpoints(map);
        },

        _getDoors: function(map) {
            var self = this;

            var doors = [];
            _.each(map.doors, function(door) {
            	door.width = (door.width) ? door.width : 1;
            	door.height = (door.height) ? door.height : 1;
                var area = new Area(door.x, door.y, door.width, door.height);
                    area.minLevel = door.tminLevel,
                    area.maxLevel = door.tmaxLevel,
                	area.map = door.tmap,
                    area.portal = door.p === 1,
                    area.quest = door.tq,
                    area.admin = door.a;
					switch(door.to) {
						case 'u': area.orientation = Types.Orientations.UP;
							break;
						case 'd': area.orientation = Types.Orientations.DOWN;
							break;
						case 'l': area.orientation = Types.Orientations.LEFT;
							break;
						case 'r': area.orientation = Types.Orientations.RIGHT;
							break;
						default : area.orientation = Types.Orientations.DOWN;
					}
                doors.push(area);
            });
            return doors;
        },

        _loadTileset: function(filepath) {
            var self = this,
                tileset = new Image();

            tileset.crossOrigin = "Anonymous";
            tileset.src = filepath;

            log.info("Loading tileset: "+filepath);

            tileset.onload = function() {
                if(tileset.width % self.tilesize > 0) {
                    throw Error("Tileset size should be a multiple of "+ self.tilesize);
                }
                log.info("Map tileset loaded.");

                self.tilesetCount -= 1;
                if(self.tilesetCount === 0) {
                    log.debug("All map tilesets loaded.")

                    self.tilesetsLoaded = true;
                    self._checkReady();
                }
            };

            return tileset;
        },

        ready: function(f) {
            this.ready_func = f;
        },

        tileIndexToGridPosition: function(tileNum) {
            var x = 0,
                y = 0;

            var getX = function(num, w) {
                if(num == 0) {
                    return 0;
                }
                return (num % w == 0) ? w - 1 : (num % w) - 1;
            };

            tileNum -= 1;
            x = getX(tileNum + 1, this.width);
            y = Math.floor(tileNum / this.width);

            return { x: x, y: y };
        },

        GridPositionToTileIndex: function(x, y) {
            return (y * this.width) + x;
        },

        isColliding: function(x, y) {
            //log.info("isCOlliding x:"+x+",y:"+y);
            if(this.isOutOfBounds(x, y) || !this.grid || !this.grid[y]) {
                return false;
            }
            return (this.grid[y][x] === true);
        },

        isPlateau: function(x, y) {
            if(this.isOutOfBounds(x, y) || !this.plateauGrid || !this.plateauGrid[y]) {
                return false;
            }
            return (this.plateauGrid[y][x] === true);
        },

        _generateCollisionGrid: function() {
            var tileIndex = 0,
                self = this;

            log.debug(JSON.stringify(this.collision));
            this.grid = [];
            for(var j, i = 0; i < this.height; i++) {
                this.grid[i] = [];
                for(j = 0; j < this.width; j++) {
                    this.grid[i][j] = (this.collision[i * this.width+j] == 1 ? true : false);
                }
            }
            log.debug(JSON.stringify(this.grid));

            /*_.each(this.collision, function(tileIndex) {
                var pos = self.tileIndexToGridPosition(tileIndex+1);
                if (self.grid[pos.y][pos.x] === 0)
                	self.grid[pos.y][pos.x] = true;
            });*/

            /*_.each(this.blocking, function(tileIndex) {
                var pos = self.tileIndexToGridPosition(tileIndex+1);
                if(self.grid[pos.y] !== undefined) {
                    self.grid[pos.y][pos.x] = true;
                }
            });*/
            log.debug("Collision grid generated.");
        },

        _generatePlateauGrid: function() {
            var tileIndex = 0;

            this.plateauGrid = [];
            for(var j, i = 0; i < this.height; i++) {
                this.plateauGrid[i] = [];
                for(j = 0; j < this.width; j++) {
                    if(_.include(this.plateau, tileIndex)) {
                        this.plateauGrid[i][j] = true;
                    } else {
                        this.plateauGrid[i][j] = false;
                    }
                    tileIndex += 1;
                }
            }
            log.info("Plateau grid generated.");
        },

        /**
         * Returns true if the given position is located within the dimensions of the map.
         *
         * @returns {Boolean} Whether the position is out of bounds.
         */
        isOutOfBounds: function(x, y) {
            return isInt(x) && isInt(y) && (x < 0 || x >= this.width || y < 0 || y >= this.height);
        },

        /**
         * Returns true if the given tile id is "high", i.e. above all entities.
         * Used by the renderer to know which tiles to draw after all the entities
         * have been drawn.
         *
         * @param {Number} id The tile id in the tileset
         * @see Renderer.drawHighTiles
         */
        isHighTile: function(id) {
            return _.indexOf(this.high, id+1) >= 0;
        },

        /**
         * Returns true if the tile is animated. Used by the renderer.
         * @param {Number} id The tile id in the tileset
         */
        isAnimatedTile: function(id) {
            return id+1 in this.animated;
        },

        /**
         *
         */
        getTileAnimationLength: function(id) {
            return this.animated[id+1].l;
        },

        /**
         *
         */
        getTileAnimationDelay: function(id) {
            var animProperties = this.animated[id+1];
            if(animProperties.d) {
                return animProperties.d;
            } else {
                return 100;
            }
        },

        isDoor: function(x,y) {
            return _.detect(this.doors, function(door) {
                return (door.contains({gridX: x, gridY: y}) != null);
            });            
        },
        
        
        getDoor: function(entity) {
            return _.detect(this.doors, function(door) {
                return door.contains(entity);
            });            
        },

        _getCheckpoints: function(map) {
            var checkpoints = [];
            _.each(map.checkpoints, function(cp) {
                var area = new Area(cp.x, cp.y, cp.w, cp.h);
                area.id = cp.id;
                checkpoints.push(area);
            });
            return checkpoints;
        },

        getCurrentCheckpoint: function(entity) {
            return _.detect(this.checkpoints, function(checkpoint) {
                return checkpoint.contains(entity);
            });
        }
    });

    return Map;
});
