'use strict';

// (HTMLImageElement | HTMLCanvasElement) -> HTMLCanvasElement
function wrap(img) {
    if (!!(img.getContext && img.getContext('2d'))) {
        return img;
    }
    var canv = document.createElement('canvas');
    canv.width = img.width;
    canv.height = img.height;
    canv.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
    return canv;
}

// (Number, Object) -> Point
function colorPos2Point(colPos, imgSize) {
    var pt = {x: 0, y: 0};
    pt.y = parseInt(colPos / (imgSize.w * 4));
    pt.x = colPos / 4 - pt.y * imgSize.w;
    return pt;
}

// (Point, Object) -> Number
function point2ColorPos(pt, imgSize) {
    return ((pt.y - 1) * imgSize.w * 4) + (pt.x * 4 - 4);
}

// (Number, Array, Object) -> Array
function neighborColors(colPos, imgCols, imgSize) {
    var res = [],
        tlPos, tPos, trPos, rPos,
        brPos, bPos, blPos, lPos,
        pt = colorPos2Point(colPos, imgSize);

    if (pt.x > 0 && pt.y > 0) {
        tlPos = colPos - 4 - imgSize.w*4;
        res.push([ // top left color
            imgCols[tlPos],
            imgCols[tlPos+1],
            imgCols[tlPos+2],
            imgCols[tlPos+3]
        ]);
    }

    if (pt.y > 0) {
        tPos = colPos - imgSize.w*4;
        res.push([ // top color
            imgCols[tPos],
            imgCols[tPos+1],
            imgCols[tPos+2],
            imgCols[tPos+3]
        ]);
    }

    if (pt.x < imgSize.w && pt.y > 0) {
        trPos = colPos - imgSize.w*4 + 4;
        res.push([ // top right color
            imgCols[trPos],
            imgCols[trPos+1],
            imgCols[trPos+2],
            imgCols[trPos+3]
        ]);
    }

    if (pt.x < imgSize.w) {
        rPos = colPos + 4;
        res.push([ // right color
            imgCols[rPos],
            imgCols[rPos+1],
            imgCols[rPos+2],
            imgCols[rPos+3]
        ]);
    }

    if (pt.x < imgSize.w && pt.y < imgSize.h) {
        brPos = colPos + imgSize.w*4 + 4;
        res.push([ // bottom right color
            imgCols[brPos],
            imgCols[brPos+1],
            imgCols[brPos+2],
            imgCols[brPos+3]
        ]);
    }

    if (pt.y < imgSize.h) {
        bPos = colPos + imgSize.w*4;
        res.push([ // bottom color
            imgCols[bPos],
            imgCols[bPos+1],
            imgCols[bPos+2],
            imgCols[bPos+3]
        ]);
    }

    if (pt.x > 0 && pt.y < imgSize.h) {
        blPos = colPos + imgSize.w*4 - 4;
        res.push([ // bottom left color
            imgCols[blPos],
            imgCols[blPos+1],
            imgCols[blPos+2],
            imgCols[blPos+3]
        ]);
    }

    if (pt.x > 0) {
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

// (String) -> Array
function hex2Rgb(hex) {
    var num = parseInt(hex, 16);
    return [num >> 16, num >> 8 & 255, num & 255]; // rgb
}

// (Array) -> String
function rgb2Hex(rgb) {
    return ((rgb[2] | rgb[1] << 8 | rgb[0] << 16) | 1 << 24)
        .toString(16).slice(1);
}

// (Array, Array, Number) -> Boolean
function similarColors(rgb1, rgb2, tolerance) {
    var r = Math.abs(rgb1[0] - rgb2[0]) < tolerance,
        g = Math.abs(rgb1[1] - rgb2[1]) < tolerance,
        b = Math.abs(rgb1[2] - rgb2[2]) < tolerance;
    return (r && g && b);
}

// (Array, Array, Number) -> Boolean
function colorInAllColors(col, cols, tolerance) {
    for (var i = 0; i < cols.length; i++) {
        if (similarColors(col, cols[i], tolerance) === false) {
            return false;
        }
    }
    return true;
}

// (Array, Array, Number) -> Boolean
function colorInColors(col, cols, tolerance) {
    for (var i = 0; i < cols.length; i++) {
        if (similarColors(col, cols[i], tolerance) === true) {
            return true;
        }
    }
    return false;
}

exports.wrap = wrap;
exports.colorPos2Point = colorPos2Point;
exports.point2ColorPos = point2ColorPos;
exports.neighborColors = neighborColors;
exports.hex2Rgb = hex2Rgb;
exports.rgb2Hex = rgb2Hex;
exports.similarColors = similarColors;
exports.colorInColors = colorInColors;
exports.colorInAllColors = colorInAllColors;