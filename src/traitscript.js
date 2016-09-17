module.exports = (function TSModule() {

console.log('TraitScript compiler (C)2016 Keean Schupke')

var exports = function TraitScript(ast) {
    this.ast = ast;
}

exports.prototype.generate = function generate() {
    var ast = this.ast;

    if (ast.lit) {
        return ast.lit;
    } else {
        return "";
    }
}

return exports;
})()
