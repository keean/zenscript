(() => {
"use strict"

var AST = require('../src/ast.js')
var MultiMap = require('../src/multimap.js')
require('../src/typing-instantiate.js')
const unify = require('../src/unification.js')

var IntegerType = new AST.TypeConstructor('Int', [])

AST.LiteralInt.prototype.pass_typing = function() {
    this.typing = new AST.Typing(new MultiMap(), IntegerType)
    return this.typing
}

AST.Variable.prototype.pass_typing = function() {
    var tyvar = new AST.TypeVariable()
    var context = new MultiMap()
    context.set(this.name, tyvar)
    this.typing = new AST.Typing(context, tyvar)
    return this.typing
}

AST.LiteralTuple.prototype.pass_typing = function() {
    const context = new MultiMap()
    const type = new AST.TypeConstructor('Product', new Array(this.expressions.length))
    for (const [i,exp] of this.expressions.entries()) {
        exp.pass_typing()
        context.union(exp.typing.context)
        type.params[i] = exp.typing.type
    }
    this.typing = new AST.Typing(context, type)
    return this.typing
}

AST.LiteralArray.prototype.pass_typing = function() {
    throw 'array literal not supported in source language'
}

AST.Application.prototype.pass_typing = function() {
    const f = this.fun.pass_typing().instantiate()
    const a = this.arg.pass_typing().instantiate()
    f.context.union(a.context)
    const t = new AST.Typing(f.context, new AST.TypeVariable())
    const u = new AST.TypeConstructor('->', [a.type, t.type])
    unify(f.type, u)
    this.typing = t
    return this.typing
}

AST.Fn.prototype.pass_typing = function() {
    this.body.pass_typing()
    return this.typing
}

AST.Declaration.prototype.pass_typing = function() {
    this.expression.pass_typing()
    return this.typing
  
}

AST.Assignment.prototype.pass_typing = function() {
    this.expression.pass_typing()
    return this.typing
}

AST.Return.prototype.pass_typing = function() {
    this.expression.pass_typing()
    return this.typing
}

AST.Block.prototype.pass_typing = function() {
    for(var i = 0; i < this.statements.length; ++i) {
        this.statements[i].pass_typing()
    }
    return this.typing
}

})()
