var compile = (() => {
    "use strict"

    var fs = require('fs')
    var path = require('path')
    var ast = require('./ast.js')
    var parse = require('./parse.js')
    var generate = require('./generate.js')
    var pass_tuple_convert = require('./pass-tuple-convert.js')

    return (source) => {
        if (path.extname(source) !== '.zs') {
            return console.log('filename: "' + source + '" does not have .zs extension')
        }
        var base = path.dirname(source) + '/' + path.basename(source, '.zs')
        var dest = base + '.js'
        var debug = base + '.ast'
        fs.readFile(source, 'utf8', (err, data) => {
            if (err) {
                return console.log(err)
            }

            //----------------------------------------------------------------
            // Parse Source
            var ast = parse(data)

            fs.writeFile(debug, JSON.stringify(ast, null, '  '), (err) => {
                if (err) {
                    return console.log(err)
                }
            })

            if (!ast.status) {
                return console.log(ast.value)
            }  

            //----------------------------------------------------------------
            // Compiler Passes
            ast.value.pass_tuple_convert()

            //----------------------------------------------------------------
            // Generate Target
            fs.writeFile(dest, ast.value.generate(), (err) => {
                if (err) {
                    return console.log(err)
                }
            })
        })
    }
})()

if (process.argv.length != 3) {
    return console.log('Please specify source file')
}

compile(process.argv[2])



