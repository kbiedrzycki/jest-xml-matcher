const DiffChecker = require('./xml-difference-checker')

expect.extend({
  toEqualXML (actual, expected) {
    const differencesChecker = new DiffChecker(actual, expected)

    if (!differencesChecker.hasDifferences) {
      return {
        message: () => `XML structures are equal`,
        pass: true
      }
    } else {
      return {
        message: () => `XML structures are different:\n${differencesChecker.formattedDifferences}`,
        pass: false
      }
    }
  }
})
