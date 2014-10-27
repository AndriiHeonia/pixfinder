'use strict';

// (Point, Point) -> Number
function dist(pt1, pt2) {
    return Math.sqrt(
        Math.pow(pt2.x - pt1.x, 2) + Math.pow(pt2.y - pt1.y, 2)
    );
}

exports.dist = dist;