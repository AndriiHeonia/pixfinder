var PF = {
	
	getFeatures: function (img, colors) { // (HTMLImageElement, Object) -> Object
		var canv = this._wrapByCanvas(img),
			colors = this._colorsToRgb(colors),
            features = [[]];

		for (var x = 0; x < img.clientWidth; x++) {
			for (var y = 0; y < img.clientHeight; y++) {
				
				var px = { x: x, y: y },
					pxCol = this._getPixelColor(canv, px),
					nPxs,
					nPxCols,
                    fPxs,
                    fPxsCols,
                    fIdx;

				// skip if px is not a pixel of the feature
				if (this._isColorInColors(pxCol, colors, this._areColorsEqual) === false) {
					continue;
				};

				nPxs = this._getNeighborPixels(px, {
                    w: canv.width - 1, 
                    h: canv.height - 1
                });
				nPxCols = this._getPixelsColors(canv, nPxs);

                // skip if px is not a boundary pixel of the feature
                if (this._areColorsEqualToColor(nPxCols, pxCol, this._areColorsEqual) === true) {
                    continue;
                }

                features[0].push(px);

                /*for (var i = 0; i < features.length; i++) {
                    fPxs = features[i];
                    fPxsCols = this._getPixelsColors(canv, fPxs);
                    // check or pixel belongs to one of already processed features
                    if (this._areColorsIntersects(this._areColorsEqual, fPxsCols, nPxCols) === true) {
                        features[i].push(px);
                    };
                };*/

                // we need only boundary pixels & only if it does't belongs to exists features
                /*if (isFeatureUpdated === false &&
                    this._areColorsEqualToColor(nPxCols, pxCol, this._areColorsEqual) === false) {
                    features[features.length] = [];
                    features[features.length-1].push(px);
                };*/

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

    _isColorInColors: function (col, cols, callback) { // (Array, Array, Function) -> Boolean
		for (var i = 0; i < cols.length; i++) {
			if (callback(col, cols[i]) === true) {
				return true;
			};
		};
		return false;
    },

    _areColorsEqualToColor: function (cols, col, callback) { // (Array, Array, Function) -> Boolean
		for (var i = 0; i < cols.length; i++) {
			if (callback(col, cols[i]) === false) {
				return false;
			};
		};
		return true;
    },

    _areColorsIntersects: function (callback, cols1, cols2) { // (Function, Array, Array) -> Boolean
        for (var i = 0; i < cols1.length; i++) {
            for (var j = 0; j < cols2.length; j++) {
                if (callback(cols1[i], cols2[j]) === true) {
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
    },

    _pushPixelToFeature: function (canvas, features, pixel, neighborPixelColors, callback) {
        for (var i = 0; i < features.length; i++) {
            fPxs = features[i];
            fPxsCols = this._getPixelsColors(canv, fPxs);
            // check or pixel belongs to one of already processed features
            if (this._areColorsIntersects(fPxsCols, nPxCols, this._areColorsEqual) === true) {
                features[i].push(px);
            };
        };
    }
}