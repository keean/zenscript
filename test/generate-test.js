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

    it('given a variable AST node, produce the JS for it', function() {
        var compiler = new TraitScript({'var' : 'x'});
        expect(compiler.generate()).to.equal("x");
    });

    it('given a simple application AST tree, produce the JS for it', function() {
        var compiler = new TraitScript({
            'app' : 'f', 
            'args' : [{'var' : 'x'}, {'var' : 'y'}]
        })
        expect(compiler.generate()).to.equal('f(x,y)');
    });

    it('given a simple function AST tree, produce the JS for it', function() {
        var compiler = new TraitScript({
            'fn' : 'f',
            'args' : ['x', 'y'],
            'body' : {
                'var' : 'x'
            }
        });
        expect(compiler.generate()).to.equal('function f(x,y){return x;}');
    });

    it('given a stament block in the AST tree, produce the JS for it', function() {
        var compiler = new TraitScript({
            'def' : [
                {'fn' : 'f', 'args' : ['x', 'y'], 'body' : {'var' : 'x'}}
            ],
            'blk' : [
                {'app' : 'f', 'args' : [{'lit' : '1'}, {'lit' : '2'}]}
            ]
        });
        expect(compiler.generate()).to.equal('function f(x,y){return x;}f(1,2);');
    });

    it('given a stament block in the AST tree, run the generated JS', function() {
        var compiler = new TraitScript({
            'def' : [
                {'fn' : 'f', 'args' : ['x', 'y'], 'body' : {'var' : 'x'}},
            ],
            'blk' : [
                {'app' : 'f', 'args' : [{'lit' : '1'}, {'lit' : '2'}]}
            ]
        });
        expect(eval(compiler.generate())).to.equal(1);
    });
});

