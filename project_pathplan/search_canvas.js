
// Constants for Potential energy Costs
const PE_OBSTACLE = 100
// Weighted cost constant for closeness to obstacle
const PE_LAMBDA = .033


/**
 * A Cell represents an individual component in our discretized world map (a grid).
 * It hold its index position (i,j) and world position (x,y) - Discrete integers vs real valued numbers.
 * In addition it holds several properties that will come in handy during graph search algorithms.
 * Finally, it also overloads the valueOf operator so that Cells can be compared (i.e Cell1 > Cell2)
 * @class Cell
 */
class Cell {
    constructor(i, j, x, y,  obstacle=false,  parent=null, distance=100000, visited=false, priority=null, queued=false) {
        this.i = i
        this.j = j
        this.x = x
        this.y = y
        this.parent = parent
        this.distance = distance
        this.visited = visited
        this.priority = priority
        this.queued = queued
        this.obstacle = obstacle
    }
    valueOf() {
        this.priority
    }
}

/**
 * Determines whether two floating point numbers are equal
 * 
 * @param {number} numb1 
 * @param {number} numb2 
 * @param {number} [epsilon=.000001] 
 * @returns {boolean} Whether they are equal
 */
function is_equal(numb1, numb2, epsilon = .00001) {
    let tmp; // Declare a temp to be assigned and compared to the allowed offset.
    // Subtract the two vales (Math.abs(x - y); may work but this is safer.)
    (numb1 < numb2) ? tmp = (numb2 - numb1) : tmp = (numb1 - numb2);
    // console.log(tmp)
    return tmp < epsilon;
}

function init() {

    // initialize search variables, data structures, DOM elements, etc.
    initSearch();

    // start main animation/iteration loop 
    animate();
}

function initSearch() {

    // specify default search algorithm to use for planning
    // search_alg = "depth-first";  
    //search_alg = "breadth-first";  
    //search_alg = "greedy-best-first";  
    search_alg = "A-star";
    //search_alg = "RRT";  
    //search_alg = "RRT-connect";  
    //search_alg = "RRT-star";  

    // specify default the world for the planner 
    //  (stored as "range" global variable with name "planning_scene")
    //planning_scene = "empty";
    //planning_scene = "misc";
    planning_scene = "narrow1";
    //planning_scene = "narrow2";
    //planning_scene = "three_sections";

    // specify default eps (epsilon) spatial resolution variable
    //   for RRT, specifies threshold radius for step size and reaching goal
    eps = 0.1;

    // create event handlers for the mouse
    canvas = document.getElementById("myCanvas");
    mouse_x = 0;
    mouse_y = 0;

    // when the mouse moves, update the mouse's location
    canvas.onmousemove = function handleMouseMove(event) {
        mouse_x = event.clientX;
        mouse_y = event.clientY;
    };

    // when the mouse button is pressed, update mouseDown
    canvas.onmousedown = function () {
        mouseDown = 1;
    };

    // when the mouse button is released, update mouseDown
    canvas.onmouseup = function () {
        mouseDown = 0;
        q_goal = [ xformViewWorldX(mouse_x), xformViewWorldY(mouse_y) ];

        // IMPORTANT: mouse_x and mouse_y are in absolute coordinates with
        //    respect to the browser window, and in units of pixels.  The
        //    xformViewWorldX only considers relative coordinates for the
        //    canvas element.
    };

    // specify start and goal configurations
    q_start_config = [ 0, 0 ];
    q_goal_config = [ 4, 4 ];
    q_init = q_start_config;
    q_goal = q_goal_config;
    // q_init = q_goal_config;
    // q_goal = q_start_config;

    var url_parsed = window.location.href.split("?");
    for (i = 1; i < url_parsed.length; i++) {
        var param_parsed = url_parsed[ i ].split("=");
        //eval(param_parsed[0]+"=\'"+param_parsed[1]+"\'");
        if ((param_parsed[ 0 ] !== "search_alg") && (param_parsed[ 0 ] !== "planning_scene"))
            eval(param_parsed[ 0 ] + "=" + param_parsed[ 1 ]);
        else
            eval(param_parsed[ 0 ] + "=\'" + param_parsed[ 1 ] + "\'");
    }

    // set the world for the planner 
    setPlanningScene();

    // initialize search tree from start configurations (RRT-based algorithms)
    T_a = initRRT(q_init);
    // also initialize search tree from goal configuration (RRT-Connect)
    T_b = initRRT(q_goal);

    // initialize graph search algorithms (DFS, BFS, A-star) 
    initSearchGraph();

    if (search_alg == 'potential-field') {
        initPotentialField()
    }

    // flag to continue or stop search iterations
    search_iterate = true;

    // counter for number of search iterations executed
    search_iter_count = 0;
    search_result = "starting";

    // threshold for number of maximum search iterations for certain algorithms
    search_max_iterations = 10000;

    // counter for number of configurations visited
    search_visited = 0;

    // variable to sum final path length
    path_length = 0;

    // capture the current system time for timing of successive iterations
    //   using the given Date object
    cur_time = Date.now();

    // specify minimum number of milliseconds between successive search 
    //   iterations
    min_msec_between_iterations = 20;

    // create textbar DOM element for text output to browser window
    textbar = document.createElement('div');
    textbar.style.zIndex = 0;    // if you still don't see the label, try uncommenting this
    textbar.style.position = 'absolute';
    textbar.style.width = window.width - 10;
    textbar.style[ "font-family" ] = "Monospace";
    textbar.style[ "font-size" ] = "14px";
    textbar.style.height = 20;
    textbar.style.color = "#000000";
    textbar.innerHTML = "4Progress - RRT Canvas";
    //textbar.style.top = 30 + 'px';  // position textbar wrt. document
    textbar.style.top = (25 + document.getElementById("myCanvas").offsetTop) + 'px';  // position textbar wrt. canvas
    textbar.style.left = 30 + 'px';
    document.body.appendChild(textbar);

}

