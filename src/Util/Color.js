'use strict';

Pixfinder.Util.Color = {

    // (String) -> Array
    toRGB: function (color) {
        var num = parseInt(color, 16);
        return [num >> 16, num >> 8 & 255, num & 255]; // rgb
    },

    // (Array) -> String
    toHex: function (rgb) {
        return ((rgb[2] | rgb[1] << 8 | rgb[0] << 16) | 1 << 24)
            .toString(16).slice(1);
    },

    // (Array, Array, Number) -> Boolean
    areSimilar: function (rgb1, rgb2, tolerance) {
        var r = Math.abs(rgb1[0] - rgb2[0]) < tolerance,
            g = Math.abs(rgb1[1] - rgb2[1]) < tolerance,
            b = Math.abs(rgb1[2] - rgb2[2]) < tolerance;

        return (r && g && b);
    }

};