const search = require('../search') // import the module we wish to test
const fs = require('fs')  // need file system module to read our fixtures
const path = require('path')
const util = require('../util') // utility file

zip = (...rows) => [ ...rows[ 0 ] ].map((_, c) => rows.map(row => row[ c ])) // small utility function, pythons zip
const FIXTURE_FILE = path.join(__dirname, 'fixtures', 'maps.json')  // name of our fixture file
const FIXTURES = JSON.parse(fs.readFileSync(FIXTURE_FILE, 'utf8'));


// Check Module and function existence
describe('Search Module Existence', () => {
  test('Search module should exist', () => {
    expect(search).toBeDefined()
  });
  test('Search module to have getNeighbors function', () => {
    expect(typeof search.get_neighbors).toBe('function')
  });
});


// Check getNeighbors function
describe('Check getNeighbors function', () => {
  let testGroup = FIXTURES.getNeighbors
  for (let testName in testGroup) {
    test(`${testName}`, () => {
      // construct map
      let mapName = testGroup[ testName ].map
      let G = util.construct_map(FIXTURES.maps[ mapName ].bounds)
      let obstacles = FIXTURES.maps[ mapName ].obstacles
      // Get cell of interest
      let input = testGroup[ testName ].input
      let start_cell = util.world_to_cell(input[0], input[1])
      // console.log(start_grid)
      let neighborCells = search.get_neighbors(G[ start_cell[ 0 ] ][ start_cell[ 1 ] ], G, obstacles)
      // console.log(neighborCells)
      let neighbors = util.extractIndexesFromCells(neighborCells)
      let desiredNeighbors = util.worlds_to_cells(testGroup[ testName ].output)
      // console.log(neighbors)
      expect(neighbors).toEqual(desiredNeighbors)
      
    })

  }

});


