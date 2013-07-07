// http://www.mathblog.dk/disjoint-set-data-structure/
P.Struct.DisjointSet = function () {
    'use strict';

    var _relations = {};

    function _getObjectKeyByVal (obj, value) {
        for (var prop in obj) {
            if (obj[prop] === value) {
                return prop;
            }
        }
    };

    return {

        add: function (val) {
            var key = JSON.stringify(val);
            if (typeof _relations[key] === 'undefined') {
                _relations[key] = val;
            }
        },

        find: function (val1, val2) {
            var key1 = JSON.stringify(val1),
                key2 = JSON.stringify(val2);
            return _relations[key1] === _relations[key2] ? true : false;
        },

        union: function (val1, val2) {
            var key1 = JSON.stringify(val1),
                key2 = JSON.stringify(val2);

            for (var key in _relations) {
                if (_relations[key] === _relations[key1]) {
                    _relations[key] = _relations[key2];
                };
            }
        },

        getRelations: function () {
            var resObj = {},
                resArr = [];

            for (var key in _relations) {
                var resKey = JSON.stringify(_relations[key]);
                if (typeof resObj[resKey] === 'undefined') {
                    resObj[resKey] = [JSON.parse(key)];
                }
                else {
                    resObj[resKey].push(JSON.parse(key));
                }
            }

            for (var key in resObj) {
                resArr.push(resObj[key]);
            }

            return resArr;
        }
    }
};