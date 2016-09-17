module.exports = (function TSModule() {

    console.log('TraitScript compiler (C)2016 Keean Schupke')

    var exports = function TraitScript(ast) {
        this.ast = ast;
    }

    exports.prototype.generate = function generate() {
        return "";
    }

    return exports;
})()
