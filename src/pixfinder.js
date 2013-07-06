var step = 3;
var PF = {    

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
                    isPxColEqualTo = curry(this._areColorsEqual, pxCol),
                	nPxs,
                	nPxCols;

                // skip if px is not a pixel of the feature
                if(!this._isColorInColors(this._areColorsEqual, pxCol, colors)) {
                    continue;
                }

                nPxs = this._getNeighborPixels(px, {
                    w: canv.width - step, 
                    h: canv.height - step
                }, 3);
                nPxCols = this._getPixelsColors(canv, nPxs);

                // skip if px is not a boundary pixel of the feature
                if (this._areColorsEqualToColor(this._areColorsEqual, nPxCols, pxCol) === true) {
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
            cols[i] = PF.toRGB(cols[i]);
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

    _areColorsEqual: function (col1, col2) { // (Array, Array) -> Boolean
        var r = col1[0] === col2[0],
            g = col1[1] === col2[1],
            b = col1[2] === col2[2];

        return (r && g && b);
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