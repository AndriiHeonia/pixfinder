/**
 * (c) 2014, Andrey Geonya
 * https://github.com/dstructjs/disjoint-set
 */

(function () { 'use strict';

function disjointSet() {
    return new DisjointSet();
}

var DisjointSet = function() {
    this._relations = {};
    this._size = {};
};

DisjointSet.prototype = {
    add: function (val) {
        var key = JSON.stringify(val);
        if (typeof this._relations[key] === 'undefined') {
            this._relations[key] = val;
            this._size[key] = 1;
        }
        return this;
    },

    find: function (val) {
        var root = val,
            key = JSON.stringify(root);

        while (this._relations[key] !== root) {
            root = this._relations[key];
            key = JSON.stringify(root);
        }
        return root;
    },

    connected: function (val1, val2) {
        return this.find(val1) === this.find(val2) ? true : false;
    },

    union: function (val1, val2) {
        var val1Root = this.find(val1),
            val2Root = this.find(val2),
            key1 = JSON.stringify(val1),
            key2 = JSON.stringify(val2);

        if (val1Root === val2Root) { return this; }

        if (this._size[key1] < this._size[key2]) {
            this._relations[key1] = val2Root;
            this._size[key1] += this._size[key2];
        }
        else {
            this._relations[key2] = val1Root;
            this._size[key2] += this._size[key1];
        }

        return this;
    },

    extract: function () {
        var root, val,
            resObjKey,
            resObj = {},
            resArr = [];

        for (var key in this._relations) {
            val = this._relations[key];
            root = this.find(val);
            resObjKey = JSON.stringify(root);

            if (typeof resObj[resObjKey] === 'undefined') {
                resObj[resObjKey] = [];
            }
            resObj[resObjKey].push(JSON.parse(key));
        }

        for (var key1 in resObj) {
            resArr.push(resObj[key1]);
        }

        return resArr;
    },

    destroy: function () {
        this._relations = {};
    }
};

if (typeof define === 'function' && define.amd) {
    define(function() {
        return disjointSet;
    });
} else if (typeof module !== 'undefined') {
    module.exports = disjointSet;
} else if (typeof self !== 'undefined') {
    self.disjointSet = disjointSet;
} else {
    window.disjointSet = disjointSet;
}

})();