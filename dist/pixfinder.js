!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.pix=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * (c) 2014, Andrey Geonya
 * https://github.com/dstructjs/disjoint-set
 */

(function () { 'use strict';

function disjointSet() {
    return new DisjointSet();
}

var DisjointSet = function() {
    this._reset();
};

DisjointSet.prototype = {
    add: function (val) {
        var id = this._isPrimitive(val) ? val : this._lastId;
        if (typeof val._disjointSetId === 'undefined') {
            val._disjointSetId = this._relations[id] = id;
            this._objects[id] = val;
            this._size[id] = 1;
            this._lastId++;
        }
        return this;
    },

    find: function (val) {
        var id = this._isPrimitive(val) ? val : val._disjointSetId;
        return this._findById(id);
    },

    _findById: function (id) {
        var rootId = id;
        while (this._relations[rootId] !== rootId) {
            rootId = this._relations[rootId];
        }
        return rootId;
    },

    connected: function (val1, val2) {
        return this.find(val1) === this.find(val2) ? true : false;
    },

    union: function (val1, val2) {
        var val1RootId = this.find(val1),
            val2RootId = this.find(val2);

        if (val1RootId === val2RootId) { return this; }

        if (this._size[val1RootId] < this._size[val2RootId]) {
            this._relations[val1RootId] = val2RootId;
            this._size[val1RootId] += this._size[val2RootId];
        }
        else {
            this._relations[val2RootId] = val1RootId;
            this._size[val2RootId] += this._size[val1RootId];
        }

        return this;
    },

    extract: function () {
        var rootId,
            resObj = {},
            resArr = [];

        for (var id in this._relations) {
            rootId = this._findById(id);

            if (typeof resObj[rootId] === 'undefined') {
                resObj[rootId] = [];
            }
            resObj[rootId].push(this._objects[id]);
        }

        for (var key1 in resObj) {
            resArr.push(resObj[key1]);
        }

        return resArr;
    },

    destroy: function () {
        this._reset();
    },

    _isPrimitive: function (val) {
        if (typeof this.IS_PRIMITIVE !== 'undefined') {
            return this.IS_PRIMITIVE;
        }
        else {
            this.IS_PRIMITIVE = DisjointSet._isPrimitive(val);
            return this.IS_PRIMITIVE;
        }
    },

    _reset: function () {
        for (var id in this._objects) {
            delete this._objects[id]._disjointSetId;
        }
        this._objects = {};
        this._relations = {};
        this._size = {};
        this._lastId = 0;
    }
};

DisjointSet._isPrimitive = function (val) {
    if (Object.prototype.toString.call(val) === '[object String]' ||
        Object.prototype.toString.call(val) === '[object Number]') {
        return true;
    }
    else {
        return false;
    }
};

if (typeof define === 'function' && define.amd) {
    define(function() {
        return disjointSet;
    });
} else if (typeof module !== 'undefined') {
    module.exports = disjointSet;
} else if (typeof self !== 'undefined') {
    self.disjointSet = disjointSet;
} else {
    window.disjointSet = disjointSet;
}

})();
},{}],2:[function(require,module,exports){
function Grid(points) {
    var _cells = [];

    points.forEach(function(point) {
        var cellXY = this.point2CellXY(point),
            x = cellXY[0],
            y = cellXY[1];
        if (_cells[x] === undefined) {
            _cells[x] = [];
        }
        if (_cells[x][y] === undefined) {
            _cells[x][y] = [];
        }
        _cells[x][y].push(point);
    }, this);

    this.cellPoints = function(x, y) { // (Number, Number) -> Array
        return (_cells[x] !== undefined && _cells[x][y] !== undefined) ? _cells[x][y] : [];
    };

    this.removePoint = function(point) { // (Array) -> Array
        var cellXY = this.point2CellXY(point),
            cell = _cells[cellXY[0]][cellXY[1]],
            pointIdxInCell;
        
        for (var i = 0; i < cell.length; i++) {
            if (cell[i][0] === point[0] && cell[i][1] === point[1]) {
                pointIdxInCell = i;
                break;
            }
        }

        cell.splice(pointIdxInCell, 1);

        return cell;
    };
}

Grid.prototype = {
    point2CellXY: function(point) { // (Array) -> Array
        var x = parseInt(point[0] / Grid.CELL_SIZE),
            y = parseInt(point[1] / Grid.CELL_SIZE);
        return [x, y];
    },

    rangePoints: function(bbox) { // (Array) -> Array
        var tlCellXY = this.point2CellXY([bbox[0], bbox[1]]),
            brCellXY = this.point2CellXY([bbox[2], bbox[3]]),
            points = [];

        for (var x = tlCellXY[0]; x <= brCellXY[0]; x++) {
            for (var y = tlCellXY[1]; y <= brCellXY[1]; y++) {
                points = points.concat(this.cellPoints(x, y));
            }
        }

        return points;
    },

    addBorder2Bbox: function(bbox, border) { // (Array, Number) -> Array
        return [
            bbox[0] - (border * Grid.CELL_SIZE),
            bbox[1] - (border * Grid.CELL_SIZE),
            bbox[2] + (border * Grid.CELL_SIZE),
            bbox[3] + (border * Grid.CELL_SIZE)
        ];
    }
};

function grid(points) {
    return new Grid(points);
}

Grid.CELL_SIZE = 10;

module.exports = grid;
},{}],3:[function(require,module,exports){
/*
 (c) 2014, Andrey Geonya
 Hull.js, a JavaScript library for concave hull generation by set of points.
 https://github.com/AndreyGeonya/hull
*/

'use strict';

var intersect = require('./intersect.js');
var grid = require('./grid.js');

function _sortByX(pointset) {
    return pointset.sort(function(a, b) {
        if (a[0] == b[0]) {
            return a[1] - b[1];                           
        } else {                                                    
            return a[0] - b[0];                                                           
        }
    });
}

function _getMaxY(pointset) {
    var maxY = -Infinity;
    for (var i = pointset.length - 1; i >= 0; i--) {
        if (pointset[i][1] > maxY) {
            maxY = pointset[i][1];
        }
    }
    return maxY;
}

function _upperTangent(pointset) {
    var lower = [];
    for (var l = 0; l < pointset.length; l++) {
        while (lower.length >= 2 && (_cross(lower[lower.length - 2], lower[lower.length - 1], pointset[l]) <= 0)) {
            lower.pop();
        }
        lower.push(pointset[l]);
    }
    lower.pop();
    return lower;
}

function _lowerTangent(pointset) {
    var reversed = pointset.reverse(),
        upper = [];
    for (var u = 0; u < reversed.length; u++) {
        while (upper.length >= 2 && (_cross(upper[upper.length - 2], upper[upper.length - 1], reversed[u]) <= 0)) {
            upper.pop();
        }
        upper.push(reversed[u]);
    }
    upper.pop();
    return upper;
}

function _cross(o, a, b) {
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); 
}

function _sqLength(a, b) {
    return Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2);
}