//////////////////////////////////////////////////
/////     ANIMATION AND INTERACTION LOOP
//////////////////////////////////////////////////

function animate() {

    // IMPORTANT: 
    //   Search iterations occur asynchronously, once per call to this function.
    //   This structure does not use an explicit loop to advance the search.
    //   Such an explicit loop would keep the process inside this function
    //   without giving control back to the browser run-time.  As a result, 
    //   the browser would become non-responsive and non-interactive.
    //   In this asynchronous structure, the animate function is called to 
    //   first perform one iteration of the search algorithm, then register
    //   itself as an animation callback to the brower using the 
    //   requestAnimationFrame() function, and finally returning out of the
    //   function (giving control back to the browser).  
    //   requestAnimationFrame() sets this function to be executed 
    //   again in the very near future.  Such behavior is similar to expected 
    //   control flow of the setInterval function.

    // render the world to the canvas element
    drawRobotWorld();
    // search_iterate = false

    // make sure the rrt iterations are not running faster than animation update
    if (search_iterate && (Date.now() - cur_time > min_msec_between_iterations)) {

        // update time marker for last iteration update
        cur_time = Date.now();

        // update iteration count
        search_iter_count++;

        // call iteration for the selected search algorithm
        switch (search_alg) {
            case "depth-first":
            case "breadth-first":
            case "greedy-best-first":
            case "A-star":
                search_result = iterateGraphSearch();
                break;
            case 'potential-field':
                search_result = iteratePotentialFieldSearch();
                break;
            case "RRT":
                search_result = iterateRRT();
                break;
            case "RRT-connect":
                search_result = iterateRRTConnect();
                break;
            case "RRT-star":
                search_result = iterateRRTStar();
                break;
            default:
                console.warn('search_canvas: search algorithm not found, using rrt as default');
                search_result = iterateRRT();
                break;
        }
    }

    // update textbar with current search state
    textbar.innerHTML =
        search_alg + " progress: " + search_result
        + " <br> "
        + "start: " + q_init
        + " | "
        + "goal: " + q_goal
        + " <br> "
        + "iteration: " + search_iter_count
        + " | "
        + "visited: " + search_visited
        + " | "
        + "queue size: " + visit_queue.length
        + " <br> "
        + "path length: " + path_length.toFixed(2);
    //textbar.innerHTML += "<br> mouse ("+ mouse_x+","+mouse_y+")";
    textbar.innerHTML += "<br> mouse (" + xformViewWorldX(mouse_x) + "," + xformViewWorldY(mouse_y) + ")";

    if (search_result == 'failed' || search_result == 'succeeded') {
        search_iterate = false
    }
    if (search_result == 'succeeded') {
        const goal_cell = get_cell(q_goal[0], q_goal[1])
        // console.log(goal_cell) 
        // const goal_coords = [goal_cell.x, goal_cell.y]
        drawHighlightedPathGraph(goal_cell)
    }
    // callback request for the animate function be called again
    //   more details online:  http://learningwebgl.com/blog/?p=3189
    requestAnimationFrame(animate);
}


