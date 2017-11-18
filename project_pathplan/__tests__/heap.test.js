const heap = require('../heap') // import the module we wish to test
const fs = require('fs')  // need file system module to read our fixtures
const path = require('path')

const FIXTURE_FILE = path.join(__dirname, 'fixtures', 'heaps.json')  // name of our fixture file

zip = (...rows) => [...rows[0]].map((_,c) => rows.map(row => row[c])) // small utility function, pythons zip

// Check Module and function existence
describe('Heap Module Existence', () => {
  test('Heap module should exist', () => {
    expect(heap).toBeDefined()
  });
  test('Heap module to have insert function', () => {
    expect(typeof heap.insert).toBe('function')
  });
  test('Heap module to have extract function', () => {
    expect(typeof heap.extract).toBe('function')
  })
});

// Run through Min Heap test by running against our fixtures
describe('Min Heap Insert/Extract Tests', () => {
  let tests = JSON.parse(fs.readFileSync(FIXTURE_FILE, 'utf8'));
  // Iterate through each of our fixture test (each test is specific heap we are testing)
  for(let heapName in tests) {
    let testParams = tests[heapName]
    let heapType = testParams.type
    describe(`${heapName} Test`, () => {
      // Test Insert Function
      test('Insert', () => {
        let heapCopy = testParams.heap.slice()
        let insertTests = zip(testParams.insert.items, testParams.insert.output)
        for([item, output] of insertTests) {
          heap.insert(heapCopy, item, heapType)
          expect(heapCopy).toEqual(output)
        }
      })
      // Test Extract Function
      test('Extract', () => {
        let heapCopy = testParams.heap.slice()
        for(item of testParams.extract.output) {
          heap.extract(heapCopy, heapType)
          expect(heapCopy).toEqual(item)
        }
      })
    })
  }
});