function _cos(o, a, b) {
    var aShifted = [a[0] - o[0], a[1] - o[1]],
        bShifted = [b[0] - o[0], b[1] - o[1]],
        sqALen = _sqLength(o, a),
        sqBLen = _sqLength(o, b),
        dot = aShifted[0] * bShifted[0] + aShifted[1] * bShifted[1];

    return dot / Math.sqrt(sqALen * sqBLen);
}

function _intersect(segment, pointset) {
    for (var i = 0; i < pointset.length - 1; i++) {
        var seg = [pointset[i], pointset[i + 1]];
        if (segment[0][0] === seg[0][0] && segment[0][1] === seg[0][1] ||
            segment[0][0] === seg[1][0] && segment[0][1] === seg[1][1]) {
            continue;
        }
        if (intersect(segment, seg)) {
            return true;
        }
    }
    return false;
}

function _bBoxAround(edge, boxSize) {
    var minX, maxX, minY, maxY;

    if (edge[0][0] < edge[1][0]) {
        minX = edge[0][0] - boxSize;
        maxX = edge[1][0] + boxSize;
    } else {
        minX = edge[1][0] - boxSize;
        maxX = edge[0][0] + boxSize;
    }

    if (edge[0][1] < edge[1][1]) {
        minY = edge[0][1] - boxSize;
        maxY = edge[1][1] + boxSize;
    } else {
        minY = edge[1][1] - boxSize;
        maxY = edge[0][1] + boxSize;
    }

    return [
        minX, minY, // tl
        maxX, maxY  // br
    ];
}

function _midPoint(edge, innerPoints, convex) {
    var point = null,
        angle1Cos = MAX_CONCAVE_ANGLE_COS,
        angle2Cos = MAX_CONCAVE_ANGLE_COS,
        a1Cos, a2Cos;

    for (var i = 0; i < innerPoints.length; i++) {
        a1Cos = _cos(edge[0], edge[1], innerPoints[i]);
        a2Cos = _cos(edge[1], edge[0], innerPoints[i]);

        if (a1Cos > angle1Cos && a2Cos > angle2Cos &&
            !_intersect([edge[0], innerPoints[i]], convex) &&
            !_intersect([edge[1], innerPoints[i]], convex)) {

            angle1Cos = a1Cos;
            angle2Cos = a2Cos;
            point = innerPoints[i];
        }
    }

    return point;
}

function _concave(convex, maxSqEdgeLen, maxSearchBBoxSize, grid) {
    var edge,
        border,
        bBoxSize,
        midPoint,
        bBoxAround,    
        midPointInserted = false;

    for (var i = 0; i < convex.length - 1; i++) {
        edge = [convex[i], convex[i + 1]];

        if (_sqLength(edge[0], edge[1]) < maxSqEdgeLen) { continue; }

        border = 0;
        bBoxSize = MIN_SEARCH_BBOX_SIZE;
        bBoxAround = _bBoxAround(edge, bBoxSize);
        do {
            bBoxAround = grid.addBorder2Bbox(bBoxAround, border);
            bBoxSize = bBoxAround[2] - bBoxAround[0];
            midPoint = _midPoint(edge, grid.rangePoints(bBoxAround), convex);            
            border++;
        }  while (midPoint === null && maxSearchBBoxSize > bBoxSize);

        if (midPoint !== null) {
            convex.splice(i + 1, 0, midPoint);
            grid.removePoint(midPoint);
            midPointInserted = true;
        }
    }

    if (midPointInserted) {
        return _concave(convex, maxSqEdgeLen, maxSearchBBoxSize, grid);
    }

    return convex;
}

