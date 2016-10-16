module.exports = (() => {
"use strict"

const AST = require('../src/ast.js')
const MultiMap = require('../src/multimap.js')

//----------------------------------------------------------------------------
// Mu conversion of type

const visited_set = new Set()
const mu_map = new Map()
let vid = 0

AST.TypeVariable.prototype.muConvert = function() {}

AST.TypeConstructor.prototype.muConvert = function() {
   if (!visited_set.has(this)) {
      visited_set.add(this)
      for (let i = 0; i < this.params.length; ++i) {
         this.params[i].find().muConvert()
      }
      visited_set.delete(this)
   } else if (!mu_map.get(this)) {
      mu_map.set(this, vid++)
   }
}
      
AST.Typing.prototype.muConvert = function() {
   for (let i = 0; i < this.context.length; ++i) {
      this.contect[i].find().muConvert()
   }
   this.type.find().muConvert()
}

//----------------------------------------------------------------------------
// Convert type to string

const tvar_map = new Map()

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
   

AST.TypeVariable.prototype.show = function() {
   return this.name + this.id
   /*let v = tvar_map.get(this.id)
   if (v === undefined) {
      v = id_to_name(vid)
      tvar_map.set(this.id, vid++)
      return v
   } else {
      return id_to_name(v)
   }*/
}

AST.TypeConstructor.prototype.show = function() {
   let f = visited_set.has(this)
   let m = mu_map.get(this)
   if (m === undefined || !visited_set.has(this)) {
      visited_set.add(this)
      let str = this.constructor
      if (this.params.length > 0) {
         str += '<'
         for (let i = 0; i < this.params.length; ++i) {
            str += this.params[i].find().show()
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

AST.Typing.prototype.show = function() {
   let str = ''
   if (this.context.length > 0) {
      str = '{'
      const keys = this.context.keys()
      for (let i = 0; i < keys.length; ++i) {
         str += keys[i] + ': ' 
         const vals = this.context[keys[i]]
         for (let j = 0; j < vals.length; ++j) {
            str += vals[j].find().show()
            if (i + 1 < vals.length) {
               str += ' /\\ '
            }
         }
         if (i + 1 < keys.length) {
            str += ', '
         }
      }
      str += '}'
   }
   str += this.type.find().show()
   return str
}

function show(t) {
   tvar_map.clear()
   visited_set.clear()
   mu_map.clear()
   vid = 0
   
   const u = t.find()
   u.muConvert()
   return u.show()
}

return {
   type : show,
   vars(vs) {
      tvar_map.clear()
      visited_set.clear()
      mu_map.clear()
      vid = 0

      let str = ''
      for (const v of vs) {
         v.muConvert()
         str += '   ' + v.show() + ' = '
         const u = v.find()
         u.muConvert()
         str += u.show() + '\n'
      }
      return str
   }
}

})()
