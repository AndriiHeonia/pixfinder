var PF = {
    getFeatures: function (img, colors) { // (HTMLImageElement, Object) -> Object
        var canv = this._wrapByCanvas(img),
            colors = this._colorsToRgb(colors),
            features = [];

        for (var x = 0; x < img.clientWidth; x = x+1) {
            for (var y = 0; y < img.clientHeight; y = y+1) {

                var px = { x: x, y: y },
                	pxCol = this._getPixelColor(canv, px),
                    isPxColEqualTo = curry(this._areColorsEqual, pxCol),
                	nPxs,
                	nPxCols;

                // skip if px is not a pixel of the feature
                if (colors.some(isPxColEqualTo)) { // bug here!

                    nPxs = this._getNeighborPixels(px, {
                        w: canv.width - 1, 
                        h: canv.height - 1
                    });
                    nPxCols = this._getPixelsColors(canv, nPxs);

                    // skip if px is not a boundary pixel of the feature
                    if (this._areColorsEqualToColor(this._areColorsEqual, nPxCols, pxCol) === true) {
                        continue;
                    };

                    var areNPxColorsIntersectsWith = curry(this._areColorsIntersects, this._areColorsEqual, nPxCols);
                    var getPixelsColors = curry(this._getPixelsColors, canv);

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

    _areColorsIntersects: function (checkingFunc, cols1, cols2) { // (Function, Array, Array) -> Boolean
        for (var i = 0; i < cols1.length; i++) {
            for (var j = 0; j < cols2.length; j++) {
                if (checkingFunc(cols1[i], cols2[j]) === true) {
                    return true;
                };
            };
        };
        return false;
    },

    _getNeighborPixels: function (px, imgSize) { // (Object, Object) -> Array
        var res = [];
        
        if (px.x > 0 && px.y > 0) {
            res.push({ x: px.x-1, y: px.y-1 }); // tl
        };

        if (px.y > 0) {
            res.push({ x: px.x,   y: px.y-1 }); // t
        };

        if (px.x < imgSize.w && px.y > 0) {
            res.push({ x: px.x+1, y: px.y-1 }); // tr
        };

        if (px.x < imgSize.w) {
            res.push({ x: px.x+1, y: px.y }); // r
        };

        if (px.x < imgSize.w && px.y < imgSize.h) {
            res.push({ x: px.x+1, y: px.y+1 }); // br
        };

        if (px.y < imgSize.h) {
            res.push({ x: px.x, y: px.y+1 }); // b
        };

        if (px.x > 0 && px.y < imgSize.h) {
            res.push({ x: px.x-1, y: px.y+1 }); // bl
        };

        if (px.x > 0) {
            res.push({ x: px.x-1, y: px.y }); // l
        };

        return res;
    }
}