function hull(pointset, concavity) {
    var lower, upper, convex,
        innerPoints,
        maxSearchBBoxSize,
        maxEdgeLen = concavity || 20;

    if (pointset.length < 4) {
        return pointset;
    }
    pointset = _sortByX(pointset);
    upper = _upperTangent(pointset);
    lower = _lowerTangent(pointset);
    convex = lower.concat(upper);
    convex.push(pointset[0]);

    maxSearchBBoxSize = Math.max(pointset[pointset.length - 1][0], _getMaxY(convex)) * MAX_SEARCH_BBOX_SIZE_PERCENT;
    innerPoints = pointset.filter(function(pt) {
        return convex.indexOf(pt) < 0;
    });
 
    return _concave(convex, Math.pow(maxEdgeLen, 2), maxSearchBBoxSize, grid(innerPoints));
}

var MAX_CONCAVE_ANGLE_COS = Math.cos(90 / (180 / Math.PI)); // angle = 90 deg
var MIN_SEARCH_BBOX_SIZE = 5;
var MAX_SEARCH_BBOX_SIZE_PERCENT = 0.8;

module.exports = hull;
},{"./grid.js":2,"./intersect.js":4}],4:[function(require,module,exports){
function ccw(x1, y1, x2, y2, x3, y3) {           
    var cw = ((y3 - y1) * (x2 - x1)) - ((y2 - y1) * (x3 - x1));
    return cw > 0 ? true : cw < 0 ? false : true; // colinear
}

function intersect(seg1, seg2) {
  var x1 = seg1[0][0], y1 = seg1[0][1],
      x2 = seg1[1][0], y2 = seg1[1][1],
      x3 = seg2[0][0], y3 = seg2[0][1],
      x4 = seg2[1][0], y4 = seg2[1][1];
    return ccw(x1, y1, x3, y3, x4, y4) !== ccw(x2, y2, x3, y3, x4, y4) && ccw(x1, y1, x2, y2, x3, y3) !== ccw(x1, y1, x2, y2, x4, y4);
}

module.exports = intersect;
},{}],5:[function(require,module,exports){
(function() {

// (HTMLImageElement | HTMLCanvasElement, Coord | Array, Object, Array)
function bfs(img, startCoord, eventMap, blacklist) {
    var queue = _is('Array', startCoord) ? startCoord : [startCoord];

    if (_isImgLoaded(img)) {
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

    if (blacklist !== undefined) {
        blacklist.forEach(function(coord) {
            visited[coord.x + '-' + coord.y] = true;
        });
    }

    function visitPx(coord) {
        visited[coord.x + '-' + coord.y] = true;
        if (eventMap !== undefined && eventMap.onvisit !== undefined) {
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
        if (stopMainLoop) { break mainLoop; }

        var coord = queue.shift(),
            colPos = _getColorPositionByXY(coord, imgSize),
            col = [imgCols[colPos], imgCols[colPos+1], imgCols[colPos+2], imgCols[colPos+3]],
            px = { coord: coord, color: col },
            nPxs = _getNeighborPixels(coord, imgSize, imgCols);

        for (var i = 0; i < nPxs.length; i++) {
            var nPx = nPxs[i];
            if (visited[nPx.coord.x + '-' + nPx.coord.y] !== true) {
                visitPx(nPx.coord);
                if (stopMainLoop) { break mainLoop; }
                if (!skipNeighbords) {
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

    if (coord.x > 0 && coord.y < imgSize.h) { // blPx
        pos = {
            x: coord.x - 1,
            y: coord.y + 1
        };
        res.push({
            coord: pos,
            color: _getColorByXY(pos, imgSize, imgCols)
        });
    }

    if (coord.x > 0) { // lPx
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
    if (img.tagName === 'CANVAS') { return img; }
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

if (typeof module !== 'undefined') module.exports = bfs;
else window.bfs = bfs;

})();
},{}],6:[function(require,module,exports){
/*
 (c) 2013, Vladimir Agafonkin
 RBush, a JavaScript library for high-performance 2D spatial indexing of points and rectangles.
 https://github.com/mourner/rbush
*/

(function () { 'use strict';

function rbush(maxEntries, format) {

    // jshint newcap: false, validthis: true
    if (!(this instanceof rbush)) return new rbush(maxEntries, format);

    // max entries in a node is 9 by default; min node fill is 40% for best performance
    this._maxEntries = Math.max(4, maxEntries || 9);
    this._minEntries = Math.max(2, Math.ceil(this._maxEntries * 0.4));

    if (format) {
        this._initFormat(format);
    }

    this.clear();
}

rbush.prototype = {

    all: function () {
        return this._all(this.data, []);
    },

    search: function (bbox) {

        var node = this.data,
            result = [],
            toBBox = this.toBBox;

        if (!intersects(bbox, node.bbox)) return result;

        var nodesToSearch = [],
            i, len, child, childBBox;

        while (node) {
            for (i = 0, len = node.children.length; i < len; i++) {

                child = node.children[i];
                childBBox = node.leaf ? toBBox(child) : child.bbox;

                if (intersects(bbox, childBBox)) {
                    if (node.leaf) result.push(child);
                    else if (contains(bbox, childBBox)) this._all(child, result);
                    else nodesToSearch.push(child);
                }
            }
            node = nodesToSearch.pop();
        }

        return result;
    },

    load: function (data) {
        if (!(data && data.length)) return this;

        if (data.length < this._minEntries) {
            for (var i = 0, len = data.length; i < len; i++) {
                this.insert(data[i]);
            }
            return this;
        }

        // recursively build the tree with the given data from stratch using OMT algorithm
        var node = this._build(data.slice(), 0, data.length - 1, 0);

        if (!this.data.children.length) {
            // save as is if tree is empty
            this.data = node;

        } else if (this.data.height === node.height) {
            // split root if trees have the same height
            this._splitRoot(this.data, node);

        } else {
            if (this.data.height < node.height) {
                // swap trees if inserted one is bigger
                var tmpNode = this.data;
                this.data = node;
                node = tmpNode;
            }

            // insert the small tree into the large tree at appropriate level
            this._insert(node, this.data.height - node.height - 1, true);
        }

        return this;
    },

    insert: function (item) {
        if (item) this._insert(item, this.data.height - 1);
        return this;
    },

    clear: function () {
        this.data = {
            children: [],
            height: 1,
            bbox: empty(),
            leaf: true
        };
        return this;
    },

    remove: function (item) {
        if (!item) return this;

        var node = this.data,
            bbox = this.toBBox(item),
            path = [],
            indexes = [],
            i, parent, index, goingUp;

        // depth-first iterative tree traversal
        while (node || path.length) {

            if (!node) { // go up
                node = path.pop();
                parent = path[path.length - 1];
                i = indexes.pop();
                goingUp = true;
            }

            if (node.leaf) { // check current node
                index = node.children.indexOf(item);

                if (index !== -1) {
                    // item found, remove the item and condense tree upwards
                    node.children.splice(index, 1);
                    path.push(node);
                    this._condense(path);
                    return this;
                }
            }

            if (!goingUp && !node.leaf && contains(node.bbox, bbox)) { // go down
                path.push(node);
                indexes.push(i);
                i = 0;
                parent = node;
                node = node.children[0];

            } else if (parent) { // go right
                i++;
                node = parent.children[i];
                goingUp = false;

            } else node = null; // nothing found
        }

        return this;
    },

    toBBox: function (item) { return item; },

    compareMinX: function (a, b) { return a[0] - b[0]; },
    compareMinY: function (a, b) { return a[1] - b[1]; },

    toJSON: function () { return this.data; },

    fromJSON: function (data) {
        this.data = data;
        return this;
    },

    _all: function (node, result) {
        var nodesToSearch = [];
        while (node) {
            if (node.leaf) result.push.apply(result, node.children);
            else nodesToSearch.push.apply(nodesToSearch, node.children);

            node = nodesToSearch.pop();
        }
        return result;
    },

    _build: function (items, left, right, height) {

        var N = right - left + 1,
            M = this._maxEntries,
            node;

        if (N <= M) {
            // reached leaf level; return leaf
            node = {
                children: items.slice(left, right + 1),
                height: 1,
                bbox: null,
                leaf: true
            };
            calcBBox(node, this.toBBox);
            return node;
        }

        if (!height) {
            // target height of the bulk-loaded tree
            height = Math.ceil(Math.log(N) / Math.log(M));

            // target number of root entries to maximize storage utilization
            M = Math.ceil(N / Math.pow(M, height - 1));
        }

        // TODO eliminate recursion?

        node = {
            children: [],
            height: height,
            bbox: null
        };

        // split the items into M mostly square tiles

        var N2 = Math.ceil(N / M),
            N1 = N2 * Math.ceil(Math.sqrt(M)),
            i, j, right2, right3;

        multiSelect(items, left, right, N1, this.compareMinX);

        for (i = left; i <= right; i += N1) {

            right2 = Math.min(i + N1 - 1, right);

            multiSelect(items, i, right2, N2, this.compareMinY);

            for (j = i; j <= right2; j += N2) {

                right3 = Math.min(j + N2 - 1, right2);

                // pack each entry recursively
                node.children.push(this._build(items, j, right3, height - 1));
            }
        }

        calcBBox(node, this.toBBox);

        return node;
    },

    _chooseSubtree: function (bbox, node, level, path) {

        var i, len, child, targetNode, area, enlargement, minArea, minEnlargement;

        while (true) {
            path.push(node);

            if (node.leaf || path.length - 1 === level) break;

            minArea = minEnlargement = Infinity;

            for (i = 0, len = node.children.length; i < len; i++) {
                child = node.children[i];
                area = bboxArea(child.bbox);
                enlargement = enlargedArea(bbox, child.bbox) - area;

                // choose entry with the least area enlargement
                if (enlargement < minEnlargement) {
                    minEnlargement = enlargement;
                    minArea = area < minArea ? area : minArea;
                    targetNode = child;

                } else if (enlargement === minEnlargement) {
                    // otherwise choose one with the smallest area
                    if (area < minArea) {
                        minArea = area;
                        targetNode = child;
                    }
                }
            }

            node = targetNode;
        }

        return node;
    },

    _insert: function (item, level, isNode) {

        var toBBox = this.toBBox,
            bbox = isNode ? item.bbox : toBBox(item),
            insertPath = [];

        // find the best node for accommodating the item, saving all nodes along the path too
        var node = this._chooseSubtree(bbox, this.data, level, insertPath);

        // put the item into the node
        node.children.push(item);
        extend(node.bbox, bbox);

        // split on node overflow; propagate upwards if necessary
        while (level >= 0) {
            if (insertPath[level].children.length > this._maxEntries) {
                this._split(insertPath, level);
                level--;
            } else break;
        }

        // adjust bboxes along the insertion path
        this._adjustParentBBoxes(bbox, insertPath, level);
    },

    // split overflowed node into two
    _split: function (insertPath, level) {

        var node = insertPath[level],
            M = node.children.length,
            m = this._minEntries;

        this._chooseSplitAxis(node, m, M);

        var newNode = {
            children: node.children.splice(this._chooseSplitIndex(node, m, M)),
            height: node.height
        };

        if (node.leaf) newNode.leaf = true;

        calcBBox(node, this.toBBox);
        calcBBox(newNode, this.toBBox);

        if (level) insertPath[level - 1].children.push(newNode);
        else this._splitRoot(node, newNode);
    },

    _splitRoot: function (node, newNode) {
        // split root node
        this.data = {
            children: [node, newNode],
            height: node.height + 1
        };
        calcBBox(this.data, this.toBBox);
    },

    _chooseSplitIndex: function (node, m, M) {

        var i, bbox1, bbox2, overlap, area, minOverlap, minArea, index;

        minOverlap = minArea = Infinity;

        for (i = m; i <= M - m; i++) {
            bbox1 = distBBox(node, 0, i, this.toBBox);
            bbox2 = distBBox(node, i, M, this.toBBox);

            overlap = intersectionArea(bbox1, bbox2);
            area = bboxArea(bbox1) + bboxArea(bbox2);

            // choose distribution with minimum overlap
            if (overlap < minOverlap) {
                minOverlap = overlap;
                index = i;

                minArea = area < minArea ? area : minArea;

            } else if (overlap === minOverlap) {
                // otherwise choose distribution with minimum area
                if (area < minArea) {
                    minArea = area;
                    index = i;
                }
            }
        }

        return index;
    },

    // sorts node children by the best axis for split
    _chooseSplitAxis: function (node, m, M) {

        var compareMinX = node.leaf ? this.compareMinX : compareNodeMinX,
            compareMinY = node.leaf ? this.compareMinY : compareNodeMinY,
            xMargin = this._allDistMargin(node, m, M, compareMinX),
            yMargin = this._allDistMargin(node, m, M, compareMinY);

        // if total distributions margin value is minimal for x, sort by minX,
        // otherwise it's already sorted by minY
        if (xMargin < yMargin) node.children.sort(compareMinX);
    },

    // total margin of all possible split distributions where each node is at least m full
    _allDistMargin: function (node, m, M, compare) {

        node.children.sort(compare);

        var toBBox = this.toBBox,
            leftBBox = distBBox(node, 0, m, toBBox),
            rightBBox = distBBox(node, M - m, M, toBBox),
            margin = bboxMargin(leftBBox) + bboxMargin(rightBBox),
            i, child;

        for (i = m; i < M - m; i++) {
            child = node.children[i];
            extend(leftBBox, node.leaf ? toBBox(child) : child.bbox);
            margin += bboxMargin(leftBBox);
        }

        for (i = M - m - 1; i >= m; i--) {
            child = node.children[i];
            extend(rightBBox, node.leaf ? toBBox(child) : child.bbox);
            margin += bboxMargin(rightBBox);
        }

        return margin;
    },

    _adjustParentBBoxes: function (bbox, path, level) {
        // adjust bboxes along the given tree path
        for (var i = level; i >= 0; i--) {
            extend(path[i].bbox, bbox);
        }
    },

    _condense: function (path) {
        // go through the path, removing empty nodes and updating bboxes
        for (var i = path.length - 1, siblings; i >= 0; i--) {
            if (path[i].children.length === 0) {
                if (i > 0) {
                    siblings = path[i - 1].children;
                    siblings.splice(siblings.indexOf(path[i]), 1);

                } else this.clear();

            } else calcBBox(path[i], this.toBBox);
        }
    },

    _initFormat: function (format) {
        // data format (minX, minY, maxX, maxY accessors)

        // uses eval-type function compilation instead of just accepting a toBBox function
        // because the algorithms are very sensitive to sorting functions performance,
        // so they should be dead simple and without inner calls

        // jshint evil: true

        var compareArr = ['return a', ' - b', ';'];

        this.compareMinX = new Function('a', 'b', compareArr.join(format[0]));
        this.compareMinY = new Function('a', 'b', compareArr.join(format[1]));

        this.toBBox = new Function('a', 'return [a' + format.join(', a') + '];');
    }
};


// calculate node's bbox from bboxes of its children
function calcBBox(node, toBBox) {
    node.bbox = distBBox(node, 0, node.children.length, toBBox);
}

// min bounding rectangle of node children from k to p-1
function distBBox(node, k, p, toBBox) {
    var bbox = empty();

    for (var i = k, child; i < p; i++) {
        child = node.children[i];
        extend(bbox, node.leaf ? toBBox(child) : child.bbox);
    }

    return bbox;
}

function empty() { return [Infinity, Infinity, -Infinity, -Infinity]; }

function extend(a, b) {
    a[0] = Math.min(a[0], b[0]);
    a[1] = Math.min(a[1], b[1]);
    a[2] = Math.max(a[2], b[2]);
    a[3] = Math.max(a[3], b[3]);
    return a;
}

function compareNodeMinX(a, b) { return a.bbox[0] - b.bbox[0]; }
function compareNodeMinY(a, b) { return a.bbox[1] - b.bbox[1]; }

function bboxArea(a)   { return (a[2] - a[0]) * (a[3] - a[1]); }
function bboxMargin(a) { return (a[2] - a[0]) + (a[3] - a[1]); }

function enlargedArea(a, b) {
    return (Math.max(b[2], a[2]) - Math.min(b[0], a[0])) *
           (Math.max(b[3], a[3]) - Math.min(b[1], a[1]));
}

function intersectionArea (a, b) {
    var minX = Math.max(a[0], b[0]),
        minY = Math.max(a[1], b[1]),
        maxX = Math.min(a[2], b[2]),
        maxY = Math.min(a[3], b[3]);

    return Math.max(0, maxX - minX) *
           Math.max(0, maxY - minY);
}

function contains(a, b) {
    return a[0] <= b[0] &&
           a[1] <= b[1] &&
           b[2] <= a[2] &&
           b[3] <= a[3];
}

function intersects (a, b) {
    return b[0] <= a[2] &&
           b[1] <= a[3] &&
           b[2] >= a[0] &&
           b[3] >= a[1];
}

// sort an array so that items come in groups of n unsorted items, with groups sorted between each other;
// combines selection algorithm with binary divide & conquer approach

function multiSelect(arr, left, right, n, compare) {
    var stack = [left, right],
        mid;

    while (stack.length) {
        right = stack.pop();
        left = stack.pop();

        if (right - left <= n) continue;

        mid = left + Math.ceil((right - left) / n / 2) * n;
        select(arr, left, right, mid, compare);

        stack.push(left, mid, mid, right);
    }
}

// sort array between left and right (inclusive) so that the smallest k elements come first (unordered)
function select(arr, left, right, k, compare) {
    var n, i, z, s, sd, newLeft, newRight, t, j;

    while (right > left) {
        if (right - left > 600) {
            n = right - left + 1;
            i = k - left + 1;
            z = Math.log(n);
            s = 0.5 * Math.exp(2 * z / 3);
            sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (i - n / 2 < 0 ? -1 : 1);
            newLeft = Math.max(left, Math.floor(k - i * s / n + sd));
            newRight = Math.min(right, Math.floor(k + (n - i) * s / n + sd));
            select(arr, newLeft, newRight, k, compare);
        }

        t = arr[k];
        i = left;
        j = right;

        swap(arr, left, k);
        if (compare(arr[right], t) > 0) swap(arr, left, right);

        while (i < j) {
            swap(arr, i, j);
            i++;
            j--;
            while (compare(arr[i], t) < 0) i++;
            while (compare(arr[j], t) > 0) j--;
        }

        if (compare(arr[left], t) === 0) swap(arr, left, j);
        else {
            j++;
            swap(arr, j, right);
        }

        if (j <= k) left = j + 1;
        if (k <= j) right = j - 1;
    }
}

function swap(arr, i, j) {
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
}


// export as AMD/CommonJS module or global variable
if (typeof define === 'function' && define.amd) define(function() { return rbush; });
else if (typeof module !== 'undefined') module.exports = rbush;
else if (typeof self !== 'undefined') self.rbush = rbush;
else window.rbush = rbush;

})();

},{}],7:[function(require,module,exports){
/*
 (c) 2014, Andrey Geonya
 Pixfinder, a JavaScript library for image analysis and object detection.
 https://github.com/AndreyGeonya/pixfinder
*/

'use strict';

var rbush = require('rbush'),
    bfs = require('img-bfs'),
    hull = require('hull.js'),
    disjointSet = require('disjoint-set'),
    util = {
        canvas: require('./util/canvas'),
        math: require('./util/math')
    };

// (Object) -> Array
exports.find = function(options) {
    var opt = _default(options),
        canv = util.canvas.wrap(opt.img),
        ctx = canv.getContext('2d'),
        imgSize = { w: canv.width, h: canv.height },
        imgCols = ctx.getImageData(0, 0, imgSize.w, imgSize.h).data,
        colPos = util.canvas.point2ColorPos(opt.startPoint, imgSize),
        ptCol = [imgCols[colPos], imgCols[colPos + 1], imgCols[colPos + 2], imgCols[colPos + 3]],
        tree = rbush(9, ['.x', '.y', '.x', '.y']),
        points = [];

    if (!_pointInObject(ptCol, opt)) { return []; }

    bfs(canv, opt.startPoint, {
        onvisit: function(e) {
            var pt = e.pixel.coord;
            if (_pointInObject(e.pixel.color, opt)) {
                tree.insert(pt);
            } else {
                var bbox = [
                    pt.x - opt.distance, pt.y - opt.distance,
                    pt.x + opt.distance, pt.y + opt.distance
                ];
                if (tree.search(bbox).length === 0) {
                    e.skip();
                }
            }
        }
    });

    points = tree.all();
    // TODO: support pt.x, pt.y format in hull.js and remove map
    points = points.map(function(pt) {
        return [pt.x, pt.y];
    });
    points = hull(points, 10);
    points = points.map(function(pt) {
        return {x: pt[0], y: pt[1]};
    });

    return points;
}

exports.findAll = function(options) {
    var opt = _default(options),
        canv = util.canvas.wrap(opt.img),
        ctx = canv.getContext('2d'),
        objectPts, objects;

    objectPts = _objectsPoints(canv, opt.colors, opt.accuracy, opt.tolerance, opt.fill);
    objects = _splitByDist(objectPts, opt.distance);
    objects = opt.clearNoise ? _clearNoise(objects, opt.clearNoise) : objects;

    objects.forEach(function(points, idx) {
        // TODO: support pt.x, pt.y format in hull.js and remove map
        points = points.map(function(pt) {
            return [pt.x, pt.y];
        });
        points = hull(points, 10);
        objects[idx] = points.map(function(pt) {
            return {x: pt[0], y: pt[1]};
        });
    });

    return objects;
}

// (Object) -> Object
function _default(options) {
    var opt = options;

    opt.accuracy = opt.accuracy || 2;
    opt.distance = opt.distance || 10;
    opt.tolerance = opt.tolerance || 50;
    opt.fill = opt.fill || false;
    opt.colors = opt.colors.map(util.canvas.hex2Rgb);
    opt.clearNoise = opt.clearNoise || false;

    return opt;
}

// (Array, Object) -> Boolean
function _pointInObject(ptColor, options) {
    return util.canvas.colorInColors(ptColor, options.colors, options.tolerance);
}

// (HTMLCanvasElement, Array, Number, Number, Boolean) -> Array
function _objectsPoints(canvas, colors, accuracy, tolerance, fill) {
    var result = [],
        ctx = canvas.getContext('2d'),
        imgSize = { w: canvas.width, h: canvas.height },
        imgCols = ctx.getImageData(0, 0, imgSize.w, imgSize.h).data;

    for (var i = 0; i < imgCols.length; i += (4 * accuracy)) { // 4 - rgba
        var ptCol = [imgCols[i], imgCols[i + 1], imgCols[i + 2], imgCols[i + 3]],
            nCols = util.canvas.neighborColors(i, imgCols, imgSize),
            pt = util.canvas.colorPos2Point(i, imgSize);

        // skip if pt is inner pixel of the feature (not fill)
        if (!fill && util.canvas.colorInAllColors(ptCol, nCols, tolerance)) {
            continue;
        }

        // is it pixel of the feature?
        if(util.canvas.colorInColors(ptCol, colors, tolerance)) {
            result.push(pt);
        }
    }

    return result;
}

// (Array, Number) -> Array
function _splitByDist(points, dist) {
    var set = disjointSet(),
        objects;

    // TODO: O(N^2) should be optimized
    // May be there is reason to rethink algorithm and use
    // Shared Nearest Neighbor Clustering instead of _splitByDist?
    for (var i = 0; i < points.length; i++) {
        set.add(points[i]);
        for (var j = i; j >= 0; j--) {
            if (util.math.dist(points[i], points[j]) <= dist) {
                if (!set.connected(points[i], points[j])) {
                    set.union(points[i], points[j]);
                }
            }
        }
    }
    objects = set.extract();
    set.destroy();

    return objects;
}

// (Array, Number) -> Array
function _clearNoise(objects, noise) {
    return objects.filter(function(obj) {
        return obj.length >= noise;
    });
}
},{"./util/canvas":8,"./util/math":9,"disjoint-set":1,"hull.js":3,"img-bfs":5,"rbush":6}],8:[function(require,module,exports){
'use strict';

// (HTMLImageElement) -> HTMLCanvasElement
function wrap(img) {
    var canv = document.createElement('canvas');
    canv.width = img.width;
    canv.height = img.height;
    canv.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
    return canv;
}

// (Number, Object) -> Point
function colorPos2Point(colPos, imgSize) {
    var pt = {x: 0, y: 0};
    pt.y = parseInt(colPos / (imgSize.w * 4));
    pt.x = colPos / 4 - pt.y * imgSize.w;
    return pt;
}

// (Point, Object) -> Number
function point2ColorPos(pt, imgSize) {
    return ((pt.y - 1) * imgSize.w * 4) + (pt.x * 4 - 4);
}

// (Number, Array, Object) -> Array
function neighborColors(colPos, imgCols, imgSize) {
    var res = [],
        tlPos, tPos, trPos, rPos,
        brPos, bPos, blPos, lPos,
        pt = colorPos2Point(colPos, imgSize);

    if (pt.x > 0 && pt.y > 0) {
        tlPos = colPos - 4 - imgSize.w*4;
        res.push([ // top left color
            imgCols[tlPos],
            imgCols[tlPos+1],
            imgCols[tlPos+2],
            imgCols[tlPos+3]
        ]);
    }

    if (pt.y > 0) {
        tPos = colPos - imgSize.w*4;
        res.push([ // top color
            imgCols[tPos],
            imgCols[tPos+1],
            imgCols[tPos+2],
            imgCols[tPos+3]
        ]);
    }

    if (pt.x < imgSize.w && pt.y > 0) {
        trPos = colPos - imgSize.w*4 + 4;
        res.push([ // top right color
            imgCols[trPos],
            imgCols[trPos+1],
            imgCols[trPos+2],
            imgCols[trPos+3]
        ]);
    }

    if (pt.x < imgSize.w) {
        rPos = colPos + 4;
        res.push([ // right color
            imgCols[rPos],
            imgCols[rPos+1],
            imgCols[rPos+2],
            imgCols[rPos+3]
        ]);
    }

    if (pt.x < imgSize.w && pt.y < imgSize.h) {
        brPos = colPos + imgSize.w*4 + 4;
        res.push([ // bottom right color
            imgCols[brPos],
            imgCols[brPos+1],
            imgCols[brPos+2],
            imgCols[brPos+3]
        ]);
    }

    if (pt.y < imgSize.h) {
        bPos = colPos + imgSize.w*4;
        res.push([ // bottom color
            imgCols[bPos],
            imgCols[bPos+1],
            imgCols[bPos+2],
            imgCols[bPos+3]
        ]);
    }

    if (pt.x > 0 && pt.y < imgSize.h) {
        blPos = colPos + imgSize.w*4 - 4;
        res.push([ // bottom left color
            imgCols[blPos],
            imgCols[blPos+1],
            imgCols[blPos+2],
            imgCols[blPos+3]
        ]);
    }

    if (pt.x > 0) {
        lPos = colPos - 4;
        res.push([ // left color
            imgCols[lPos],
            imgCols[lPos+1],
            imgCols[lPos+2],
            imgCols[lPos+3]
        ]);
    }

    return res;
}

// (String) -> Array
function hex2Rgb(hex) {
    var num = parseInt(hex, 16);
    return [num >> 16, num >> 8 & 255, num & 255]; // rgb
}

// (Array) -> String
function rgb2Hex(rgb) {
    return ((rgb[2] | rgb[1] << 8 | rgb[0] << 16) | 1 << 24)
        .toString(16).slice(1);
}

// (Array, Array, Number) -> Boolean
function similarColors(rgb1, rgb2, tolerance) {
    var r = Math.abs(rgb1[0] - rgb2[0]) < tolerance,
        g = Math.abs(rgb1[1] - rgb2[1]) < tolerance,
        b = Math.abs(rgb1[2] - rgb2[2]) < tolerance;
    return (r && g && b);
}

// (Array, Array, Number) -> Boolean
function colorInAllColors(col, cols, tolerance) {
    for (var i = 0; i < cols.length; i++) {
        if (similarColors(col, cols[i], tolerance) === false) {
            return false;
        }
    }
    return true;
}

// (Array, Array, Number) -> Boolean
function colorInColors(col, cols, tolerance) {
    for (var i = 0; i < cols.length; i++) {
        if (similarColors(col, cols[i], tolerance) === true) {
            return true;
        }
    }
    return false;
}

exports.wrap = wrap;
exports.colorPos2Point = colorPos2Point;
exports.point2ColorPos = point2ColorPos;
exports.neighborColors = neighborColors;
exports.hex2Rgb = hex2Rgb;
exports.rgb2Hex = rgb2Hex;
exports.similarColors = similarColors;
exports.colorInColors = colorInColors;
exports.colorInAllColors = colorInAllColors;
},{}],9:[function(require,module,exports){
'use strict';

function dist(pt1, pt2) { // (Point, Point) -> Number
    return Math.sqrt(
        Math.pow(pt2.x - pt1.x, 2) + Math.pow(pt2.y - pt1.y, 2)
    );
}

exports.dist = dist;
},{}]},{},[7])(7)
});