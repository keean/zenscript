var chai = require('chai')
var expect = chai.expect
var AST = require('../src/ast.js')
var generate = require('../src/generate.js')

describe('Generate', () => {
    it('given an empty AST, produce an empty JS output', () => {
        expect((new AST.Block([])).generate()).to.equal('')
    })

    it('given a literal AST node, produce the JS for it', () => {
        expect((new AST.Literal_Int(1)).generate()).to.equal('1')
    })

    it('given a variable AST node, produce the JS for it', () => {
        expect((new AST.Variable('x')).generate()).to.equal('x')
    })

    it('given a simple application AST tree, produce the JS for it', () => {
        expect((new AST.Application('f', [
            new AST.Variable('x'),
            new AST.Variable('y')
        ])).generate()).to.equal('f(x,y)')
    })

    it('given a simple function AST tree, produce the JS for it', () => {
        expect((
            new AST.Fn('f', ['x', 'y'], new AST.Return(new AST.Variable('x')))
        ).generate()).to.equal('function f(x,y){return x;}')
    })

    it('given a stament block in the AST tree, produce the JS for it', () => {
        expect((new AST.Block([
            new AST.Fn('f', ['x', 'y'], new AST.Return(new AST.Variable('x'))),
            new AST.Application('f', [new AST.Literal_Int(1), new AST.Literal_Int(2)])
        ])).generate()).to.equal('function f(x,y){return x;}f(1,2)')
    })

    it('given a stament block in the AST tree, run the generated JS', () => {
        /* jshint evil:true */
        expect(eval((new AST.Block([
            new AST.Fn('f', ['x', 'y'], new AST.Return(new AST.Variable('x'))),
            new AST.Application('f', [new AST.Literal_Int(1), new AST.Literal_Int(2)])
        ])).generate())).to.equal(1)
        /* jshint evil:false */
    })

    it('given a function definition and application, generate the AST', () => {
        expect((new AST.Block([
            new AST.Assignment('id', new AST.Fn('id', ['x'], new AST.Return(new AST.Variable('x')))),
            new AST.Application('id', [new AST.Literal_Int(42)])
        ])).generate()).to.equal('id=function id(x){return x;};id(42)')
    })
})

