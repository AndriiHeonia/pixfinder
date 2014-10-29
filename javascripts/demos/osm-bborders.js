L.BBorders = L.Handler.extend({
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
                tolerance: 4,
                startPoint: {
                    x: parseInt(e.containerPoint.x), 
                    y: parseInt(e.containerPoint.y)
                },
                colors: [
                    'bca9a9',
                    'c1adad',
                    'b1b1b0',
                    'c1b0ae',
                    'beadad'
                ]
            });

        buildingPoly = buildingPoly.map(function(pt) {
            return L.point(pt.x, pt.y);
        });
        buildingPoly.forEach(function(pt) {
            latLngs.push(this._map.containerPointToLatLng(pt));
        }, this);
        this._curBuildingPoly.setLatLngs(latLngs);
    },

    addHooks: function() {
        var _this = this, timeoutId = 0,
            options = {
                color: '#0f004f',
                opacity: 0.3,
                weight: 2,
                fillColor: '#9adeff',
                fillOpacity: 0.4
            };
        
        this._curBuildingPoly = L.polygon([], options).addTo(this._map);

        this._map.on('mousemove', function(e) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(function() {
                _this._processMousemove(e);
            }, 10);
        });

        this._map.on('layeradd', function(layer) {
            if (layer.layer._tiles !== undefined) {
                layer.layer.once('load', function() {
                    _this._updateCanvas(layer.target._container);
                });
                _this._map.on('moveend zoomend', function() {
                    _this._updateCanvas(layer.target._container);
                });
            }
        });
    }
});

L.Map.addInitHook('addHandler', 'bBorders', L.BBorders);