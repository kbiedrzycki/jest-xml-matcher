export interface CustomMatcherResult {
  pass: boolean
  message: string | (() => string)
}

declare namespace jest {
  interface Matchers {
    toEqualXML (actual: string, expected: string): CustomMatcherResult
  }
}
