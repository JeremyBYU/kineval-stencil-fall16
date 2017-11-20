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
   * This will return ALL neighboring cells from a given cell
   * It does this by applying the left, right, up, and down actions (in that specific order)
   * @param {Cell} cell 
   * @return {Cell[]} neighbors
   */
  function get_all_neighbors (cell) {
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
  * It ensures that the resulting neighbor is in bounds and obstacle free
  * @param {Cell} cell 
  * @return {Cell[]} neighbors
  */
  exports.get_neighbors = function get_neighbors (cell) {
    // index of the cell
    let neighbors = get_all_neighbors(cell)

    const filtered_neighbors = neighbors.filter((neighbor) => {
      const world_coords = [ neighbor.x, neighbor.y ]
      const collision_detected = testCollision(world_coords)
      // Neighbor can't hit an obstacle, can't be in closed set
      return !collision_detected && !neighbor.visited
    })
    return filtered_neighbors
  }


})(typeof exports === 'undefined' ? this[ 'search' ] = {} : exports);