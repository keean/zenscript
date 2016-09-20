module.exports = (function Parse_Module() {

var Parsimmon = require('parsimmon');

var exports = function parse(s) {
    var identifier = Parsimmon.regexp(/[a-z]+/).map(function(id) {
        return {'var' : id};
    }).or(Parsimmon.succeed({}));

    var result = identifier.parse(s);

    return result.value;
}

return exports;
})();
