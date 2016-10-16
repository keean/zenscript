module.exports = (() => {
"use strict"

const AST = require('../src/ast.js')

const visited = new Set()

AST.TypeVariable.prototype.getVars = function(vars) {
   if(!vars.has(this)) {
      vars.add(this)
   } 
}

AST.TypeConstructor.prototype.getVars = function(vars) {
   if (!visited.has(this)) {
      visited.add(this)
      for (const p of this.params) {
         p.find().getVars(vars)
      }
   }
}

AST.Typing.prototype.getVars = function(vars) {
   for (const v of this.context.keys()) {
      v.find().getVars(vars)
   }
   this.type.find().getVars(vars)
}

return (ast, vars) => {
   visited.clear()
   ast.find().getVars(vars)
   visited.clear()
}

})()
