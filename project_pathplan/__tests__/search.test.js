const search = require('../search') // import the module we wish to test
const fs = require('fs')  // need file system module to read our fixtures
const path = require('path')

const FIXTURE_FILE = path.join(__dirname, 'fixtures', 'heaps.json')  // name of our fixture file

zip = (...rows) => [...rows[0]].map((_,c) => rows.map(row => row[c])) // small utility function, pythons zip

// Check Module and function existence
describe('Search Module Existence', () => {
  test('Search module should exist', () => {
    expect(search).toBeDefined()
  });
  test('Search module to have getNeighbors function', () => {
    expect(typeof search.get_neighbors).toBe('function')
  });
});