/**
 * These methods will abstract away from the data structure needed.
 * Whether its a LIFO/FIFO stack, or a Priority Queue (Min Heap)
*/
/**
 * This will return the next cell from the data structure
 * @param {Cell[]} data_structure 
 * @param {string} search_alg 
 * @returns {Cell}
 */
function next(data_structure, search_alg='depth-first') {
    if (search_alg === 'depth-first') {
        return data_structure.pop()
    } else if (search_alg === 'breadth-first') {
        return data_structure.shift()
    } else if (search_alg === 'A-star' || search_alg === 'greedy-best-first') {
        return minheap_extract(data_structure)
    } else {
        return data_structure.pop()
    }
}

/**
 * This will insert an item into the data structure
 * 
 * @param {Cell} item 
 * @param {Cell[]} data_structure 
 * @param {string} search_alg 
 * @returns 
 */
function insert(item, data_structure, search_alg='depth-first') {
    if (search_alg === 'depth-first' || search_alg === 'breadth-first') {
        return data_structure.push(item)
    } else if (search_alg === 'A-star' || search_alg === 'greedy-best-first') {
        return minheap_insert(data_structure, item)
    } else {
        return data_structure.push(item)
    }
}


/**
 * Returns the cell at the global world position
 * 
 * @param {Number} xpos 
 * @param {Number} ypos 
 * @returns {Cell}
 */
function get_cell(xpos, ypos) {
    const iind = Math.round((xpos - (-2)) / eps)
    const jind = Math.round((ypos - (-2)) / eps)
    const cell = G[iind][jind]
    return cell
}

/**
 * This will return the neighboring cells from a given cell
 * It does this by applying the left, right, up, and down actions
 * @param {Cell} cell 
 * @return {Cell[]} neighbors
 */
