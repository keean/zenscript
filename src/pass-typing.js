module.exports = (() => {
"use strict"

const AST = require('../src/ast.js')
const MultiMap = require('../src/multimap.js')
const inst = require('../src/typing-instantiate.js')
const unify = require('../src/unification.js')
const Show = require('../src/typing-show.js')

const IntegerType = new AST.TypeConstructor('Int', [])
const UnitType = new AST.TypeConstructor('Unit', [])

function deepFreeze(obj) {
   Object.freeze(obj)
   for (const k of Object.keys(obj)) {
      const p = obj[k]
      if (typeof p == 'object' && p !== null) {
         deepFreeze(p)
      }
   }
}

AST.LiteralInt.prototype.infer = function() {
   this.typing = new AST.Typing(IntegerType)
   deepFreeze(this.typing)
   return this.typing
}

AST.Variable.prototype.infer = function() {
   this.typing = new AST.Typing(new AST.TypeVariable('VAR'))
   this.typing.context.set(this.name, this.typing.type)
   deepFreeze(this.typing)
   return this.typing
}

AST.LiteralTuple.prototype.infer = function() {
   const context = new MultiMap
   const type = new AST.TypeConstructor('Product', new Array(this.expressions.length))
   for (let i = 0; i < this.expressions.length; ++i) {
       const typing = this.expressions[i].infer()
       context.union(typing.context)
       type.params[i] = typing.type
   }
   this.typing = new AST.Typing(type, context)
   deepFreeze(this.typing)
   return this.typing
}

AST.LiteralArray.prototype.infer = function() {
   throw 'array literal not supported in source language'
}

AST.Application.prototype.infer = function() {
   const f = inst(this.fun.infer())
   const a = inst(this.arg.infer())
   f.context.union(a.context)
   const t = new AST.Typing(new AST.TypeVariable, f.context)
   const u = new AST.TypeConstructor('Arrow', [a.type, t.type])
   unify.types(f.type, u)
   this.typing = t
   deepFreeze(this.typing)
   return this.typing
}

AST.Fn.prototype.infer = function() {
   const b = inst(this.body.infer())
   const ps = new AST.TypeConstructor('Product', new Array())
   for (const r of this.args) {
      const a = new AST.TypeVariable
      const ts = b.context.get(r) || []
      for (const t of ts) {
         unify.types(a, t)
      }
      b.context.erase(r)
      ps.params.push(a)
   }

   this.typing = new AST.Typing(new AST.TypeConstructor('Arrow', [ps, b.type]), b.context)
   deepFreeze(this.typing)
   return this.typing
}

AST.Declaration.prototype.infer = function() {
   this.typing = new AST.Typing(UnitType)
   this.typing.defined.set(this.name, this.expression.infer())
   const show = new Show
   deepFreeze(this.typing)
   return this.typing
  
}

AST.Assignment.prototype.infer = function() {
   throw 'assignment not implemented'
   /*this.expression.typing()
   this.typing = new AST.Typing(this.expression.context, UnitType)
   this.typing = new AST.Typing(new Map, UnitType)
   deepFreeze(this.typing)
   return this.typing*/
}

AST.Return.prototype.infer = function() {
   this.typing = this.expression.infer()
   return this.typing
}

function resolveReferences(context, defined) {
   const show = new Show
   let outcxt = new MultiMap
   for (const key of context.keys()) {  
      const p = defined.get(key)
      if (p !== undefined) {
         const m = inst(p)
         for (const c of context.get(key)) {
            unify.types(m.type, c)
         }
         outcxt.union(resolveReferences(m.context, defined))
      } else {
         for (const c of context.get(key)) {
            outcxt.set(key, c)
         }
      }
   }

   return outcxt
}


AST.Block.prototype.infer = function() {
   const context = new MultiMap
   const defined = new Map()
   let type = UnitType
   const show = new Show

   for(var i = 0; i < this.statements.length; ++i) {

      const statement_typing = inst(this.statements[i].infer())

      context.union(resolveReferences(statement_typing.context, defined))

      for (const [k, v] of statement_typing.defined.entries()) {
         defined.set(k, v)
      }

      type = statement_typing.type
   }

   this.typing = new AST.Typing(type, context, defined)
   deepFreeze(this.typing)
   return this.typing
}

return (ast) => {
   return ast.infer()
}

})()
