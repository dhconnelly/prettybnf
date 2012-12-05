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

Parser.EOF = -1;

Parser.prototype.peek = function () {
    if (this.pos >= this.input.length) return Parser.EOF;
    return this.input[this.pos];
};

Parser.prototype.eat = function () {
    if (this.pos >= this.input.length) return Parser.EOF;
    return this.input[this.pos++];
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

}(typeof exports === 'undefined' ? this.prettybnf = {} : exports));
