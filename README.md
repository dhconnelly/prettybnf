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

The BNF syntax recognized by the parser is defined in the file `prettybnf.bnf`,
which is itself written in BNF.

The parser constructs an AST, composed of AST nodes, from a grammar.  Each node
is an object with a `type` property that specifies the type of node and other
relevant properties.  The five node types are as follows:

    { type:        (String) 'grammar',
      productions: (Array) list of productions         }

    { type:        (String) 'production',
      lhs:         (Object) a nonterminal node,
      rhs:         (Array) list of expressions         }

    { type:        (String) 'expression',
      terms:       (Array) terminals and nonterminals  }

    { type:        (String) 'nonterminal',
      text:        (String) the nonterminal name       }

    { type:        (String) 'terminal',
      text:        (String) the terminal string        }

`prettybnf.parse` returns a `grammar` node.

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

For a longer example, take a look at the file `prettybnf.bnf`, which defines
the grammar recognized by the parser itself.

Contributing
------------

- fork on [GitHub](https://github.com/dhconnelly/prettybnf)
- write code in `prettybnf.js`
- add unit tests to `test_prettybnf.js`
- make sure all tests and linting pass: `npm test`
- send me a pull request

Author
------

Written by Daniel Connelly <dhconnelly@gmail.com> (http://dhconnelly.com).

License
-------

Released under the 2-clause BSD license; see LICENSE for more details.
