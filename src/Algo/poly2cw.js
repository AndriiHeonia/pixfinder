/**
 * (c) 2014, Andrey Geonya
 * https://github.com/AndreyGeonya/poly2cw
 */

(function () { 'use strict';

function poly2cw(vertices, algo) {
    if (algo === 'vectorProduct') {
        var leftIndx = _leftmostIndx(vertices),
            v = vertices.slice(0, leftIndx).concat(vertices.slice(leftIndx+1)),
            leftPoint = {
                x: vertices[leftIndx].x,
                y: vertices[leftIndx].y
            };

        v.sort(function(px1, px2) {
            var res = _rotate(leftPoint, px1, px2);
            return res;
        });
        v.unshift(leftPoint);

        return v;        
    }
    else if (algo === 'tsp') {
        
        var v = [];
        
        v.push(vertices[0]);
        vertices[0].marked = true;

        var indx = 0;
        while(indx = _getClosestPxIndex(vertices[indx], vertices)) {
            vertices[indx].marked = true;
            v.push(vertices[indx]);
        }

        // var c1=document.getElementById("canv1");
        // var ctx1=c1.getContext("2d");
        // ctx1.beginPath();
        // for (var i = 0; i < v.length; i++) {
        //     ctx1.lineTo(v[i].x, v[i].y);
        //     ctx1.moveTo(v[i].x, v[i].y);
        //     ctx1.stroke();
        // }
        // ctx1.closePath();

        return v;
    }
    else if (algo === 'tsp-voronoi') {
        if (vertices.length <= 1) {
            return vertices;
        }
        var voronoi = new Voronoi();
        var bbox = _getBbox(vertices);
        var diagram = voronoi.compute(vertices, bbox);

        var c1=document.getElementById("canv1");
        var ctx1=c1.getContext("2d");

        // точки
        // for (var i = 0; i < diagram.cells.length; i++) {
        //     ctx1.beginPath();
        //     ctx1.arc(diagram.cells[i].site.x, diagram.cells[i].site.y, 4, 0, 2 * Math.PI, false);
        //     ctx1.fill();
        //     ctx1.closePath();
        // }

        // сетка
        // for (var i = 0; i < diagram.cells.length; i++) {
        //     for (var j = 0; j < diagram.cells[i].halfedges.length; j++) {
        //         var halfedge = diagram.cells[i].halfedges[j];
        //         ctx1.beginPath();
        //         ctx1.moveTo(halfedge.edge.va.x, halfedge.edge.va.y);
        //         ctx1.lineTo(halfedge.edge.vb.x, halfedge.edge.vb.y);
        //         ctx1.stroke();
        //         ctx1.closePath();
        //     };
        // }

        // var marked = {};
        // var v = [];
        // var vertice = vertices[0];
        // for (var i = 0; i < 22; i++) {
        //     var curVertice = vertice;
        //     vertice = _getClosestVertice(vertice, diagram, marked, bbox);
            
        //     if (vertice) {
        //         v.push(vertice);
        //         marked[vertice.voronoiId] = true;
        //     } else {
        //         vertice = _getClosestVertice(curVertice, diagram, {}, bbox);
        //     }
        // }
        // TODO: обратно нужно идти строго в обратном направлении!
        // Или избежать необходимости идти обратно...
        // while(true) {
        //     var curVertice = vertice;
        //     vertice = _getClosestVertice(vertice, diagram, marked, bbox);
        //     if (!vertice) {
        //         // // зашли в "тупик", но ещё обошли не все вершины
        //         // if (v.length<vertices.length-1) {
        //         //     vertice = _getClosestVertice(curVertice, diagram, {});
        //         // }
        //         // else {
        //             break;
        //         // }
        //     }
        //     else {
        //         v.push(vertice);
        //         marked[vertice.voronoiId] = true;
        //     }
        // }

        // console.log(diagram.cells[vertices[9].voronoiId]);
        return v;
    }
}

function _leftmostIndx(vertices) {
    var indx = 0;
    vertices.forEach(function(px, i) {
        if (px.x < vertices[indx].x) {
            indx = i;
        }
    });
    return indx;
}

function _getDistance(px1, px2) { // (Object, Object) -> Number
    return Math.sqrt(
        Math.pow(px2.x - px1.x, 2) + Math.pow(px2.y - px1.y, 2)
    );
}

function _rotate(px1, px2, px3) {
    return (px2.x-px1.x)*(px3.y-px2.y)-(px2.y-px1.y)*(px3.x-px2.x);
}

function _getClosestVertice(vertice, diagram, marked, bbox) {
    var voronoiId = vertice.voronoiId;
    // получаем всех соседей текущей точки
    var nPxs = [];
    diagram.cells[voronoiId].halfedges.forEach(function(halfedge) {
        var lSite = halfedge.edge.lSite;
        var rSite = halfedge.edge.rSite;
        if (lSite && lSite.voronoiId !== voronoiId && typeof(marked[lSite.voronoiId]) === 'undefined') {
            nPxs.push(lSite);
        }
        if (rSite && rSite.voronoiId !== voronoiId && typeof(marked[rSite.voronoiId]) === 'undefined') {
            nPxs.push(rSite);
        }
    });

    if (nPxs.length===0) {
        return null;
    }

    // проверяем наличие самого левого/правого/нижнего/верхнего соседа, такой сосед
    // гораздо приоритетней самого близкого, так как он составляет часть convex hull-а
    for (var i = 0; i < nPxs.length; i++) {
        if (nPxs[i].x === bbox.xl ||
            nPxs[i].x === bbox.xr ||
            nPxs[i].y === bbox.yt ||
            nPxs[i].y === bbox.yb) {
            return nPxs[i];
        }
    }

    // выбираем самого близкого соседа
    var minDist = Infinity;
    var closestVoronoiId = null;
    nPxs.forEach(function(nPx){
        var dist = _getDistance(vertice, nPx);
        if (dist < minDist) {
            closestVoronoiId = nPx.voronoiId;
            minDist = dist;
        }
    });
    
    return diagram.cells[closestVoronoiId].site;
    // function _isBordered(px) {
    //     var halfedges = diagram.cells[px.voronoiId].halfedges;
    //     for (var i = 0; i < halfedges.length; i++) {
    //         if (!halfedges[i].edge.lSite || !halfedges[i].edge.rSite) {
    //             return true;
    //         }
    //     }
    //     return false;
    // }
    // определяем углового соседа (у его ячейки меньше всего сторон)
    // var cornerNPx = null;
    // var minHalfedgesCount = Infinity;
    // var halfedgesCounts = [];
    // nPxs.forEach(function(nPx) {
    //     if (_isBordered(nPx)) {
    //         var count = diagram.cells[nPx.voronoiId].halfedges.length;
    //         if (count < minHalfedgesCount) {
    //             cornerNPx = nPx;
    //             halfedgesCounts.push(count);
    //         }
    //     }
    // });
    // function equals(element, index, array) {
    //     return element === array[0];
    // }
    // if (!(halfedgesCounts.length > 1 && halfedgesCounts.every(equals))) {
    //     // возвращаем углового соседа (он приоритетнее чем любой самый близкий)
    //     return cornerNPx;
    // }
}
window._getClosestVertice = _getClosestVertice;

function _getClosestPxIndex(px, pixels) {
    var closestPxDist = Infinity,
        closestPxIndex = null;
    for (var i = 0; i < pixels.length; i++) {
        if (pixels[i].marked === true) {
            continue;
        }
        var dist = _getDistance(px, pixels[i]);
        if (dist < closestPxDist) {
            closestPxIndex = i;
            closestPxDist = dist;
        }
    }
    return closestPxIndex;
}

function _getBbox(pixels) {
    var bbox = {
        xl:Infinity,
        xr:0,
        yt:Infinity,
        yb:0
    };

    pixels.forEach(function(px){
        if (px.x > bbox.xr) {
            bbox.xr = px.x;
        }
        if (px.x < bbox.xl) {
            bbox.xl = px.x;
        }
        if (px.y > bbox.yb) {
            bbox.yb = px.y;
        }
        if (px.y < bbox.yt) {
            bbox.yt = px.y;
        }
    });

    return bbox;
}
window._getBbox = _getBbox;


if (typeof define === 'function' && define.amd) {
    define(function() {
        return poly2cw;
    });
} else if (typeof module !== 'undefined') {
    module.exports = poly2cw;
} else {
    window.poly2cw = poly2cw;
}

})();