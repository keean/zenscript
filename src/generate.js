module.exports = (() => {
    "use strict"

var AST = require('../src/ast.js')

function spaces(i) {
    return ' '.repeat(i)
}

AST.Literal_Int.prototype.generate = function(indent) {
    return this.value.toString()
}

AST.Literal_Array.prototype.generate = function(indent) {
    return '[' + this.expressions.map((x) => x.generate(indent)).join(', ') + ']'
}

AST.Literal_Tuple.prototype.generate = function(indent) {
    throw 'Target language does not support tuples.'
}

AST.Variable.prototype.generate = function(indent) {
    return this.name
}

AST.Application.prototype.generate = function(indent) {
    return this.name + '(' + this.args.map((x) => x.generate(indent)).join(',') + ')'
}

AST.Fn.prototype.generate = function(indent) {
    return 'function' + (this.name ? ' ' : '') + this.name + '(' + this.args.join(',') + ') {\n' +
        this.body.generate(indent + 3) + spaces(indent) + '}'
}

AST.Declaration.prototype.generate = function(indent) {
    return spaces(indent) + 'var ' + this.name + ' = ' + this.expression.generate(indent) + ';\n'
}

AST.Assignment.prototype.generate = function(indent) {
    return spaces(indent) + this.name + ' = ' + this.expression.generate(indent) + ';\n'
}

AST.Return.prototype.generate = function(indent) {
    return spaces(indent) + 'return ' + this.expression.generate(indent) + ';\n'
}

AST.Block.prototype.generate = function(indent) {
    return this.statements.map((x) => x.generate(indent)).join('')
}

})()