function get_all_neighbors(cell) {
    // index of the cell
    let i = cell.i, j = cell.j
    // list of neighbors
    let neighbors = []

    // Checking GRID bounds, not necessary if we are always inside an enclosing obstacle,
    // but just in case someone specifies outside a grid.
    if (i !== 0) {
        neighbors.push(G[i - 1][j])     // left
    }
    if (i !== G.length-1) {
        neighbors.push(G[i + 1][j])     // right   
    }
    if (j !== 0) {
        neighbors.push(G[i][j - 1])     // up
    }
    if (j !== G[i].length - 1) {
        neighbors.push(G[i][j + 1])     // down
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
function get_neighbors(cell) {
    // index of the cell
    let neighbors = get_all_neighbors(cell)

    const filtered_neighbors = neighbors.filter((neighbor) => {
        const world_coords = [neighbor.x, neighbor.y]
        const collision_detected = testCollision(world_coords)
        // Neighbor can't hit an obstacle, can't be in closed set
        return !collision_detected && !neighbor.visited
    })
    return filtered_neighbors
}

/**
 * This will check whether the cell is the goal node
 * 
 * @param {Cell} cell 
 * @param {[number, number]} goal 
 */
function goal_check(cell, goal) {
    const goal_cell = get_cell(goal[0], goal[1])
    const is_goal = goal_cell === cell
    return is_goal
}


/**
 * Returns the Euclidean distance between two cells
 * 
 * @param {Cell} cell1 
 * @param {Cell} cell2 
 */
function dist_cell(cell1, cell2){
    return distance(cell1.x, cell1.y, cell2.x, cell2.y)
}


/**
 * Returns the euclidean distance between two points
 * 
 * @param {number} x1 
 * @param {number} y1 
 * @param {number} x2 
 * @param {number} y2 
 * @returns 
 */
function distance(x1, y1, x2, y2){
    const dist = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
    return dist
}


/**
 * Calculates the fscore for a neighbor, give the current node and search algorithm type
 * @param {Cell} current_node 
 * @param {Cell} neighbor 
 * @param {string} [search_alg='A-star'] 
 * @returns 
 */
function fscore(current_node, neighbor, search_alg='A-star') {
    const goal_cell = get_cell(q_goal[0], q_goal[1])
    let score = current_node.distance +  dist_cell(current_node, neighbor)
    if (search_alg == 'A-star') {
        // User distance plus heuristic
        score += dist_cell(neighbor, goal_cell)
    } else if (search_alg == 'greedy-best-first') {
        // ONLY use heuristic
        score = dist_cell(neighbor, goal_cell)
    }
    return score
}


/**
 * This function will update the neighbor cell.
 * Update that is it queued, update its parent, update its distance, and update its priority
 * 
 * @param {Cell} current_node 
 * @param {Cell} neighbor 
 */
function update_cell(current_node, neighbor) {
    const goal_cell = get_cell(q_goal[0], q_goal[1])
    neighbor.queued = true // add to the open set and mark it
    neighbor.parent = current_node // add the current node as the parent
    neighbor.distance = current_node.distance + dist_cell(current_node, neighbor) 
    neighbor.priority = fscore(current_node, neighbor, search_alg)
}

function iteratePotentialFieldSearch() {
    // I'm using a queue of length 1!
    if (visit_queue.length == 0) {
        return 'failed'
    }
    // Get the cell on the local beam queue
    const current_node = next(visit_queue, search_alg)

    // Perform Goal Test
    if (goal_check(current_node, q_goal)) {
        return 'succeeded'
    }

    search_visited++
    // Draw the cell we are exploring
    draw_2D_configuration([current_node.x, current_node.y])

    // Get all possible neighbors from this cell
    const neighbors = get_all_neighbors(current_node)
    // Select the best neighbor, based on the potential field
    const best_neighbor = neighbors.sort((a, b) => a.priority - b.priority)[0]
    best_neighbor.parent = current_node
    best_neighbor.distance = current_node.distance + dist_cell(current_node, best_neighbor)
    insert(best_neighbor, visit_queue, search_alg)

    if (best_neighbor.priority > current_node.priority) {
        // We went backwards!! Ball can't roll up a hill
        return 'failed'
    }
    
}

function iterateGraphSearch() {
    /* 
    Basic Algorithm for Graph Search - Begins with having a defined problem
    A problem is fully specified with: 
    * states - The specified grid                   - G
    * initial state - Where the initial state is    - q_init
    * actions - up, down, left, right
    * transition model - deterministic transition
    * goal test, a function to check if goal        - q_goal
    * path cost - euclidean distance cell to cell
    * heuristic - euclidean distance to goal        - heuristic_estimate

    Other Important Variables that may be implementation specific
    * frontier/open-set                             - visit_queue
        * Stack - BFS and DFS
        * Priority Queue (Min Heap) - A-star, Greedy best-first
    * closed-set/visited-set
        * Just use a flag on the nodes
        * 
    */
    // Check if the frontier (visit_queue) is empty
    // console.log('Before Empty Queue Check!')
    if (visit_queue.length == 0) {
        console.log('Search Failed')
        return 'failed'
    }
    // Get the next node from the frontier, data structure and implementation methods abstracted
    const current_node = next(visit_queue, search_alg)
    // Check if current node is the goal
    if (goal_check(current_node, q_goal)) {
        console.log('Succeeded in search')
        return 'succeeded'
    }
    // Draw the cell we are exploring
    draw_2D_configuration([current_node.x, current_node.y])
    // Add the node to the explored/visited set.  More efficient to use a flag
    current_node.visited = true
    search_visited++ // It was never defined what this is precisely
    // This function ensures we only get neighbors not hitting obstacles or in closed set
    const neighbors = get_neighbors(current_node)
    // Loop through neighbors
    for(let i=0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];
        // Ensure neighbor is not in open set/visit_queue
        if (!neighbor.queued) {
            update_cell(current_node, neighbor)
            insert(neighbor, visit_queue, search_alg) // Insert because its NOT in the queue
            highlight_queue(neighbor)
        } else if (neighbor.priority >  fscore(current_node, neighbor, search_alg) && (search_alg == 'A-star' || search_alg == 'greedy-best-first') ) {
            // We have a better path!
            update_cell(current_node, neighbor)
            // DONT insert because it is already in the queue
        }

    }

    return 'normal'
}


/**
 * This function will highlight a cell that is in the queue
 * 
 * @param {Cell} cell 
 */
function highlight_queue(cell) {
    ctx.fillStyle = "#0088FF";
    ctx.fillRect(xformWorldViewX(cell.x)-1.5,xformWorldViewY(cell.y)-1.5,3,3);
}



function iterateRRT() {


    // STENCIL: implement a single iteration of an RRT algorithm.
    //   An asynch timing mechanism is used instead of a for loop to avoid 
    //   blocking and non-responsiveness in the browser.
    //
    //   Return "failed" if the search fails on this iteration.
    //   Return "succeeded" if the search succeeds on this iteration.
    //   Return "extended" otherwise.
    //
    //   Provided support functions:
    //
    //   testCollision - returns whether a given configuration is in collision
    //   tree_init - creates a tree of configurations
    //   insertTreeVertex - adds and displays new configuration vertex for a tree
    //   insertTreeEdge - adds and displays new tree edge between configurations
    //   drawHighlightedPath - renders a highlighted path in a tree
}

function iterateRRTConnect() {


    // STENCIL: implement a single iteration of an RRT-Connect algorithm.
    //   An asynch timing mechanism is used instead of a for loop to avoid 
    //   blocking and non-responsiveness in the browser.
    //
    //   Return "failed" if the search fails on this iteration.
    //   Return "succeeded" if the search succeeds on this iteration.
    //   Return "extended" otherwise.
    //
    //   Provided support functions:
    //
    //   testCollision - returns whether a given configuration is in collision
    //   tree_init - creates a tree of configurations
    //   insertTreeVertex - adds and displays new configuration vertex for a tree
    //   insertTreeEdge - adds and displays new tree edge between configurations
    //   drawHighlightedPath - renders a highlighted path in a tree
}

function iterateRRTStar() {

}

//////////////////////////////////////////////////
/////     STENCIL SUPPORT FUNCTIONS
//////////////////////////////////////////////////

// functions for transforming canvas coordinates into planning world coordinates
function xformWorldViewX(world_x) {
    return (world_x * 100) + 200;  // view_x
}
function xformWorldViewY(world_y) {
    return (world_y * 100) + 200;  // view_y
}
function xformViewWorldX(view_x) {
    return (view_x - 200) / 100;  // view_x
}
function xformViewWorldY(view_y) {
    return (view_y - 200) / 100;  // view_y
}


function drawRobotWorld() {

    // draw start and goal configurations
    c = document.getElementById("myCanvas");
    ctx = c.getContext("2d");
    ctx.fillStyle = "#0000FF";
    ctx.fillRect(xformWorldViewX(q_init[ 0 ]) - 5, xformWorldViewY(q_init[ 1 ]) - 5, 10, 10);
    ctx.fillStyle = "#00FF00";
    ctx.fillRect(xformWorldViewX(q_goal[ 0 ]) - 5, xformWorldViewY(q_goal[ 1 ]) - 5, 10, 10);

    // draw robot's world
    for (let j = 0; j < range.length; j++) {
        ctx.fillStyle = "#8888FF";
        ctx.fillRect(xformWorldViewX(range[ j ][ 0 ][ 0 ]), xformWorldViewY(range[ j ][ 1 ][ 0 ]), xformWorldViewX(range[ j ][ 0 ][ 1 ]) - xformWorldViewX(range[ j ][ 0 ][ 0 ]), xformWorldViewY(range[ j ][ 1 ][ 1 ]) - xformWorldViewY(range[ j ][ 1 ][ 0 ]));
    }

}

function drawHighlightedPath(path) {
    ctx = c.getContext("2d");
    ctx.strokeStyle = "#0000FF";
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 1; i < path.length; i++) {
        ctx.moveTo(xformWorldViewX(path[ i - 1 ].vertex[ 0 ]), xformWorldViewY(path[ i - 1 ].vertex[ 1 ]));
        ctx.lineTo(xformWorldViewX(path[ i ].vertex[ 0 ]), xformWorldViewY(path[ i ].vertex[ 1 ]));
    }
    ctx.stroke();
}

