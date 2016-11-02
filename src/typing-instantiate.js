module.exports = (() => {
"use strict"

const AST = require('../src/ast.js')
const MultiMap = require('../src/multimap.js')

//----------------------------------------------------------------------------
// Typing instantiation copies a typing replacing all type variables with 
// fresh type variables. Each node needs to be dereferenced with 'find' to 
// make sure we are using the representative type for each equivalence class.

const trec_map = new Map()
const tvar_map = new Map()

AST.TypeVariable.prototype.instantiate = function() {
   let v = tvar_map.get(this)
   if (v === undefined) {
      v = new AST.TypeVariable()
      tvar_map.set(this, v)
   }
   return v
}

AST.TypeConstructor.prototype.instantiate = function() {
   let f = trec_map.get(this)
   if (f === undefined) {
      f = new AST.TypeConstructor(this.atom, new Array(this.params.length))
      trec_map.set(this, f)
      for (let i = 0; i < this.params.length; ++i) {
         f.params[i] = this.params[i].find().instantiate()
      }
   }
   return f
}

AST.Typing.prototype.instantiate = function() {
   trec_map.clear()
   tvar_map.clear()
    
   let context = new MultiMap()
   this.context.forEach((k, v) => {
      context.set(k, v.find().instantiate())
   })
   return new AST.Typing(this.type.find().instantiate(), context, this.defined)
}

return (ast) => {
   return ast.instantiate()
}

})()
