
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



exports.world_to_cell = function world_to_cell(x, y, {x_start = -2, x_end = 7, y_start = -2, y_end = 7, eps = .1} = {} ) {
  delta_x = x - x_start
  delta_y = y - y_start
  i = Math.round(delta_x / eps)
  j = Math.round(delta_y / eps)
  return [i, j]
}

exports.worlds_to_cells = function worlds_to_cells(worlds) {
  cells = worlds.map((world) => {
    return exports.world_to_cell(...world)
  })
  return cells
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


