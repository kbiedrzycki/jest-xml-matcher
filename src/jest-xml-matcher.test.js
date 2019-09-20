const {toEqualXML} = require('./jest-xml-matcher')

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

  it('ignores different encoding of characters', () => {
    const plainText = `<foo>hello</foo>`
    const escapedText = `<foo>&#104;&#101;&#108;&#108;&#111;</foo>`
    expect(plainText).toEqualXML(escapedText)
  })

  it('ignores comments in XML', () => {
    const plainText = `<foo><!-- hi --></foo>`
    const escapedText = `<foo></foo>`
    expect(plainText).toEqualXML(escapedText)
  })

  it('ignores whitespace differences', () => {
    const xmlOne = `<root><a>  foo  </a><b><c></c></b></root>`
    const xmlTwo = `
      <root>
        <a>  foo  </a>
        <b>
<c/>
</b>
      </root>
    `

    expect(xmlOne).toEqualXML(xmlTwo)
  })

  it(`doesn't ignore whitespace differences in text which is not entirely whitespace`, () => {
    const xmlOne = `<message>Hi there!</message>`
    const xmlTwo = `\
<message>
    Hi there!
</message>`

    expect(xmlOne).not.toEqualXML(xmlTwo)
  })

  it('does not ignore namespace prefix differences', () => {
    // Perhaps it should though...
    expect(`<a:foo xmlns:a="myns"/>`).not
      .toEqualXML(`<b:foo xmlns:b="myns"/>`)
  })

  it('does not ignore default namespace differences', () => {
    // Perhaps it should though...
    expect(`<foo xmlns="myns"/>`).not
      .toEqualXML(`<b:foo xmlns:b="myns"/>`)
  })

  it.each([
    [false, `<a`, `<a/>`, 'actual value is not valid XML:'],
    [true, `<a`, `<a/>`, 'actual value is not valid XML:'],
    [false, `<a/>`, `<a`, 'expected value is not valid XML:'],
    [true, `<a/>`, `<a`, 'expected value is not valid XML:'],
    [false, `<a`, `<a`, 'actual value is not valid XML:'],
    [true, `<a`, `<a`, 'actual value is not valid XML:']
  ])('fails when either XML document is malformed', (isNot, xmlOne, xmlTwo, message) => {
    const result = toEqualXML.call({isNot}, xmlOne, xmlTwo)
    expect(result.pass).toBe(isNot);  // false when expect().ToEqualXML(), true when expect().not.toEqualXML()
    expect(result.message()).toContain(message)
    expect(result.message()).toContain('unexpected end of input')
  })
})
