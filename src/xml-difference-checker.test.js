const {XMLDifferenceChecker, MalformedXMLXMLDifferenceError} = require('./xml-difference-checker')

let diffChecker

const previousValue = `<test><deep>test</deep></test>`
const nextValue = `<parent>test</parent>`

describe('xml-difference-checker', () => {
  it('formats input values', () => {
    diffChecker = new XMLDifferenceChecker(previousValue, nextValue)

    const expectedNextValue = `<parent>test</parent>`
    const expectedPreviousValue = `<test>
  <deep>test</deep>
</test>`

    expect(diffChecker.formattedPreviousValue).toEqual(expectedPreviousValue)
    expect(diffChecker.formattedNextValue).toEqual(expectedNextValue)
  })

  describe('#hasDifferences', () => {
    it('returns true if there are differences between xml structures', () => {
      diffChecker = new XMLDifferenceChecker(previousValue, nextValue)
      expect(diffChecker.hasDifferences).toBe(true)
    })

    it('returns false if xml structures are same', () => {
      diffChecker = new XMLDifferenceChecker(previousValue, previousValue)
      expect(diffChecker.hasDifferences).toBe(false)
    })
  })

  describe('#formattedDifferences', () => {
    it('returns string of formatted differences', () => {
      diffChecker = new XMLDifferenceChecker(previousValue, nextValue)

      expect(diffChecker.formattedDifferences).toContain(`<parent>test</parent>`)
    })
  })

  describe('#differences', () => {
    it('returns differences between xml structures as array of diff objects', () => {
      diffChecker = new XMLDifferenceChecker(previousValue, nextValue)

      expect(diffChecker.differences).toEqual([
        {
          count: 3,
          added: undefined,
          removed: true,
          value: `<test>\n  <deep>test</deep>\n</test>`
        },
        {
          count: 1,
          added: true,
          removed: undefined,
          value: `<parent>test</parent>`
        }
      ])
    })
  })

  describe('error handling', () => {
    it.each([
      [true, `<a`, `<a/>`],
      [false, `<a/>`, `<a`],
    ])('constructor throws when previous value is not valid XML', (isPrevious, previous, next) => {
      let err
      try { new XMLDifferenceChecker(previous, next) }
      catch (e) { err = e; }

      expect(err instanceof MalformedXMLXMLDifferenceError).toBe(true)
      expect(err.isPrevious).toBe(isPrevious)
      expect(err.cause.message).toContain('unexpected end of input')
    })
  })
})
