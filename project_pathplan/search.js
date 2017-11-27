/**
 * @author Jeremy Castagno <jdcasta@umich.edu>
 * @author Your Name <your_email.edu>
 * 
 * 
 * Please implement the search functions in this module
 * All necessary function are stubbed out for you to complete
 * 
 * List of Global variables available for you (that are needed):
 * 1. {Cell[][]} - G: The global map. All cells are initialized for you.
 * 2. {Cell[]} - visit_queue: The queue used in graph search.  Often called the open set or frontier.
 * 3. {[number, number]} - q_goal: World position coordinates in array for goal
 * 4. 
 */

// This Immediately Invoked Function Expression (IIFE) is used to allow this module to be used in the 
// browser as well as in nodejs. In the browser this module will be be available under the global variable 'search'.
// In node it can bre "required" as per usual using the CommonJS standard.
(function (exports) {




  /**
 * This function will determine if the configuration is in a collision with an obstacle
 * 
 * @param {[number, number]} q - [x,y]  world coordinates
 * @returns {boolean}
 */
  function testCollision (q, range) {

    var j, i;

    // test for collision with each object
    for (j = 0; j < range.length; j++) {

      // assume configuration is in collision
      var in_collision = true;

      // no collision detected, if configuration is outside obstacle along any dimension
      for (i = 0; i < q.length; i++) {
        if ((q[ i ] < range[ j ][ i ][ 0 ]) || (q[ i ] > range[ j ][ i ][ 1 ]))
          in_collision = false;
      }

      // return collision, if configuration inside obstacle extents along all dimensions
      if (in_collision)
        return true;
    }

    // return no collision, if no collision detected with any obstacle
    return false;
  }

  /**
   * This will return ALL neighboring cells from a given cell
   * It does this by applying the left, right, up, and down actions (in that specific order)
   * @param {Cell} cell 
   * @param {Cell[][]} G - The global discretized map
   * @return {Cell[]} neighbors
   */
  function get_all_neighbors (cell, G) {
    // index of the cell
    let i = cell.i, j = cell.j
    // list of neighbors
    let neighbors = []

    // Checking GRID bounds, not necessary if we are always inside an enclosing obstacle,
    // but just in case someone specifies outside a grid.
    if (i !== 0) {
      neighbors.push(G[ i - 1 ][ j ])     // left
    }
    if (i !== G.length - 1) {
      neighbors.push(G[ i + 1 ][ j ])     // right   
    }
    if (j !== 0) {
      neighbors.push(G[ i ][ j - 1 ])     // up
    }
    if (j !== G[ i ].length - 1) {
      neighbors.push(G[ i ][ j + 1 ])     // down
    }
    return neighbors
  }

  /**
  * This will return the neighboring cells from a given cell
  * It does this by applying the left, right, up, and down actions
  * It ensures that the resulting neighbor is in bounds, obstacle free, and not previously visited
  * @param {Cell} cell 
  * @param {Cell[][]} G - The global discretized map
  * @return {Cell[]} neighbors
  */
  exports.get_neighbors = function get_neighbors (cell, G, obstacles) {
    // index of the cell
    let neighbors = get_all_neighbors(cell, G)

    const filtered_neighbors = neighbors.filter((neighbor, obstacles) => {
      const world_coords = [ neighbor.x, neighbor.y ]
      const collision_detected = testCollision(world_coords, obstacles)
      // Neighbor can't hit an obstacle, can't be in closed set
      return !collision_detected && !neighbor.visited
    })
    return filtered_neighbors
  }

  exports.testCollision = testCollision


})(typeof exports === 'undefined' ? this[ 'search' ] = {} : exports);