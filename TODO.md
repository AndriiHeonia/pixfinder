* Think about _splitByDist optimization. (Done!)
* See map example. Why some objects with ~1px distance recognizes as different objects? (Done!)
  It looks like disjointSet bug - connection destroys at some moment (Done!)
* Add option to disable skipping not boundary pixels (Done!)
* Refactor Pixfinder.js (namspaces, comments, etc), integrate jshint (Done!)
* Finish beer example and think what about noise (Done!)
* Write documentation (Done!)
* Write breadth-first search of the borders from point
* Try to integrate it to the real map
* Optimize _splitByDist() operation, now it's too long: O(n2)
* Implement geometries simplification, we need only corners
* What about polygons with holes?
* Write tests