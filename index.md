---
title: prettybnf
layout: default
---

prettybnf
=========

a JavaScript library for working with BNF grammars

About
-----

`prettybnf` provides a parser for Backus-Naur Form grammars and a stringifier
for pretty-printing BNF abstract syntax trees.  It uses the traditional BNF
syntax as opposed to `yacc` syntax.

Getting Started
---------------

Download the latest version of `prettybnf.js` from GitHub
[here](https://github.com/dhconnelly/prettybnf/downloads).

You can use `prettybnf` both in Node.js apps and in modern browsers.  Only
browsers that implement ECMAScript 5.1 with strict mode are supported.  This
includes Chrome 13+, Firefox 4+, Safari 5.1+, IE 10+, and Opera 12+
([source](http://kangax.github.com/es5-compat-table)).

To use the library in your project:

- in a Node.js app using `npm`: do `npm install prettybnf` and add
  `var prettybnf = require('prettybnf')` to your scripts.
- in a Node.js app, manually: put `prettybnf.js` somewhere and add
  `var prettybnf = require('./path/to/prettybnf.js')` to your scripts.
- in a browser app: put `prettybnf.js` somewhere and add the usual
  `<script src="path/to/prettybnf.js"></script>` tag to your HTML.  This will
  create a global object named `prettybnf`.

Usage
-----

There are four top-level exports on the `prettybnf` object:

    {
        version: '0.1.1', // defines your version of the library
        parse: function (grammar) {}, // String -> AST node
        stringify: function (ast) {}, // AST node -> String
        Parser: function (grammar) {}, // parser internals for testing
    }

The parser constructs an AST, composed of AST nodes, from a grammar.  Each node
is an object with a `type` property  and other relevant properties.  The five
node types are as follows:

    { type: 'grammar',
      productions: an Array of productions }

    { type: 'production',
      lhs: a nonterminal,
      rhs: an Array of expressions }

    { type: 'expression',
      terms: an Array of terminals and nonterminals }

    { type: 'nonterminal',
      text: the nonterminal String }

    { type: 'terminal',
      text: the terminal String }

`prettybnf.parse` returns a `grammar` node.

The language recongized by the `prettybnf` parser is defined by the following
self-describing grammar:

    <empty> ::= "";

    <space> ::= " " | "\n" | "\t";
    <letter> ::= "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j"
               | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t"
               | "u" | "v" | "w" | "x" | "y" | "z"
               | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J"
               | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T"
               | "U" | "V" | "W" | "X" | "Y" | "Z";
    <digit> ::= "0" | "1" | "2" | "3" | "4"
              | "5" | "6" | "7" | "8" | "9";
    <delim> ::= "-" | "_" | "|" | ":" | "=" | ";" | " ";
    <escaped> ::= "\\\"" | "\\n" | "\\t" | "\\\\";
    <char> ::= <letter> | <digit> | <delim> | <escaped>;
    <terminal_char> ::= <char> | "<" | ">";

    <ws> ::= <space> <ws> | <empty>;
    <text> ::= <char> <text> | <empty>;
    <terminal_text> ::= <terminal_char> <terminal_text> | <empty>;
    <term> ::= <terminal> | <nonterminal>;
    <terminal> ::= "\"" <terminal_text> "\"";
    <nonterminal> ::= "<" <text> ">";
    <expression> ::= <term> <ws> <expression> | <term> <ws>;
    <expressions> ::= <expression> "|" <ws> <expressions> | <expression>;
    <production> ::= <nonterminal> <ws> "::=" <ws> <expressions> ";";
    <grammar> ::= <production> <ws> <grammar> | <production> <ws>;

Example
-------

Consider the following grammar, which you might have saved in the file `g.bnf`:

    <list>  ::=  "<" <items> ">"               ;
    <items> ::=  <items> " " <item> | <item>   ;
    <item>  ::=  "foo" | "bar" | "baz"         ;

To read this grammar from the file, parse it, and print the AST, you might do
the following:

    // Node.js specific:
    var prettybnf = require('prettybnf'), fs = require('fs');
    var g = fs.readFileSync('g.bnf', 'utf8');

    // The grammar is stored in the string g
    var ast = prettybnf.parse(g);
    console.log(ast);

This will print out the AST for the above grammar, which looks like

    { type: 'grammar',
      productions:
       [ { type: 'production',
           lhs: { type: 'nonterminal', text: 'list' },
           rhs:
            [ { type: 'expression',
                terms:
                 [ { type: 'terminal', text: '<' },
                   { type: 'nonterminal', text: 'items' },
                   { type: 'terminal', text: '>' } ] } ] },
         { type: 'production',
           lhs: { type: 'nonterminal', text: 'items' },
           rhs:
            [ { type: 'expression',
                terms:
                 [ { type: 'nonterminal', text: 'items' },
                   { type: 'terminal', text: ' ' },
                   { type: 'nonterminal', text: 'item' } ] },
              { type: 'expression',
                terms: [ { type: 'nonterminal', text: 'item' } ] } ] },
         { type: 'production',
           lhs: { type: 'nonterminal', text: 'item' },
           rhs:
            [ { type: 'expression',
                terms: [ { type: 'terminal', text: 'foo' } ] },
              { type: 'expression',
                terms: [ { type: 'terminal', text: 'bar' } ] },
              { type: 'expression',
                terms: [ { type: 'terminal', text: 'baz' } ] } ] } ] }

You could add another expression to the `<item>` production:

    var item = ast.productions[2];
    item.rhs.push({
        type: 'expression',
        terms: [{ type: 'terminal', text: 'hello' },
                { type: 'nonterminal', text: 'list' }]
    });

Now print out the modified grammar:

    var h = prettybnf.stringify(ast);
    console.log(h);

The resulting grammar looks like

    <list>  ::=  "<" <items> ">";
    <items> ::=  <items> " " <item> | <item>;
    <item>  ::=  "foo" | "bar" | "baz" | "hello" <list>;

Contributing
------------

- fork on [GitHub](https://github.com/dhconnelly/prettybnf)
- write code in `prettybnf.js`
- add unit tests to `test_prettybnf.js`
- make sure all tests and linting pass: `npm test`
- send me a pull request

Author
------

Written by [Daniel Connelly](http://dhconnelly.com) (<dhconnelly@gmail.com>).

License
-------

Released under the Simplified (2-clause) BSD License, described here and in
the `LICENSE` file:

Copyright (c) 2012, Daniel Connelly
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
