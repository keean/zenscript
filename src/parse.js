module.exports = (function Parse_Module() {

var Parsimmon = require('parsimmon');

var exports = function parse(s) {

    var assign = Parsimmon.string('=');
    var space = Parsimmon.oneOf(' \t');
    var cr = Parsimmon.string('\n');
    
    var name = Parsimmon.regexp(/[a-z]+/);

    var int_lit = Parsimmon.digits.map(function(i) {
        return {'lit' : parseInt(i)};
    });

    var assignment = Parsimmon.seqMap(name,
            Parsimmon.optWhitespace,
            assign, Parsimmon.optWhitespace,
            int_lit,
            function(n, x, y, z, v) {
        return {'ass' : n, 'exp' : v};
    });

    var identifier = name.map(function(id) {
        return {'var' : id};
    });
    var empty = Parsimmon.succeed({});

    var stmt = assignment.or(identifier);

    var block = Parsimmon.sepBy(stmt, cr).map(function(blk) {
        return {'blk' : blk};
    });

    return block.parse(s).value;
};

return exports;
})();
