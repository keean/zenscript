(() => {
"use strict"

// This pass rewrites the AST converting Literal_Tuple -> Literal_Array

var AST = require('../src/ast.js')


AST.LiteralInt.prototype.pass_tuple_convert = function() {
    return this
}

AST.LiteralArray.prototype.pass_tuple_convert = function() {
    for(var i = 0; i < this.expressions.length; ++i) {
        this.expressions[i] = this.expressions[i].pass_tuple_convert()
    }
    return this
}

AST.LiteralTuple.prototype.pass_tuple_convert = function() {
   for(var i = 0; i < this.expressions.length; ++i) {
      this.expressions[i] = this.expressions[i].pass_tuple_convert()
   }

   const a = new AST.LiteralArray(this.expressions)
   a.typing = this.typing
   return a
}

AST.Variable.prototype.pass_tuple_convert = function() {
    return this
}

AST.Application.prototype.pass_tuple_convert = function() {
    for(var i = 0; i < this.arg.expressions.length; ++i) {
        this.arg.expressions[i] = this.arg.expressions[i].pass_tuple_convert()
    }
    this.fun = this.fun.pass_tuple_convert()
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
    this.expression = this.expression.pass_tuple_convert()
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