function drawHighlightedPathGraph(current_node) {
    // traverse path back to start and draw path
    ctx.strokeStyle = "#0000FF";
    ctx.lineWidth = 4;
    ctx.beginPath();
    path_length = 0;
    let q_path_ref = current_node;
    while (q_path_ref.distance > 0) {
        // KE: find cleaner way to draw edges
        //draw_2D_edge_configurations([q_path_ref.x,q_path_ref.y],[q_path_ref.parent.x,q_path_ref.parent.y]);
        ctx.moveTo(xformWorldViewX(q_path_ref.x), xformWorldViewY(q_path_ref.y));
        ctx.lineTo(xformWorldViewX(q_path_ref.parent.x), xformWorldViewY(q_path_ref.parent.y));
        path_length += Math.sqrt(Math.pow(q_path_ref.x - q_path_ref.parent.x, 2) + Math.pow(q_path_ref.y - q_path_ref.parent.y, 2));
        q_path_ref = q_path_ref.parent;
    }
    ctx.closePath();
    ctx.stroke();
}

function get_potenial_energy(cell) {
    // goal energy
    let potential_energy = distance(cell.x, cell.y, q_goal[0], q_goal[1]) 
    // collision energy
    if (testCollision([cell.x, cell.y])) {
        potential_energy += PE_OBSTACLE
    } else {
        let [closest_obstacle, dist] = get_closest_cell(cell, OBS_LIST)
        potential_energy += PE_LAMBDA * 1 / dist
    }
    
    return potential_energy
}


