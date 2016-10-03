module.exports = (() => {
    "use strict"

// This pass removed tuples from the AST

var AST = require('../src/ast.js')


AST.Literal_Int.prototype.pass_tuple_convert = function() {
    return this
}

AST.Literal_Array.prototype.pass_tuple_convert = function() {
    for(var i = 0; i < this.expressions.length; ++i) {
        this.expressions[i] = this.expressions[i].pass_tuple_convert()
    }
    return this
}

AST.Literal_Tuple.prototype.pass_tuple_convert = function() {
    return new AST.Literal_Array(this.expressions)
}

AST.Variable.prototype.pass_tuple_convert = function() {
    return this
}

AST.Application.prototype.pass_tuple_convert = function() {
    for(var i = 0; i < this.args.length; ++i) {
        this.args[i] = this.args[i].pass_tuple_convert()
    }
    return this
}

AST.Fn.prototype.pass_tuple_convert = function() {
    this.body = this.body.pass_tuple_convert()
    return this
}

AST.Declaration.prototype.pass_tuple_convert = function() {
    this.expression = this.expression.pass_tuple_convert()
    return this
}

AST.Assignment.prototype.pass_tuple_convert = function() {
    this.expression = this.expression.pass__tuple_convert()
    return this
}

AST.Return.prototype.pass_tuple_convert = function() {
    this.expression = this.expression.pass_tuple_convert()
    return this
}

AST.Block.prototype.pass_tuple_convert = function() {
    for(var i = 0; i < this.statements.length; ++i) {
        this.statements[i] = this.statements[i].pass_tuple_convert()
    }
    return this
}

})()
