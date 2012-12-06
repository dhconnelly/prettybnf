(function (exports) {
'use strict';

exports.version = '0.0.0';
exports.parse = function (g) {};
exports.stringify = function (ast) {};
exports.Parser = Parser;

// ---------------------------------------------------------------------------

function Parser(input) {
    var o = (this !== exports) ? this : {};
    o.input = input;
    o.pos = 0;
    o.line = 1;
}

var EOF = Parser.EOF = -1;

Parser.prototype.peek = function () {
    if (this.pos >= this.input.length) return EOF;
    return this.input[this.pos];
};

Parser.prototype.eat = function (expected) {
    var ch = this.peek();
    if (expected !== undefined && expected !== ch) {
        throw new SyntaxError('Expected ' + expected + ', got' + ch);
    }
    if (ch === EOF) return EOF;
    this.pos++;
    return ch;
};

// <ws> ::= <space> <ws> | <empty>;
// <space> ::= " " | "\n" | "\t";
// <empty> ::= "";
Parser.prototype.ws = function () {
    var ret = '', ch;
    while (' \n\t'.indexOf(ch = this.peek()) >= 0) {
        if (ch === '\n') this.line++;
        ret += this.eat();
    }
    return ret;
};

// <escaped> ::= "\\\"" | "\\n" | "\\t";
Parser.prototype.escaped = function () {
    this.eat('\\');
    var ch = this.peek();
    if (ch !== '"' && ch !== 'n' && ch !== 't') {
        throw new SyntaxError('Invalid escape sequence: \\' + ch);
    }
    return '\\' + this.eat();
};

// <char> ::= <letter> | <digit> | <delim> | <escaped>;
// <letter> ::= "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k"
//            | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v"
//            | "w" | "x" | "y" | "z"
//            | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K"
//            | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V"
//            | "W" | "X" | "Y" | "Z";
// <digit> ::= "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "0";
// <delim> ::= "-" | "_" | "|" | ":" | "=" | ";" | " ";
Parser.prototype.isChar = function () {
    var ch = this.peek();
    return ch !== EOF && ((/[a-zA-Z0-9\-_|:=; ]/).test(ch) || ch === '\\');
};

// <text> ::= <char> <text> | <empty>;
Parser.prototype.text = function () {
    var ret = '', ch;
    while (this.isChar()) {
        if (this.peek() === '\\') ret += this.escaped();
        else ret += this.eat();
    }
    return ret;
};

// <terminal> ::= "\"" <text> "\"";
Parser.prototype.terminal = function () {
    this.eat('"');
    var text = this.text();
    this.eat('"');
    return { type: 'terminal', text: text };
};

// <nonterminal> ::= "<" <text> ">";
Parser.prototype.nonterminal = function () {
    this.eat('<');
    var text = this.text();
    this.eat('>');
    return { type: 'nonterminal', text: text };
};

// <term> ::= <terminal> | <nonterminal>;
Parser.prototype.term = function () {
    return (this.peek() === '<') ? this.nonterminal() : this.terminal();
};

// <expression> ::= <term> <ws> <expression> | <term>;
Parser.prototype.expression = function () {
    var terms = [this.term()];
    this.ws();
    while ('<"'.indexOf(this.peek()) >= 0) {
        terms.push(this.term());
        this.ws();
    }
    return { type: 'expression', terms: terms };
};

}(typeof exports === 'undefined' ? this.prettybnf = {} : exports));
