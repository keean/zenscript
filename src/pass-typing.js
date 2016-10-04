(() => {
"use strict"

// Typing

var AST = require('../src/ast.js')

var Integer_Type = new AST.Type_Constructor('Int', [])

AST.Literal_Int.prototype.pass_typing = function() {
    this.typing = new AST.Typing({}, Integer_Type)
}

AST.Variable.prototype.pass_typing = function() {
    var tyvar = new AST.Type_Variable()
    var mncxt = {}
    mncxt[this.name] = tyvar
    this.typing = new AST.Typing(mncxt, tyvar)
}

AST.Literal_Array.prototype.pass_typing = function() {
    throw 'array literal not supported in source language'
}

AST.Literal_Tuple.prototype.pass_typing = function() {
    for(var i = 0; i < this.expressions.length; ++i) {
        this.expressions[i].pass_typing()
    }
}

AST.Application.prototype.pass_typing = function() {
    for(var i = 0; i < this.args.length; ++i) {
        this.args[i].pass_typing()
    }
}

AST.Fn.prototype.pass_typing = function() {
    this.body.pass_typing()
}

AST.Declaration.prototype.pass_typing = function() {
    this.expression.pass_typing()
}

AST.Assignment.prototype.pass_typing = function() {
    this.expression.pass_typing()
}

AST.Return.prototype.pass_typing = function() {
    this.expression.pass_typing()
}

AST.Block.prototype.pass_typing = function() {
    for(var i = 0; i < this.statements.length; ++i) {
        this.statements[i].pass_typing()
    }
}

})()
