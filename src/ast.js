module.exports = (() => {
    "use strict"

    function Literal_Int(v) {
        this.type = 'literal_int'
        this.value = v
    }

    function Variable(n) {
        this.type = 'variable'
        this.name = n
    }

    function Application(n, a) {
        this.type = 'application'
        this.name = n
        this.args = a
    }

    function Fn(n, a, e) {
        this.type = 'function'
        this.name = n
        this.args = a
        this.body = e
    }

    function Declaration(n, e) {
        this.type = 'declaration'
        this.name = n
        this.expression = e
    }

    function Assignment(n, e) {
        this.type = 'assignment'
        this.name = n
        this.expression = e
    }

    function Return(e) {
        this.type = 'return'
        this.expression = e
    }

    function Block(b) {
        this.type = 'block'
        this.statements = b
    }

    return {
        Literal_Int : Literal_Int,
        Variable : Variable,
        Application : Application,
        Fn : Fn,
        Declaration : Declaration,
        Assignment : Assignment,
        Return : Return,
        Block : Block
    }

})()


