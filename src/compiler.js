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
        var read_start = new Date().getTime()
        fs.readFile(source, 'utf8', (err, data) => {
            if (err) {
                return console.log(err)
            }
            var read_end = new Date().getTime()
            console.log('read time: ' + (read_end - read_start) + 'ms')

            //----------------------------------------------------------------
            // Parse Source
            var parse_start = new Date().getTime()
            var ast = parse(data)
            var parse_end = new Date().getTime()
            console.log('parse time: ' + (parse_end - parse_start) + 'ms')

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
            var pass1_start = new Date().getTime()
            ast.value.pass_tuple_convert()
            var pass1_end = new Date().getTime()
            console.log('pass 1 time: ' + (parse_end - parse_start) + 'ms')

            //----------------------------------------------------------------
            // Generate Target
            var write_start = new Date().getTime()
            fs.writeFile(dest, ast.value.generate(), (err) => {
                if (err) {
                    return console.log(err)
                }
                var write_end = new Date().getTime()
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

