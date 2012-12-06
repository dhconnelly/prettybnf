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

You can use `prettybnf` both in Node.js apps and in modern browsers.  Only
browsers that implement ECMAScript 5.1 with strict mode are supported.  This
includes Chrome 13+, Firefox 4+, Safari 5.1+, IE 10+, and Opera 12+
([source](http://kangax.github.com/es5-compat-table)).

To get the library:

- in a Node.js app using `npm`: do `npm install prettybnf` and add
  `var prettybnf = require('prettybnf')` to your scripts.
- in a Node.js app, manually: put `prettybnf.js` somewhere and add
  `var prettybnf = require('./path/to/prettybnf.js')` to your scripts.
- in a browser app: put `prettybnf.js` somewhere and add the usual
  `<script src="path/to/prettybnf.js"></script>` tag to your HTML.  This will
  create a global object named `prettybnf`.

If you're not using `npm` you can download the latest version of `prettybnf.js`
from GitHub [here](https://github.com/dhconnelly/prettybnf/downloads).

Usage
-----

There are four top-level exports on the `prettybnf` object:

- `prettybnf.version`: string defining your version of the library
- `prettybnf.parse(grammar)`: parses a BNF string and returns the AST
- `prettybnf.stringify(ast)`: serializes an AST to a BNF string
- `prettybnf.Parser(grammar)`: internals of the parser for testing and hacking

The parser constructs an AST, composed of AST nodes, from a grammar.  Each node
is an object with a `type` property that specifies the type of node. The node
types, which correspond to the BNF syntax recognized by the parser, are as
follows:

- `grammar`
- `production`
- `expression`
- `nonterminal`
- `terminal`

`prettybnf.parse` returns a `grammar` node.

Each node has other relevant properties, described as follows:

- `grammar`:
    + `productions`: an `Array` of `production` nodes.
- `production`:
    + `lhs`: a `nonterminal` node
    + `rhs`: an `Array` of `expression` nodes
- `expression`:
    + `terms`: an `Array` of `terminal` or `nonterminal` nodes
- `terminal`:
    + `text`: the terminal `String`
- `nonterminal`:
    + `text`: a `String` specifying the name of the nonterminal

The BNF syntax recognized by the parser is defined in the file `prettybnf.bnf`,
which is itself written in BNF.

Contributing
------------

- fork on [GitHub](https://github.com/dhconnelly/prettybnf)
- make sure you have [Node.js](http://nodejs.org)
- write code in `prettybnf.js`
- add unit tests to `test_prettybnf.js`
- make sure all tests pass and everything passes `jshint`: `npm test`
- send me a pull request

Author
------

Written by Daniel Connelly <dhconnelly@gmail.com> (http://dhconnelly.com).

License
-------

Released under the 2-clause BSD license; see LICENSE for more details.
