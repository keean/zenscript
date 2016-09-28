var compile = (() => {
    "use strict"

    var parse = require('./parse.js')
    var generate = require('./generate.js')
    var fs = require('fs')
    var path = require('path')

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

            var ast = parse(data)

            fs.writeFile(debug, JSON.stringify(ast, null, '  '), (err) => {
                if (err) {
                    return console.log(err)
                }
            })

            if (!ast.status) {
                return console.log(ast.value)
            }  

            fs.writeFile(dest, generate(ast.value), (err) => {
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



