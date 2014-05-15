(function() { 'use strict';

    window.Pixfinder = function (options) {

    var opt = options;
    
    opt.accuracy = opt.accuracy || 2;
    opt.distance = opt.distance || 10;
    opt.tolerance = opt.tolerance || 50;
    opt.fill = opt.fill || false;
    opt.colors = _colorsToRgb(opt.colors);
    opt.img = Object.prototype.toString.call(opt.img) === '[object String]' ?
        document.getElementById(opt.img) : opt.img;

    var processImg = function() {
        var canv = _wrapByCanvas(opt.img),
            regionsPxs = _getRegionsPixels(
                canv,
                opt.colors,
                opt.accuracy,
                opt.tolerance,
                opt.fill
            ),
            edges = _splitByDist(regionsPxs, opt.distance);

        if (typeof options.onload !== 'undefined') {
            options.onload({
                edges: edges
            });
        }
    };

    if (_isImgLoaded(opt.img)) {
        processImg();
    } else {
        opt.img.addEventListener('load', processImg, false);
    }
};

// (HTMLImageElement) -> Boolean
function _isImgLoaded(img) {
    return !(typeof img.naturalWidth !== 'undefined' && img.naturalWidth === 0);
}

// (Array) -> Array
function _colorsToRgb(cols) {
    for (var i = 0; i < cols.length; i++) {
        cols[i] = Pixfinder.Util.Color.toRGB(cols[i]);
    }
    return cols;
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

// (Number, Object) -> Object
function _getPixelByColorPosition(colPos, imgSize) {
    var px = {x: 0, y: 0};
    px.y = parseInt(colPos / (imgSize.w*4));
    px.x = colPos/4 - px.y*imgSize.w;
    return px;
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
    var set = disjointSet(), // jshint ignore:line
        res;

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

window.pixfinder = function(options) {
    return new Pixfinder(options);
};

})();