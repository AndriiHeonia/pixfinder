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