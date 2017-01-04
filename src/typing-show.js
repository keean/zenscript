module.exports = (() => {
"use strict"

const AST = require('../src/ast.js')
const MultiMap = require('../src/multimap.js')

//----------------------------------------------------------------------------
// Mu conversion of type

AST.TypeVariable.prototype.muConvert = function() {}

AST.TypeConstructor.prototype.muConvert = function(cxt) {
   if (!cxt.visited_set.has(this)) {
      cxt.visited_set.add(this)
      for (let i = 0; i < this.params.length; ++i) {
         this.params[i].find().muConvert(cxt)
      }
      cxt.visited_set.delete(this)
   } else if (cxt.mu_map.get(this) === undefined) {
      cxt.mu_map.set(this, cxt.vid++)
   }
}
      
AST.Typing.prototype.muConvert = function(cxt) {
   for (const x of this.context.keys()) {
      for (const y of this.context[x]) {
         y.find().muConvert(cxt)
      }
   }
   this.type.find().muConvert(cxt)
   for (const x of this.defined.values()) {
      x.muConvert(cxt)
   }
}

//----------------------------------------------------------------------------
// Convert type to string

const vs = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
   'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

function id_to_name(x) {
   const str = []
   do {
      str.push(vs[x % 26])
      x /= 26
   } while (x > 0)
   str.reverse()
   return str.join('')
}
   

AST.TypeVariable.prototype.show = function(cxt) {
   //return this.name + this.id
   let v = cxt.tvar_map.get(this)
   if (v === undefined) {
      v = cxt.vid
      cxt.tvar_map.set(this, cxt.vid++)
   }
   return id_to_name(v)
}

AST.TypeConstructor.prototype.show = function(cxt) {
   let m = cxt.mu_map.get(this)
   if (m === undefined || !cxt.visited_set.has(this)) {
      cxt.visited_set.add(this)
      let str = this.atom
      const op = AST.infixTypeOps.get(str)
      if (op) {
         const lhs = this.params[0].find()
         const rhs = this.params[1].find()
         const lop = AST.infixTypeOps.get(lhs.atom)
         const rop = AST.infixTypeOps.get(rhs.atom)
         const leftParenthesis = (lop !== undefined) &&
            ((op.precedence > lop.precedence) ||
            ((op.precedence === lop.precedence) &&
               (op.associativity === AST.rightAssociative)))
         const rightParenthesis = (rop !== undefined) &&
            ((op.precedence > rop.precedence) ||
            ((op.precedence === rop.precedence) &&
               (op.assiciativity === AST.leftAssociative)))
         return (leftParenthesis ? '(' : '') + lhs.show(cxt) +
            (leftParenthesis ? ') ' : ' ') + op.symbol + (rightParenthesis ? ' (' : ' ') +
            rhs.show(cxt) + (rightParenthesis ? ')' : '')
      } else if (str === 'Product') {
         str = '<'
         for (let i = 0; i < this.params.length; ++i) {
            str += this.params[i].find().show(cxt)
            if (i + 1 < this.params.length) {
               str += ', '
            }
         }
         str += '>'
      } else if (this.params.length > 0) {
         str += '<'
         for (let i = 0; i < this.params.length; ++i) {
            str += this.params[i].find().show(cxt)
            if (i + 1 < this.params.length) {
               str += ', '
            }
         }
         str += '>'
      }
      if (m !== undefined) {
         str += ' as ' + id_to_name(m)
      }
      return str
   } else {
      return id_to_name(m)
   }
}

function show_type_dict(cxt, dict) {
   let str = ''
   const keys = dict.keys()
   for (let i = 0; i < keys.length; ++i) {
      str += keys[i] + ': '
      const vals = dict[keys[i]]
      for (let j = 0; j < vals.length; ++j) {
         str += vals[j].find().show(cxt)
         if (j + 1 < vals.length) {
            str += ' /\\ '
         }
      }
      if (i + 1 < keys.length) {
         str += ', '
      }
   }
   return str
}

function show_typing_dict(cxt, dict) {
   if (dict !== undefined) {
      let str = ''
      const keys = [...dict.keys()]
      for (let i = 0; i < keys.length; ++i) {
         str += keys[i] + ': ' + dict.get(keys[i]).show(cxt)
         if (i + 1 < keys.length) {
            str += ', '
         }
      }
      return str
   }
   return ''
}

AST.Typing.prototype.show = function(cxt) {
   const cxt_str = show_type_dict(cxt, this.context)
   const def_str = show_typing_dict(cxt, this.defined)

   let str = ''
   if (cxt_str.length > 0) {
      str += '{' + cxt_str + '} '
   }
   str += this.type.find().show(cxt)
   if (def_str.length > 0) {
      str += ' [' + def_str + ']'
   }
   
   return str
}

return class {
   constructor() {
      this.tvar_map = new Map()
      this.visited_set = new Set()
      this.mu_map = new Map()
      this.vid = 0
   }

   context(t) {
      this.vid = 0
      this.mu_map.clear()
      this.tvar_map.clear()
      this.visited_set.clear()
      for (const x of t.values()) {
         x.muConvert(this)
      }
      this.visited_set.clear()
      const s = show_type_dict(this, t)
      this.visited_set.clear()
      return s
   }

   defined(t) {
      this.vid = 0
      this.mu_map.clear()
      this.tvar_map.clear()
      this.visited_set.clear()
      for (const x of t.values()) {
         x.muConvert(this)     
      }
      this.visited_set.clear()
      const s = show_typing_dict(this, t)
      this.visited_set.clear()
      return s
   }

   typing(t) {
      this.vid = 0
      this.mu_map.clear()
      this.tvar_map.clear()
      this.visited_set.clear()
      t.muConvert(this)     
      this.visited_set.clear()
      const s = t.show(this)
      this.visited_set.clear()
      return s
   }

   type(t) {
      const u = t.find()
      this.visited_set.clear()
      u.muConvert(this)
      this.visited_set.clear()
      const s = u.show(this)
      this.visited_set.clear()
      return s
   }
   
   vars(vs) {
      let str = ''
      for (const v of vs) {
         this.visited_set.clear()
         v.muConvert(this)
         this.visited_set.clear()
         str += v.show(this) + ' = '
         const u = v.find()
         this.visited_set.clear()
         u.muConvert(this)
         this.visited_set.clear()
         str += u.show(this) + '\n'
         this.visited_set.clear()
      }
      return str
   }
}

})()
