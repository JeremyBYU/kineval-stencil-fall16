/*  Please implement the heap data structure functions in this module
    All necessary function are stubbed out for you to complete
    The heap data structure should be a simple array ([]). The functions to insert
    and extract an element from the heap should follow the binary heap methodology.

    To determine the value of an item in the heap, please use the function valueOf().
    Example: 
      let heap = [1, 2, 3]
      let a = heap.pop() // 3
      let value = a.valueOf() // 3

    Example 2:
      let heap = [Cell1, Cell2, Cell3] // Cell objects
      let a = heap.pop() // Cell3
      let value = a.valueOf() // Cell3 value/priority as a real number
*/

const HEAP_TYPE = 'min' // Default heap type

/**
 * This function will insert an element into the heap array. Optionally specify the type of heap.
*  @template T - Any object that implements the operator .valueOf() to provide a real valued number
 * @param {T[]} heap - The heap array
 * @param {T} new_element - The new element to insert
 * @param {string} [type='min'] - Optional heap type specification. Possible values are 'min' or 'max'
 */
function minheap_insert(heap, new_element, type = HEAP_TYPE) {
    heap.push(new_element) // Push the new element to the end of the array
    let child_index = heap.length - 1
    let parent_index = get_parent_index(heap, child_index)
    swap_parents(heap, child_index, parent_index, type) // call recursive function to swap with parent
}


/**
 * 
 * 
 * @param {T[]} heap - The heap array
 * @param {Number} child_index 
 * @returns {number} parent_index - 
 */
function get_parent_index(heap, child_index) {
    if (child_index == 0)
        return -1
    // Get the correct parent index, check if even
    let parent_index = child_index % 2 == 0 ? (child_index - 2) / 2 : (child_index - 1) / 2
    return parent_index
}

/**
 * This function will recursively swap a child node with its parents node (bottom-up).
 * Swapping is performed based on the type
*  @template T - Any object that implement the operator .valueOf() to provide a real valued number
 * @param {T[]} heap 
 * @param {Number} child_index 
 * @param {Number} parent_index 
 * @param {string} [type='min'] 
 */
function swap_parents(heap, child_index, parent_index, type = HEAP_TYPE) {
    // Base Case if parent doesn't exist
    if (parent_index == -1)
        return
    let swap = false
    // Check swap conditions
    if (type == 'min' && heap[ parent_index ] > heap[ child_index ]) {
        swap = true
    } else if (type == 'max' && heap[ parent_index ] < heap[ child_index ]) {
        swap = true
    }
    if (swap) {
        const tmp = heap[ parent_index ]
        heap[ parent_index ] = heap[ child_index ]
        heap[ child_index ] = tmp
        let new_parent_index = get_parent_index(heap, parent_index)
        // recursive swap, the parent becomes the child
        swap_parents(heap, parent_index, new_parent_index, type)
    }

}

// assign insert function within minheaper object
minheaper.insert = minheap_insert;

/**
 * This function will extract a number from the bottom of the heap
 * and resort the heap based on the heap type
*  @template T - Any object that implement the operator .valueOf() to provide a real valued number
 * @param {T[]} heap 
 * @param {string} [type='min'] 
 */
function minheap_extract(heap, type = HEAP_TYPE) {
    let parent_index = 0
    const root = heap[ parent_index ]
    // Put last element in the root index
    heap[ parent_index ] = heap.pop()
    let left_child_index = 2 * parent_index + 1
    let right_child_index = 2 * parent_index + 2

    swap_children(heap, parent_index, left_child_index, right_child_index, type)
    return root // return the extracted value
}

/**
 * This function will recursively swap a parent with its children (top-down)
 * Swapping is carried out by the type of heap specified
*  @template T - Any object that implement the operator .valueOf() to provide a real valued number
 * @param {T[]} heap
 * @param {Number} p_index
 * @param {Number} lc_index 
 * @param {Number} rc_index 
 * @param {string} [type='min'] 
 */
function swap_children(heap, p_index, lc_index, rc_index, type = HEAP_TYPE) {
    // Swap with its smaller child in a min-heap and its larger child in a max-heap
    let lc_value = heap[ lc_index ] ? heap[lc_index] : undefined // The left child value
    let rc_value = heap[ rc_index ] ? heap[rc_index] : undefined // The right child value
    let child_swap_index = -1     // The index of the child to be swiped, -1 means no swap will occur 
    // Check if we have reached the bottom of the tree     
    if (typeof lc_value === 'undefined') {
        return
    }
    if (typeof rc_value === 'undefined') {
        rc_value = type == 'min' ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY
    }

    if (type == 'min' && (heap[ p_index ] > lc_value || heap[ p_index ] > rc_value)) {
        // We definitely need to swap, but need to determine which child
        child_swap_index = lc_value < rc_value ? lc_index : rc_index
    } else if (type == 'max' && (heap[ p_index ] < lc_value || heap[ p_index ] < rc_value)) {
        // We definitely need to swap, but need to determine which child
        child_swap_index = lc_value > rc_value ? lc_index : rc_index
    }
    if (child_swap_index !== -1) {
        let tmp = heap[ child_swap_index ]
        heap[ child_swap_index ] = heap[ p_index ]
        heap[ p_index ] = tmp

        let left_child_index = 2 * child_swap_index + 1
        let right_child_index = 2 * child_swap_index + 2
        swap_children(heap, child_swap_index, left_child_index, right_child_index, type)
    }

}


