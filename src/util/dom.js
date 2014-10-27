'use strict';

// (HTMLImageElement) -> Boolean
function loaded(img) {
    return !(typeof img.naturalWidth !== 'undefined' && img.naturalWidth === 0);
}

// (HTMLImageElement, Function)
function onload(img, func) {
    if (loaded(img)) {
        func();
    } else {
        img.addEventListener('load', func, false);
    }
}

exports.loaded = loaded;
exports.onload = onload;