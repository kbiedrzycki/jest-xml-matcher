require('colors')
const jsdiff = require('diff')

expect.extend({
  toEqualXMLStructure (actual, expected) {
    let differencesOutput = ''
    const differences = jsdiff.diffLines(actual, expected).filter(difference => difference.added || difference.removed)
    const pass = differences.length === 0

    differences.forEach(difference => {
      const color = difference.added ? 'green' : difference.removed ? 'red' : 'grey'

      differencesOutput += difference.value[color]
    });

    if (pass) {
      return {
        message: () => `XML structures are equal`,
        pass: true
      }
    } else {
      return {
        message: () => `XML structures are different:\n${differencesOutput}`,
        pass: false
      }
    }
  },
})
