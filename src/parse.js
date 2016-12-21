module.exports = (() => {
"use strict"

const P = require('parsimmon')
const AST = require('../src/ast.js')
const unify = require('../src/unification.js')
const show = require('../src/typing-show.js')
const IndentationParser = require('../src/parse-indentation.js')
const PrecedenceParser = require('../src/parse-precedence.js')

const Indent = new IndentationParser(0)

//------------------------------------------------------------------------
// Terminals

// space = {' ' | TAB}
const space = P.regex(/[ \t]*/).desc('space')

// newline = '\n'
const newline = P.string('\n').desc('newline')   

// exp_space = {' '}, [NL, {NL}, INDENT.>];
const exp_space = space.then((newline.atLeast(1).then(Indent.relative(Indent.gt))).atMost(1))

// lazy tokenization, consume trailing space
function token(tok) {
   return tok.skip(exp_space)
}

const comma = token(P.string(','))

function fix(f) {
   let lazy
   lazy = f(P.lazy(() => {return lazy}))
   return lazy
}

const paren_open = token(P.string('('))
const paren_close = token(P.string(')'))
function inParenthesis(exp) {
   return paren_open.then(exp).skip(paren_close)
}

//------------------------------------------------------------------------
// Types

const var_map = new Map()

const typeVariable = token(P.regexp(/[A-Z]+[A-Z0-9]*/)).map((n) => {
   let t = var_map.get(n)
   if (t === undefined) {
      t = new AST.TypeVariable(n)
      var_map.set(n, t)
   }   
   return t
})

const typeList = token(P.string('<')).then(P.sepBy(P.lazy(() => {return texp}), comma)).skip(token(P.string('>')))

let texp
const typeConstructor = P.seqMap(
   token(P.regexp(/^(?=.*[a-z])[A-Z][a-zA-Z0-9]+/)),
   typeList.or(P.succeed([])),
   (n, ps) => {return new AST.TypeConstructor(n, ps)}
)

const typeSubExpression = P.seqMap(
   typeList.map((ts) => {return new AST.TypeConstructor('Product', ts)}).
      or(typeConstructor).or(typeVariable).or(inParenthesis(P.lazy(() => {return texp}))),
   (token(P.string('as')).then(typeVariable)).or(P.succeed()),
   (texp, mu) => {
      if (mu !== undefined) {
         if (!unify.types(texp, mu)) {
            throw 'unification error when parsing recursive type'
         }
      }
      return texp
   }
)

const typeOperator = token(P.regex(/[->]+/))

const TypePrecedence = new PrecedenceParser.PrecedenceParser(typeOperator, typeSubExpression)
texp = TypePrecedence.parseExprWithMinimumPrecedence(0)

const typeExpression = P.succeed().chain(() => {
   var_map.clear()
   return texp
})

// Register type operators with precedence parser

function infixTypeOp([name, opInfo]) {
   TypePrecedence.ledop(opInfo.symbol, opInfo.associativity, opInfo.precedence, function(info, lhs) {
      return this.parseExprWithMinimumPrecedence(info.minimumPrecedence()).map((rhs) => {
         return new AST.TypeConstructor(name, [lhs, rhs])
      })
   })
}

for (const opEntry of AST.infixTypeOps.entries()) {
   infixTypeOp(opEntry)
}

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


const thin_arrow = P.string('->').skip(space)
const fat_arrow = P.string('=>').skip(space)
const assign = P.string('=').skip(space)
const typeAnnotation = P.string(':').skip(space)
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

// typedIdentifier = identifier, [typeAnnotation, typeExpression]
const typedVariable = P.seqMap(variable,
   (typeAnnotation.then(typeExpression)).or(P.succeed()), (v, t) => {
      if (t !== undefined) {
         v.userType = t
      }
      return v;
   }
)

const typedArgList = P.sepBy(typedVariable, comma)

// literal_function = [identifier], '(', arg_list, ')', '=>' (NL, block | expression)
const literal_function = P.seqMap(
   identifier.or(P.succeed('')),
   inParenthesis(typedArgList).skip(fat_arrow),
   (newline.then(block)).or(expression.map((e) => {return new AST.Return(e)})),
   (name, args, body) => {
      return new AST.Fn(name, args, body)
   }
)

// expression_list = expression, {',', expression}
expression_list_lazy = P.sepBy(expression, comma)

// tuple = '(', expression_list, ')'
const tuple = inParenthesis(expression_list).map((exp_list) => {
   return new AST.LiteralTuple(exp_list)
})

/*const singleton = inParenthesis(variable.or(int_lit).or(inParenthesis(expression))).map((term) => {
   return new AST.LiteralTuple([term])
})*/

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

// Assignments
const assignKeyword = P.string('let').then(exp_space)
const assignment = P.seqMap(
   assignKeyword.then(typedVariable).skip(assign),
   expression,
   (v, e) => {
      return new AST.Declaration(v, e)
   }
)

// Return
const returnKeyword = P.string('return')
const rtn = returnKeyword.then(space).then(expression).map((exp) => {
   return new AST.Return(exp)
})

const defineFunction = P.seqMap(
   identifier,
   inParenthesis(typedArgList).skip(fat_arrow),
   (newline.then(block)).or(expression.map((e) => {return new AST.Return(e)})),
   (name, args, body) => {
      return new AST.Declaration(new AST.Variable(name), new AST.Fn(name, args, body))
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

