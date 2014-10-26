(function() { 'use strict';

    window.Pixfinder = {

        getObject: function(options) {
            var opt = _getCommonDefaults(options),
                canv = Pixfinder.Util.Canvas.wrapImgByCanvas(opt.img),
                ctx = canv.getContext('2d'),
                imgSize = { w: canv.width, h: canv.height },
                imgCols = ctx.getImageData(0, 0, imgSize.w, imgSize.h).data,
                colPos = Pixfinder.Util.Canvas.getColorPositionByPixel(opt.startPixel, imgSize),
                pxCol = [imgCols[colPos], imgCols[colPos+1], imgCols[colPos+2], imgCols[colPos+3]],
                isStartPxInObject = false,
                tree = rbush(9, ['.x', '.y', '.x', '.y']),
                result = [];

            isStartPxInObject = _isColorInColors(
                Pixfinder.Util.Color.areSimilar,
                pxCol,
                opt.colors,
                opt.tolerance
            );
            if (!isStartPxInObject) { return []; }

            bfs(canv, opt.startPixel, {
                onvisit: function(e) {
                    var px = e.pixel.coord;
                    if (_isColorInColors(
                        Pixfinder.Util.Color.areSimilar,
                        e.pixel.color,
                        options.colors,
                        options.tolerance
                    )) {
                        tree.insert(px);
                    } else {
                        var bbox = [
                            px.x - opt.distance, px.y - opt.distance,
                            px.x + opt.distance, px.y + opt.distance
                        ];
                        if (tree.search(bbox).length === 0) {
                            e.skip();
                        }
                    }
                }
            });

            result = tree.all();
            result = result.map(function(px) {
                return [px.x, px.y];
            });
            result = hull(result, 9);
            result = result.map(function(px) {
                return {x: px[0], y: px[1]};
            });

            return result;      
        },

        getObjects: function(options) {
            var canv,
                objects,
                regionsPxs,
                opt = _getCommonDefaults(options);

            opt.clearNoise = opt.clearNoise || false;

            canv = Pixfinder.Util.Canvas.wrapImgByCanvas(opt.img);

            regionsPxs = _getRegionsPixels(
                canv,
                opt.colors,
                opt.accuracy,
                opt.tolerance,
                opt.fill
            );

            objects = _splitByDist(regionsPxs, opt.distance);

            objects = objects.map(function(object) {
                return poly2cw(object, 'tsp');
            });

            objects = opt.clearNoise ?
                _clearNoise(objects, opt.clearNoise) : objects;

            return objects;
        }
    };


    // (Object) -> Object
    function _getCommonDefaults(options) {
        var opt = options;

        opt.accuracy = opt.accuracy || 2;
        opt.distance = opt.distance || 10;
        opt.tolerance = opt.tolerance || 50;
        opt.fill = opt.fill || false;
        opt.colors = opt.colors.map(Pixfinder.Util.Color.toRGB);

        return opt;
    }

    // (HTMLCanvasElement, Array, Number, Number, Boolean) -> Array
    function _getRegionsPixels(canvas, colors, accuracy, tolerance, fill) {
        var res = [],
            ctx = canvas.getContext('2d'),
            imgSize = {
                w: canvas.width,
                h: canvas.height
            },
            imgCols = ctx.getImageData(0, 0, imgSize.w, imgSize.h).data;

        for (var i = 0; i < imgCols.length; i+=(4*accuracy)) { // 4 - rgba
            var pxCol = [imgCols[i], imgCols[i+1], imgCols[i+2], imgCols[i+3]],
                nPxCols = Pixfinder.Util.Canvas.getNeighborPixelsColors(i, imgCols, {
                    w: canvas.width,
                    h: canvas.height
                }),
                px = Pixfinder.Util.Canvas.getPixelByColorPosition(i, imgSize);

            // skip if px is inner pixel of the feature (not fill)
            if (!fill &&
                _areColorsEqualToColor(
                    Pixfinder.Util.Color.areSimilar,
                    nPxCols,
                    pxCol,
                    tolerance) === true) {
                continue;
            }

            // is it pixel of the feature?
            if(_isColorInColors(
                Pixfinder.Util.Color.areSimilar,
                pxCol,
                colors,
                tolerance
            )) {
                res.push(px);
            }
        }

        return res;
    }

    // (Function, Array, Array, Number) -> Boolean
    function _areColorsEqualToColor(checkingFunc, cols, col, tolerance) {
        for (var i = 0; i < cols.length; i++) {
            if (checkingFunc(col, cols[i], tolerance) === false) {
                return false;
            }
        }
        return true;
    }

    // (Function, Array, Array, Number) -> Boolean
    function _isColorInColors(checkingFunc, col, cols, tolerance) {
        for (var i = 0; i < cols.length; i++) {
            if (checkingFunc(col, cols[i], tolerance) === true) {
                return true;
            }
        }
        return false;
    }

    // (Array, Number) -> Array
    function _splitByDist(pixels, dist) {
        var set = disjointSet(),
            res;

        // TODO: O(N^2) should be optimized
        // May be there is reason to rethink algorithm and use
        // Shared Nearest Neighbor Clustering instead of _splitByDist?
        for (var i = 0; i < pixels.length; i++) {
            set.add(pixels[i]);
            for (var j = i; j >= 0; j--) {
                if (Pixfinder.Util.Math.getDistance(pixels[i], pixels[j]) <= dist) {
                    if (!set.connected(pixels[i], pixels[j])) {
                        set.union(pixels[i], pixels[j]);
                    }
                }
            }
        }

        res = set.extract();

        set.destroy();
        return res;
    }

    // (Array, Number) -> Array
    function _clearNoise(objects, noise) {
        return objects.filter(function(el) {
            return el.length >= noise;
        });
    }

})();