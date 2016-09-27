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
            });
        })),
        function(name, args, body) {
            return {'fn' : name, 'args' : args, 'body' : body};
        }
    );

    var fn_app = Parsimmon.seqMap(
        identifier,
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

    var Indent = (function() {
        var indent = 0;
        function eq(x, y) {return x == y;};
        function ge(x, y) {return x >= y;};
        function gt(x, y) {return x > y;};
        return {
            get: function() {
                return indent;
            },
            set: function(i) {
                indent = i;
            },
            relative: function(relation) {
                return Parsimmon.custom(function(success, failure) {
                    return function(stream, i) {
                        var j = 0;
                        while (stream.charAt(i + j) == ' ') {
                            j = j + 1;
                        }
                        if (relation(j, indent)) {
                            indent = j;
                            return success(i + j, j);
                        } else {
                            if (relation == eq) {
                                return failure(i, 'indentation error: ' + j + " does not equal " + indent);
                            } else if (relation == gt) {
                                return failure(i, 'indentation error: ' + j + " is not greater than " + indent);
                            } else {
                                return failure(i, 'indentation error: ' + j + " is not equal or greater then" + indent);
                            }
                        }
                    };
                });
            },
            absolute: function(target) {
                return Parsimmon.custom(function(success, failure) {
                    return function(stream, i) {
                        var j = 0;
                        while (stream.charAt(i + j) == ' ') {
                            j = j + 1;
                        }
                        if (j == target) {
                            indent = j;
                            return success(i + j, target);
                        } else {
                            return failure(i, 'indentation error: ' + j + ' does not equal ' + target);
                        }
                    };
                });
            },
            eq : eq, 
            ge : ge,
            gt : gt
        };
    })();


    var top_level = Parsimmon.sepBy(Indent.absolute(0).then(statement), cr).map(function(blk) {
        return {'blk' : blk};
    });

    block = Parsimmon.succeed({}).chain(function() {
        var indent = Indent.get();
        return Parsimmon.seqMap(
            Indent.relative(Indent.gt).then(statement),
            Parsimmon.alt((cr.then(Indent.relative(Indent.eq)).then(statement)).many(), Parsimmon.succeed([])),
            function(s, ss) {
                ss.unshift(s);
                Indent.set(indent);
                return {'blk' : ss};
            }   
        );
    });

    return top_level.parse(s);
};


return exports;
})();
