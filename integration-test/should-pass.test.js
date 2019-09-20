it('should match equivalent XML', () => {
  const expected = `<a b="1" a="2"><b/></a>`
  const actual = `\
<a b="1"
   a="2">
    <b/>
</a>`
  expect(expected).toEqualXML(actual)
})

it('should reject equivalent XML with .not', () => {
  expect(`<a/>`).not.toEqualXML(`<b/>`)
})
