var syntax = require('..');
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var pp = require("zeHelpers").prettyPrint;
var bemxjst = require("bem-xjst");
var compat = require('bemhtml-compat');
var esprima = require("esprima");
var esgen = require("escodegen").generate;

// TODO pull proper latest i-bem.bemhtml from bem-core
var ibem = require('./fixtures/i-bem');

var tests = {},
    templates = [ 'info1', 'info2', 'info3', 'info5', 'info6', 'info7' ];

templates.forEach(function (file) {
  var dir = path.dirname(module.filename),
      utf8 = { encoding:'utf8' },
      base = dir + '/' + file;

  tests[file] = {
    'old': fs.readFileSync(base + '.bemhtml', utf8),
    'new': fs.readFileSync(base + '.bemhtml.js', utf8),
    'json': (new Function('return ' + fs.readFileSync(base + '.json', utf8)))()
  };
});

function show() {
  templates.forEach(function (t) {
    var files = tests[t],
        transpiled = compat.transpile(files['old']),
        ast = compat.parse(files['old']),
        oldCode = ibem + transpiled,
        newCode = ibem + files['new'],
        input = files['json'];

    pp(files['old'], {prompt: "code"});
    pp(ast, {prompt: "ast"});

    var oldResult  = bemxjst.compile(oldCode, {}).apply.call(input),
        newResult  = bemxjst.compile(newCode, {}).apply.call(input);
  });
}

function getSource(fn) {
  return fn.toString().replace(/^function\s*\(\)\s*{\/\*|\*\/}$/g, '');
}

function stringify(thing) {
  return pp(thing, {stringify: true});
}

describe('BEMHTML/syntax', function() {

  it('parse info6 into a simpler AST', function() {
    var source = tests.info6.old;
    var ast = syntax.parse(source);
    assert.equal(
      stringify(ast),
      stringify(
        [ [ [ [ 'block', [ 'string', 'b-wrapper' ] ],
              [ 'tag' ],
              [ 'body', [ 'begin', [ 'return', [ 'string', 'wrap' ] ] ] ] ],
            [ [ 'block', [ 'string', 'b-wrapper' ] ],
              [ 'content' ],
              [ 'body',
                [ 'begin',
                  [ 'return',
                    [ 'getp',
                      [ 'string', 'content' ],
                      [ 'getp', [ 'string', 'ctx' ], [ 'this' ] ] ] ] ] ] ] ],
          [ [ [ 'block', [ 'string', 'b-inner' ] ],
              [ 'default' ],
              [ 'body',
                [ [ 'stmt',
                    [ 'call',
                      [ 'get', 'func' ],
                      [ 'json',
                        [ 'binding', 'block', [ 'string', 'b' ] ],
                        [ 'binding',
                          'content',
                          [ 'getp',
                            [ 'string', 'content' ],
                            [ 'getp', [ 'string', 'ctx' ], [ 'this' ] ] ] ] ] ] ] ] ] ] ] ]));
  });

});
