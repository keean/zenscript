var chai = require('chai')
var expect = chai.expect
var parse = require('../src/parse.js')
var generate = require('../src/generate.js')

describe('Integration', () => {
    it('parse simple assignment, and expression, then generate', () => {
        expect(generate(parse('let x = 3\nx').value)).to.equal('var x=3;x;')
    })

    it('parse simple assignment, and expression, then generate and eval', () => {
        /* jshint evil:true */
        expect(eval(generate(parse('let x = 3\nx').value))).to.equal(3)
        /* jshint evil:false */
    })

    it('parse function assignment, and expression, then generate', () => {
        expect(generate(parse('let id = id(x) => x').value)).to.equal('var id=function id(x){return x;};')
    })

    it('parse function assignment, and application, then generate', () => {
        /* jshint evil:true */
        expect(eval(generate(parse('let id = id(x) => x\nid(42)').value))).to.equal(42)
        /* jshint evil:false */
    })
})

