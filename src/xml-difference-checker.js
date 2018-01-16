require('colors')
const jsdiff = require('diff')
const format = require('pretty-data').pd

module.exports = class XMLDifferenceChecker {
  constructor (previousValue = '', nextValue = '') {
    this.previousValue = previousValue
    this.nextValue = nextValue
    this.formattedPreviousValue = this.formatXML(this.previousValue)
    this.formattedNextValue = this.formatXML(this.nextValue)
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

  formatXML (value) {
    return format.xml(value.trim())
  }
}
