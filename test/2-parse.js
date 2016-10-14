var chai = require('chai')
var expect = chai.expect
var AST = require('../src/ast.js')
var parse = require('../src/parse.js')

describe('Parse', () => {
   it('parse empty source', () => {
      expect(parse.program('')).to.deep.equal({
         'status' : true,
         'value' : new AST.Block([])
      })
   })

   it('parse identifier', () => {
      expect(parse.program('xyz')).to.deep.equal({
         'status' : true,
         'value' : new AST.Block([new AST.Variable('xyz')])
      })
   })

   it('parse application', () => {
      expect(parse.program('f(x)')).to.deep.equal({
         "status": true,
         "value": new AST.Block([
            new AST.Application(
               new AST.Variable('f'),
               new AST.LiteralTuple([new AST.Variable('x')]
            ))])
      })
   })

    it('parse simple assignment', () => {
        expect(parse.program('let x = 3')).to.deep.equal({
            'status' : true,
            'value' : new AST.Block([new AST.Declaration('x', new AST.LiteralInt(3))])
        })
    })

    it('parse simple assignment, and expression', () => {
        expect(parse.program('let x = 3\nx')).to.deep.equal({
            'status' : true,
            'value' : new AST.Block([
                new AST.Declaration('x', new AST.LiteralInt(3)),
                new AST.Variable('x')
            ])
        })
    })

    it('parse anonymous function definition', () => {
        expect(parse.program('(x) => x')).to.deep.equal({
            'status' : true,
            'value' : new AST.Block([new AST.Fn('', ['x'], new AST.Return(new AST.Variable('x')))])
        })
    })

    it('parse assignment of function definition', () => {
        expect(parse.program('let id = id(x) => x')).to.deep.equal({
            'status' : true,
            'value' : new AST.Block([
                new AST.Declaration('id', new AST.Fn('id', ['x'], new AST.Return(new AST.Variable('x'))))
            ])
        })
    })

    it('parse assignment of function definition, and application', () => {
        expect(parse.program('let id = id(x) => x\nid(42)')).to.deep.equal({
            'status' : true,
            'value' : new AST.Block([
                new AST.Declaration('id', new AST.Fn('id', ['x'], new AST.Return(new AST.Variable('x')))),
                new AST.Application(new AST.Variable('id'), new AST.LiteralTuple([new AST.LiteralInt(42)]))
            ])
        })
    })

    it('parse function definiton block indent', () => {
        expect(parse.program('let f = (x) =>\n g(x)\n g(x)')).to.deep.equal({
            'status' : true,
            'value' : new AST.Block([
                new AST.Declaration('f', new AST.Fn('', ['x'], new AST.Block([
                    new AST.Application(new AST.Variable('g'), new AST.LiteralTuple([new AST.Variable('x')])),
                    new AST.Application(new AST.Variable('g'), new AST.LiteralTuple([new AST.Variable('x')]))
                ])))
            ])
        })
    })
})

