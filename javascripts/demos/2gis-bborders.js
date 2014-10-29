DG.BBorders = DG.Handler.extend({
    _curBuildingPoly: null,
    _canv: null,

    _updateCanvas: function(element) {
        var _this = this;
        html2canvas(element, {
            onrendered: function(canvas) {
                _this._canv = canvas;
            },
            timeout: 400,
            useCORS: true
        });
    },

    _processMousemove: function(e) {
        var latLngs = [];

        if (this._curBuildingPoly.getLatLngs().length > 0 && 
            this._curBuildingPoly.getBounds().contains(e.latlng)) {
            return;
        }

        var buildingPoly = pix.find({
                img: this._canv,
                distance: 1,
                tolerance: 5,
                startPoint: {
                    x: parseInt(e.containerPoint.x), 
                    y: parseInt(e.containerPoint.y)
                },
                colors: [
                    // houses
                    'dedac8', 'fcfae8', 'c7c0b3', 'bfb8ab', 'd3cec0',
                    'd3d1c1', 'b8b4a6', 'edd595', 'e8d090', 'fde3a6',
                    'c9bfa3', 'ecd5a3', 'f1d69a', 'fedf98', 'c6c9c7',
                    'd3d3d3', 'd3def1', 'cedbef', 'e9e7d7', 'd3d0c1',
                    'f1d58c', 'c6c0b2', 'e1e0cf'
                ]
            });

        buildingPoly = buildingPoly.map(function(pt) {
            return DG.point(pt.x, pt.y);
        });
        buildingPoly.forEach(function(pt) {
            latLngs.push(this._map.containerPointToLatLng(pt));
        }, this);
        this._curBuildingPoly.setLatLngs(latLngs);
    },

    addHooks: function() {
        var _this = this, timeoutId = 0,
            options = {
                color: '#000000',
                opacity: 0.2,
                weight: 1,
                fillColor: '#515151',
                fillOpacity: 0.2
            };
        
        this._curBuildingPoly = DG.polygon([], options).addTo(this._map);

        this._map.on('mousemove', function(e) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(function() {
                _this._processMousemove(e);
            }, 5);
        });

        this._map.on('zoomend moveend', function(e) {
            _this._updateCanvas(_this._map.getContainer());
        });
    }
});

DG.Map.addInitHook('addHandler', 'bBorders', DG.BBorders);