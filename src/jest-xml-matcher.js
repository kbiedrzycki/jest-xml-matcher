const {XMLDifferenceChecker, MalformedXMLXMLDifferenceError} = require('./xml-difference-checker')

const matchers = {
  toEqualXML (actual, expected) {
    let differencesChecker
    try { differencesChecker = new XMLDifferenceChecker(actual, expected) }
    catch (e) {
      if(e instanceof MalformedXMLXMLDifferenceError) {
        return {
          pass: !!this.isNot, // fail regardless of whether .not is used
          message: () => `${e.isPrevious ? 'actual' : 'expected'} value is not valid XML:\n${e.cause.message}}`
        }
      }
      throw e
    }

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
}

expect.extend(matchers)
module.exports = matchers
