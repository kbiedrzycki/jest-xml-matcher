require('./jest-xml-matcher')

const xmlOne = `
  <root>
    <child name="foo" value="bar">test</child>
  </root>
`

const xmlTwo = `
  <parent>
    <dad name="foo" value="baz">test</dad>
  </parent>
`

describe('jest-xml-matcher', () => {
  it('compares same XML structures', () => {
    expect(xmlOne).toEqualXMLStructure(xmlOne)
  })

  it('compares different XML structures', () => {
    expect(xmlOne).not.toEqualXMLStructure(xmlTwo)
  })
})
