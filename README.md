# jest-xml-matcher
Custom [Jest](https://facebook.github.io/jest/) matcher which can be used to find differences between XML structures

### Installation
It can be installed using [yarn](https://yarnpkg.com)
```
yarn add -D jest-xml-matcher
```
Or using [npm](https://www.npmjs.com/)
```
npm install --save-dev jest-xml-matcher
```

### Usage
Simplest way to use matcher with Jest is to modify `setupTestFrameworkScriptFile` configuration part.

To do this, include following part in `package.json`:
```
"jest": {
  "setupTestFrameworkScriptFile": "./node_modules/jest-xml-matcher/index.js",
  ...
}
```

Also it possible to use test entry file and include module there (as in `setupTests.js` while using [CRA](https://github.com/facebookincubator/create-react-app)):
```
require('jest-xml-matcher')
// or
import 'jest-xml-matcher'
```

By adding lines mentioned above, `expect` is being extended with `toEqualXML` check.
See examples for more explanation.

### Examples

Assuming you have following XML structures:

```
const actualXML = `
  <parent>
    <child attr="test">
      <anotherInside>That's changing</anotherInside>
    </child>
  </parent>
`

const expectedXML = `
  <parenting>
    <child attr="tested">
      <anotherInside>What a pity :(</anotherInside>
    </child>
  </parenting>
`
```

In test file you can write
```
expect(actualXML).toEqualXML(expectedXML)
```

Which should result in:

![example](https://raw.githubusercontent.com/kbiedrzycki/jest-xml-matcher/master/docs/example-test-result.png)
