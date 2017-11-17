/**
 * @author Jeremy Castagno <jdcasta@umich.edu>
 * @author Your Name <your_email.edu>
 * 
 * 
 * Please implement the heap functions in this module
 * All necessary function are stubbed out for you to complete
 * The heap data structure should be a simple array ([]). The functions to insert
 * and extract an element from the heap should follow the binary heap methodology.
 *
 * Please also ensure that all items that are to be inserted in the heap have a properly 
 * overloaded .valueOf() method that returns a real valued number.  Numbers have this built in,
 * but custom objects must be have this configured correctly.
 * 
 * 
 */

const HEAP_TYPE = 'min' // Default heap type
console.log('Loaded heap.js')
/**
 * This function will insert an element into the heap array.
 * @template T - Any object that implements the operator .valueOf() to provide a real valued number
 * @param {T[]} heap - The heap array
 * @param {T} new_element - The new element to insert
 * @param {string} [type='min'] - Optional heap type specification. Possible values are 'min' or 'max'
 * @returns {void}
 */
function minheap_insert (heap, new_element, type = HEAP_TYPE) {
  heap.push(new_element) // Push the new element to the end of the array
  let child_index = heap.length - 1
  let parent_index = get_parent_index(child_index)
  swap_parents(heap, child_index, parent_index, type) // call recursive function to swap with parent
}


/**
 * This function will properly get the parent index when provided a child index.
 * @param {Number} child_index - The child items index in the heap
 * @returns {number} parent_index - The parents items index in the heap
 */
function get_parent_index (child_index) {
  if (child_index == 0)
    return -1
  // Get the correct parent index, check if even
  let parent_index = child_index % 2 == 0 ? (child_index - 2) / 2 : (child_index - 1) / 2
  return parent_index
}

/**
 * This function will recursively swap a child node with its parents node (bottom-up, used after an insert).
 * @template T - Any object that implements the operator .valueOf() to provide a real valued number
 * @param {T[]} heap - The heap array
 * @param {Number} child_index - The child items index in the heap
 * @param {Number} parent_index - The parent items index in the heap
 * @param {string} [type='min'] - Optional heap type specification. Possible values are 'min' or 'max'
 * @returns {void}
 */
function swap_parents (heap, child_index, parent_index, type = HEAP_TYPE) {
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
    let new_parent_index = get_parent_index(parent_index)
    // recursive swap, the parent becomes the child
    swap_parents(heap, parent_index, new_parent_index, type)
  }

}

// assign insert function within minheaper object
// minheaper.insert = minheap_insert;

/**
 * This function will extract a number from the top of the heap
 * and resort the heap based on the heap type
 * @template T - Any object that implements the operator .valueOf() to provide a real valued number
 * @param {T[]} heap - The heap array
 * @param {string} [type='min'] - Optional heap type specification. Possible values are 'min' or 'max'
 * @returns {T} root - The item at the top of the heap tree
 */
function minheap_extract (heap, type = HEAP_TYPE) {
  let parent_index = 0
  const root = heap[ parent_index ]
  // Put last element in the root index
  heap[ parent_index ] = heap.pop()
  let left_child_index = 2 * parent_index + 1
  let right_child_index = 2 * parent_index + 2
  // recursively swap the parent with the child
  swap_children(heap, parent_index, left_child_index, right_child_index, type)
  return root // return the extracted value
}

/**
 * This function will recursively swap a parent with its children (top-down)
 * Swapping is carried out by the type of heap specified
 * @template T - Any object that implements the operator .valueOf() to provide a real valued number
 * @param {T[]} heap - The heap array
 * @param {Number} p_index - Parent items index in the heap
 * @param {Number} lc_index - The left child's index of the parent
 * @param {Number} rc_index - The right child's index of the 
 * @param {string} [type='min'] - Optional heap type specification. Possible values are 'min' or 'max'
 */
export function swap_children (heap, p_index, lc_index, rc_index, type = HEAP_TYPE) {
  // Swap with its smaller child in a min-heap and its larger child in a max-heap
  let lc_value = heap[ lc_index ] ? heap[ lc_index ] : undefined // The left child value
  let rc_value = heap[ rc_index ] ? heap[ rc_index ] : undefined // The right child value
  let child_swap_index = -1  // The index of the child to be swiped, -1 means no swap will occur 
  // Check if we have reached the bottom of the tree     
  if (typeof lc_value === 'undefined') {
    return
  }
  if (typeof rc_value === 'undefined') {
    // if no right child exists, then provide it a default value
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

