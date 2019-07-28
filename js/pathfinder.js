define(['lib/astar'], function(AStar) {

    var Pathfinder = Class.extend({
        init: function(width, height) {
            this.width = width;
            this.height = height;
            this.grid = null;
            this.blankGrid = [];
            this.initBlankGrid_();
            this.ignored = [];
            this.included = [];
        },
    
        initBlankGrid_: function() {
            for(var i=0; i < this.height; i += 1) {
                this.blankGrid[i] = [];
                for(var j=0; j < this.width; j += 1) {
                    this.blankGrid[i][j] = 0;
                }
            }
        },

        getShortGrid: function (grid, entity, x, y, gridEdges) {
			var start = [entity.gridX, entity.gridY];
			var end = [x,y];
			
			var minX = Math.max(Math.min(start[0], end[0])-gridEdges, 0);
			var maxX = Math.min(Math.max(start[0], end[0])+gridEdges,grid[0].length);
			var minY = Math.max(Math.min(start[1], end[1])-gridEdges, 0);
			var maxY = Math.min(Math.max(start[1], end[1])+gridEdges,grid.length);
			
			var substart = [start[0]-minX, start[1]-minY];
			var subend = [end[0]-minX, end[1]-minY];
			
			log.info(JSON.stringify(substart));
			log.info(JSON.stringify(subend));
			log.info("minX="+minX+",maxX="+maxX+",minY="+minY+",maxY="+maxY);
			
			var crop = [];
			for(var i = minY; i<maxY; i++){
				crop.push(grid[i].slice(minX, maxX));
			}
			return {
				crop: crop, 
				minX: minX,
				minY: minY,
				substart: substart,
				subend: subend};
        },
        
        findNeighbourPath: function(entity, x, y) {
            var start = [entity.gridX, entity.gridY],
        		end = [x, y];

            // If its one space just return the start, end path.
			if ((Math.abs(start[0] - end[0]) == 1 && Math.abs(start[1] - end[1]) == 0) ||
				(Math.abs(start[1] - end[1]) == 1 && Math.abs(start[0] - end[0]) == 0))
					return [[start[0], start[1]],[end[0],end[1]]];

			return null;			
		},

        findShortPath: function(crop, entity, x, y, offsetX, offsetY, substart, subend) {
            var start = [entity.gridX, entity.gridY],
        		end = [x, y],
        		path;
            
        	log.info(JSON.stringify("substart="+substart));
        	log.info(JSON.stringify("subend="+subend));
        	log.info(JSON.stringify("crop="+crop));
        	
			var subpath = AStar(crop, substart, subend);

			if (subpath.length > 0)
			{
				var path = [];
				var len = subpath.length;
				for (var j = 0; j < len; ++j)
				{
					path[j] = [];
					path[j][0] = subpath[j][0]+offsetX;
					path[j][1] = subpath[j][1]+offsetY;
				}
				log.info(JSON.stringify(path));
				log.info(JSON.stringify(subpath));
				return path;
			}
			
            return null;
        },
        
        findPath: function(grid, entity, x, y, findIncomplete) {
            var start = [entity.gridX, entity.gridY],
        		end = [x, y],
        		path;
					
			this.grid = grid;
            this.applyIgnoreList_(this.grid, true);
            this.applyIncludeList_(this.grid, true);
            
			if(/*subpath.length === 0 &&*/ findIncomplete === true) {
				path = AStar(this.grid, start, end);
			}

            if(!path || path.length === 0 && findIncomplete === true) {
                // If no path was found, try and find an incomplete one
                // to at least get closer to destination.
                path = this.findIncompletePath_(start, end);
                //log.info("NO path to destination");
            }
        
            return path;
        },
    
        /**
         * Finds a path which leads the closest possible to an unreachable x, y position.
         *
         * Whenever A* returns an empty path, it means that the destination tile is unreachable.
         * We would like the entities to move the closest possible to it though, instead of
         * staying where they are without moving at all. That's why we have this function which
         * returns an incomplete path to the chosen destination.
         *
         * @private
         * @returns {Array} The incomplete path towards the end position
         */
        findIncompletePath_: function(start, end) {
            var perfect, x, y,
                incomplete = [];

            perfect = AStar(this.blankGrid, start, end);
        
            for(var i=perfect.length-1; i > 0; i -= 1) {
                x = perfect[i][0];
                y = perfect[i][1];
            
                if(this.grid[y][x] === 0) {
                    incomplete = AStar(this.grid, start, [x, y]);
                    break;
                }
            }
            return incomplete;
        },
    
        /**
         * Removes colliding tiles corresponding to the given entity's position in the pathing grid.
         */
        ignoreEntity: function(entity) {
            if(entity) {
                this.ignored.push(entity);
            }
        },
        includeEntity: function(entity) {
            if(entity) {
                this.included.push(entity);
            }
        },
        
        applyIgnoreList_: function(grid, ignored) {
            var self = this,
                x, y;

            _.each(this.ignored, function(entity) {
                x = entity.isMoving() ? entity.nextGridX : entity.gridX;
                y = entity.isMoving() ? entity.nextGridY : entity.gridY;

                if(x >= 0 && y >= 0) {
                	//log.info("path.grid=["+x+","+y+"]");
                    grid[y][x] = ignored ? 0 : 1;
                }
            });
        },
    
        applyIncludeList_: function(grid, included) {
            var self = this,
                x, y;

            _.each(this.included, function(entity) {
                x = entity.isMoving() ? (entity.path.length > 0 ? entity.path[entity.path.length-1][0] : entity.nextGridX) : entity.gridX;
                y = entity.isMoving() ? (entity.path.length > 0 ? entity.path[entity.path.length-1][1] : entity.nextGridY) : entity.gridY;

                if(x >= 0 && y >= 0) {
                	//log.info("path.grid=["+x+","+y+"]");
                    grid[y][x] = included ? 1 : 0;
                }                
            });
        },
        
        clearIgnoreList: function(grid) {
            this.applyIgnoreList_(grid, false);
            this.ignored = [];
        },
        
        clearIncludeList: function(grid) {
            this.applyIncludeList_(grid, false);
            this.ignored = [];
        },
        
    });
    
    return Pathfinder;
});
