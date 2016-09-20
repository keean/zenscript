var chai = require('chai');
var expect = chai.expect;
var parse = require('../src/parse.js');

describe('Parse', function() {
    it('parse empty source', function() {
        expect(parse('')).to.deep.equal({
            'blk' : []
        });
    });

    it('parse identifier', function() {
        expect(parse('xyz')).to.deep.equal({
            'blk' : [{'var' : 'xyz'}]
        });
    });

    it('parse simple assignment', function() {
        expect(parse('x = 3')).to.deep.equal({
            'blk' : [{
                'ass' : 'x',
                'exp' : {'lit' : 3}
            }]
        });
    });
    
    it('parse simple assignment, and expression', function() {
        expect(parse('x = 3\nx')).to.deep.equal({
            'blk' : [{'ass' : 'x', 'exp' : {'lit' : 3}}, {'var' : 'x'}]
        });
    });
});

