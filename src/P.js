// http://en.wikipedia.org/wiki/Binary_image
// http://en.wikipedia.org/wiki/Otsu%27s_method
// http://en.wikipedia.org/wiki/Blob_extraction

// http://en.wikipedia.org/wiki/Grayscale
// http://en.wikipedia.org/wiki/Gamma_correction

// http://ru.wikipedia.org/wiki/%D0%92%D1%8B%D0%B4%D0%B5%D0%BB%D0%B5%D0%BD%D0%B8%D0%B5_%D0%B3%D1%80%D0%B0%D0%BD%D0%B8%D1%86
// http://ru.wikipedia.org/wiki/K-means

var step = 2;
var P = {

    getRegionsByColors: function (img, colors) { // (HTMLImageElement, Array) -> Object
        var canvas = this._wrapByCanvas(img),
            colors = this._extendColors(this._colorsToRgb(colors), 1),
            regionsPxs = this._getRegionsPixels(canvas, colors),
            regions = this._splitRegionsByDist(regionsPxs, 10);

        return regions;
    },

    _getRegionsPixels: function (canvas, colors) { // (HTMLCanvasElement, Array) -> Array
        var res = [];

        for (var x = 0; x < img.clientWidth; x = x+step) {
            for (var y = 0; y < img.clientHeight; y = y+step) {
                var px = { x: x, y: y },
                    pxCol = this._getPixelColor(canvas, px);

                // is it pixel of the feature?
                if(this._isColorInColors(P.Util.Color.areEqual, pxCol, colors)) {
                    res.push(px);
                }
            }
        }

        return res;
    },

    _splitRegionsByDist: function (pixels, dist) { // (Array, Number) -> Array
        var disjointSet = new P.Struct.DisjointSet(),
            res;

        for (var i = 0; i < pixels.length; i++) {
            disjointSet.add(pixels[i]);
            for (var j = 0; j < pixels.length; j++) {
                disjointSet.add(pixels[j]);
                if (P.Util.Math.getDistance(pixels[i], pixels[j]) <= dist) {
                    if (!disjointSet.find(pixels[i], pixels[j])) {
                        disjointSet.union(pixels[i], pixels[j]);
                    };
                };
            };
        };

        res = disjointSet.extract();
        disjointSet.destroy();
        return res;
    },

    // @todo refactor this ugly function to FP style, add step as argument
    // @todo try to detect similar colors by main color
    getFeatures: function (img, colors) { // (HTMLImageElement, Array) -> Object
        var canv = this._wrapByCanvas(img),
            colors = this._extendColors(this._colorsToRgb(colors), 10),
            features = [];

        for (var x = 0; x < img.clientWidth; x = x+step) {
            for (var y = 0; y < img.clientHeight; y = y+step) {

                var px = { x: x, y: y },
                	pxCol = this._getPixelColor(canv, px),
                    isPxColEqualTo = P.Func.curry(P.Util.Color.areEqual, pxCol),
                	nPxs,
                	nPxCols;

                // skip if px is not a pixel of the feature
                if(!this._isColorInColors(P.Util.Color.areEqual, pxCol, colors)) {
                    continue;
                }

                nPxs = this._getNeighborPixels(px, {
                    w: canv.width - step, 
                    h: canv.height - step
                }, 0);
                nPxCols = this._getPixelsColors(canv, nPxs);

                // skip if px is not a boundary pixel of the feature
                if (this._areColorsEqualToColor(P.Util.Color.areEqual, nPxCols, pxCol) === true) {
                    continue;
                };

                if (features.length === 0) {
                    features[0] = [px];
                    continue;                   
                };

                var wasUpdated = false;

                for (var i = 0; i < features.length; i++) {
                    if (this._arePixelsIntersects(features[i], nPxs)) {
                        features[i].push(px);
                        wasUpdated = true;
                        break;
                    }
                };

                if (wasUpdated === false) {
                    features[features.length] = [px];
                };

            }
        };

        return features;
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

    _extendColors: function (cols, step) { // (Array) -> Array
        var res = [];
        for (var i = 0; i < cols.length; i++) {
            res.push(cols[i]);
            for (var j = 0; j < step; j++) {
                res.push([cols[i][0] + j, cols[i][1], cols[i][2]]);
                res.push([cols[i][0] + j, cols[i][1] + j, cols[i][2]]);
                res.push([cols[i][0] + j, cols[i][1], cols[i][2] + j]);
                res.push([cols[i][0] + j, cols[i][1] + j, cols[i][2] + j]);

                res.push([cols[i][0], cols[i][1] + j, cols[i][2]]);
                res.push([cols[i][0], cols[i][1] + j, cols[i][2] + j]);

                res.push([cols[i][0], cols[i][1], cols[i][2] + j]);
                res.push([cols[i][0] + j, cols[i][1], cols[i][2] + j]);
            };
        };
        return res;
    },

    _getPixelColor: function (canvas, px) { // (HTMLCanvasElement, Object) -> Array
        return canvas.getContext('2d').getImageData(px.x, px.y, 1, 1).data;
    },

    _getPixelsColors: function (canvas, pxs) { // (HTMLCanvasElement, Array) -> Array
        var list = [];
        for (var i = 0; i < pxs.length; i++) {
        	list.push(canvas.getContext('2d').getImageData(pxs[i].x, pxs[i].y, 1, 1).data);
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

    _arePixelsIntersects: function (pxs1, pxs2) { // (Array, Array) -> Boolean
        for (var i = 0; i < pxs1.length; i++) {
            for (var j = 0; j < pxs2.length; j++) {
                if (pxs1[i].x === pxs2[j].x && pxs1[i].y ===pxs2[j].y) {
                    return true;
                };
            };
        };
        return false;
    },

    _getNeighborPixels: function (px, imgSize, count) { // (Object, Object) -> Array
        var res = [];

        if (px.x > 0 && px.y > 0) {
            res.push(this._getNeighborTlPixels(px, imgSize)); // tl
        };

        if (px.y > 0) {
            res.push(this._getNeighborTPixels(px, imgSize)); // t
        };

        if (px.x < imgSize.w && px.y > 0) {
            res.push(this._getNeighborTrPixels(px, imgSize)); // tr
        };

        if (px.x < imgSize.w) {
            res.push(this._getNeighborRPixels(px, imgSize)); // r
        };

        if (px.x < imgSize.w && px.y < imgSize.h) {
            res.push(this._getNeighborBrPixels(px, imgSize)); // br
        };

        if (px.y < imgSize.h) {
            res.push(this._getNeighborBPixels(px, imgSize)); // b
        };

        if (px.x > 0 && px.y < imgSize.h) {
            res.push(this._getNeighborBlPixels(px, imgSize)); // bl
        };

        if (px.x > 0) {
            res.push(this._getNeighborLPixels(px, imgSize)); // l
        };

        for (var c = 0; c < count; c++) {
            var nRes = [];

            for (var i = 0; i < res.length; i++) {

                if (res[i].x > 0 && res[i].y > 0) {
                    nRes.push(this._getNeighborTlPixels(res[i], imgSize));
                };

                if (res[i].y > 0) {
                    nRes.push(this._getNeighborTPixels(res[i], imgSize)); // t
                };

                if (res[i].x < imgSize.w && res[i].y > 0) {
                    nRes.push(this._getNeighborTrPixels(res[i], imgSize)); // tr
                };

                if (res[i].x < imgSize.w) {
                    nRes.push(this._getNeighborRPixels(res[i], imgSize)); // r
                };

                if (res[i].x < imgSize.w && res[i].y < imgSize.h) {
                    nRes.push(this._getNeighborBrPixels(res[i], imgSize)); // br
                };

                if (res[i].y < imgSize.h) {
                    nRes.push(this._getNeighborBPixels(res[i], imgSize)); // b
                };

                if (res[i].x > 0 && res[i].y < imgSize.h) {
                    nRes.push(this._getNeighborBlPixels(res[i], imgSize)); // bl
                };

                if (res[i].x > 0) {
                    nRes.push(this._getNeighborLPixels(res[i], imgSize)); // l
                };
            };

            for (var i = 0; i < nRes.length; i++) {
                res.push(nRes[i]);
            };            
        };

        return res;
    },

    _getNeighborTlPixels: function (px, imgSize) { // (Object, Object) -> Object
        return { x: px.x-step, y: px.y-step }; // tl
    },

    _getNeighborTPixels: function (px, imgSize) { // (Object, Object) -> Object
        return { x: px.x,   y: px.y-step }; // t
    },

    _getNeighborTrPixels: function (px, imgSize) { // (Object, Object) -> Object
        return { x: px.x+step, y: px.y-step }; // tr
    },

    _getNeighborRPixels: function (px, imgSize) { // (Object, Object) -> Object
        return { x: px.x+step, y: px.y }; // r
    },

    _getNeighborBrPixels: function (px, imgSize) { // (Object, Object) -> Object
        return { x: px.x+step, y: px.y+step }; // br
    },

    _getNeighborBPixels: function (px, imgSize) { // (Object, Object) -> Object
        if (px.y < imgSize.h) {
            return { x: px.x, y: px.y+step }; // b
        };
    },

    _getNeighborBlPixels: function (px, imgSize) { // (Object, Object) -> Object
        if (px.x > 0 && px.y < imgSize.h) {
            return { x: px.x-step, y: px.y+step }; // bl
        };
    },

    _getNeighborLPixels: function (px, imgSize) { // (Object, Object) -> Object
        if (px.x > 0) {
            return { x: px.x-step, y: px.y }; // l
        };
    }
}