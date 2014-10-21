Pixfinder.Util.Dom = {
    isImgLoaded: function (img) {
        return !(typeof img.naturalWidth !== 'undefined' && img.naturalWidth === 0);
    }
}