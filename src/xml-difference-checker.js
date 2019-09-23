require('colors')
const jsdiff = require('diff')
const {normaliseXML, XMLParseError} = require('./xml-normaliser')

class MalformedXMLXMLDifferenceError extends Error {
  constructor(isPrevious, cause) {
    super()
    this.isPrevious = !!isPrevious
    this.cause = cause
  }

  get message() {
    return `${this.isPrevious ? 'previous' : 'next'} is not valid XML`
  }
}

class XMLDifferenceChecker {
  constructor (previousValue = '', nextValue = '') {
    this.previousValue = previousValue
    this.nextValue = nextValue
    this.formattedPreviousValue = XMLDifferenceChecker.formatXML(this.previousValue, true)
    this.formattedNextValue = XMLDifferenceChecker.formatXML(this.nextValue, false)
  }

  get differences () {
    return jsdiff.diffLines(this.formattedPreviousValue, this.formattedNextValue)
  }

  get hasDifferences () {
    return this.differences.filter(this.hasModifiedLines).length > 0
  }

  get formattedDifferences () {
    const differences = this.differences.map(difference => {
      const color = difference.added ? 'green' : difference.removed ? 'red' : 'grey'

      return difference.value[color]
    })

    return differences.join(``)
  }

  hasModifiedLines (difference) {
    return difference.added || difference.removed
  }

  static formatXML (value, isPrevious) {
    try {
      return normaliseXML(value)
    }
    catch (e) {
      if(e instanceof XMLParseError) {
        throw new MalformedXMLXMLDifferenceError(isPrevious, e)
      }
      throw e
    }
  }
}

module.exports = {XMLDifferenceChecker, MalformedXMLXMLDifferenceError}
