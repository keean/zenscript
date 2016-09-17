module.exports = (function Generate_Module() {

function gen_fn(ast) {
    return 'function ' + ast.fn + '(' + ast.args.join(',') + '){' + gen_blk(ast.body) + '}';
}

function gen_exp(ast) {
    if (ast.lit) {
        return ast.lit;
    } else if (ast.var) {
        return ast.var;
    } else if (ast.app) {
        return ast.app + '(' + ast.args.map(gen_exp).join(',') + ')';
    } else if (ast.fn) {
        return gen_fn(ast);
    } else {
        return '';
    }
}

function gen_stmt(ast) {
    if (ast.fn) {
        return gen_fn(ast);
    } else if (ast.decl) {
        return 'var ' + ast.decl + '=' + gen_exp(ast.exp) + ';';
    } else if (ast.ass) {
        return ast.ass + '=' + gen_exp(ast.exp) + ';';
    } else if (ast.rtn) {
        return 'return ' + gen_exp(ast.rtn) + ';';
    } else {
        return gen_exp(ast) + ';';
    }
}

function gen_blk(ast) {
    if (ast.blk) {
        return ast.blk.map(gen_stmt).join('');
    } else {
        return gen_stmt(ast);
    }
}

var exports = function generate(ast) {
    return gen_blk(ast);
}

return exports;
})();
