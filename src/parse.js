module.exports = (() => {
"use strict"

const P = require('parsimmon')
const AST = require('../src/ast.js')
const unify = require('../src/unification.js')
const show = require('../src/typing-show.js')

//------------------------------------------------------------------------
// Indentation Parser

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
   return P.custom((success, failure) => {
      return (stream, i) => {
         let j = 0
         while (stream.charAt(i + j) == ' ') {
            j = j + 1
         }
         if (relation.op(j, this.indent)) {
            return success(i + j, j)
         } else {
            return failure(i, 'indentation error: ' + j + relation.err + this.indent)
         }
      }
   })
}
IndentationParser.prototype.absolute = function(target) {
   return P.custom((success, failure) => {
      return (stream, i) => {
         let j = 0
         while (stream.charAt(i + j) == ' ') {
            j = j + 1
         }
         if (j == target) {
            return success(i + j, j)
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
const Indent = new IndentationParser(0)

//------------------------------------------------------------------------
// Terminals

const space = P.regex(/[ \t]*/)
const newline = P.string('\n').desc('newline')    // NL
// exp_space = {' '}, [NL, {NL}, INDENT.>];
const exp_space = space.then((newline.atLeast(1).then(Indent.relative(Indent.gt))).atMost(1))
const comma = P.string(',').skip(exp_space)

//------------------------------------------------------------------------
// Types

const var_map = new Map()

const typeVariable = P.regexp(/[A-Z]+[A-Z0-9]*/).skip(exp_space).map((n) => {
   let t = var_map.get(n)
   if (t === undefined) {
      t = new AST.TypeVariable(n)
      var_map.set(n, t)
   }   
   return t
})

let typeListLazy
const typeList = P.lazy(() => {return typeListLazy})

const typeConstructor = P.seqMap(
   P.regexp(/^(?=.*[a-z])[A-Z][a-zA-Z0-9]+/).skip(exp_space),
   (P.string('<').then(exp_space).then(typeList).skip(exp_space).skip(P.string('>')).skip(exp_space)).or(P.succeed([])),
   (n, ps) => {return new AST.TypeConstructor(n, ps)}
)

const typeSubExpression = P.seqMap(
   typeConstructor.or(typeVariable),
   (P.string('as').then(exp_space).then(typeVariable).skip(exp_space)).or(P.succeed()),
   (texp, mu) => {
      if (mu !== undefined) {
         if (!unify.types(texp, mu)) {
            throw 'unification error when parsing recursive type'
         }
      }
      return texp
   }
)

typeListLazy = P.sepBy(typeSubExpression, comma)

const typeExpression = P.succeed().chain(() => {
   var_map.clear()
   return typeSubExpression
})

//------------------------------------------------------------------------
// Values

// FLOAT
const literal_float = P.regexp(/[0-9]+\.[0-9]+/).map((n) => {
   return new AST.Literal_Float(parseFloat(n))
})

// STRING : Simple for now, fix later
const literal_string = P.regexp(/"[^"]"/).map((s) => {
   return new AST.Literal_String(s)
})

// definitions for recursive parsers
let expression_list_lazy
const expression_list = P.lazy(() => {return expression_list_lazy})

let expression_lazy
const expression = P.lazy(() => {return expression_lazy})

let block_lazy
const block = P.lazy(() => {return block_lazy})

let sub_expression_lazy
const sub_expression = P.lazy(() => {return sub_expression_lazy})

//------------------------------------------------------------------------
// Types

//------------------------------------------------------------------------
// Expressions


const paren_open = P.string('(').skip(exp_space)
const paren_close = P.string(')').skip(exp_space)
const thin_arrow = P.string('->').skip(space)
const fat_arrow = P.string('=>').skip(space)
const assign = P.string('=').skip(space)
const identifier = P.regexp(/[a-z][a-zA-Z_0-9]*/).skip(exp_space)

// ID
const variable = identifier.map((id) => {
   return new AST.Variable(id)
})

// INT
const int_lit = P.regexp(/[0-9]+/).map((i) => {
   return new AST.LiteralInt(parseInt(i))
})

// arg_list = identifier, {comma, identifier}
const arg_list = P.sepBy(identifier, comma)

function in_parenthesis(exp) {
   return paren_open.then(exp).skip(paren_close)
}

// literal_function = [identifier], '(', arg_list, ')', '=>' (NL, block | expression)
const literal_function = P.seqMap(
   identifier.or(P.succeed('')),
   in_parenthesis(arg_list).skip(fat_arrow),
   (newline.then(block)).or(expression.map((e) => {return new AST.Return(e)})),
   (name, args, body) => {
      return new AST.Fn(name, args, body)
   }
)

// expression_list = expression, {',', expression}
expression_list_lazy = P.sepBy(expression, comma)

// tuple = '(', expression_list, ')'
const tuple = in_parenthesis(expression_list).map((exp_list) => {
   return new AST.LiteralTuple(exp_list)
})

const singleton = in_parenthesis(variable.or(int_lit).or(in_parenthesis(expression))).map((term) => {
   return new AST.LiteralTuple([term])
})

function application(exp1, exps) {
   return P.seqMap(exp1, exps.many(), (app, app_list) => {
      if (app_list.length > 0) {
         if (app instanceof AST.LiteralTuple && app.expressions.length == 1) {
            app = app.expressions[0]
         }
      }
      for (const a of app_list) {
         app = new AST.Application(app, a)
      }
      return app
   })
}

sub_expression_lazy = literal_function.or(variable).or(int_lit).or(tuple).skip(exp_space)

expression_lazy = application(sub_expression, sub_expression)

//------------------------------------------------------------------------
// Statements

const assign_keyword = P.string('let')
const assignment = P.seqMap(
   assign_keyword.then(space).then(identifier).skip(assign).skip(space),
   expression,
   (name, expr) => {
      return new AST.Declaration(name, expr)
   }
)


const return_keyword = P.string('return')

const rtn = return_keyword.then(space).then(expression).map((exp) => {
   return new AST.Return(exp)
})

const defineFunction = P.seqMap(
   identifier,
   in_parenthesis(arg_list).skip(fat_arrow),
   (newline.then(block)).or(expression.map((e) => {return new AST.Return(e)})),
   (name, args, body) => {
      return new AST.Declaration(name, new AST.Fn(name, args, body))
   }
)

// expression_list = expression, {',', expression}

const statement = rtn.or(defineFunction).or(assignment).or(expression).skip(space)

//------------------------------------------------------------------------
// Blocks

block_lazy = P.succeed({}).chain(() => {
   const indent = Indent.get()
   return P.seqMap(
      newline.many().then(Indent.relative(Indent.gt).map((i) => Indent.set(i))).then(statement),
      (newline.many().then(Indent.relative(Indent.eq).map((i) => Indent.set(i))).then(statement)).many(),
      (first, blk) => {
          blk.unshift(first)
          Indent.set(indent)
          return new AST.Block(blk)
      }   
   )
})

//------------------------------------------------------------------------
// Program 

// top_level = {NL}, {INDENT==0, statement, {NL}}
const topLevel = newline.many().then((Indent.absolute(0).map((i) => Indent.set(i)).
   then(statement).skip(newline.many())).many()).map((blk) => {return new AST.Block(blk)})

return {
   program(s) {
      return topLevel.parse(s)
   },

   type(s) {
      return typeExpression.parse(s)
   }
}

})()

