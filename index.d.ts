declare namespace jest {
  interface Matchers<R, T> {
    toEqualXML(xml: string): R
  }
}
