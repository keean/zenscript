var chai = require('chai');
var expect = chai.expect;
var TraitScript = require('../src/traitscript.js');

describe('Generator', function() {
    it('given an empty AST, produce an empty JS output', function() {
        var compiler = new TraitScript({});
        expect(compiler.generate()).to.equal("");
    });

    it('given a literal AST node, produce the JS for it', function() {
        var compiler = new TraitScript({'lit' : '1'});
        expect(compiler.generate()).to.equal("1");
    });
});

