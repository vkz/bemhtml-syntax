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
    templates = [ 'info1', 'info2', 'info3', 'info5', 'info6', 'info7', 'info8' ];

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

function toHtml(code, input) {
  return bemxjst.compile(ibem + code, {}).apply.call(input);
}

function show() {
  templates.forEach(function (t) {

    console.log('\n ---------------------------------------\n', t, '\n');

    var files = tests[t],
        oldCode = files['old'],
        transpiled = compat.transpile(oldCode),
        ast = syntax.parse(files['old']),
        newCode = files['new'],
        input = files['json'];

    if (t === 'info8') {
      pp(transpiled, {prompt: "transpiled"});
      pp(ast, {prompt: "ast"});
      pp(toHtml(transpiled, input), {prompt: "old html"});
      pp(toHtml(newCode, input), {prompt: "new html"});
    }

  });
}
show();

function getSource(fn) {
  return fn.toString().replace(/^function\s*\(\)\s*{\/\*|\*\/}$/g, '');
}

function stringify(thing) {
  return pp(thing, {stringify: true});
}

describe('BEMHTML/syntax', function() {

  // TODO skipped while investigating! Remember to UNskip it.
  it.skip('parse info6 into a simpler AST', function() {
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
