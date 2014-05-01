var Pixfinder = function (options) {
    var opt = options;
    
    opt.accuracy = opt.accuracy || 2;
    opt.distance = opt.distance || 10;
    opt.tolerance = opt.tolerance || 50;
    opt.fill = opt.fill || false;
    opt.colors = Pixfinder._colorsToRgb(opt.colors);
    opt.img = Object.prototype.toString.call(opt.img) === '[object String]' ?
        document.getElementById(opt.img) : opt.img;

    var processImg = function() {
        var canv = Pixfinder._wrapByCanvas(opt.img),
            regionsPxs = Pixfinder._getRegionsPixels(canv, opt.colors, opt.accuracy, opt.tolerance, opt.fill),
            edges = Pixfinder._splitByDist(regionsPxs, opt.distance);

        if (typeof options.onload !== 'undefined') {
            options.onload({
                edges: edges
            });
        }
    }

    if (Pixfinder._isImgLoaded(opt.img)) {
        processImg();
    } else {
        opt.img.addEventListener('load', processImg, false);
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

Pixfinder._getRegionsPixels = function(canvas, colors, accuracy, tolerance, fill) { // (HTMLCanvasElement, Array, Number, Number, Boolean) -> Array
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
            }),
            px = Pixfinder._getPixelByColorPosition(i, imgSize);

        // skip if px is inner pixel of the feature (not fill)
        if (!fill && Pixfinder._areColorsEqualToColor(Pixfinder.Util.Color.areSimilar, nPxCols, pxCol, tolerance) === true) {
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
/**
 * (c) 2014, Andrey Geonya
 * https://github.com/dstructjs/disjoint-set
 */

(function () { 'use strict';

function disjointSet() {
    return new DisjointSet();
}

var DisjointSet = function() {
    this._reset();
};

DisjointSet.prototype = {
    add: function (val) {
        var id = this._isPrimitive(val) ? val : this._lastId;
        if (typeof val._disjointSetId === 'undefined') {
            val._disjointSetId = this._relations[id] = id;
            this._objects[id] = val;
            this._size[id] = 1;
            this._lastId++;
        }
        return this;
    },

    find: function (val) {
        var id = this._isPrimitive(val) ? val : val._disjointSetId;
        return this._findById(id);
    },

    _findById: function (id) {
        var rootId = id;
        while (this._relations[rootId] !== rootId) {
            rootId = this._relations[rootId];
        }
        return rootId;
    },

    connected: function (val1, val2) {
        return this.find(val1) === this.find(val2) ? true : false;
    },

    union: function (val1, val2) {
        var val1RootId = this.find(val1),
            val2RootId = this.find(val2);

        if (val1RootId === val2RootId) { return this; }

        if (this._size[val1RootId] < this._size[val2RootId]) {
            this._relations[val1RootId] = val2RootId;
            this._size[val1RootId] += this._size[val2RootId];
        }
        else {
            this._relations[val2RootId] = val1RootId;
            this._size[val2RootId] += this._size[val1RootId];
        }

        return this;
    },

    extract: function () {
        var rootId,
            resObj = {},
            resArr = [];

        for (var id in this._relations) {
            rootId = this._findById(id);

            if (typeof resObj[rootId] === 'undefined') {
                resObj[rootId] = [];
            }
            resObj[rootId].push(this._objects[id]);
        }

        for (var key1 in resObj) {
            resArr.push(resObj[key1]);
        }

        return resArr;
    },

    destroy: function () {
        this._reset();
    },

    _isPrimitive: function (val) {
        if (typeof this.IS_PRIMITIVE !== 'undefined') {
            return this.IS_PRIMITIVE;
        }
        else {
            this.IS_PRIMITIVE = DisjointSet._isPrimitive(val);
            return this.IS_PRIMITIVE;
        }
    },

    _reset: function () {
        for (var id in this._objects) {
            delete this._objects[id]._disjointSetId;
        }
        this._objects = {};
        this._relations = {};
        this._size = {};
        this._lastId = 0;
    }
};

DisjointSet._isPrimitive = function (val) {
    if (Object.prototype.toString.call(val) === '[object String]' ||
        Object.prototype.toString.call(val) === '[object Number]') {
        return true;
    }
    else {
        return false;
    }
};

if (typeof define === 'function' && define.amd) {
    define(function() {
        return disjointSet;
    });
} else if (typeof module !== 'undefined') {
    module.exports = disjointSet;
} else if (typeof self !== 'undefined') {
    self.disjointSet = disjointSet;
} else {
    window.disjointSet = disjointSet;
}

})();
Pixfinder.Util.Color = {

    toRGB: function (color) { // (String) -> Array
        var num = parseInt(color, 16);
        return [num >> 16, num >> 8 & 255, num & 255]; // rgb
    },

    toHex: function (rgb) { // (Array) -> String
        return ((rgb[2] | rgb[1] << 8 | rgb[0] << 16) | 1 << 24).toString(16).slice(1);
    },

    areSimilar: function (rgb1, rgb2, tolerance) { // (Array, Array, Number) -> Boolean
        var r = Math.abs(rgb1[0] - rgb2[0]) < tolerance,
            g = Math.abs(rgb1[1] - rgb2[1]) < tolerance,
            b = Math.abs(rgb1[2] - rgb2[2]) < tolerance;

        return (r && g && b);
    },

};
Pixfinder.Util.Math = {

    getDistance: function (px1, px2) { // (Object, Object) -> Number
        return Math.sqrt(
            Math.pow(px2.x - px1.x, 2) + Math.pow(px2.y - px1.y, 2)
        );
    }

};
Pixfinder.Util = {};