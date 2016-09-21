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
        Parsimmon.string('(').then(identifier).skip(Parsimmon.string(')')).skip(space).skip(Parsimmon.string('=>')).skip(space),
        Parsimmon.lazy(function() {
            return block;
        }),
        function(arg, body) {
            return {'fn' : '', 'args' : [arg], 'body' : body};
        }
    );

    var expression = variable.or(int_lit).or(fn_lit);

    var assignment = Parsimmon.seqMap(identifier,
            Parsimmon.optWhitespace,
            assign, Parsimmon.optWhitespace,
            int_lit,
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
