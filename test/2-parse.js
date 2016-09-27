var chai = require('chai')
var expect = chai.expect
var parse = require('../src/parse.js')

describe('Parse', () => {
    it('parse empty source', () => {
        expect(parse('')).to.deep.equal({
            'status' : true,
            'value' : {'blk' : []}
        })
    })

    it('parse identifier', () => {
        expect(parse('xyz')).to.deep.equal({
            'status' : true,
            'value' : {'blk' : [{'var' : 'xyz'}]}
        })
    })

    it('parse simple assignment', () => {
        expect(parse('let x = 3')).to.deep.equal({
            'status' : true,
            'value' : {
                'blk' : [{'ass' : 'x', 'exp' : {'lit' : 3}}]
            }
        })
    })
    
    it('parse simple assignment, and expression', () => {
        expect(parse('let x = 3\nx')).to.deep.equal({
            'status' : true,
            'value' : {
                'blk' : [{'ass' : 'x', 'exp' : {'lit' : 3}}, {'var' : 'x'}]
            }
        })
    })

    it('parse anonymous function definition', () => {
        expect(parse('(x) => x')).to.deep.equal({
            'status' : true,
            'value' : {
                'blk' : [{'fn' : '', 'args' : ['x'], 'body' : {'rtn' : {'var' : 'x'}}}]
            }
        })
    })

    it('parse assignment of function definition', () => {
        expect(parse('let id = id(x) => x')).to.deep.equal({
            'status' : true,
            'value' : {
                'blk' : [{'ass' : 'id', 'exp' : {'fn' : 'id', 'args' : ['x'], 'body' : {'rtn' : {'var' : 'x'}}}}]
            }
        })
    })

    it('parse assignment of function definition, and application', () => {
        expect(parse('let id = id(x) => x\nid(42)')).to.deep.equal({
            'status' : true,
            'value' : {
                'blk' : [
                    {'ass' : 'id', 'exp' : {'fn' : 'id', 'args' : ['x'], 'body' : {'rtn' : {'var' : 'x'}}}},
                    {'app' : 'id', 'args' : [{'lit' : 42}]}
                ]
            }
        })
    })

    it('parse function definiton block indent', () => {
        expect(parse('let f = (x) =>\n g(x)\n g(x)')).to.deep.equal({})
    })
})

