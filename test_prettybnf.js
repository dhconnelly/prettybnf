var prettybnf = require('./prettybnf');

exports.testVersion = function (t) {
    t.equal(prettybnf.version, '0.0.0');
    t.done();
};
