/*jshint node: true */
'use strict';

var prettybnf = require('./prettybnf');

exports.testVersion = function (t) {
    t.equal(prettybnf.version, '0.1.0');
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
    t.ok(Array.isArray(node));
    t.equal(node.length, 3);
    t.equal(node[0].terms.length, 2);
    t.equal(node[1].terms.length, 1);
    t.equal(node[2].terms.length, 1);
    t.throws(function () { new Parser('').expressions(); }, SyntaxError);
    t.throws(function () { new Parser('<a> |').expressions(); }, SyntaxError);
    t.throws(function () { new Parser('| <a>').expressions(); }, SyntaxError);
    t.done();
};

exports.testParser_production = function (t) {
    var node = new Parser('<a>\t::=   <b> | "c" <d> | ""\n\t;').production();
    t.equal(node.type, 'production');
    t.equal(node.lhs.type, 'nonterminal');
    t.ok(Array.isArray(node.rhs));
    t.equal(node.rhs.length, 3);
    t.throws(function () { new Parser(' <a> ::= "b";').production(); }, SyntaxError);
    t.throws(function () { new Parser('::= "b";').production(); }, SyntaxError);
    t.throws(function () { new Parser('<a> ::= ;').production(); }, SyntaxError);
    t.throws(function () { new Parser('<a> ').production(); }, SyntaxError);
    t.throws(function () { new Parser('<a> ::= "b"').production(); }, SyntaxError);
    t.done();
};

exports.testParser_grammar = function (t) {
    var node = new Parser('<foo>\t ::= <foo> <foo> | "foo"  ;\n' +
                          '<bar>\t ::= <bar> "bar" | "baz"  ;\n' +
                          '<bah>\t ::= "\"" <foo> "\""      ;\n\n').grammar();
    t.equal(node.type, 'grammar');
    t.equal(node.productions.length, 3);
    t.throws(function () { new Parser('').grammar(); }, SyntaxError);
    t.done();
};

// ---------------------------------------------------------------------------

var grammar = '<list> ::= "<" <items> ">";\n' +
              '<items> ::= <items> " " <item> | <item>;\n' +
              '<item> ::= "foo" | "bar" | "baz";\n';

var ast = {
    type: 'grammar',
    productions: [
        {
            type: 'production',
            lhs: {
                type: 'nonterminal',
                text: 'list'
            },
            rhs: [
                {
                    type: 'expression',
                    terms: [
                        { type: 'terminal', text: '<' },
                        { type: 'nonterminal', text: 'items' },
                        { type: 'terminal', text: '>' }
                    ]
                }
            ]
        },
        {
            type: 'production',
            lhs: {
                type: 'nonterminal',
                text: 'items'
            },
            rhs: [
                {
                    type: 'expression',
                    terms: [
                        { type: 'nonterminal', text: 'items' },
                        { type: 'terminal', text: ' ' },
                        { type: 'nonterminal', text: 'item' }
                    ]
                },
                {
                    type: 'expression',
                    terms: [
                        { type: 'nonterminal', text: 'item' }
                    ]
                }
            ]
        },
        {
            type: 'production',
            lhs: {
                type: 'nonterminal',
                text: 'item'
            },
            rhs: [
                {
                    type: 'expression',
                    terms: [
                        { type: 'terminal', text: 'foo' }
                    ]
                },
                {
                    type: 'expression',
                    terms: [
                        { type: 'terminal', text: 'bar' }
                    ]
                },
                {
                    type: 'expression',
                    terms: [
                        { type: 'terminal', text: 'baz' }
                    ]
                }
            ]
        }
    ]
};

exports.test_parse = function (t) {
    t.ok(nodesEqual(prettybnf.parse(grammar), ast));
    t.done();
};

exports.test_stringify = function (t) {
    t.equal(prettybnf.stringify(ast), grammar);
    t.done();
};

exports.test_cycle = function (t) {
    var fs = require('fs');
    var ast1 = prettybnf.parse(fs.readFileSync('prettybnf.bnf', 'utf8'));
    var str1 = prettybnf.stringify(ast1);
    var ast2 = prettybnf.parse(str1);
    var str2 = prettybnf.stringify(ast2);
    t.ok(nodesEqual(ast1, ast2));
    t.equal(str1, str2);
    t.done();
};

function nodeListsEqual(left, right) {
    if (left.length !== right.length) return false;
    for (var i = 0; i < left.length; i++) {
        if (!nodesEqual(left[i], right[i])) return false;
    }
    return true;
}

function nodesEqual(left, right) {
    if (left.type !== right.type) return false;
    switch (left.type) {
    case 'terminal':
    case 'nonterminal': return left.text === right.text;
    case 'expression':  return nodeListsEqual(left.terms, right.terms);
    case 'production':  return nodesEqual(left.lhs, right.lhs) && nodeListsEqual(left.rhs, right.rhs);
    case 'grammar':     return nodeListsEqual(left.productions, right.productions);
    }
    throw new Error('Unknown node type: ' + left.type);
}
