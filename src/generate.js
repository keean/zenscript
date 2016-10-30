module.exports = (() => {
    "use strict"

const AST = require('../src/ast.js')
const Show = require('../src/typing-show.js')
const show = new Show()

function spaces(i) {
   return ' '.repeat(i)
}

AST.LiteralInt.prototype.generate = function(cxt) {
   return this.value.toString() + 
      ((this.typing && cxt.debug) ? ('/*LIT: ' + show.typing(this.typing) + '*/ ') : '') 
}

AST.LiteralArray.prototype.generate = function(cxt) {
   return '[' + this.expressions.map((x) => x.generate(cxt)).join(cxt.minimise ? ',' : ', ') + ']' +
      ((this.typing && cxt.debug) ? ('/*ARY: ' + show.typing(this.typing) + '*/ ') : '')
}

AST.LiteralTuple.prototype.generate = function(cxt) {
   return '(' + this.expressions.map((x) => x.generate(cxt)).join(cxt.minimise ? ',' : ', ') + ')' +
      ((this.typing && cxt.debug) ? ('/*TPL: ' + show.typing(this.typing) + '*/ ') : '')
}

AST.Variable.prototype.generate = function(cxt) {
   return this.name +
      ((this.typing && cxt.debug) ? ('/*VAR: ' + show.typing(this.typing) + '*/ ') : '')
}

AST.Application.prototype.generate = function(cxt) {
   return ((this.fun instanceof AST.Variable) ? this.fun.generate(cxt) : '(' +
      this.fun.generate(cxt) + ')') + this.arg.generate(cxt) +
      ((this.typing && cxt.debug) ? ('/*APP: ' +
      show.typing(this.typing) + '*/ ') : '')
}

AST.Fn.prototype.generate = function(cxt) {
   cxt.indent += 3
   const body = this.body.generate(cxt)
   cxt.indent -= 3
   return 'function' + (this.name ? ' ' : '') + this.name + '(' +
      this.args.map((x) => x.name).join(cxt.minimise ? ',' : ', ') +
      (cxt.minimise ? '){' : ') {\n') + body + spaces(cxt.indent) + '}' +
      ((this.typing && cxt.debug) ? ('/*FUN: ' + show.typing(this.typing) +
      '*/ ') : '') + (cxt.minimise ? '' : '\n')
}

AST.Declaration.prototype.generate = function(cxt) {
   return (cxt.minimise ? '' : spaces(cxt.indent)) + 'var ' + this.name +
      (cxt.minimise ? '=' : ' = ') + this.expression.generate(cxt) +
      (cxt.minimise ? ';' : '; ') + ((this.typing && cxt.debug) ? ('/*DCL: ' +
      show.typing(this.typing) + '*/ ') : '') + (cxt.minimise ? '' : '\n')
}

AST.Assignment.prototype.generate = function(cxt) {
   return (cxt.minimise ? '' : spaces(cxt.indent)) + this.name +
   (cxt.minimise ? '=' : ' = ') + this.expression.generate(cxt) + ';' +
   (cxt.minimise ? '' : '\n')
}

AST.Return.prototype.generate = function(cxt) {
   return (cxt.minimise ? '' : spaces(cxt.indent)) + 'return ' +
      this.expression.generate(cxt) + (cxt.minimise ? ';' : '; ') +
      ((this.typing && cxt.debug) ? ('/*RTN: ' + show.typing(this.typing) +
      '*/ ') : '') + (cxt.minimise ? '' : '\n')
}

AST.Block.prototype.generate = function(cxt) {
   return this.statements.map((x) => x.generate(cxt)).join('') + (cxt.minimise ? '' : '\n') +
      ((this.typing && cxt.debug) ? ('/*BLK: ' + show.typing(this.typing) + '*/ ') : '') +
      (cxt.minimise ? '' : '\n')
}

//----------------------------------------------------------------------------
// The type generation methods need to use 'find' for each node to make sure
// it is using the representative type for each equivalence class

AST.Typing.prototype.generate = function(cxt) {
    const keys = this.context.keys()
    let s = ''
    if (keys.length > 0) {
        s += '{' + keys.map((key) => {
            return key + ' : ' + this.context[key].map((t) => {
                return t.find().generate()
            }).join(' /\\ ')
        }).join(', ') + '} '
    }
    return s + this.type.find().generate()
}

AST.TypeVariable.prototype.generate = function(cxt) {
    return 't' + this.id
}

AST.TypeConstructor.prototype.generate = function(cxt) {
    let s = this.constructor
    if (this.params.length > 0) {
        s += '<'
        for (let i = 0; i < this.params.length; ++i) {
            s += this.params[i].find().generate()
            if (i + 1 < this.params.length) {
                s += ', '
            }
        }
        s += '>'
    }
    return s
}

return class {
   constructor(debug) {
      this.indent = 0
      this.debug = debug
   }
         
   minimal(ast) {
      this.minimise = true
      return ast.generate(this)
   }

   pretty(ast) {
      this.minimise = false
      return ast.generate(this)
   }
}

})()
