
//importScripts('lib/underscore.min.js');

onmessage = function (event) {
    generateCollisionGrid();
    generatePlateauGrid();

    postMessage(mapData);
};

function generateCollisionGrid() {
    var tileIndex = 0;

    mapData.grid = [];
    for(var j, i = 0; i < mapData.height; i++) {
        mapData.grid[i] = [];
        for(j = 0; j < mapData.width; j++) {
            mapData.grid[i][j] = false;
        }
    }

    _.each(mapData.collisions, function(tileIndex) {
        var pos = tileIndexToGridPosition(tileIndex+1);
        if (pos.y < mapData.grid.length && pos.x < mapData.grid[0].length)
        	mapData.grid[pos.y][pos.x] = true;
    });

    _.each(mapData.blocking, function(tileIndex) {
        var pos = tileIndexToGridPosition(tileIndex+1);
        if(mapData.grid[pos.y] !== undefined) {
            mapData.grid[pos.y][pos.x] = true;
        }
    });
}

function generatePlateauGrid() {
    var tileIndex = 0;

    mapData.plateauGrid = [];
    for(var j, i = 0; i < mapData.height; i++) {
        mapData.plateauGrid[i] = [];
        for(j = 0; j < mapData.width; j++) {
            if(_.include(mapData.plateau, tileIndex)) {
                mapData.plateauGrid[i][j] = true;
            } else {
                mapData.plateauGrid[i][j] = false;
            }
            tileIndex += 1;
        }
    }
}

function tileIndexToGridPosition(tileNum) {
    var x = 0,
        y = 0;

    var getX = function(num, w) {
        if(num == 0) {
            return 0;
        }
        return (num % w == 0) ? w - 1 : (num % w) - 1;
    };

    tileNum -= 1;
    x = getX(tileNum + 1, mapData.width);
    y = Math.floor(tileNum / mapData.width);

    return { x: x, y: y };
}
