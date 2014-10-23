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
                borderPxs = [];

            isStartPxInObject = _isColorInColors(
                Pixfinder.Util.Color.areSimilar,
                pxCol,
                opt.colors,
                opt.tolerance
            );
            if (!isStartPxInObject) { return []; }

            borderPxs = _getBorderPxsWithOffset([opt.startPixel], borderPxs, canv, opt);
            borderPxs = borderPxs.map(function(px) {
                return [px.x, px.y];
            });
            borderPxs = hull(borderPxs, 6);
            borderPxs = borderPxs.map(function(px) {
                return {x: px[0], y: px[1]};
            });

            return borderPxs;
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

    var blacklist = {};
    function _getBorderPxs(px, canvas, options) { // (Pixel, HTMLCanvasElement, Object) -> Object
        var result = [];

        if (blacklist[px.x + '-' + px.y] !== true) {
            bfs(canvas, px, {
                onvisit: function(e) {

                    // ctx1.fillStyle="green";
                    // ctx1.beginPath();
                    // ctx1.arc(e.pixel.coord.x, e.pixel.coord.y, 1, 0, 2 * Math.PI, true);
                    // ctx1.fill();
                    // ctx1.closePath();

                    blacklist[e.pixel.coord.x + '-' + e.pixel.coord.y] = true;
                    if (!_isColorInColors(
                        Pixfinder.Util.Color.areSimilar,
                        e.pixel.color,
                        options.colors,
                        options.tolerance
                    )) {
                        result.push(e.pixel.coord);
                        e.skip();
                    }
                }
            });
        }

        // ctx1.fillStyle="red";
        // for (var i = 0; i < result.length; i++) {
        //     ctx1.beginPath();
        //     ctx1.arc(result[i].x, result[i].y, 1, 0, 2 * Math.PI, true);
        //     ctx1.fill();
        //     ctx1.closePath();
        // }

        return result;
    }

    var pixelsAroundBorderBlacklist = {};
    function _getPixelsAroundBorder(borderPxs, imgSize) {
        var result = [];

        Pixfinder.Util.Obj.extend(pixelsAroundBorderBlacklist, blacklist);
        function _notInBlacklist(px) {
            return pixelsAroundBorderBlacklist[px.x + '-' + px.y] !== true;
        }

        borderPxs.forEach(function(px) {
            var nPxs = Pixfinder.Util.Canvas.getNeighborPixels(px, imgSize);
            nPxs = nPxs.filter(_notInBlacklist);
            nPxs.forEach(function(p) {
                 pixelsAroundBorderBlacklist[p.x + '-' + p.y] = true;
            });
            result = result.concat(nPxs);
        });

        return result;
    }

    function _insideRegion(px, imgSize, imgCols, options) {
        var colPos = Pixfinder.Util.Canvas.getColorPositionByPixel(px, imgSize),
            pxCol = [imgCols[colPos], imgCols[colPos+1], imgCols[colPos+2], imgCols[colPos+3]];
        return _isColorInColors(
            Pixfinder.Util.Color.areSimilar,
            pxCol,
            options.colors,
            options.tolerance
        );
    }

    function _getBorderPxsWithOffset(queue, borderPxs, canvas, options) {
        var ctx = canvas.getContext('2d'),
            imgSize = { w: canvas.width, h: canvas.height },
            imgCols = ctx.getImageData(0, 0, imgSize.w, imgSize.h).data,
            borderPxs = borderPxs.concat(_getBorderPxs(queue.pop(), canvas, options)),
            pixelsForQueue = _getPixelsAroundBorder(borderPxs, imgSize, options.distance);
        
        for (var i = 0; i < options.distance; i++) {
            pixelsForQueue = _getPixelsAroundBorder(pixelsForQueue, imgSize);
        }

        pixelsForQueue = pixelsForQueue.filter(function(px) {
            return _insideRegion(px, imgSize, imgCols, options);
        });
        pixelsForQueue = pixelsForQueue.concat(queue);
        
        // ctx1.fillStyle="blue";
        // for (var i = 0; i < pixelsForQueue.length; i++) {
        //     ctx1.beginPath();
        //     ctx1.arc(pixelsForQueue[i].x, pixelsForQueue[i].y, 1, 0, 2 * Math.PI, true);
        //     ctx1.fill();
        //     ctx1.closePath();
        // }
        
        // return borderPxs;

        if (pixelsForQueue.length > 0) {
            return _getBorderPxsWithOffset(pixelsForQueue, borderPxs, canvas, options);
        } else {
            return borderPxs;
        }
    }    


    ///


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