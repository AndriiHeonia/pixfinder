var Pixfinder = function (options) {
    var opt = options;

    opt.accuracy = opt.accuracy || 3;
    opt.distance = opt.distance || 15;
    opt.colors = Pixfinder._colorsToRgb(opt.colors);
    opt.img = Object.prototype.toString.call(opt.img) === '[object String]' ?
        document.getElementById(opt.img) : opt.img;

    var processImg = function() {
        var canv = Pixfinder._wrapByCanvas(opt.img);
        var regionsPxs = Pixfinder._getRegionsPixels(canv, opt.colors, opt.accuracy);
        var regions = Pixfinder._splitByDist(regionsPxs, opt.distance);
        if (typeof options.onload !== 'undefined') {
            options.onload(regions);
        }
    }

    if (Pixfinder._isImgLoaded(opt.img)) {
        processImg();
    } else {
        Pixfinder._on('load', opt.img, processImg);
    }
}

Pixfinder._on = function(ev, el, func) {
    if (el.addEventListener) {
        el.addEventListener(ev, func, false); 
    } else if (el.attachEvent)  {
        el.attachEvent('on' + ev, func);
    }
}

Pixfinder._isImgLoaded = function(img) {
    return !(typeof img.naturalWidth !== "undefined" && img.naturalWidth == 0);
}

Pixfinder._colorsToRgb = function(cols) { // (Array) -> Array
    for (var i = 0; i < cols.length; i++) {
        cols[i] = Pixfinder.Util.Color.toRGB(cols[i]);
    };
    return cols;
}

Pixfinder._wrapByCanvas = function(img) { // (HTMLImageElement) -> HTMLCanvasElement
    var canv = document.createElement('canvas');
    canv.width = img.width;
    canv.height = img.height;
    canv.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
    return canv;
}

Pixfinder._getRegionsPixels = function(canvas, colors, accuracy) { // (HTMLCanvasElement, Array, Number) -> Array
    var res = [],
        ctx = canvas.getContext('2d');

    for (var x = 0; x < canvas.width; x = x+accuracy) {
        for (var y = 0; y < canvas.height; y = y+accuracy) {
            var px = { x: x, y: y },
                pxCol = this._getPixelColor(ctx, px),
                nPxs = this._getNeighborPixels(px, {
                    w: canvas.width - accuracy, 
                    h: canvas.height - accuracy
                }, accuracy);
                nPxCols = this._getPixelsColors(ctx, nPxs); // TODO: 1209ms should be optimized

            // skip if px is not a boundary pixel of the feature
            if (this._areColorsEqualToColor(Pixfinder.Util.Color.areEqual, nPxCols, pxCol) === true) {
                continue;
            }

            // is it pixel of the feature?
            if(this._isColorInColors(Pixfinder.Util.Color.areEqual, pxCol, colors)) {
                res.push(px);
            }
        }
    }

    return res;
}

Pixfinder._getPixelColor = function(context, px) { // (CanvasRenderingContext2D, Object) -> Array
    return context.getImageData(px.x, px.y, 1, 1).data;
}

Pixfinder._getNeighborPixels = function(px, imgSize, accuracy) { // (Object, Object) -> Array
    var res = [];

    if (px.x > 0 && px.y > 0) {
        res.push({ x: px.x-accuracy, y: px.y-accuracy }); // tl
    };

    if (px.y > 0) {
        res.push({ x: px.x,   y: px.y-accuracy }); // t
    };

    if (px.x < imgSize.w && px.y > 0) {
        res.push({ x: px.x+accuracy, y: px.y-accuracy }); // tr
    };

    if (px.x < imgSize.w) {
        res.push({ x: px.x+accuracy, y: px.y }); // r
    };

    if (px.x < imgSize.w && px.y < imgSize.h) {
        res.push({ x: px.x+accuracy, y: px.y+accuracy }); // br
    };

    if (px.y < imgSize.h) {
        res.push({ x: px.x, y: px.y+accuracy }); // b
    };

    if (px.x > 0 && px.y < imgSize.h) {
        res.push({ x: px.x-accuracy, y: px.y+accuracy }); // bl
    };

    if (px.x > 0) {
        res.push({ x: px.x-accuracy, y: px.y }); // l
    };

    return res;
}

Pixfinder._getPixelsColors = function(context, pxs) { // (CanvasRenderingContext2D, Array) -> Array
    var list = [];
    for (var i = 0; i < pxs.length; i++) {
        list.push(context.getImageData(pxs[i].x, pxs[i].y, 1, 1).data);
    };
    return list;
}

Pixfinder._areColorsEqualToColor = function(checkingFunc, cols, col) { // (Function, Array, Array) -> Boolean
    for (var i = 0; i < cols.length; i++) {
        if (checkingFunc(col, cols[i]) === false) {
            return false;
        };
    };
    return true;
}

Pixfinder._isColorInColors = function(checkingFunc, col, cols) { // (Function, Array, Array) -> Boolean
    for (var i = 0; i < cols.length; i++) {
        if (checkingFunc(col, cols[i]) === true) {
            return true;
        };
    };
    return false;
}

Pixfinder._splitByDist = function(pixels, dist) { // (Array, Number) -> Array
    var disjointSet = new Pixfinder.Struct.DisjointSet(),
        res;

    //var t0 = new Date();
    for (var i = 0; i < pixels.length; i++) {
        disjointSet.add(pixels[i]);
        for (var j = i; j > 0; j--) {
            disjointSet.add(pixels[j]);
            if (Pixfinder.Util.Math.getDistance(pixels[i], pixels[j]) <= dist) {
                if (!disjointSet.find(pixels[i], pixels[j])) {
                    disjointSet.union(pixels[i], pixels[j]);
                }
            }
        }
    }
    // var t1 = new Date();
    // console.log('_splitByDist loop: ', t1 - t0);

    res = disjointSet.extract();
    disjointSet.destroy();
    return res;
}

var pixfinder = function(options) {
    return new Pixfinder(options);
}