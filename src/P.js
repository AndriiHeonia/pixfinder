var P = {

    getRegionsByColors: function (img, colors, options) { // (HTMLImageElement, Array, Object) -> Object
        var opt = options || {},
            canvas = this._wrapByCanvas(img),
            colors = this._colorsToRgb(colors),
            regionsPxs, regions;

        opt.accuracy = opt.accuracy || 3;

        var t0 = new Date();
        regionsPxs = this._getRegionsPixels(canvas, colors, opt.accuracy);
        var t1 = new Date();
        console.log('_getRegionsPixels: ', t1 - t0);

        var t0 = new Date();
        regions = this._splitByDist(regionsPxs, 10);
        var t1 = new Date();
        console.log('_splitByDist: ', t1 - t0);

        return regions;
    },

    _getRegionsPixels: function (canvas, colors, accuracy) { // (HTMLCanvasElement, Array, Number) -> Array
        var res = [],
            ctx = canvas.getContext('2d');

        for (var x = 0; x < img.clientWidth; x = x+accuracy) {
            for (var y = 0; y < img.clientHeight; y = y+accuracy) {
                var px = { x: x, y: y },
                    pxCol = this._getPixelColor(ctx, px),
                    nPxs = this._getNeighborPixels(px, {
                        w: canvas.width - accuracy, 
                        h: canvas.height - accuracy
                    }, accuracy);
                    nPxCols = this._getPixelsColors(ctx, nPxs); // TODO: 1209ms should be optimized

                // skip if px is not a boundary pixel of the feature
                if (this._areColorsEqualToColor(P.Util.Color.areEqual, nPxCols, pxCol) === true) {
                    continue;
                }

                // is it pixel of the feature?
                if(this._isColorInColors(P.Util.Color.areEqual, pxCol, colors)) {
                    res.push(px);
                }
            }
        }

        return res;
    },

    // TODO: should be optimized
    _splitByDist: function (pixels, dist) { // (Array, Number) -> Array
        var disjointSet = new P.Struct.DisjointSet(),
            res;

        //var t0 = new Date();
        for (var i = 0; i < pixels.length; i++) {
            disjointSet.add(pixels[i]);
            for (var j = 0; j < pixels.length; j++) {
                disjointSet.add(pixels[j]);
                if (P.Util.Math.getDistance(pixels[i], pixels[j]) <= dist) {
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
    },

    _wrapByCanvas: function (img) { // (HTMLImageElement) -> HTMLCanvasElement
        var canv = document.createElement('canvas');
        canv.width = img.width;
        canv.height = img.height;
        canv.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
        return canv;
    },

    _colorsToRgb: function (cols) { // (Array) -> Array
        for (var i = 0; i < cols.length; i++) {
            cols[i] = P.Util.Color.toRGB(cols[i]);
        };
        return cols;
    },

    _getPixelColor: function (context, px) { // (CanvasRenderingContext2D, Object) -> Array
        return context.getImageData(px.x, px.y, 1, 1).data;
    },

    _getPixelsColors: function (context, pxs) { // (CanvasRenderingContext2D, Array) -> Array
        var list = [];
        for (var i = 0; i < pxs.length; i++) {
        	list.push(context.getImageData(pxs[i].x, pxs[i].y, 1, 1).data);
        };
        return list;
    },

    _isColorInColors: function (checkingFunc, col, cols) { // (Function, Array, Array) -> Boolean
        for (var i = 0; i < cols.length; i++) {
            if (checkingFunc(col, cols[i]) === true) {
                return true;
            };
        };
        return false;
    },

    _areColorsEqualToColor: function (checkingFunc, cols, col) { // (Function, Array, Array) -> Boolean
        for (var i = 0; i < cols.length; i++) {
            if (checkingFunc(col, cols[i]) === false) {
                return false;
            };
        };
        return true;
    },

    _getNeighborPixels: function (px, imgSize, accuracy) { // (Object, Object) -> Array
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
}