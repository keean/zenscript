module.exports = (() => {
"use strict"

const AST = require('../src/ast.js')
const getVariables = require('../src/typing-getvars.js')

//----------------------------------------------------------------------------
// The unification algorithm needs to derefence each node using 'find' to make
// sure we are using the representative type from each equivalence class.
// This algorithm is recursion free, using a 'todo' list to capture
// unifications to be done next. This minimises the memory usage by avoiding
// large stack depths in complex unifications, and also allows early bail-out
// as soon as the failure flag is set.

const todo = []
let unifies = true

AST.TypeVariable.prototype.variable_unify = function(that) {
   this.union(that)
}

AST.TypeConstructor.prototype.variable_unify = function(that) {
   that.replaceWith(this)
}

AST.TypeVariable.prototype.constructor_unify = function(that) {
   this.replaceWith(that) 
}

AST.TypeConstructor.prototype.constructor_unify = function(that) {
   if (this.atom === that.atom && this.params.length === that.params.length) {
      for(let i = 0; i < this.params.length; ++i) {
         todo.push([this.params[i], that.params[i]])
      }
   } else {
      unifies = false
   }
}


AST.TypeVariable.prototype.unify = function(that) {
   that.variable_unify(this)
}

AST.TypeConstructor.prototype.unify = function(that) {
   that.constructor_unify(this)
}

function unify(a, b) {
   unifies= true
   todo.length = 0
   todo.push([a, b])

   while (todo.length > 0 && unifies) {
      const [s, t] = todo.pop()
      const u = s.find()
      const v = t.find()

      if (u !== v) {
         u.unify(v)
      }
   }

   todo.length = 0

   return unifies
}

return {
   types: unify,

   mgu(a, b) {
      const tyvars = new Set()
      getVariables(a, tyvars)
      getVariables(b, tyvars)
      if (unify(a, b)) {
         for (const v of tyvars) {
            if (v === v.find()) {
               tyvars.delete(v)
            }
         }
         return tyvars
      } else {
         return undefined
      }
   }
}

})()
