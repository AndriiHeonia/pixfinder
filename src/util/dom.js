'use strict';

// (HTMLImageElement) -> Boolean
function imgLoaded (img) {
    return !(typeof img.naturalWidth !== 'undefined' && img.naturalWidth === 0);
}

exports.imgLoaded = imgLoaded;