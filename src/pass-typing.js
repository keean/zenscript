module.exports = (() => {
"use strict"

const AST = require('../src/ast.js')
const MultiMap = require('../src/multimap.js')
const inst = require('../src/typing-instantiate.js')
const unify = require('../src/unification.js')
const Show = require('../src/typing-show.js')

const IntegerType = AST.deepFreeze(new AST.TypeConstructor('Int', []))
const UnitType = AST.deepFreeze(new AST.TypeConstructor('Unit', []))

AST.LiteralInt.prototype.infer = function() {
   this.typing = new AST.Typing(IntegerType)
   return AST.deepFreeze(this.typing)
}

AST.Variable.prototype.infer = function() {
   this.typing = new AST.Typing(new AST.TypeVariable('VAR'))
   this.typing.context.set(this.name, this.typing.type)
   return AST.deepFreeze(this.typing)
}

AST.LiteralTuple.prototype.infer = function() {
   const context = new MultiMap()
   const type = new AST.TypeConstructor('Product', new Array(this.expressions.length))
   for (let i = 0; i < this.expressions.length; ++i) {
       const typing = this.expressions[i].infer()
       context.union(typing.context)
       type.params[i] = typing.type
   }
   this.typing = new AST.Typing(type, context)
   return AST.deepFreeze(this.typing)
}

AST.LiteralArray.prototype.infer = function() {
   throw 'array literal not supported in source language'
}

AST.Application.prototype.infer = function() {
   const f = inst(this.fun.infer())
   const a = inst(this.arg.infer())
   f.context.union(a.context)
   const t = new AST.Typing(new AST.TypeVariable(), f.context)
   const u = new AST.TypeConstructor('Arrow', [a.type, t.type])
   if (unify.types(f.type, u)) {
      this.typing = t
   } else {
      const g = this.fun.typing.type
      const b = new AST.TypeConstructor('Arrow', [this.arg.typing.type, new AST.TypeVariable()])
      this.typing = new AST.Typing(new AST.TypeConstructor('!Fail!', [g, b]))
   }
   return AST.deepFreeze(this.typing)
}

AST.Fn.prototype.infer = function() {
   const b = inst(this.body.infer())
   const ps = new AST.TypeConstructor('Product', [])
   for (const r of this.args) {
      let a = r.userType
      if (a === undefined) {
         a = new AST.TypeVariable()
      }
      const ts = b.context.get(r.name) || []
      for (const t of ts) {
         if (!unify.types(a, t)) {
            const show = new Show()
            throw 'unification failed' + show.type(a) + ' :u: ' + show.type(t)
         }
      }
      b.context.erase(r.name)
      ps.params.push(a)
   }

   this.typing = new AST.Typing(new AST.TypeConstructor('Arrow', [ps, b.type]), b.context)
   return AST.deepFreeze(this.typing)
}

AST.Declaration.prototype.infer = function() {
   this.typing = new AST.Typing(UnitType)
   const a = this.variable.userType
   const b = this.expression.infer()
   const show = new Show()
   let c = b
   if (a !== undefined) {
      c = inst(c)
      if (!unify.types(inst(a), c.type)) {
         const show = new Show()
         throw 'unification failed' + show.type(a) + ' :u: ' + show.type(b.type)
      }
   }
   this.typing.defined.set(this.variable.name, c)
   return AST.deepFreeze(this.typing)
}

AST.Assignment.prototype.infer = function() {
   throw 'assignment not implemented'
   /*this.expression.typing()
   this.typing = new AST.Typing(this.expression.context, UnitType)
   this.typing = new AST.Typing(new Map, UnitType)
   return AST.deepFreeze(this.typing)
   return this.typing*/
}

AST.Return.prototype.infer = function() {
   this.typing = this.expression.infer()
   return AST.deepFreeze(this.typing)
}

function resolveReferences(context, defined, outcxt) {
   for (const key of context.keys()) {  
      const poly = defined.get(key)
      if (poly !== undefined) {
         const mono = inst(poly)
         for (const c of context.get(key)) {
            if (!unify.types(mono.type, c)) {
               const show = new Show()
               throw 'unification failed: ' + show.type(mono.type) + ' :u: ' + show.type(c)
            }
         }
         resolveReferences(mono.context, defined, outcxt)
      } else {
         for (const c of context.get(key)) {
            outcxt.set(key, c)
         }
      }
   }
}

AST.Block.prototype.infer = function() {
   const context = new MultiMap()
   const defined = new Map()
   let type = UnitType
   for(let i = 0; i < this.statements.length; ++i) {
      const statement_typing = inst(this.statements[i].infer())
      resolveReferences(statement_typing.context, defined, context)
      for (const [k, v] of statement_typing.defined.entries()) {
         defined.set(k, v)
      }
      type = statement_typing.type
   }
   this.typing = new AST.Typing(type, context, defined)
   return AST.deepFreeze(this.typing)
}

return (ast) => {
   return ast.infer()
}

})()
