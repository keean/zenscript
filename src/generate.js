module.exports = (() => {
    "use strict"

const AST = require('../src/ast.js')

function spaces(i) {
    return ' '.repeat(i)
}

AST.LiteralInt.prototype.generate = function(indent) {
    return this.value.toString() + '/*' + this.typing.generate(indent) + '*/ '
}

AST.LiteralArray.prototype.generate = function(indent) {
    return '[' + this.expressions.map((x) => x.typing.generate(indent)).join(', ') + ']' + '/*' + this.typing.generate(indent) + '*/ '
}

AST.LiteralTuple.prototype.generate = function(indent) {
    return '(' + this.expressions.map((x) => x.generate(indent)).join(',') + ')' + '/*' + this.typing.generate(indent) + '*/ '
}

AST.Variable.prototype.generate = function(indent) {
    return this.name + '/*' + this.typing.generate() + '*/ '
}

AST.Application.prototype.generate = function(indent) {
    return this.fun.generate() + this.arg.generate()
}

AST.Fn.prototype.generate = function(indent) {
    return 'function' + (this.name ? ' ' : '') + this.name + '(' + this.args.join(',') + ') {\n' +
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


AST.Typing.prototype.generate = function(indent) {
    const keys = Object.keys(this.context)
    let s = ''
    if (keys.length > 0) {
        s += '{' + keys.map((key) => {
            return key + ' : ' + this.context[key].map((t) => {
                return t.generate()
            }).join(' & ')
        }).join(', ') + '} '
    }
    return s + this.type.generate()
}

AST.TypeVariable.prototype.generate = function(indent) {
    return 't' + this.id
}

AST.TypeConstructor.prototype.generate = function(indent) {
    var s = this.constructor
    if (this.params.length > 0) {
        s += '<'
        for (var i = 0; i < this.params.length; ++i) {
            s += this.params[i].generate()
            if (i + 1 < this.params.length) {
                s += ', '
            }
        }
        s += '>'
    }
    return s
}

})()
