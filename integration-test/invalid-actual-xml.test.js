describe('comparing invalid XML', () => {
  it('should fail when expected is invalid', () => {
    expect(`<a`).toEqualXML(`<a/>`)
  })
})
