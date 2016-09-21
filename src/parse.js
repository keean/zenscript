module.exports = (function Parse_Module() {
    "use strict";

var Parsimmon = require('parsimmon');

var exports = function parse(s) {

    var assign = Parsimmon.string('=');
    var space = Parsimmon.oneOf(' \t');
    var cr = Parsimmon.string('\n');
    
    var identifier = Parsimmon.regexp(/[a-z][a-zA-Z_]*/);

    var variable = identifier.map(function(id) {
        return {'var' : id};
    });

    var int_lit = Parsimmon.regexp(/[0-9]+/).map(function(i) {
        return {'lit' : parseInt(i)};
    });

    var block;

    var fn_lit = Parsimmon.seqMap(
        identifier.or(Parsimmon.succeed('')).map(function(name) {
            return name;
        }),
        Parsimmon.string('(').then(identifier).skip(Parsimmon.string(')')).skip(space).skip(Parsimmon.string('=>')).skip(space),
        Parsimmon.lazy(function() {
            return block;
        }),
        function(name, arg, body) {
            return {'fn' : name, 'args' : [arg], 'body' : body};
        }
    );

    var expression = fn_lit.or(variable).or(int_lit);

    var assignment = Parsimmon.seqMap(identifier,
            Parsimmon.optWhitespace,
            assign, Parsimmon.optWhitespace,
            expression,
            function(n, x, y, z, v) {
        return {'ass' : n, 'exp' : v};
    });

    var statement = assignment.or(expression);

    block = Parsimmon.sepBy(statement, cr).map(function(blk) {
        return {'blk' : blk};
    });

    return block.parse(s);
};


return exports;
})();
