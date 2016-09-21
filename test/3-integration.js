var chai = require('chai');
var expect = chai.expect;
var parse = require('../src/parse.js');
var generate = require('../src/generate.js');

describe('Integration', function() {
    it('parse simple assignment, and expression, then generate', function() {
        expect(generate(parse('x = 3\nx').value)).to.equal('x=3;x;');
    });

    it('parse simple assignment, and expression, then generate and eval', function() {
        /* jshint evil:true */
        expect(eval(generate(parse('x = 3\nx').value))).to.equal(3);
        /* jshint evil:false */
    });
});

