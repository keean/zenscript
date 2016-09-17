module.exports = (function TSModule() {

console.log('TraitScript compiler (C)2016 Keean Schupke')

function gen_exp(ast) {
    if (ast.lit) {
        return ast.lit;
    } else if (ast.var) {
        return ast.var;
    } else if (ast.app) {
        return ast.app + '(' + ast.args.map(gen_exp).join(',') + ')';
    } else {
        return '';
    }
}

function gen_fn(ast) {
    return 'function ' + ast.fn + '(' + ast.args.join(',') + '){return ' + gen_exp(ast.body) + ';}';
}

function gen_blk(ast) {
    if (ast.blk) {
        return ast.def.map(gen_fn).join('') + ast.blk.map(gen_exp).join(';') + ';';
    } else if (ast.fn) {
        return gen_fn(ast);
    } else {
        return gen_exp(ast);
    }
}

var exports = function TraitScript(ast) {
    this.ast = ast;
}

exports.prototype.generate = function generate() {
    return gen_blk(this.ast);
}

return exports;
})()
