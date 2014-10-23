(function() { 'use strict';

    window.Pixfinder = {

        getObjects: function(options) {
            var canv,
                objects,
                regionsPxs,
                opt = _setCommonDefaults(options);

            opt.clearNoise = opt.clearNoise || false;

            canv = _wrapByCanvas(opt.img);
            console.time('_getRegionsPixels');
            regionsPxs = _getRegionsPixels(
                canv,
                opt.colors,
                opt.accuracy,
                opt.tolerance,
                opt.fill
            );
            console.timeEnd('_getRegionsPixels');

            console.time('_splitByDist');
            objects = _splitByDist(regionsPxs, opt.distance);
            console.timeEnd('_splitByDist');

            objects = objects.map(function(object) {
                return poly2cw(object, 'tsp');
            });

            objects = opt.clearNoise ?
                _clearNoise(objects, opt.clearNoise) : objects;

            return objects;
        },

        getObject: function(options) {
            var opt = _setCommonDefaults(options),
                canv = _wrapByCanvas(opt.img),
                ctx = canv.getContext('2d'),
                imgSize = { w: canv.width, h: canv.height },
                imgCols = ctx.getImageData(0, 0, imgSize.w, imgSize.h).data,
                colPos = _getColorPositionByPixel(opt.startPixel, imgSize),
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

            var blacklist = {};
            function _bfs(px) {
                if (blacklist[px.x + '-' + px.y] === true) {
                    return;
                }
                bfs(canv, px, {
                    onvisit: function(e) {
                        blacklist[e.pixel.coord.x + '-' + e.pixel.coord.y] = true;
                        if (!_isColorInColors(
                            Pixfinder.Util.Color.areSimilar,
                            e.pixel.color,
                            opt.colors,
                            opt.tolerance
                        )) {
                            borderPxs.push(e.pixel.coord);
                            e.skip();
                        }
                    }
                });
            }

            function insideObject(px) {
                var colPos = _getColorPositionByPixel(px, imgSize),
                    pxCol = [imgCols[colPos], imgCols[colPos+1], imgCols[colPos+2], imgCols[colPos+3]];
                return _isColorInColors(
                    Pixfinder.Util.Color.areSimilar,
                    pxCol,
                    opt.colors,
                    opt.tolerance
                );
            }

            // function notInBlacklist(px) {
            //     return blacklist[px.x + '-' + px.y] !== true;
            // }

            function notInBlacklistAndInsideObject(px) {
                return notInBlacklist(px) && insideObject(px);
            }

            function searchBorderPxs(queue) {
                // get borderPxs
                _bfs(queue.pop());
                console.log('borderPxs: ', borderPxs.length);

                // get pxs for queue
                var pixelsForQueue = [];
                var pixelsForQueueBlacklist = {};
                Pixfinder.Util.Obj.extend(pixelsForQueueBlacklist, blacklist);
                function notInBlacklist(px) {
                    return pixelsForQueueBlacklist[px.x + '-' + px.y] !== true;
                }
                function notInBlacklistAndInsideObject(px) {
                    return notInBlacklist(px) && insideObject(px);
                }
                borderPxs.forEach(function(px) {
                    var nPxs = _getNeighborPixels(px, imgSize);
                    nPxs = nPxs.filter(notInBlacklist);
                    nPxs.forEach(function(p) {
                         pixelsForQueueBlacklist[p.x + '-' + p.y] = true;
                    });
                    pixelsForQueue = pixelsForQueue.concat(nPxs);
                });
                for (var i = 0; i < opt.distance - 1; i++) {
                    pixelsForQueue.forEach(function(px) {
                        var nPxs = _getNeighborPixels(px, imgSize);
                        nPxs = nPxs.filter(notInBlacklist);
                        nPxs.forEach(function(p) {
                             pixelsForQueueBlacklist[p.x + '-' + p.y] = true;
                        });
                        pixelsForQueue = pixelsForQueue.concat(nPxs);
                    });
                }
                pixelsForQueue = pixelsForQueue.filter(insideObject);

                // draw pxs for queue                
                ctx1.fillStyle="blue";
                for (var i = 0; i < pixelsForQueue.length; i++) {
                    ctx1.beginPath();
                    ctx1.arc(pixelsForQueue[i].x, pixelsForQueue[i].y, 1, 0, 2 * Math.PI, true);
                    ctx1.fill();
                    ctx1.closePath();
                }

                // draw border
                ctx1.fillStyle="red";
                for (var i = 0; i < borderPxs.length; i++) {
                    ctx1.beginPath();
                    ctx1.arc(borderPxs[i].x, borderPxs[i].y, 1, 0, 2 * Math.PI, true);
                    ctx1.fill();
                    ctx1.closePath();
                }

                // var q = pixelsForQueue.concat(queue);
                console.log('pixelsForQueue', pixelsForQueue.length);
                if (pixelsForQueue.length > 0) {
                    searchBorderPxs(pixelsForQueue);
                }
            }

            searchBorderPxs([opt.startPixel]);
            
            borderPxs = borderPxs.map(function(px) {
                return [px.x, px.y];
            });
            borderPxs = hull(borderPxs, opt.distance);
            borderPxs = borderPxs.map(function(px) {
                return {x: px[0], y: px[1]};
            });

            return borderPxs;
        }

    };

    // (Object) -> Object
    function _setCommonDefaults(options) {
        var opt = options;

        opt.accuracy = opt.accuracy || 2;
        opt.distance = opt.distance || 10;
        opt.tolerance = opt.tolerance || 50;
        opt.fill = opt.fill || false;
        opt.colors = opt.colors.map(Pixfinder.Util.Color.toRGB);

        return opt;
    }

    // (HTMLImageElement) -> HTMLCanvasElement
    function _wrapByCanvas(img) {
        var canv = document.createElement('canvas');
        canv.width = img.width;
        canv.height = img.height;
        canv.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
        return canv;
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
                nPxCols = _getNeighborPixelsColors(i, imgCols, {
                    w: canvas.width,
                    h: canvas.height
                }),
                px = _getPixelByColorPosition(i, imgSize);

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

    // (Number, Object) -> Pixel
    function _getPixelByColorPosition(colPos, imgSize) {
        var px = {x: 0, y: 0};
        px.y = parseInt(colPos / (imgSize.w*4));
        px.x = colPos/4 - px.y*imgSize.w;
        return px;
    }

    // (Pixel, Object) -> Number
    function _getColorPositionByPixel(px, imgSize) {
        return ((px.y - 1) * imgSize.w * 4) + (px.x * 4 - 4);
    }

    function _getNeighborPixels(px, imgSize) {
        var nPxs = [],
            t   = {x: px.x, y: px.y - 1},
            tr  = {x: px.x + 1, y: px.y - 1},
            r   = {x: px.x + 1, y: px.y},
            br  = {x: px.x + 1, y: px.y + 1},
            b   = {x: px.x, y: px.y + 1},
            bl  = {x: px.x - 1, y: px.y + 1},
            l   = {x: px.x - 1, y: px.y},
            tl  = {x: px.x - 1, y: px.y - 1};

        if (px.y > 0) {
            nPxs.push(t);
            if (px.x < imgSize.w) {
                nPxs.push(tr);
            }
        }
        if (px.x < imgSize.w) {
            nPxs.push(r);
            if (px.y < imgSize.h) {
                nPxs.push(br);
            }
        }
        if (px.y < imgSize.h) {
            nPxs.push(b);
            if (px.x > 0) {
                nPxs.push(bl);
            }
        }
        if (px.x > 0) {
            nPxs.push(l);
            if (px.y > 0) {
                nPxs.push(tl);
            }
        }

        return nPxs;
    }

    // (Number, Array, Object) -> Array
    function _getNeighborPixelsColors(colPos, imgCols, imgSize) {
        var res = [],
            tlPos, tPos, trPos, rPos,
            brPos, bPos, blPos, lPos,
            px = _getPixelByColorPosition(colPos, imgSize);

        if (px.x > 0 && px.y > 0) {
            tlPos = colPos - 4 - imgSize.w*4;
            res.push([ // top left color
                imgCols[tlPos],
                imgCols[tlPos+1],
                imgCols[tlPos+2],
                imgCols[tlPos+3]
            ]);
        }

        if (px.y > 0) {
            tPos = colPos - imgSize.w*4;
            res.push([ // top color
                imgCols[tPos],
                imgCols[tPos+1],
                imgCols[tPos+2],
                imgCols[tPos+3]
            ]);
        }

        if (px.x < imgSize.w && px.y > 0) {
            trPos = colPos - imgSize.w*4 + 4;
            res.push([ // top right color
                imgCols[trPos],
                imgCols[trPos+1],
                imgCols[trPos+2],
                imgCols[trPos+3]
            ]);
        }

        if (px.x < imgSize.w) {
            rPos = colPos + 4;
            res.push([ // right color
                imgCols[rPos],
                imgCols[rPos+1],
                imgCols[rPos+2],
                imgCols[rPos+3]
            ]);
        }

        if (px.x < imgSize.w && px.y < imgSize.h) {
            brPos = colPos + imgSize.w*4 + 4;
            res.push([ // bottom right color
                imgCols[brPos],
                imgCols[brPos+1],
                imgCols[brPos+2],
                imgCols[brPos+3]
            ]);
        }

        if (px.y < imgSize.h) {
            bPos = colPos + imgSize.w*4;
            res.push([ // bottom color
                imgCols[bPos],
                imgCols[bPos+1],
                imgCols[bPos+2],
                imgCols[bPos+3]
            ]);
        }

        if (px.x > 0 && px.y < imgSize.h) {
            blPos = colPos + imgSize.w*4 - 4;
            res.push([ // bottom left color
                imgCols[blPos],
                imgCols[blPos+1],
                imgCols[blPos+2],
                imgCols[blPos+3]
            ]);
        }

        if (px.x > 0) {
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