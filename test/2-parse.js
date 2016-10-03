var chai = require('chai')
var expect = chai.expect
var AST = require('../src/ast.js')
var parse = require('../src/parse.js')

describe('Parse', () => {
    it('parse empty source', () => {
        expect(parse('')).to.deep.equal({
            'status' : true,
            'value' : new AST.Block([])
        })
    })

    it('parse identifier', () => {
        expect(parse('xyz')).to.deep.equal({
            'status' : true,
            'value' : new AST.Block([new AST.Variable('xyz')])
        })
    })

    it('parse simple assignment', () => {
        expect(parse('let x = 3')).to.deep.equal({
            'status' : true,
            'value' : new AST.Block([new AST.Declaration('x', new AST.Literal_Int(3))])
        })
    })

    it('parse simple assignment, and expression', () => {
        expect(parse('let x = 3\nx')).to.deep.equal({
            'status' : true,
            'value' : new AST.Block([
                new AST.Declaration('x', new AST.Literal_Int(3)),
                new AST.Variable('x')
            ])
        })
    })

    it('parse anonymous function definition', () => {
        expect(parse('(x) => x')).to.deep.equal({
            'status' : true,
            'value' : new AST.Block([new AST.Fn('', ['x'], new AST.Return(new AST.Variable('x')))])
        })
    })

    it('parse assignment of function definition', () => {
        expect(parse('let id = id(x) => x')).to.deep.equal({
            'status' : true,
            'value' : new AST.Block([
                new AST.Declaration('id', new AST.Fn('id', ['x'], new AST.Return(new AST.Variable('x'))))
            ])
        })
    })

    it('parse assignment of function definition, and application', () => {
        expect(parse('let id = id(x) => x\nid(42)')).to.deep.equal({
            'status' : true,
            'value' : new AST.Block([
                new AST.Declaration('id', new AST.Fn('id', ['x'], new AST.Return(new AST.Variable('x')))),
                new AST.Application('id', [new AST.Literal_Int(42)])
            ])
        })
    })

    it('parse function definiton block indent', () => {
        expect(parse('let f = (x) =>\n g(x)\n g(x)')).to.deep.equal({
            'status' : true,
            'value' : new AST.Block([
                new AST.Declaration('f', new AST.Fn('', ['x'], new AST.Block([
                    new AST.Application('g', [new AST.Variable('x')]),
                    new AST.Application('g', [new AST.Variable('x')])
                ])))
            ])
        })
    })
})

