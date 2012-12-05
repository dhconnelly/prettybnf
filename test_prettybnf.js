/*jshint node: true */
'use strict';

var prettybnf = require('./prettybnf');

exports.testVersion = function (t) {
    t.equal(prettybnf.version, '0.0.0');
    t.done();
};

// ---------------------------------------------------------------------------

var Parser = prettybnf.Parser;

exports.testParser_peek = function (t) {
    var p = new Parser('abc');
    t.equal(p.peek(), 'a');
    t.equal(p.peek(), 'a');
    p.pos = 3;
    t.equal(p.peek(), Parser.EOF);
    t.equal(p.peek(), Parser.EOF);
    t.done();
};

exports.testParser_eat = function (t) {
    var p = new Parser('abc');
    t.equal(p.eat(), 'a');
    t.equal(p.eat(), 'b');
    t.equal(p.eat(), 'c');
    t.equal(p.eat(), Parser.EOF);
    t.equal(p.eat(), Parser.EOF);
    t.done();
};

exports.testParser_ws = function (t) {
    var p = new Parser('  \n\n   \t\n    foo');
    t.equal(p.ws(), '  \n\n   \t\n    ');
    t.equal(p.peek(), 'f');
    t.equal(p.ws(), '');
    t.done();
};
