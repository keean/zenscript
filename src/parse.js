module.exports = (() => {
    "use strict"

var Parsimmon = require('parsimmon')

var exports = (s) => {

    var assign = Parsimmon.string('=')
    var space = Parsimmon.regex(/[ \t]*/)
    var comma = Parsimmon.string(',')
    var newline = Parsimmon.string('\n')
    
    var identifier = Parsimmon.regexp(/[a-z][a-zA-Z_0-9]*/)

    var variable = identifier.map((id) => {
        return {'var' : id}
    })

    var arg_list = Parsimmon.sepBy(identifier.skip(space), comma)

    var int_lit = Parsimmon.regexp(/[0-9]+/).map((i) => {
        return {'lit' : parseInt(i)}
    })

    // definitions for recursive parsers
    var block
    var expression
    var expression_list

    var fn_lit = Parsimmon.seqMap(
        identifier.or(Parsimmon.succeed('')),
        Parsimmon.string('(').then(arg_list).skip(Parsimmon.string(')')).skip(space).skip(Parsimmon.string('=>')).skip(space),
        newline.then(Parsimmon.lazy(() => {
            return block
        })).or(Parsimmon.lazy(() => {
            return expression.map((e) => {
                return {'rtn' : e}
            })
        })),
        (name, args, body) => {
            return {'fn' : name, 'args' : args, 'body' : body}
        }
    )

    var fn_app = Parsimmon.seqMap(
        identifier,
        Parsimmon.string('(').then(Parsimmon.lazy(() => {
            return expression_list
        })).skip(Parsimmon.string(')')),
        (name, exps) => {
            return {'app' : name, 'args' : exps}
        }
    )

    expression = fn_lit.or(fn_app).or(variable).or(int_lit).skip(space)

    expression_list = Parsimmon.sepBy(expression, Parsimmon.string(','))

    var assign_keyword = Parsimmon.string('let')
    var assignment = Parsimmon.seqMap(
            assign_keyword.then(space).then(identifier).skip(space).skip(assign).skip(space),
            expression,
            (n, v) => {
                return {'decl' : n, 'exp' : v}
            }
    )


    var return_keyword = Parsimmon.string('return')

    var rtn = return_keyword.then(space).then(expression).map((exp) => {
        return {'rtn' : exp}
    })

    var statement = rtn.or(assignment).or(expression).skip(space)

    function IndentationParser(init) {
        this.indent = init
    }
    IndentationParser.prototype.get = function() {
        return this.indent
    }
    IndentationParser.prototype.set = function(i) {
        this.indent = i
    }
    IndentationParser.prototype.relative = function(relation) {
        return Parsimmon.custom((success, failure) => {
            return (stream, i) => {
                var j = 0
                while (stream.charAt(i + j) == ' ') {
                    j = j + 1
                }
                if (relation.op(j, this.indent)) {
                    this.indent = j
                    return success(i + j, j)
                } else {
                    return failure(i, 'indentation error: ' + j + relation.err + this.indent)
                }
            }
        })
    }
    IndentationParser.prototype.absolute = function(target) {
        return Parsimmon.custom((success, failure) => {
            return (stream, i) => {
                var j = 0
                while (stream.charAt(i + j) == ' ') {
                    j = j + 1
                }
                if (j == target) {
                    this.indent = j
                    return success(i + j, target)
                } else {
                    return failure(i, 'indentation error: ' + j + ' does not equal ' + target)
                }
            }
        })
    }
    IndentationParser.prototype.eq  = {op: (x, y) => {return x == y}, err: ' does not equal '}
    IndentationParser.prototype.ge  = {op: (x, y) => {return x >= y}, err: ' is not equal or greater than '}
    IndentationParser.prototype.gt  = {op: (x, y) => {return x > y}, err: ' is not greater than '}
    IndentationParser.prototype.any = {op: (x, y) => {return true}, err: ' cannot fail '}
    var Indent = new IndentationParser(0)

    var top_level = newline.many().then((Indent.absolute(0).then(statement).skip(newline.many())).many()).map((blk) => {
        return {'blk' : blk}
    })

    block = Parsimmon.succeed({}).chain(() => {
        var indent = Indent.get()
        return Parsimmon.seqMap(
            newline.many().then(Indent.relative(Indent.gt)).then(statement),
            (newline.many().then(Indent.relative(Indent.eq)).then(statement)).many(),
            (first, blk) => {
                blk.unshift(first)
                Indent.set(indent)
                return {'blk' : blk}
            }   
        )
    })

    return top_level.parse(s)
}


return exports
})()

