module.exports = (() => {
   "use strict"
   let tyvar_id = 0

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

   return Object.freeze({ 

      // Values
     
      LiteralInt : class {
         constructor(v) {
            this.tag = 'literal_int'
            this.value = v
         }
      },

      LiteralArray : class {
         constructor(l) {
            this.tag = 'literal_array'
            this.expressions = l
         }
      },

      LiteralTuple : class {
         constructor(l) {
            this.tag = 'literal_tuple'
            this.expressions = l
         }
      },

      Variable : class {
         constructor(n) {
            this.tag = 'variable'
            this.name = n
         }
      },

      Application : class {
         constructor(f, a) {
            this.tag = 'application'
            this.fun = f
            this.arg = a
         }
      },

      Fn : class {
         constructor(n, a, e) {
            this.tag = 'function'
            this.name = n
            this.args = a
            this.body = e
         }
      },

      Declaration : class {
         constructor(n, e) {
            this.tag = 'declaration'
            this.name = n
            this.expression = e
         }
      },

      Assignment : class {
         constructor(n, e) {
            this.tag = 'assignment'
            this.name = n
            this.expression = e   
         }
      },

      Return : class {
         constructor(e) {
            this.tag = 'return'
            this.expression = e
         }
      },

      Block : class {
         constructor(b) {
            this.tag = 'block'
            this.statements = b
         }
      },

      // Types

      Typing : class {
         constructor(ts, t) {
            this.tag = 'typing'
            this.context = ts
            this.type = t
         }
      },

      TypeConstructor : class extends Type {
         constructor(n, ps) {
            super()
            this.tag = 'type_constructor'
            this.constructor = n
            this.params = ps
         }
      },

      TypeVariable : class extends Type {
         constructor() {
            super()
            this.tag = 'type_variable'
            this.id = tyvar_id++
         }

      }
   })
})()


