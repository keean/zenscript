const chai = require('chai')
const expect = chai.expect
const AST = require('../src/ast.js')
const mgu = require('../src/unification.js').mgu
const parse = require('../src/parse.js').type
const Show = require('../src/typing-show.js')

describe('Unification', () => {
   it('Test unification of a recursive type', () => {
      const v = new AST.TypeVariable()
      const u = new AST.TypeConstructor('Sum', [
         new AST.TypeConstructor('Unit', []),
         new AST.TypeConstructor('Product', [
            new AST.TypeConstructor('Int', []),
            v
         ])
      ])
      v.unify(u) // create a cyclic type

      const t = new AST.TypeVariable()
      const z = mgu(t, u)
      const show = new Show()
      expect(show.vars(z)).to.equal('A = Sum<Unit, Product<Int, B>> as B\n')
   })
})

