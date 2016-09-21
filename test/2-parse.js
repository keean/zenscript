var chai = require('chai');
var expect = chai.expect;
var parse = require('../src/parse.js');

describe('Parse', function() {
    it('parse empty source', function() {
        expect(parse('')).to.deep.equal({
            'status' : true,
            'value' : {'blk' : []}
        });
    });

    it('parse identifier', function() {
        expect(parse('xyz')).to.deep.equal({
            'status' : true,
            'value' : {'blk' : [{'var' : 'xyz'}]}
        });
    });

    it('parse simple assignment', function() {
        expect(parse('x = 3')).to.deep.equal({
            'status' : true,
            'value' : {
                'blk' : [{'ass' : 'x', 'exp' : {'lit' : 3}}]
            }
        });
    });
    
    it('parse simple assignment, and expression', function() {
        expect(parse('x = 3\nx')).to.deep.equal({
            'status' : true,
            'value' : {
                'blk' : [{'ass' : 'x', 'exp' : {'lit' : 3}}, {'var' : 'x'}]
            }
        });
    });

    it('parse anonymous function definition', function() {
        expect(parse('(x) => x')).to.deep.equal({
            'status' : true,
            'value' : {
                'blk' : [{'fn' : '', 'args' : ['x'], 'body' : {'blk' : [{'var' : 'x'}]}}]
            }
        });
    });

    it('parse assignment of function definition', function() {
        expect(parse('id = id(x) => x')).to.deep.equal({
            'status' : true,
            'value' : {
                'blk' : [{'ass' : 'id', 'exp' : {'fn' : 'id', 'args' : ['x'], 'body' : {'blk' : [{'var' : 'x'}]}}}]
            }
        });
    });

    it('parse assignment of function definition, and application', function() {
        expect(parse('id = id(x) => x\nid(42)')).to.deep.equal({});
    });
});

