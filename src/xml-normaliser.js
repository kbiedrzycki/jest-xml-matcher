const xmldom = require('xmldom')
const c14n = require('xml-crypto/lib/c14n-canonicalization')

module.exports = {}

class XMLParseError extends Error { }

const parseErrorHandler = err => { throw err }
const parser = new xmldom.DOMParser({
  locator: {}, // required for line/row numbers
  // Ignore warnings, but fail on any error
  errorHandler: {
    error: parseErrorHandler,
    fatalError: parseErrorHandler
  }
})

function parseXML(value) {
  try {
    return parser.parseFromString(value)
  } catch(e) {
    throw new XMLParseError(e.message || String(e))
  }
}

const canonicaliser = new c14n.C14nCanonicalization()

const ELEMENT_NODE = 1
const TEXT_NODE = 3
const COMMENT_NODE = 8

function shouldPreserveSpace(node, ancestorPreservesSpace) {
  const space = node.nodeType === ELEMENT_NODE && node.getAttribute('xml:space')
  if(space === 'default')
    return false
  return ancestorPreservesSpace || space === 'preserve'
}

function copyNodeList(nodeList) {
  return Array.prototype.slice.call(nodeList)
}

function stripWhitespaceTextNodes(node, ancestorPreservesSpace) {
  const preserveSpace = shouldPreserveSpace(node, ancestorPreservesSpace)

  if(!node.hasChildNodes()) return

  for(const child of copyNodeList(node.childNodes)) {
    if(!preserveSpace && child.nodeType === TEXT_NODE && /^\s*$/m.test(child.nodeValue)) {
      node.removeChild(child)
    }
    else {
      stripWhitespaceTextNodes(child, preserveSpace)
    }
  }
}

function stripCommentNodes(node) {
  if(!node.hasChildNodes()) return

  for(const child of copyNodeList(node.childNodes)) {
    if(child.nodeType === COMMENT_NODE) {
      node.removeChild(child)
    }
    else {
      stripCommentNodes(child)
    }
  }
}

function getIndent(level) {
  return '\n' + new Array(level).fill('  ').join('')
}

function indentElements(node, level, ancestorPreservesSpace) {
  const preserveSpace = shouldPreserveSpace(node, ancestorPreservesSpace)
  level = level || 0

  if(!node.hasChildNodes()) return

  let indentedChild = false
  for(const child of copyNodeList(node.childNodes)) {
    if(node.nodeType === ELEMENT_NODE && !preserveSpace && child.nodeType === ELEMENT_NODE) {
      node.insertBefore(node.ownerDocument.createTextNode(getIndent(level + 1)), child)
      indentedChild = true
    }

    indentElements(child, level + (node.nodeType === ELEMENT_NODE ? 1 :0), preserveSpace)
  }
  if(indentedChild) {
    node.appendChild(node.ownerDocument.createTextNode(getIndent(level)))
  }
}

function normaliseXML(value) {
  const doc = parseXML(value)
  doc.normalize()
  stripWhitespaceTextNodes(doc)
  stripCommentNodes(doc)
  indentElements(doc)

  return canonicaliser.process(doc.documentElement)
}

module.exports = {
  _copyNodeList: copyNodeList,
  _indentElements: indentElements,
  _parseXML: parseXML,
  _shouldPreserveSpace: shouldPreserveSpace,
  _stripCommentNodes: stripCommentNodes,
  _stripWhitespaceTextNodes: stripWhitespaceTextNodes,
  normaliseXML,
  XMLParseError
}
