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
    t.equal(new Parser('\\"').escaped(), '\"');
    t.equal(new Parser('\\n').escaped(), '\n');
    t.equal(new Parser('\\t').escaped(), '\t');
    t.equal(new Parser('\\\\').escaped(), '\\');
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
    t.equal(new Parser('abc\\"\n').text(), 'abc\"');
    t.equal(new Parser('').text(), '');
    t.done();
};

exports.testParser_terminal_text = function (t) {
    t.equal(new Parser('<abc\\"><\n').terminal_text(), '<abc\"><');
    t.equal(new Parser('').terminal_text(), '');
    t.done();
};

exports.testParser_terminal = function (t) {
    var node = new Parser('"<abc<>"').terminal();
    t.equal(node.type, 'terminal');
    t.equal(node.text, '<abc<>');
    t.throws(function () { new Parser('abc"').terminal(); }, SyntaxError);
    t.throws(function () { new Parser('"abc').terminal(); }, SyntaxError);
    t.done();
};

exports.testParser_nonterminal = function (t) {
    var node = new Parser('<abc>').nonterminal();
    t.equal(node.type, 'nonterminal');
    t.equal(node.text, 'abc');
    t.throws(function () { new Parser('<<abc>').nonterminal(); }, SyntaxError);
    t.throws(function () { new Parser('abc>').nonterminal(); }, SyntaxError);
    t.throws(function () { new Parser('<abc').nonterminal(); }, SyntaxError);
    t.done();
};

exports.testParser_term = function (t) {
    t.equal(new Parser('<abc>').term().type, 'nonterminal');
    t.equal(new Parser('"abc"').term().type, 'terminal');
    t.done();
};

exports.testParser_expression = function (t) {
    var node = new Parser('"abc"    <def>  ""').expression();
    t.equal(node.type, 'expression');
    t.equal(node.terms.length, 3);
    t.equal(node.terms[0].text, 'abc');
    t.equal(node.terms[1].text, 'def');
    t.equal(node.terms[2].text, '');
    t.throws(function () { new Parser('').expression(); }, SyntaxError);
    t.throws(function () { new Parser('abc').expression(); }, SyntaxError);
    t.throws(function () { new Parser(' abc').expression(); }, SyntaxError);
    t.done();
};

exports.testParser_expressions = function (t) {
    var node = new Parser('<abc> <def> | "ghi" | ""').expressions();
    t.equal(node.type, 'expressions');
    t.equal(node.expressions.length, 3);
    t.equal(node.expressions[0].terms.length, 2);
    t.equal(node.expressions[1].terms.length, 1);
    t.equal(node.expressions[2].terms.length, 1);
    t.throws(function () { new Parser('').expressions(); }, SyntaxError);
    t.throws(function () { new Parser('<a> |').expressions(); }, SyntaxError);
    t.throws(function () { new Parser('| <a>').expressions(); }, SyntaxError);
    t.done();
};

exports.testParser_production = function (t) {
    var node = new Parser('<a>\t::=   <b> | "c" <d> | ""\n\t;').production();
    t.equal(node.type, 'production');
    t.equal(node.lhs.type, 'nonterminal');
    t.equal(node.rhs.type, 'expressions');
    t.equal(node.rhs.expressions.length, 3);
    t.throws(function () { new Parser(' <a> ::= "b";').production(); }, SyntaxError);
    t.throws(function () { new Parser('::= "b";').production(); }, SyntaxError);
    t.throws(function () { new Parser('<a> ::= ;').production(); }, SyntaxError);
    t.throws(function () { new Parser('<a> ').production(); }, SyntaxError);
    t.throws(function () { new Parser('<a> ::= "b"').production(); }, SyntaxError);
    t.done();
};

exports.testParser_grammar = function (t) {
    var fs = require('fs');
    var node = new Parser(fs.readFileSync('prettybnf.bnf', 'utf8')).grammar();
    t.equal(node.type, 'grammar');
    t.equal(node.productions.length, 18);
    t.throws(function () { new Parser('').grammar(); }, SyntaxError);
    t.done();
};
