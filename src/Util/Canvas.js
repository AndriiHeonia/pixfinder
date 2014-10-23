'use strict';

Pixfinder.Util.Canvas = {

    // (HTMLImageElement) -> HTMLCanvasElement
    wrapImgByCanvas: function(img) {
        var canv = document.createElement('canvas');
        canv.width = img.width;
        canv.height = img.height;
        canv.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
        return canv;
    },   

    // (Number, Object) -> Pixel
    getPixelByColorPosition: function(colPos, imgSize) {
        var px = {x: 0, y: 0};
        px.y = parseInt(colPos / (imgSize.w*4));
        px.x = colPos/4 - px.y*imgSize.w;
        return px;
    },

    // (Pixel, Object) -> Number
    getColorPositionByPixel: function(px, imgSize) {
        return ((px.y - 1) * imgSize.w * 4) + (px.x * 4 - 4);
    },

    // (Pixel, Object) -> Array
    getNeighborPixels: function(px, imgSize) {
        var nPxs = [],
            t   = {x: px.x, y: px.y - 1},
            tr  = {x: px.x + 1, y: px.y - 1},
            r   = {x: px.x + 1, y: px.y},
            br  = {x: px.x + 1, y: px.y + 1},
            b   = {x: px.x, y: px.y + 1},
            bl  = {x: px.x - 1, y: px.y + 1},
            l   = {x: px.x - 1, y: px.y},
            tl  = {x: px.x - 1, y: px.y - 1};

        if (px.y > 0) {
            nPxs.push(t);
            if (px.x < imgSize.w) {
                nPxs.push(tr);
            }
        }
        if (px.x < imgSize.w) {
            nPxs.push(r);
            if (px.y < imgSize.h) {
                nPxs.push(br);
            }
        }
        if (px.y < imgSize.h) {
            nPxs.push(b);
            if (px.x > 0) {
                nPxs.push(bl);
            }
        }
        if (px.x > 0) {
            nPxs.push(l);
            if (px.y > 0) {
                nPxs.push(tl);
            }
        }

        return nPxs;
    },

    // (Number, Array, Object) -> Array
    getNeighborPixelsColors: function(colPos, imgCols, imgSize) {
        var res = [],
            tlPos, tPos, trPos, rPos,
            brPos, bPos, blPos, lPos,
            px = Pixfinder.Util.Canvas.getPixelByColorPosition(colPos, imgSize);

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
        }

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

};