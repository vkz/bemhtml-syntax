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
        ast = syntax.parse(oldCode),
        newCode = files['new'],
        input = files['json'];

    if (t === 'info8' || t === 'info6') {
      pp(ast, {prompt: "ast"});
      pp(toHtml(transpiled, input), {prompt: "html for " + t});
      pp(toHtml(newCode, input), {prompt: "html for new " + t});
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
        [ [ 'template',
            [ [ 'block', [ 'string', 'b-wrapper' ] ],
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
          [ [ 'template',
              [ 'block', [ 'string', 'b-inner' ] ],
              [ 'default' ],
              [ 'body',
                [ [ 'begin',
                    ['return',
                     [ 'call',
                       [ 'get', 'applyCtx' ],
                       [ 'json',
                         [ 'binding', 'block', [ 'string', 'b' ] ],
                         [ 'binding',
                           'content',
                           [ 'getp',
                             [ 'string', 'content' ],
                             [ 'getp', [ 'string', 'ctx' ], [ 'this' ] ] ] ] ] ]]
                  ] ] ] ] ] ]));
  });

  it.skip('parse info8 into a simpler AST', function() {
    var source = tests.info6.old;
    var ast = syntax.parse(source);
    assert.equal(
      stringify(ast),
      stringify(
        [ [ 'template',
            [ [ 'block', [ 'string', 'b1' ] ],
              [ 'tag' ],
              [ 'body', [ 'begin', [ 'return', [ 'string', 'span' ] ] ] ] ]],
          [ 'template',
            [ [ 'block', [ 'string', 'b1' ] ],
              [ 'tag' ],
              [ 'body',
                [ 'begin', [ 'return', [ 'call', [ 'get', 'applyNext' ] ] ] ] ] ],
            [ [ 'block', [ 'string', 'b1' ] ],
              [ 'content' ],
              [ 'body',
                [ 'begin', [ 'return', [ 'string', 'b1 content' ] ] ] ] ] ]]));
  });

});
