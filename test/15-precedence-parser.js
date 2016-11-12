const chai = require('chai')
const expect = chai.expect

const P = require('parsimmon')
const PP = require('../src/parse-precedence.js')

const hspace = P.regex(/[ ]*/)
function token(tok) {return tok.skip(hspace)}

const oper = token(P.regex(/[-+*/~]+/))
const term = token(P.regex(/[0-9]+/).map((i) => {return parseInt(i)}))

function inOp(lhs, name, rhs) {
   return {
      'in' : name,
      'lhs' : lhs,
      'rhs' : rhs
   }
}

function preOp(name, rhs) {
   return {
      'pre' : name,
      'rhs' : rhs
   }
}

function postOp(name, lhs) {
   return {
      'post' : name,
      'lhs' : lhs
   }
}

const PPP = new PP.PrecedenceParser(oper, term, inOp, preOp, postOp)

PPP.ledop('-', PP.lAssoc, 50, PPP.parseInfixOp)
PPP.ledop('+', PP.lAssoc, 50, PPP.parseInfixOp)
PPP.ledop('*', PP.lAssoc, 70, PPP.parseInfixOp) 
PPP.ledop('/', PP.lAssoc, 70, PPP.parseInfixOp)
PPP.ledop('++', null, 90, PPP.parsePostfixOp)
PPP.nudop('~', 30, PPP.parsePrefixOp)

describe('Precedence Parser', () => {
   it('parse operator expression', () => {
      expect(PPP.parseExpr().parse('8 + 8 * ~2++ - 1')).to.deep.equal({
         "status": true, "value": {
            "in": "+", "lhs": 8, "rhs": {
               "in": "*", "lhs": 8, "rhs": {
                  "pre": "~", "rhs": {
                     "in": "-", "lhs": {
                        "lhs": 2, "post": "++"
                     },
                     "rhs": 1
                  }
               }
            }
         }
      })
   })
})
