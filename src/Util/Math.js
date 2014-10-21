'use strict';

Pixfinder.Util.Math = {

    getDistance: function(px1, px2) { // (Object, Object) -> Number
        return Math.sqrt(
            Math.pow(px2.x - px1.x, 2) + Math.pow(px2.y - px1.y, 2)
        );
    },

    // TODO: doc it
    getCentroid: function(pts) { // (Array) -> Object
        var twicearea=0,
            x=0, y=0,
            nPts = pts.length,
            p1, p2, f;
    
        for (var i = 0, j = nPts-1; i < nPts; j = i++) {
            p1 = pts[i]; p2 = pts[j];
            f = p1.x*p2.y - p2.x*p1.y;
            twicearea += f;          
            x += ( p1.x + p2.x ) * f;
            y += ( p1.y + p2.y ) * f;
        }
        f = twicearea * 3;

        return { x: parseInt(x/f), y: parseInt(y/f) };
    }
};