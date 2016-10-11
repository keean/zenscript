var chai = require('chai')
var expect = chai.expect
var parse = require('../src/parse.js')
var generate = require('../src/generate.js')

describe('Integration', () => {
    it('parse simple assignment, and expression, then generate', () => {
        expect((parse('let x = 3\nx').value).generate()).to.equal('var x = 3;\nx')
    })

    it('parse simple assignment, and expression, then generate and eval', () => {
        /* jshint evil:true */
        expect(eval((parse('let x = 3\nx').value).generate())).to.equal(3)
        /* jshint evil:false */
    })

    it('parse function assignment, and expression, then generate', () => {
        expect((parse('let id = id(x) => x').value).generate()).to.equal('var id = function id(x) {\nreturn x;\n};\n')
    })

    it('parse function assignment, and application, then generate', () => {
        /* jshint evil:true */
        expect(eval((parse('let id = id(x) => x\nid(42)').value).generate())).to.equal(42)
        /* jshint evil:false */
    })
})

