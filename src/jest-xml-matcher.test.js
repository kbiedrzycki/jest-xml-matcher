require('./jest-xml-matcher')

const xmlOne = `<root><child name="foo" value="bar">test</child></root>`
const xmlTwo = '<root><dad name="foo" value="baz">test</dad></root>'

describe('jest-xml-matcher', () => {
  it('compares same XML structures', () => {
    expect(xmlOne).toEqualXML(xmlOne)
  })

  it('compares different XML structures', () => {
    expect(xmlOne).not.toEqualXML(xmlTwo)
  })

  it('ignores formatting and order of attributes', () => {
    const regularAttributes = `<foo c="3" a="1" b="2"></foo>`
    const wrappedAttributes = `\
<foo a="1"
     c="3"
     b="2"></foo>`
    expect(regularAttributes).toEqualXML(wrappedAttributes)
  })

  it('compares different XML structures', () => {
    expect(xmlOne).not.toEqualXML(xmlTwo)
  })

  describe('one liner check', () => {
    it('does not find any differences', () => {
      const xmlOne = `<root></root>`
      const xmlTwo = `
        <root>
        </root>
      `

      expect(xmlOne).toEqualXML(xmlTwo)
    })
  })
})
