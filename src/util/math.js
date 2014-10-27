'use strict';

// (Point, Point) -> Number
function sqDist(pt1, pt2) {
    return Math.pow(pt2.x - pt1.x, 2) + Math.pow(pt2.y - pt1.y, 2);
}

exports.sqDist = sqDist;