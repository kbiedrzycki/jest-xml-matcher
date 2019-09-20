describe('comparing invalid XML', () => {
  it('should fail when actual is invalid', () => {
    expect(`<a/>`).toEqualXML(`<a`)
  })
})
