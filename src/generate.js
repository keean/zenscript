module.exports = (() => {
    "use strict"

const AST = require('../src/ast.js')
const Show = require('../src/typing-show.js')
const show = new Show()

function spaces(i) {
   return ' '.repeat(i)
}

AST.LiteralInt.prototype.generate = function(indent) {
   return this.value.toString() +
      ((this.typing) ? ('/*' + show.typing(this.typing) + '*/ ') : '')
}

AST.LiteralArray.prototype.generate = function(indent) {
   return '[' + this.expressions.map((x) => x.generate(indent)).join(', ') + ']' +
      ((this.typing) ? ('/*' + show.typing(this.typing) + '*/ ') : '')
}

AST.LiteralTuple.prototype.generate = function(indent) {
   return '(' + this.expressions.map((x) => x.generate(indent)).join(', ') + ')' +
      ((this.typing) ? ('/*' + show.typing(this.typing) + '*/ ') : '')
}

AST.Variable.prototype.generate = function(indent) {
   return this.name +
      ((this.typing) ? ('/*' + show.typing(this.typing) + '*/ ') : '')
}

AST.Application.prototype.generate = function(indent) {
   return this.fun.generate() + this.arg.generate() +
      ((this.typing) ? ('/*' + show.typing(this.typing) + '*/ ') : '')
}

AST.Fn.prototype.generate = function(indent) {
    return 'function' + (this.name ? ' ' : '') + this.name + '(' + this.args.join(', ') + ') {\n' +
        this.body.generate(indent + 3) + spaces(indent) + '}'
}

AST.Declaration.prototype.generate = function(indent) {
    return spaces(indent) + 'var ' + this.name + ' = ' + this.expression.generate(indent) + ';\n'
}

AST.Assignment.prototype.generate = function(indent) {
    return spaces(indent) + this.name + ' = ' + this.expression.generate(indent) + ';\n'
}

AST.Return.prototype.generate = function(indent) {
    return spaces(indent) + 'return ' + this.expression.generate(indent) + ';\n'
}

AST.Block.prototype.generate = function(indent) {
    return this.statements.map((x) => x.generate(indent)).join('')
}

//----------------------------------------------------------------------------
// The type generation methods need to use 'find' for each node to make sure
// it is using the representative type for each equivalence class

AST.Typing.prototype.generate = function(indent) {
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

AST.TypeVariable.prototype.generate = function(indent) {
    return 't' + this.id
}

AST.TypeConstructor.prototype.generate = function(indent) {
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

return (ast) => {
   return ast.generate(0)
}

})()
