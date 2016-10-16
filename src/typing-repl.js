var repl = (() => {
   "use strict"

   const readline = require('readline')
   const AST = require('../src/ast.js')
   const parse = require('../src/parse.js').type
   const show = require('../src/typing-show.js')
   const vars = require('../src/typing-getvars.js')
   const mgu = require('../src/unification.js').mgu


   return function() {
      const rl = readline.createInterface({
         input: process.stdin,
         output: process.stdout
      })


      function q2(t1) {
         rl.question('type 2: ', (s2) => {
            const t2 = parse(s2)
            if (t2.status) {
               console.log(show.type(new AST.TypeConstructor('Mgu', [t1.value, t2.value])))
               const vs = mgu(t1.value, t2.value)
               if (vs === undefined) {
                  console.log('Unification failed.\n')
               } else {
                  console.log(show.vars(vs))
               }
               q1()
            } else {
               console.log(t2)
               q2(t1)
            }
         })
      }

      function q1() {
         AST.resetTyvarId()
         rl.question('type 1: ', (s1) => {
            const t1 = parse(s1)
            if (t1.status) {
               q2(t1)
            } else {
               console.log(t1)
               q1()
            }
         })
      }

      q1()
   }
})()

repl()



