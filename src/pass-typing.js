(() => {
"use strict"

const AST = require('../src/ast.js')
const MultiMap = require('../src/multimap.js')
const inst = require('../src/typing-instantiate.js')
const unify = require('../src/unification.js')
const Show = require('../src/typing-show.js')

const IntegerType = new AST.TypeConstructor('Int', [])
const UnitType = new AST.TypeConstructor('Unit', [])

AST.LiteralInt.prototype.pass_typing = function() {
   this.typing = new AST.Typing(new MultiMap(), IntegerType)
   return this.typing
}

AST.Variable.prototype.pass_typing = function() {
   this.typing = new AST.Typing(new MultiMap(), new AST.TypeVariable('VAR'))
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
   console.log('APPLY')
   const show = new Show()
   const f = inst(this.fun.pass_typing())
   console.log('F-TYPE: ' + show.typing(this.fun.typing))
   const a = inst(this.arg.pass_typing())
   f.context.union(a.context)
   const t = new AST.Typing(f.context, new AST.TypeVariable('APP'))
   const u = new AST.TypeConstructor('Arrow', [a.type, t.type])
   console.log('UNIFY: (' + show.type(f.type) + ') (' + show.type(u) + ')')
   unify.types(f.type, u)
   this.typing = t
   return this.typing
}

AST.Fn.prototype.pass_typing = function() {
   console.log('ABSTRACT')
   const b = inst(this.body.pass_typing())
   const ps = new AST.TypeConstructor('Product', new Array())
   for (const r of this.args) {
      const a = new AST.TypeVariable('FUN')
      const ts = b.context.get(r) || []
      for (const t of ts) {
         unify.types(a, t)
      }
      b.context.erase(r)
      ps.params.push(a)
   }

   this.typing = new AST.Typing(b.context, new AST.TypeConstructor('Arrow', [ps, b.type]))
   const show = new Show
   console.log('A_TYPE: ' + show.typing(this.typing))
   return this.typing
}

AST.Declaration.prototype.pass_typing = function() {
   const b = inst(this.expression.pass_typing())
   this.typing = new AST.Typing(b.context, UnitType)
   this.typing.effects.set(this.name, b.type)
   const show = new Show
   console.log('DECL: ' + show.typing(this.typing))
   return this.typing
  
}

AST.Assignment.prototype.pass_typing = function() {
   this.expression.pass_typing()
   this.typing = new AST.Typing(this.expression.context, UnitType)
   return this.typing
}

AST.Return.prototype.pass_typing = function() {
   this.expression.pass_typing()
   this.typing = this.expression.typing
   return this.typing
}

AST.Block.prototype.pass_typing = function() {
   const block_typing = new AST.Typing(new MultiMap(), UnitType)
   for(var i = 0; i < this.statements.length; ++i) {
      const statement_typing = this.statements[i].pass_typing()
      block_typing.context.union(statement_typing.context)
      block_typing.effects.union(statement_typing.effects)
      block_typing.type = statement_typing.type
   }
   this.typing = inst(block_typing)
   const show = new Show
   for (const key of this.typing.context.keys()) {
      const use = this.typing.context.get(key)
      const dcl = this.typing.effects.get(key)
      const t = new AST.TypeVariable
      for (const u of use) {
         unify.types(t, u)
      }
      for (const v of dcl) {
         unify.types(t, v)
      }
      this.typing.effects.erase(key)
   }
   return this.typing
}

})()
