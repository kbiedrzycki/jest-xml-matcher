const xmldom = require('xmldom')
const {
  _copyNodeList,
  _indentElements,
  _parseXML,
  _shouldPreserveSpace,
  _stripCommentNodes,
  _stripWhitespaceTextNodes,
  normaliseXML,
  XMLParseError
} = require('./xml-normaliser')

describe('xml-normaliser', () => {
  describe('parseXML', () => {
    it('parses valid XML', () => {
      const doc = _parseXML(`<a foo="abc">hi</a>`)
      expect(doc.documentElement.nodeName).toBe("a")
      expect(doc.documentElement.getAttribute("foo")).toBe("abc")
      expect(doc.documentElement.textContent).toBe("hi")
    })

    it('throws an error given invalid XML', () => {
      expect(() => _parseXML(`<a`)).toThrow(XMLParseError)
      expect(() => _parseXML(`<a`)).toThrow('unexpected end of input')
    })
  })

  describe('shouldPreserveSpace', () => {
    it.each([
      [`<a xml:space="preserve"/>`, true, true],
      [`<a xml:space="preserve"/>`, false, true],
      [`<a xml:space="default"/>`, true, false],
      [`<a xml:space="default"/>`, false, false],
      [`<a/>`, true, true],
      [`<a/>`, false, false]
    ])('_shouldPreserveSpace(%s, %s) === %s', (xml, ancestorPreserves, expected) => {
      const el = _parseXML(xml).documentElement
      expect(_shouldPreserveSpace(el, ancestorPreserves)).toBe(expected)
    })
  })

  describe('copyNodeList', () => {
    it('returns the same elements', () => {
      expect.assertions(3)
      const nodes = _parseXML(`<a><b/><c/></a>`).documentElement.childNodes
      const copy = _copyNodeList(nodes)
      expect(copy.length).toBe(nodes.length)
      for(let i = 0; i < copy.length; ++i) {
        expect(nodes[i]).toBe(copy[i])
      }
    })

    it('returns distinct arrays', () => {
      const nodes = _parseXML(`<a><b/><c/></a>`).documentElement.childNodes
      expect(_copyNodeList(nodes)).not.toBe(nodes)
      expect(_copyNodeList(nodes)).not.toBe(_copyNodeList(nodes))
    })
  })

  function transform(xml, filter) {
    const doc = _parseXML(xml)
    filter(doc)
    return new xmldom.XMLSerializer().serializeToString(doc)
  }

  describe('stripWhitespaceTextNodes', () => {
    it('preserves non-whitespace text', () => {
      const input = `<a> foo </a>`
      expect(transform(input, _stripWhitespaceTextNodes)).toBe(input)
    })

    it('strips whitespace text', () => {
      const input = `
<a   foo="1"
\tbar="2"  >\t
    <foo       >

</foo>
</a>

`
      const output = `<a foo="1" bar="2"><foo/></a>`
      expect(transform(input, _stripWhitespaceTextNodes)).toBe(output)
    })

    it('preserves whitespace when xml:space="preserve" applies', () => {
      const input = `\
<a>
    <b xml:space="preserve">
        <c   a="1"       b="2">  </c>
        <c xml:space="default">
            <d>  </d>
        </c>
    </b>
    <b>
        <c>  </c>
    </b>
</a>`
      const output = `\
<a><b xml:space="preserve">
        <c a="1" b="2">  </c>
        <c xml:space="default"><d/></c>
    </b><b><c/></b></a>`

      expect(transform(input, _stripWhitespaceTextNodes)).toBe(output)
    })
  })

  describe('stripCommentNodes', () => {
    it('strips comment nodes', () => {
      const input = `<!-- hi -->
<a>
    <!-- foo -->
    <b/>
    <!--
      sdf
      abc -->
    <c>
        <!-- xyz -->
    </c>
</a>`
      const output = `
<a>
....
    <b/>
....
    <c>
........
    </c>
</a>`.replace(/\./g, ' ')
      expect(transform(input, _stripCommentNodes)).toBe(output)
    })
  })

  describe('indentElements', () => {
    it('indents elements', () => {
      const input = `<a><b/><c><d/><e/></c></a>`
      const output = `\
<a>
  <b/>
  <c>
    <d/>
    <e/>
  </c>
</a>`
      expect(transform(input, _indentElements)).toBe(output)
    })

    it(`doesn't indent non-elements`, () => {
      const input = `<a><!-- hi --><b/><c><d/><e>foo</e><!-- abc --></c></a>`
      const output = `\
<a><!-- hi -->
  <b/>
  <c>
    <d/>
    <e>foo</e><!-- abc -->
  </c>
</a>`
      expect(transform(input, _indentElements)).toBe(output)
    })
  })

  describe('normaliseXML', () => {
    it('normalises entities in text', () => {
      const input = `<a>&#104;&#101;&#108;&#108;&#111;</a>`
      const output = `<a>hello</a>`
      expect(normaliseXML(input)).toBe(output)
    })

    it('sorts attributes', () => {
      const input =  `<a b:a="4" xmlns:a="z" xmlns:b="a" e="3" c="1" d="2" a:a="5"></a>`
      const output = `<a xmlns:a="z" xmlns:b="a" c="1" d="2" e="3" b:a="4" a:a="5"></a>`
      expect(normaliseXML(input)).toBe(output)
    })

    it('strips whitespace, removes comments and indents', () => {
      const input = `\
<!-- abc -->
<a>
 <b/>
 <b>
        <c xml:space="preserve">  <d/>  <d/> <d   />\t</c>
</b>
</a>`
      const output = `\
<a>
  <b></b>
  <b>
    <c xml:space="preserve">  <d></d>  <d></d> <d></d>\t</c>
  </b>
</a>`
      expect(normaliseXML(input)).toBe(output)
    })
  })
})
