'use strict';

Pixfinder.Util.Math = {

    getDistance: function (px1, px2) { // (Object, Object) -> Number
        return Math.sqrt(
            Math.pow(px2.x - px1.x, 2) + Math.pow(px2.y - px1.y, 2)
        );
    }

};