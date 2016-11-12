module.exports = (() => {
"use strict"

const P = require('parsimmon')

//------------------------------------------------------------------------
// Indentation Parser

function IndentationParser(init) {
   this.indent = init
}

IndentationParser.prototype.get = function() {
   return this.indent
}

IndentationParser.prototype.set = function(i) {
   this.indent = i
}

IndentationParser.prototype.relative = function(relation) {
   return P((stream, i) => {
      let j = 0
      while (stream.charAt(i + j) == ' ') {
         j = j + 1
      }
      if (relation.op(j, this.indent)) {
         return P.makeSuccess(i + j, j)
      } else {
         return P.makeFailure(i, 'indentation error: ' + j + relation.err + this.indent)
      }
   })
}

IndentationParser.prototype.absolute = function(target) {
   return P((stream, i) => {
      let j = 0
      while (stream.charAt(i + j) == ' ') {
         j = j + 1
      }
      if (j == target) {
         return P.makeSuccess(i + j, j)
      } else {
         return P.makeFailure(i, 'indentation error: ' + j + ' does not equal ' + target)
      }
   })
}

IndentationParser.prototype.eq  = {op: (x, y) => {return x == y}, err: ' does not equal '}
IndentationParser.prototype.ge  = {op: (x, y) => {return x >= y}, err: ' is not equal or greater than '}
IndentationParser.prototype.gt  = {op: (x, y) => {return x > y}, err: ' is not greater than '}
IndentationParser.prototype.any = {op: (x, y) => {return true}, err: ' cannot fail '}

return IndentationParser

})()

