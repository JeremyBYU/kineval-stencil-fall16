
/**
 * A Cell represents an individual component in our discretized world map (a grid).
 * It hold its index position (i,j) and world position (x,y) - Discrete integers vs real valued numbers.
 * In addition it holds several properties that will come in handy during graph search algorithms.
 * Finally, it also overloads the valueOf operator so that Cells can be compared (i.e Cell1 > Cell2)
 * @class Cell
 */
class Cell {
  constructor(i, j, x, y, parent = null, distance = 100000, visited = false, priority = null, queued = false) {
    this.i = i
    this.j = j
    this.x = x
    this.y = y
    this.parent = parent
    this.distance = distance
    this.visited = visited
    this.priority = priority
    this.queued = queued
  }
  valueOf () {
    this.priority
  }
}

/**
 * 
 * 
 * @param {number} [x_start=-2] 
 * @param {number} [x_end=7] 
 * @param {number} [y_start=-2] 
 * @param {number} [y_end=7] 
 * @param {number} eps 
 * @returns {Cell[][]}
 */
exports.construct_map = function construct_map ({x_start = -2, x_end = 7, y_start = -2, y_end = 7, eps = .1}) {
  const G = []; // our global discretized map
  // It seems this is the open set or frontier variable he wants us to be using
  const visit_queue = [] // using array data structure
  // console.log(`${q_goal}`)
  for (let iind = 0, xpos = x_start; xpos < x_end; iind++ , xpos += eps) {
    G[ iind ] = [];
    for (let jind = 0, ypos = y_start; ypos < y_end; jind++ , ypos += eps) {
      G[ iind ][ jind ] = new Cell(iind, jind, xpos, ypos)
    }
  }

  return G
}

exports.world_to_cell = function world_to_cell(x, y, {x_start = -2, x_end = 7, y_start = -2, y_end = 7, eps = .1}) {
  x 
}

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
 * 
 * 
 * @param {Cell[]} cells 
 */
exports.extractIndexesFromCells = function extractIndexesFromCells(cells) {
  return cells.map((cell) => {
    return [cell.i, cell.j]
  })
}


