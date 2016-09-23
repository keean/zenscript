module.exports = (function Parse_Module() {
    "use strict";

var Parsimmon = require('parsimmon');

var exports = function parse(s) {

    var assign = Parsimmon.string('=');
    var space = Parsimmon.regex(/[ \t]*/);
    var comma = Parsimmon.string(',');
    var cr = Parsimmon.string('\n');
    
    var identifier = Parsimmon.regexp(/[a-z][a-zA-Z_]*/);

    var variable = identifier.map(function(id) {
        return {'var' : id};
    });

    var arg_list = Parsimmon.sepBy(identifier.skip(space), comma);

    var int_lit = Parsimmon.regexp(/[0-9]+/).map(function(i) {
        return {'lit' : parseInt(i)};
    });

    // definitions for recursive parsers
    var block;
    var expression;
    var expression_list;

    var fn_lit = Parsimmon.seqMap(
        identifier.or(Parsimmon.succeed('')),
        Parsimmon.string('(').then(arg_list).skip(Parsimmon.string(')')).skip(space).skip(Parsimmon.string('=>')).skip(space),
        cr.then(Parsimmon.lazy(function() {
            return block;
        })).or(Parsimmon.lazy(function() {
            return expression.map(function(e) {
                return {'rtn' : e};
            })
        })),
        function(name, args, body) {
            return {'fn' : name, 'args' : args, 'body' : body};
        }
    );

    var fn_app = Parsimmon.seqMap(
        identifier.or(Parsimmon.succeed('')),
        Parsimmon.string('(').then(Parsimmon.lazy(function() {
            return expression_list;
        })).skip(Parsimmon.string(')')),
        function(name, exps) {
            return {'app' : name, 'args' : exps};
        }
    );

    expression = fn_lit.or(fn_app).or(variable).or(int_lit).skip(space);

    expression_list = Parsimmon.sepBy(expression, Parsimmon.string(','));

    var assign_keyword = Parsimmon.string('let');
    var assignment = Parsimmon.seqMap(
            assign_keyword.then(space).then(identifier).skip(space).skip(assign).skip(space),
            expression,
            function(n, v) {
                return {'ass' : n, 'exp' : v};
            }
    );



    var statement = assignment.or(expression);

    block = Parsimmon.sepBy(
        Parsimmon.seqMap(
            Parsimmon.string(' ').many(),
            statement,
            function(spaces, stmt) {
                var indent = spaces.length;
                return stmt;
            }
        ), cr).map(function(blk) {
            return {'blk' : blk};
        });

    return block.parse(s);
};


return exports;
})();
