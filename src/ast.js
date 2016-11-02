module.exports = (() => {
   "use strict"
   const MultiMap = require('../src/multimap.js')

   let tyvar_id = 0

   //-------------------------------------------------------------------------
   // Base class for term nodes.
 
   class Term {}

   //-------------------------------------------------------------------------
   // Base class for type nodes provides union-find methods for finding the
   // representative type for an equivalence class. The 'union' and
   // 'replaceWith' methods connect the types together with directed edges
   // the 'find' method finds the representative type by following the 
   // directed edges. Union-find replaces substitution in unification 
   // resulting in an efficient algorithm that can cope with cycles.

   class Type {
      constructor() {
         this.rank = 0
      }

      find() {
         let node = this
         while (node.parent) {
            node = node.parent
         }
         return node
      }

      union(that) {
         if (this.rank < that.rank) {
            this.parent = that
         } else if (this.rank > that.rank) {
            that.parent = this
         } else {
            ++that.rank
            this.parent = that
         }
      }

      replaceWith(that) {
         if (this.rank === that.rank) {
            ++that.rank
         }
         this.parent = that
      }
   }

   //-------------------------------------------------------------------------
   // The AST classes are implemented so they can be serialised to JSON
   
   function deepFreeze(obj) {
      Object.freeze(obj)
      for (const k of Object.keys(obj)) {
         const p = obj[k]
         if (typeof p == 'object' && p !== null && !Object.isFrozen(p)) {
            deepFreeze(p)
         }
      }
      return obj
   }

   return Object.freeze({ 
      resetTyvarId() {
         tyvar_id = 0
      },

      deepFreeze : deepFreeze,

      // Values
     
      LiteralInt : class extends Term {
         constructor(v) {
            super()
            this.tag = 'literal_int'
            this.value = v
         }
      },

      LiteralArray : class extends Term {
         constructor(l) {
            super()
            this.tag = 'literal_array'
            this.expressions = l
         }
      },

      LiteralTuple : class extends Term {
         constructor(l) {
            super()
            this.tag = 'literal_tuple'
            this.expressions = l
         }
      },

      Variable : class extends Term {
         constructor(n) {
            super()
            this.tag = 'variable'
            this.name = n
         }
      },

      Application : class extends Term {
         constructor(f, a) {
            super()
            this.tag = 'application'
            this.fun = f
            this.arg = a
         }
      },

      Fn : class extends Term {
         constructor(n, a, e) {
            super()
            this.tag = 'function'
            this.name = n
            this.args = a
            this.body = e
         }
      },

      Declaration : class extends Term {
         constructor(n, e) {
            super()
            this.tag = 'declaration'
            this.name = n
            this.expression = e
         }
      },

      Assignment : class extends Term {
         constructor(n, e) {
            super()
            this.tag = 'assignment'
            this.name = n
            this.expression = e   
         }
      },

      Return : class extends Term {
         constructor(e) {
            super()
            this.tag = 'return'
            this.expression = e
         }
      },

      Block : class extends Term {
         constructor(b) {
            super()
            this.tag = 'block'
            this.statements = b
         }
      },

      // Types

      Typing : class {
         constructor(t, cxt, dfn) {
            if (cxt === undefined) {
               cxt = new MultiMap()
            }
            if (dfn === undefined) {
               dfn = new Map()
            }
            this.tag = 'typing'
            this.context = cxt
            this.defined = dfn
            this.type = t
         }
      },

      TypeConstructor : class extends Type {
         constructor(n, ps) {
            super()
            this.tag = 'type_constructor'
            this.atom = n
            this.params = ps
         }
      },

      TypeVariable : class extends Type {
         constructor(n) {
            super()
            this.tag = 'type_variable'
            this.name = n
            this.id = tyvar_id++
         }

      }
   })
})()


