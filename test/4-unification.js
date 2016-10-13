const chai = require('chai')
const expect = chai.expect
const AST = require('../src/ast.js')
const mgu = require('../src/unification.js').mgu
const show = require('../src/typing-show.js')

describe('Unification', () => {
   it('Test unification of a recursive type', () => {
      const v = new AST.TypeVariable()
      const u = new AST.TypeConstructor('Sum', [
         new AST.TypeConstructor('1', []),
         new AST.TypeConstructor('Product', [
            new AST.TypeConstructor('Int', []),
            v
         ])
      ])
      v.unify(u) // create a cyclic type

      const t = new AST.TypeVariable()
      const z = mgu(t, u)
      expect(show.vars(z)).to.equal('A = Sum<1, Product<Int, B>> as B\n')
   })
})

