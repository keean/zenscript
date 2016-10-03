module.exports = (() => {
    "use strict"

var AST = require('../src/ast.js')

AST.Literal_Int.prototype.generate = function() {
    return this.value.toString()
}

AST.Literal_Array.prototype.generate = function() {
    return '[' + this.expressions.map((x) => x.generate()).join(', ') + ']'
}

AST.Literal_Tuple.prototype.generate = function() {
    throw 'Target language does not support tuples.'
}

AST.Variable.prototype.generate = function() {
    return this.name
}

AST.Application.prototype.generate = function() {
    return this.name + '(' + this.args.map((x) => x.generate()).join(',') + ')'
}

AST.Fn.prototype.generate = function() {
    return 'function ' + this.name + '(' + this.args.join(',') + '){' + this.body.generate() + '}'
}

AST.Declaration.prototype.generate = function() {
    return 'var ' + this.name + '=' + this.expression.generate() + ';'
}

AST.Assignment.prototype.generate = function() {
    return this.name + '=' + this.expression.generate() + ';'
}

AST.Return.prototype.generate = function() {
    return 'return ' + this.expression.generate() + ';'
}

AST.Block.prototype.generate = function() {
    return this.statements.map((x) => x.generate()).join('')
}

})()
