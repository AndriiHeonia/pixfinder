// TODO: think about clear noise option. See beer example.
var Pixfinder = function (options) {
    var opt = options;
    
    opt.accuracy = opt.accuracy || 3;
    opt.distance = opt.distance || 15;
    opt.tolerance = opt.tolerance || 50;
    opt.colors = Pixfinder._colorsToRgb(opt.colors);
    opt.img = Object.prototype.toString.call(opt.img) === '[object String]' ?
        document.getElementById(opt.img) : opt.img;

    var processImg = function() {
        var canv = Pixfinder._wrapByCanvas(opt.img);
        var t0 = new Date();
        var regionsPxs = Pixfinder._getRegionsPixels(canv, opt.colors, opt.accuracy, opt.tolerance);
        var t1 = new Date();
        console.log('_getRegionsPixels: ', t1 - t0); // 10340 ms. -> 288 ms. Fuck yeah!

        var t0 = new Date();    
        var edges = Pixfinder._splitByDist(regionsPxs, opt.distance); // 52089 ms. -> 2251 ms. Fuxk yeah!
        var t1 = new Date();
        console.log('_splitByDist: ', t1 - t0);

        if (typeof options.onload !== 'undefined') {
            options.onload({
                edges: edges
            });
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

Pixfinder._getRegionsPixels = function(canvas, colors, accuracy, tolerance) { // (HTMLCanvasElement, Array, Number, Number) -> Array
    var res = [],
        ctx = canvas.getContext('2d'),
        imgSize = {
            w: canvas.width,
            h: canvas.height
        },
        imgCols = ctx.getImageData(0, 0, imgSize.w, imgSize.h).data;

    for (var i = 0; i < imgCols.length; i+=(4*accuracy)) { // 4 - rgba
        var pxCol = [imgCols[i], imgCols[i+1], imgCols[i+2], imgCols[i+3]],
            nPxCols = Pixfinder._getNeighborPixelsColors(i, imgCols, {
                w: canvas.width, 
                h: canvas.height
            }, accuracy),
            px = Pixfinder._getPixelByColorPosition(i, imgSize);

        // skip if px is not a boundary pixel of the feature
        if (Pixfinder._areColorsEqualToColor(Pixfinder.Util.Color.areSimilar, nPxCols, pxCol, tolerance) === true) {
            continue;
        }

        // is it pixel of the feature?
        if(Pixfinder._isColorInColors(Pixfinder.Util.Color.areSimilar, pxCol, colors, tolerance)) {
            res.push(px);
        }
    }

    return res;
}

Pixfinder._getPixelByColorPosition = function(colPos, imgSize) { // (Number, Object) -> Object
    px = {x: 0, y: 0};
    px.y = parseInt(colPos / (imgSize.w*4));
    px.x = colPos/4 - px.y*imgSize.w;
    return px;
}

Pixfinder._getNeighborPixelsColors = function(colPos, imgCols, imgSize) { // (Number, Array, Object) -> Array
    var res = [],
        tlPos, tPos, trPos, rPos,
        brPos, bPos, blPos, lPos,
        px = Pixfinder._getPixelByColorPosition(colPos, imgSize);

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
    };

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

Pixfinder._areColorsEqualToColor = function(checkingFunc, cols, col, tolerance) { // (Function, Array, Array, Number) -> Boolean
    for (var i = 0; i < cols.length; i++) {
        if (checkingFunc(col, cols[i], tolerance) === false) {
            return false;
        };
    };
    return true;
}

Pixfinder._isColorInColors = function(checkingFunc, col, cols, tolerance) { // (Function, Array, Array, Number) -> Boolean
    for (var i = 0; i < cols.length; i++) {
        if (checkingFunc(col, cols[i], tolerance) === true) {
            return true;
        };
    };
    return false;
}

Pixfinder._splitByDist = function(pixels, dist) { // (Array, Number) -> Array
    var set = disjointSet(),
        res;

    for (var i = 0; i < pixels.length; i++) {
        set.add(pixels[i]);
        for (var j = i; j >= 0; j--) {
            set.add(pixels[j]);
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

var pixfinder = function(options) {
    return new Pixfinder(options);
}