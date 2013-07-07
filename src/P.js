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
                    pxCol = this._getPixelColor(canvas, px),
                    nPxs = this._getNeighborPixels(px, {
                        w: canvas.width - step, 
                        h: canvas.height - step
                    }),
                    nPxCols = this._getPixelsColors(canvas, nPxs);

                // skip if px is not a boundary pixel of the feature
                if (this._areColorsEqualToColor(P.Util.Color.areEqual, nPxCols, pxCol) === true) {
                    continue;
                };

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