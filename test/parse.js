var chai = require('chai');
var expect = chai.expect;
var parse = require('../src/parse.js');

describe('Parse', function() {
    it('parse empty source', function() {
        expect(parse('')).to.deep.equal({});
    });

    it('parse identifier', function() {
        expect(parse('xyz')).to.deep.equal({
            'var' : 'xyz'
        });
    });

    it('parse simple assignment', function() {
        expect(parse('x = 3')).to.deep.equal({
            'ass' : 'x',
            'exp' : {'lit' : 3}
        });
    });
});

