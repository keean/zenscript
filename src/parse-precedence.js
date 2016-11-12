module.exports = (() => {
"use strict"

const P = require('parsimmon')

//------------------------------------------------------------------------
// Precedence Parser

const lAssoc = {}
const rAssoc = {}

class NullInfo {
   constructor(name, precedence, nullDenotation) {
      this.name = name
      this.precedence = precedence
      this.nullDenotation = nullDenotation
   }
}

class LeftInfo {
   constructor(name, assoc, precedence, leftDenotation) {
      this.name = name
      this.assoc = assoc
      this.precedence = precedence
      this.leftDenotation = leftDenotation
   }
}

function precedenceValue(info) {
   if (info.assoc === lAssoc) {
      return info.precedence + 1
   } else if (info.assoc === rAssoc) {
      return info.precedence
   } else {
      throw "Unspecified associativity"
   }
}

return Object.freeze({
   lAssoc : lAssoc,
   rAssoc : rAssoc,
   PrecedenceParser : class {
      constructor(operator, term, inOp, preOp, postOp) {
         this.operator = operator
         this.term = term
         this.inOp = inOp
         this.preOp = preOp
         this.postOp = postOp
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
            return P.fail('Unknown operator ' + info.name)
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
            return P.fail('Unkown operator ' + info.name)
         }).or(P.succeed(lhs))
      }

      parseExprWithMinimumPrecedence(precedence) {
         return this.parseNullDenotation().or(this.term).chain((lhs) => {
            return this.parseLeftDenotation(precedence, lhs)
         })
      }

      parsePrefixOp(info) {
         return this.parseExprWithMinimumPrecedence(info.precedence).map((rhs) => {
            return this.preOp(info.name, rhs)
         })
      }

      parseInfixOp(info, lhs) {
         return this.parseExprWithMinimumPrecedence(precedenceValue(info)).map((rhs) => {
            return this.inOp(lhs, info.name, rhs)
         })
      }

      parsePostfixOp(info, lhs) {
         return P.succeed().map(() => {
            return this.postOp(info.name, lhs)
         })
      }

      parseExpr() {
         return this.parseExprWithMinimumPrecedence(0)
      }
   }
})

})()


