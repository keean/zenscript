const chai = require('chai')
const expect = chai.expect
const AST = require('../src/ast.js')
const Generate = require('../src/generate.js')

const generate = new Generate()

describe('Generate', () => {
   it('given an empty AST, produce an empty JS output', () => {
      expect(generate.minimal(new AST.Block([]))).to.equal('')
   })

   it('given a literal AST node, produce the JS for it', () => {
      expect(generate.minimal(new AST.LiteralInt(1))).to.equal('1')
   })

   it('given a variable AST node, produce the JS for it', () => {
      expect(generate.minimal(new AST.Variable('x'))).to.equal('x')
   })

   it('given a simple application AST tree, produce the JS for it', () => {
      expect(generate.minimal(new AST.Application(new AST.Variable('f'), new AST.LiteralTuple([
         new AST.Variable('x'),
         new AST.Variable('y')
      ])))).to.equal('f(x,y)')
   })

   it('given a simple function AST tree, produce the JS for it', () => {
      expect(generate.minimal(
         new AST.Fn('f', [new AST.Variable('x'), new AST.Variable('y')], new AST.Return(new AST.Variable('x')))
      )).to.equal('function f(x,y){return x;}')
   })

   it('given a stament block in the AST tree, produce the JS for it', () => {
      expect(generate.minimal(new AST.Block([
         new AST.Fn('f', [new AST.Variable('x'), new AST.Variable('y')], new AST.Return(new AST.Variable('x'))),
         new AST.Application(new AST.Variable('f'), new AST.LiteralTuple([new AST.LiteralInt(1), new AST.LiteralInt(2)]))
      ]))).to.equal('function f(x,y){return x;}f(1,2)')
   })

   it('given a stament block in the AST tree, run the generated JS', () => {
      /* jshint evil:true */
      expect(eval(generate.minimal(new AST.Block([
         new AST.Fn('f', [new AST.Variable('x'), new AST.Variable('y')], new AST.Return(new AST.Variable('x'))),
         new AST.Application(new AST.Variable('f'), new AST.LiteralTuple([new AST.LiteralInt(1), new AST.LiteralInt(2)]))
      ])))).to.equal(1)
      /* jshint evil:false */
   })

   it('given a function definition and application, generate the AST', () => {
      expect(generate.minimal(new AST.Block([
         new AST.Assignment('id', new AST.Fn('id', [new AST.Variable('x')], new AST.Return(new AST.Variable('x')))),
         new AST.Application(new AST.Variable('id'), new AST.LiteralTuple([new AST.LiteralInt(42)]))
      ]))).to.equal('id=function id(x){return x;};id(42)')
   })
})

