(() => {
"use strict"

const AST = require('../src/ast.js')
const MultiMap = require('../src/multimap.js')
const inst = require('../src/typing-instantiate.js')
const unify = require('../src/unification.js')

const IntegerType = new AST.TypeConstructor('Int', [])

AST.LiteralInt.prototype.pass_typing = function() {
   this.typing = new AST.Typing(new MultiMap(), IntegerType)
   return this.typing
}

AST.Variable.prototype.pass_typing = function() {
   this.typing = new AST.Typing(new MultiMap(), new AST.TypeVariable())
   this.typing.context.set(this.name, this.typing.type)
   return this.typing
}

AST.LiteralTuple.prototype.pass_typing = function() {
   const context = new MultiMap()
   const type = new AST.TypeConstructor('Product', new Array(this.expressions.length))
   for (let i = 0; i < this.expressions.length; ++i) {
       const typing = this.expressions[i].pass_typing()
       context.union(typing.context)
       type.params[i] = typing.type
   }
   this.typing = new AST.Typing(context, type)
   return this.typing
}

AST.LiteralArray.prototype.pass_typing = function() {
   throw 'array literal not supported in source language'
}

AST.Application.prototype.pass_typing = function() {
   const f = inst(this.fun.pass_typing())
   const a = inst(this.arg.pass_typing())
   f.context.union(a.context)
   const t = new AST.Typing(f.context, new AST.TypeVariable())
   const u = new AST.TypeConstructor('Arrow', [a.type, t.type])
   unify.types(f.type, u)
   this.typing = t
   return this.typing
}

AST.Fn.prototype.pass_typing = function() {
   const b = inst(this.body.pass_typing())
   const ps = new AST.TypeConstructor('Product', new Array())
   for (const r of this.args) {
      const a = new AST.TypeVariable()
      const ts = b.context.get(r) || []
      for (const t of ts) {
         unify.types(a, t)
      }
      b.context.erase(r)
      ps.params.push(a)
   }
   this.typing = new AST.TypeConstructor('Arrow', [ps, b.type])
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
   this.typing = this.expression.typing
   return this.typing
}

AST.Block.prototype.pass_typing = function() {
   for(var i = 0; i < this.statements.length; ++i) {
      this.statements[i].pass_typing()
   }
   this.typeing = this.statements[this.statements.length - 1].typing
   return this.typing
}

})()
