var chai = require('chai');
var expect = chai.expect;
var parse = require('../src/parse.js');
var generate = require('../src/generate.js');

describe('Integration', function() {
    it('parse simple assignment, and expression, then generate and eval', function() {
        expect(generate(parse('x = 3\nx'))).to.equal('x=3;x;');
    });
});

