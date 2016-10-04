module.exports = (() => {
    "use strict"

    // Values

    function Literal_Int(v) {
        this.tag = 'literal_int'
        this.value = v
    }

    function Literal_Array(l) {
        this.tag = 'literal_array'
        this.expressions = l
    }

    function Literal_Tuple(l) {
        this.tag = 'tuple'
        this.expressions = l
    }

    function Variable(n) {
        this.tag = 'variable'
        this.name = n
    }

    function Application(n, a) {
        this.tag = 'application'
        this.name = n
        this.args = a
    }

    function Fn(n, a, e) {
        this.tag = 'function'
        this.name = n
        this.args = a
        this.body = e
    }

    function Declaration(n, e) {
        this.tag = 'declaration'
        this.name = n
        this.expression = e
    }

    function Assignment(n, e) {
        this.tag = 'assignment'
        this.name = n
        this.expression = e
    }

    function Return(e) {
        this.tag = 'return'
        this.expression = e
    }

    function Block(b) {
        this.tag = 'block'
        this.statements = b
    }

    // Types

    function Typing(ts, t) {
        this.tag = 'typing'
        this.context = ts
        this.type = t
    }

    function Type_Constructor(n, ps) {
        this.tag = 'type_constructor'
        this.constructor = n
        this.params = ps
    }

    var tyvar_id = 0

    function Type_Variable() {
        this.tag = 'type_variable'
        this.id = tyvar_id++
    }

    function Type_Product(ts) {
        this.tag = 'type_product'
        this.product = ts
    }

    function Type_Application(f, a) {
        this.tag = 'type_application'
        this.fun = f
        this.arg = a
    }

    return {
        // Value Nodes
        Literal_Int : Literal_Int,
        Literal_Array : Literal_Array,
        Literal_Tuple : Literal_Tuple,
        Variable : Variable,
        Application : Application,
        Fn : Fn,
        Declaration : Declaration,
        Assignment : Assignment,
        Return : Return,
        Block : Block,
        // Type Nodes
        Typing : Typing,
        Type_Constructor : Type_Constructor,
        Type_Variable : Type_Variable,
        Type_Product : Type_Product,
        Type_Application : Type_Application
    }

})()


