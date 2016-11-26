module.exports = (() => {
"use strict"

const P = require('parsimmon')
const AST = require('../src/ast.js')

//------------------------------------------------------------------------
// Precedence Parser

class NullInfo {
   constructor(name, precedence, nullDenotation) {
      this.name = name
      this.precedence = precedence
      this.nullDenotation = nullDenotation
   }

   minimumPrecedence() {
      return this.precedence
   }
}

class LeftInfo {
   constructor(name, assoc, precedence, leftDenotation) {
      this.name = name
      this.assoc = assoc
      this.precedence = precedence
      this.leftDenotation = leftDenotation
   }

   minimumPrecedence() {
      if (this.assoc === AST.leftAssociative) {
         return this.precedence + 1
      } else if (this.assoc === AST.rightAssociative) {
         return this.precedence
      } else {
         throw "Unspecified associativity"
      }
   }
}

return Object.freeze({
   PrecedenceParser : class {
      constructor(operator, term) {
         this.operator = operator
         this.term = term
         this.leftMap = new Map()
         this.nullMap = new Map()
      }

      ledop(name, assoc, precedence, leftDenotation) {
         this.leftMap.set(name, new LeftInfo(name, assoc, precedence, leftDenotation))
      }

      nudop(name, precedence, nullDenotation) {
         this.nullMap.set(name, new NullInfo(name, precedence, nullDenotation))
      }

      parseNullDenotation() {
         return this.operator.chain((op) => {
            const info = this.nullMap.get(op)
            if (info) {
               return info.nullDenotation.call(this, info)
            }
            return P.fail('Unknown operator ' + op)
         })
      }
            
      parseLeftDenotation(precedence, lhs) {
         return this.operator.chain((op) => {
            const info = this.leftMap.get(op)
            if (info) {
               if (info.precedence < precedence) {
                  return P.fail('Precedence below minimum expected')
               }
               return info.leftDenotation.call(this, info, lhs).chain((lhs2) => {
                  return this.parseLeftDenotation(precedence, lhs2)
               })
            }
            return P.fail('Unkown operator ' + op)
         }).or(P.succeed(lhs))
      }

      parseExprWithMinimumPrecedence(precedence) {
         return this.term.or(this.parseNullDenotation()).chain((lhs) => {
            return this.parseLeftDenotation(precedence, lhs)
         })
      }
   }
})

})()


