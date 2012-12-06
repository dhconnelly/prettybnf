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
    t.equal(p.eat('b'), 'b');
    t.equal(p.eat(), 'c');
    t.equal(p.eat(), Parser.EOF);
    t.equal(p.eat(Parser.EOF), Parser.EOF);
    t.throws(function () { p.eat('a'); }, SyntaxError);
    t.done();
};

exports.testParser_ws = function (t) {
    var p = new Parser('  \n\n   \t\n    foo');
    t.equal(p.ws(), '  \n\n   \t\n    ');
    t.equal(p.peek(), 'f');
    t.equal(p.ws(), '');
    t.done();
};

exports.testParser_escaped = function (t) {
    t.equal(new Parser('\\\"').escaped(), '\\\"');
    t.equal(new Parser('\\n').escaped(), '\\n');
    t.equal(new Parser('\\t').escaped(), '\\t');
    t.throws(function () {
        new Parser('\\d').escaped();
    }, SyntaxError);
    t.done();
};

exports.testParser_isChar = function (t) {
    t.ok(new Parser('a').isChar());
    t.ok(new Parser('A').isChar());
    t.ok(new Parser('0').isChar());
    t.ok(new Parser('-').isChar());
    t.ok(new Parser('_').isChar());
    t.ok(new Parser('|').isChar());
    t.ok(new Parser(':').isChar());
    t.ok(new Parser('=').isChar());
    t.ok(new Parser(';').isChar());
    t.ok(new Parser(' ').isChar());
    t.ok(new Parser('\\').isChar());
    t.done();
};

exports.testParser_text = function (t) {
    t.equal(new Parser('abc\\\"\n').text(), 'abc\\\"');
    t.equal(new Parser('').text(), '');
    t.done();
};
