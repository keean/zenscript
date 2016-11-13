const chai = require('chai')
const expect = chai.expect

const P = require('parsimmon')
const PP = require('../src/parse-precedence.js')

const hspace = P.regex(/[ ]*/)
function token(tok) {return tok.skip(hspace)}

const oper = token(P.regex(/[-+*/~]+/))
const term = token(P.regex(/[0-9]+/).map((i) => {return parseInt(i)}))

const PPP = new PP.PrecedenceParser(oper, term)

PPP.ledop('-', PP.lAssoc, 50, function(info, lhs) {
   return this.parseExprWithMinimumPrecedence(info.minimumPrecedence()).map((rhs) => {
      return {'sub' : [lhs, rhs]}
   })
})

PPP.ledop('+', PP.lAssoc, 50, function(info, lhs) {
   return this.parseExprWithMinimumPrecedence(info.minimumPrecedence()).map((rhs) => {
      return {'add' : [lhs, rhs]}
   })
})

PPP.ledop('*', PP.lAssoc, 70, function(info, lhs) {
   return this.parseExprWithMinimumPrecedence(info.minimumPrecedence()).map((rhs) => {
      return {'mul' : [lhs, rhs]}
   })
})

PPP.ledop('/', PP.lAssoc, 70, function(info, lhs) {
   return this.parseExprWithMinimumPrecedence(info.minimumPrecedence()).map((rhs) => {
      return {'div' : [lhs, rhs]}
   })
})

PPP.ledop('++', null, 90, function(info, lhs) {
   return P.succeed({'post-inc' : [lhs]})
})

PPP.nudop('~', 30, function(info) {
   return this.parseExprWithMinimumPrecedence(info.minimumPrecedence()).map((rhs) => {
      return {'neg' : [rhs]}
   })
})

describe('Precedence Parser', () => {
   it('parse operator expression', () => {
      expect(PPP.parseExprWithMinimumPrecedence(0).parse('8 + 8 * ~2++ - 1')).to.deep.equal({
         "status": true, "value": {
            "add" : [8, {"mul" : [8, {"neg" :  [{"sub" : [{"post-inc" : [2]}, 1]}]}]}]
         }
      })
   })
})
