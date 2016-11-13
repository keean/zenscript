const compile = (() => {
   "use strict"

   const fs = require('fs')
   const path = require('path')
   const ast = require('./ast.js')
   const parse = require('./parse.js')
   const Generate = require('./generate.js')
   const pass_typing = require('./pass-typing.js')
   const pass_tuple_convert = require('./pass-tuple-convert.js')

   function write_ast(file, ast) {
      fs.writeFile(file, JSON.stringify(ast, null, '  '), (err) => {
         if (err) {
            return console.log(err)
         }
      })
   }

   return (source) => {
      if (path.extname(source) !== '.zs') {
         return console.log('filename: "' + source + '" does not have .zs extension')
      }
      const base = path.dirname(source) + '/' + path.basename(source, '.zs')
      const dest = base + '.js'
      const debug = base + '.ast'
      const read_start = new Date().getTime()
      fs.readFile(source, 'utf8', (err, data) => {
         if (err) {
            return console.log(err)
         }
         const read_end = new Date().getTime()
         console.log('read time: ' + (read_end - read_start) + 'ms')

         //----------------------------------------------------------------
         // Parse Source
         const parse_start = new Date().getTime()
         const ast = parse.program(data)
         const parse_end = new Date().getTime()
         console.log('parse time: ' + (parse_end - parse_start) + 'ms')

         if (!ast.status) {
            return console.log(JSON.stringify(ast))
         }  

         //console.log(JSON.stringify(ast))

         //----------------------------------------------------------------
         // Compiler Passes
         const pass_start = new Date().getTime()

         pass_typing(ast.value)

         //write_ast(debug, ast) // write AST after typing

         ast.value.pass_tuple_convert()

         const pass_end = new Date().getTime()
         console.log('pass time: ' + (parse_end - parse_start) + 'ms')

         //----------------------------------------------------------------
         // Generate Target
         const write_start = new Date().getTime()
         const generate = new Generate(true)
         fs.writeFile(dest, generate.pretty(ast.value), (err) => {
            if (err) {
               return console.log(err)
            }
            const write_end = new Date().getTime()
            console.log('write time: ' + (write_end - write_start) + 'ms')
         })
      })
   }
})()

if (process.argv.length != 3) {
   console.log('Please specify source file')
} else {
   compile(process.argv[2])
}