/**
 * Returns the closest cell from cell_list to cell1
 * 
 * @param {Cell} cell1 
 * @param {Cell[]} cell_list 
 * @returns {[Cell, number]}
 */
function get_closest_cell(cell1, cell_list) {
    let min_dist = 100000;
    let min_index = 0
    for(let i = 0; i < cell_list.length; i++) {
        let p_cell = cell_list[i];
        let dist = dist_cell(cell1, p_cell)
        if (dist < min_dist) {
            min_dist = dist
            min_index = i
        }
    }
    return [cell_list[min_index], min_dist]
}

function initPotentialField() {
    // Pontial Field Global Variable

    OBS_LIST = G.reduce(function(a,b) { return a.concat(b) })
                 .filter(function(cell) { return cell.obstacle });

    for(let i = 0; i < G.length; i++) {
        let row = G[i];
        for(let j = 0; j < row.length; j++) {
            let cell = G[i][j]
            cell.priority = get_potenial_energy(cell)
        }
    }
}


function initSearchGraph() {

    // initialize search graph as 2D array over configuration space 
    //   of 2D locations with specified spatial resolution 
    G = [];
    // It seems this is the open set or frontier variable he wants us to be using
    visit_queue = [] // using array data structure
    // console.log(`${q_goal}`)
    for (let iind = 0, xpos = -2; xpos < 7; iind++ , xpos += eps) {
        G[ iind ] = [];
        for (let jind = 0, ypos = -2; ypos < 7; jind++ , ypos += eps) {
            G[ iind ][ jind ] =  new Cell(iind, jin, xpos, ypos, testCollision([xpos, ypos]) )

            // STENCIL: determine whether this graph node should be the start point for the search
            if (is_equal(xpos, q_init[0]) && is_equal(ypos, q_init[1])) {
                G[ iind ][ jind ].distance = 0
                visit_queue.push(G[ iind ][ jind ])
            }

        }
    }
    // Setting initial priority for starting cell
    visit_queue[0].priority =  dist_cell(visit_queue[0], get_cell(q_goal[0], q_goal[1]))
}

