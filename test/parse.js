var chai = require('chai');
var expect = chai.expect;
var parse = require('../src/parse.js');

describe('Parse', function() {
    it('given an empty source, produce an empty AST output', function() {
        expect(parse('')).to.deep.equal({});
    });
});

