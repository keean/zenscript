var eval_file = (() => {
    "use strict"

    var fs = require('fs')
    var path = require('path')

    return (source) => {
        if (path.extname(source) !== '.js') {
            return console.log('filename: "' + source + '" does not have .js extension')
        }
        fs.readFile(source, 'utf8', (err, data) => {
            if (err) {
                return console.log(err)
            }

            console.log(eval(data))
        })
    }
})()

if (process.argv.length != 3) {
    return console.log('Please specify file')
}

eval_file(process.argv[2])