function setPlanningScene() {

    // obstacles specified as a range along [0] (x-dimension) and [1] y-dimension
    range = []; // global variable

    // world boundary
    range[ 0 ] = [ [ -1.8, 5.8 ], [ -1.8, -1 ] ];
    range[ 1 ] = [ [ -1.8, 5.8 ], [ 5, 5.8 ] ];
    range[ 2 ] = [ [ -1.8, -1 ], [ -1.8, 5.8 ] ];
    range[ 3 ] = [ [ 5, 5.8 ], [ -1.8, 5.8 ] ];

    if (typeof planning_scene === 'undefined')
        planning_scene = 'empty';

    if (planning_scene == 'misc') {
        /*  misc stuff with narrow opening */
        range[ 4 ] = [ [ 1, 2 ], [ 1, 2 ] ];
        range[ 5 ] = [ [ 3, 3.3 ], [ 1, 4 ] ];
        range[ 6 ] = [ [ 0.6, 0.7 ], [ 0.4, 0.7 ] ];
        range[ 7 ] = [ [ 3.7, 3.9 ], [ -0.8, 5 ] ];
    }
    else if (planning_scene == 'narrow1') {
        /*  narrow path 1 */
        range[ 4 ] = [ [ 1, 3 ], [ 4, 5 ] ];
        range[ 5 ] = [ [ 1, 3 ], [ -1, 2 ] ];
        range[ 6 ] = [ [ 1, 1.95 ], [ 2, 3.8 ] ];
    }
    else if (planning_scene == 'narrow2') {
        /*  narrow path 2 */
        range[ 4 ] = [ [ 1, 3 ], [ 4, 5 ] ];
        range[ 5 ] = [ [ 1, 3 ], [ -1, 2 ] ];
        range[ 6 ] = [ [ 1, 1.9 ], [ 2, 3.8 ] ];
        range[ 7 ] = [ [ 2.1, 3 ], [ 2.2, 4 ] ];
    }
    else if (planning_scene == 'three_sections') {
        /*  three compartments */
        range[ 4 ] = [ [ 1, 1.3 ], [ 4, 5 ] ];
        range[ 5 ] = [ [ 1, 1.3 ], [ -1, 3.5 ] ];
        range[ 6 ] = [ [ 2.7, 3 ], [ -1, 0 ] ];
        range[ 7 ] = [ [ 2.7, 3 ], [ .5, 5 ] ];
    }
}


/**
 * This function will determine if the configuration is in a collision with an obstacle
 * 
 * @param {any} q - No freaking idea? - [x,y]  world coordinates
 * @returns 
 */
function testCollision(q) {

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

function initRRT(q) {

    // create tree object
    var tree = {};

    // initialize with vertex for given configuration
    tree.vertices = [];
    tree.vertices[ 0 ] = {};
    tree.vertices[ 0 ].vertex = q;
    tree.vertices[ 0 ].edges = [];

    // maintain index of newest vertex added to tree
    tree.newest = 0;

    return tree;
}

function insertTreeVertex(tree, q) {

    // create new vertex object for tree with given configuration and no edges
    new_vertex = {};
    new_vertex.edges = [];
    new_vertex.vertex = q;
    tree.vertices.push(new_vertex);

    // maintain index of newest vertex added to tree
    tree.newest = tree.vertices.length - 1;

    // draw location on canvas
    draw_2D_configuration(q);
}

function draw_2D_configuration(q) {
    // draw location of 2D configuration on canvas
    c = document.getElementById("myCanvas");
    ctx = c.getContext("2d");
    ctx.fillStyle = "#8888AA";
    ctx.fillRect(xformWorldViewX(q[ 0 ]) - 3, xformWorldViewY(q[ 1 ]) - 3, 6, 6);
}

function draw_2D_edge_configurations(q1, q2) {
    // draw line between locations of two 2D configurations on canvas
    c = document.getElementById("myCanvas");
    ctx = c.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(xformWorldViewX(q1[ 0 ]), xformWorldViewY(q1[ 1 ]));
    ctx.lineTo(xformWorldViewX(q2[ 0 ]), xformWorldViewY(q2[ 1 ]));
    ctx.stroke();
}

function insertTreeEdge(tree, q1_idx, q2_idx) {

    // add edge to first vertex as pointer to second vertex
    tree.vertices[ q1_idx ].edges.push(tree.vertices[ q2_idx ]);

    // add edge to second vertex as pointer to first vertex
    tree.vertices[ q2_idx ].edges.push(tree.vertices[ q1_idx ]);

    // draw edge on canvas
    draw_2D_edge_configurations(tree.vertices[ q1_idx ].vertex, tree.vertices[ q2_idx ].vertex);
}

//////////////////////////////////////////////////
/////     MIN HEAP IMPLEMENTATION FUNCTIONS
//////////////////////////////////////////////////

// inside heap.js


//////////////////////////////////////////////////
/////     RRT IMPLEMENTATION FUNCTIONS
//////////////////////////////////////////////////

// I dont think we are supposed to do this...

    // STENCIL: implement RRT-Connect functions here, such as:
    //   extendRRT
    //   connectRRT
    //   randomConfig
    //   newConfig
    //   findNearestNeighbor
    //   dfsPath