var chai = require('chai');
var expect = chai.expect;
var TraitScript = require('../src/traitscript.js');

describe('Generator', function() {
    it('generate() should produce an empty JS file when passed an empty AST', function() {
        var compiler = new TraitScript();
        expect(compiler.generate({})).to.equal("");
    });
});
