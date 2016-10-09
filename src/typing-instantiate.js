module.exports = (() => {
"use strict"

const AST = require('../src/ast.js')

const trec_map = new Map()
const tvar_map = new Map()

AST.Type_Variable.prototype.instantiate = function() {
    let v = tvar_map.get(this)
    if (v === undefined) {
        v = new AST.Type_Variable()
        tvar_map.set(this, v)
    }
    return v
}

AST.Type_Constructor.prototype.instantiate = function() {
    let f = trec_map.get(this)
    if (f === undefined) {
        f = new AST.Type_Constructor(new Array(this.params.length))
        trec_map.set(this, f)
        for (let i = 0; i < this.params.length; ++i) {
            f.params[i] = this.params[i].find().instantiate()
        }
    }
    return f
}

return (typing) => {
    trec_map.clear()
    tvar_map.clear()
    
    let context = {}
    for (const k of Object.keys(typing.context)) {
        merge(context, typeing.context[k])
    }
    return new Typing(context, typing.type.find().instantiate())
}

})()
