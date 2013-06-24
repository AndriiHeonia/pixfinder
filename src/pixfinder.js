var step = 1;
var PF = {
    // @todo refactor this ugly function to FP style, add step as argument
    // @todo try to detect similar colors by main color
    getFeatures: function (img, colors) { // (HTMLImageElement, Object) -> Object
        var canv = this._wrapByCanvas(img),
            colors = this._colorsToRgb(colors),
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
                });
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

    _colorsToRgb: function (cols) { // (Object) -> Object
        for (var i = 0; i < cols.length; i++) {
            cols[i] = toRGB(cols[i]);
        };
        return cols;
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

    _getNeighborPixels: function (px, imgSize) { // (Object, Object) -> Array
        var res = [];
        
        if (px.x > 0 && px.y > 0) {
            res.push({ x: px.x-step, y: px.y-step }); // tl
        };

        if (px.y > 0) {
            res.push({ x: px.x,   y: px.y-step }); // t
        };

        if (px.x < imgSize.w && px.y > 0) {
            res.push({ x: px.x+step, y: px.y-step }); // tr
        };

        if (px.x < imgSize.w) {
            res.push({ x: px.x+step, y: px.y }); // r
        };

        if (px.x < imgSize.w && px.y < imgSize.h) {
            res.push({ x: px.x+step, y: px.y+step }); // br
        };

        if (px.y < imgSize.h) {
            res.push({ x: px.x, y: px.y+step }); // b
        };

        if (px.x > 0 && px.y < imgSize.h) {
            res.push({ x: px.x-step, y: px.y+step }); // bl
        };

        if (px.x > 0) {
            res.push({ x: px.x-step, y: px.y }); // l
        };

        return res;
    }
}