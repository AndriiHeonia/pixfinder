(function() {

// (HTMLImageElement | HTMLCanvasElement, Coord | Array, Object, Array)
function bfs(img, startCoord, eventMap, blacklist) {
    var queue = _is('Array', startCoord) ? startCoord : [startCoord];

    if(_isImgLoaded(img)) {
        _bfs(_wrapByCanvas(img), queue, eventMap, blacklist);
    } else {
        img.addEventListener('load', function() {
            _bfs(_wrapByCanvas(img), queue, eventMap, blacklist);
        }, false);
    }
}

// (HTMLCanvasElement, Array, Object, Array)
function _bfs(canvas, queue, eventMap, blacklist) {
    var ctx = canvas.getContext('2d'),
        imgSize = {
            w: canvas.width,
            h: canvas.height
        },
        imgCols = ctx.getImageData(0, 0, imgSize.w, imgSize.h).data,
        visited = {},
        stopMainLoop = false,
        skipNeighbords = false;

    if(blacklist !== undefined) {
        blacklist.forEach(function(coord) {
            visited[coord.x + '-' + coord.y] = true;
        });
    }

    function visitPx(coord) {
        visited[coord.x + '-' + coord.y] = true;
        if(eventMap !== undefined && eventMap.onvisit !== undefined) {
            eventMap.onvisit({
                pixel: {
                    coord: coord,
                    color: _getColorByXY(coord, imgSize, imgCols)
                },
                stop: function() { stopMainLoop = true; },
                skip: function() { skipNeighbords = true; }
            });
        }
    }

    visitPx(queue[0]);

mainLoop:
    while (queue.length > 0) {
        if(stopMainLoop) { break mainLoop; }

        var coord = queue.shift(),
            colPos = _getColorPositionByXY(coord, imgSize),
            col = [imgCols[colPos], imgCols[colPos+1], imgCols[colPos+2], imgCols[colPos+3]],
            px = { coord: coord, color: col },
            nPxs = _getNeighborPixels(coord, imgSize, imgCols);

        for (var i = 0; i < nPxs.length; i++) {
            var nPx = nPxs[i];
            if(visited[nPx.coord.x + '-' + nPx.coord.y] !== true) {
                visitPx(nPx.coord);
                if(stopMainLoop) { break mainLoop; }
                if(!skipNeighbords) {
                    queue.push(nPx.coord);
                }
                skipNeighbords = false;
            }
        }
    }
}

// (Coord, Object) -> Number
function _getColorPositionByXY(coord, imgSize) {
    return ((coord.y - 1) * imgSize.w * 4) + (coord.x * 4 - 4);
}

// (Coord, Object, imgCols) -> Array
function _getColorByXY(coord, imgSize, imgCols) {
    var colPos = _getColorPositionByXY(coord, imgSize);
    return [imgCols[colPos], imgCols[colPos+1], imgCols[colPos+2], imgCols[colPos+3]];
}

// (Coord, Object) -> Array
function _getNeighborPixels(coord, imgSize, imgCols) {
    var res = [], pos;

    if (coord.x > 0 && coord.y > 0) { // tlPx
        pos = {
            x: coord.x - 1,
            y: coord.y - 1
        };
        res.push({
            coord: pos,
            color: _getColorByXY(pos, imgSize, imgCols)
        });
    }

    if (coord.y > 0) { // tPx
        pos = {
            x: coord.x,
            y: coord.y - 1
        };
        res.push({
            coord: pos,
            color: _getColorByXY(pos, imgSize, imgCols)
        });
    }

    if (coord.x < imgSize.w && coord.y > 0) { // trPx
        pos = {
            x: coord.x + 1,
            y: coord.y - 1
        };
        res.push({
            coord: pos,
            color: _getColorByXY(pos, imgSize, imgCols)
        });
    }

    if (coord.x < imgSize.w) { // rPx
        pos = {
            x: coord.x + 1,
            y: coord.y
        };
        res.push({
            coord: pos,
            color: _getColorByXY(pos, imgSize, imgCols)
        });
    }

    if (coord.x < imgSize.w && coord.y < imgSize.h) { // brPx
        pos = {
            x: coord.x + 1,
            y: coord.y + 1
        };
        res.push({
            coord: pos,
            color: _getColorByXY(pos, imgSize, imgCols)
        });
    }

    if (coord.y < imgSize.h) { // bPx
        pos = {
            x: coord.x,
            y: coord.y + 1
        };
        res.push({
            coord: pos,
            color: _getColorByXY(pos, imgSize, imgCols)
        });
    }

    if(coord.x > 0 && coord.y < imgSize.h) { // blPx
        pos = {
            x: coord.x - 1,
            y: coord.y + 1
        };
        res.push({
            coord: pos,
            color: _getColorByXY(pos, imgSize, imgCols)
        });
    }

    if(coord.x > 0) { // lPx
        pos = {
            x: coord.x - 1,
            y: coord.y
        };
        res.push({
            coord: pos,
            color: _getColorByXY(pos, imgSize, imgCols)
        });
    }

    return res;
}

// (HTMLImageElement) -> Boolean
function _isImgLoaded(img) {
    return !(typeof img.naturalWidth !== 'undefined' && img.naturalWidth === 0);
}

// (HTMLImageElement) -> HTMLCanvasElement
function _wrapByCanvas(img) {
    if(img.tagName === 'CANVAS') { return img; }
    var canv = document.createElement('canvas');
    canv.width = img.width;
    canv.height = img.height;
    canv.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
    return canv;
}

// (String, Object) -> Boolean
function _is(type, obj) {
    var clas = Object.prototype.toString.call(obj).slice(8, -1);
    return obj !== undefined && obj !== null && clas === type;
}

window.bfs = bfs;

})();