var syntax = require('..');
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var pp = require("zeHelpers").prettyPrint;
var bemxjst = require("bem-xjst");
var compat = require('bemhtml-compat');
var esprima = require("esprima");
var esgen = require("escodegen").generate;


var ometajs = require('ometajs');
var BEMHTMLToXJST = require('../lib/ometa/bemhtml').BEMHTMLToXJST;

// TODO pull proper latest i-bem.bemhtml from bem-core
var ibem = require('./fixtures/i-bem');

var tests = {},
    templates = [ 'info1', 'info2', 'info3', 'info5', 'info6', 'info7', 'info8', 'info9'],
    dir = path.dirname(module.filename),
    utf8 = { encoding:'utf8' };

templates.forEach(function (file) {
  var base = dir + '/' + file;

  tests[file] = {
    'old': fs.readFileSync(base + '.bemhtml', utf8),
    'new': fs.readFileSync(base + '.bemhtml.js', utf8),
    'json': (new Function('return ' + fs.readFileSync(base + '.json', utf8)))()
  };
});

function toHtml(code, input) {
  return bemxjst.compile(ibem + code, {}).apply.call(input);
}

function show(tests) {
  Object.keys(tests).forEach(function (t) {

    var files = tests[t],
        oldCode = files['old'],
        transpiled = compat.transpile(oldCode),
        ast = syntax.parse(oldCode),
        newCode = files['new'],
        input = files['json'];

    // if (t === 'info6' || t === 'info7') {
    // if (t === 'info1') {
    if (true) {
      console.log('\n ---------------------------------------\n', t, '\n');
      console.log(oldCode);
      // console.log('~~~');
      // console.log(newCode);
      console.log('~~~');
      pp(ast, {prompt: "ast"});
      console.log('~~~');
      pp(syntax.translate(ast), {prompt: "syntax.translate(ast)"});;
    }

  });
}

var bemSiteDir = path.join(dir, 'bem-site-engine'),
    bemSiteFiles = fs.readdirSync(bemSiteDir).map(function (f) {
      return path.resolve(path.join(bemSiteDir, f));
    }),
    bemSiteTemplates =  bemSiteFiles.reduce(function (ts, f) {
      ts[f] = {
        'old': fs.readFileSync(f, utf8),
        'new': '',
        'json': ''
      };
      return ts;
    }, {});

// show(bemSiteTemplates);
show(tests);

function getSource(fn) {
  return fn.toString().replace(/^function\s*\(\)\s*{\/\*|\*\/}$/g, '');
}

function stringify(thing) {
  return pp(thing, {stringify: true});
}

describe('BEMHTML/Parser should parse', function() {

  it('2 templates in one file', function() {
    var source = tests.info6.old;
    var ast = syntax.parse(source);
    assert
      .deepEqual(
        ast,
        [ [ [ 'block', [ 'string', 'b-wrapper' ] ],
            [ [ [ 'tag' ],
                [ 'body', [ 'begin', [ 'return', [ 'string', 'wrap' ] ] ] ] ],
              [ [ 'content' ],
                [ 'body',
                  [ 'begin',
                    [ 'return',
                      [ 'getp',
                        [ 'string', 'content' ],
                        [ 'getp', [ 'string', 'ctx' ], [ 'this' ] ] ] ] ] ] ] ] ],
          [ [ 'block', [ 'string', 'b-inner' ] ],
            [ [ 'default' ],
              [ 'body',
                [ 'begin',
                  [ 'return',
                    [ 'call',
                      [ 'get', 'applyCtx' ],
                      [ 'json',
                        [ 'binding', 'block', [ 'string', 'b-wrapper' ] ],
                        [ 'binding',
                          'content',
                          [ 'getp',
                            [ 'string', 'content' ],
                            [ 'getp', [ 'string', 'ctx' ], [ 'this' ] ] ] ] ] ] ] ] ] ] ] ] );
  });

  it('template with multiple mods and custom predicate', function() {
    var source = tests.info7.old;
    var ast = syntax.parse(source);
    assert.deepEqual(
      ast,
      [ [ [ 'block', [ 'string', 'b-link' ] ],
          [ [ 'elem', [ 'string', 'e1' ] ],
            [ [ [ 'tag' ],
                [ 'body', [ 'begin', [ 'return', [ 'string', 'span' ] ] ] ] ],
              [ [ 'xjst',
                  [ 'getp',
                    [ 'string', 'url' ],
                    [ 'getp', [ 'string', 'ctx' ], [ 'this' ] ] ] ],
                [ [ [ 'tag' ],
                    [ 'body', [ 'begin', [ 'return', [ 'string', 'a' ] ] ] ] ],
                  [ [ 'attrs' ],
                    [ 'body',
                      [ 'begin',
                        [ 'return',
                          [ 'json',
                            [ 'binding',
                              'href',
                              [ 'getp',
                                [ 'string', 'url' ],
                                [ 'getp', [ 'string', 'ctx' ], [ 'this' ] ] ] ] ] ] ] ] ],
                  [ [ 'reset' ],
                    [ [ [ 'attrs' ],
                        [ 'body',
                          [ 'begin',
                            [ 'return',
                              [ 'json', [ 'binding', 'href', [ 'get', 'undefined' ] ] ] ] ] ] ] ] ] ] ] ] ] ] ]);
  });

});

describe('BEMHTML/Identity should expand', function() {

  it('AST for two templates with nesting', function() {
    var source = tests.info6.old;
    var ast = syntax.parse(source);
    var extAst = syntax.translate(ast);
    assert
      .deepEqual(
        extAst,
        [ [ [ 'block', [ 'string', 'b-wrapper' ] ],
            [ 'sub',
              [ [ [ 'std', 'tag' ],
                  [ 'body', [ 'begin', [ 'return', [ 'string', 'wrap' ] ] ] ] ],
                [ [ 'std', 'content' ],
                  [ 'body',
                    [ 'begin',
                      [ 'return',
                        [ 'getp',
                          [ 'string', 'content' ],
                          [ 'getp', [ 'string', 'ctx' ], [ 'this' ] ] ] ] ] ] ] ] ] ],
          [ [ 'block', [ 'string', 'b-inner' ] ],
            [ 'dot',
              [ [ 'std', 'default' ],
                [ 'body',
                  [ 'begin',
                    [ 'return',
                      [ 'call',
                        [ 'get', 'applyCtx' ],
                        [ 'json',
                          [ 'binding', 'block', [ 'string', 'b-wrapper' ] ],
                          [ 'binding',
                            'content',
                            [ 'getp',
                              [ 'string', 'content' ],
                              [ 'getp', [ 'string', 'ctx' ], [ 'this' ] ] ] ] ] ] ] ] ] ] ] ] ] );
  });

  it('AST for a template with custom mode and predicate', function() {
    var source = tests.info7.old;
    var ast = syntax.parse(source);
    var extAst = syntax.translate(ast);
    assert.deepEqual(
      extAst,
      [ [ [ 'block', [ 'string', 'b-link' ] ],
          [ 'dot',
            [ [ 'elem', [ 'string', 'e1' ] ],
              [ 'sub',
                [ [ [ 'std', 'tag' ],
                    [ 'body', [ 'begin', [ 'return', [ 'string', 'span' ] ] ] ] ],
                  [ [ 'xjst',
                      [ 'getp',
                        [ 'string', 'url' ],
                        [ 'getp', [ 'string', 'ctx' ], [ 'this' ] ] ] ],
                    [ 'sub',
                      [ [ [ 'std', 'tag' ],
                          [ 'body', [ 'begin', [ 'return', [ 'string', 'a' ] ] ] ] ],
                        [ [ 'std', 'attrs' ],
                          [ 'body',
                            [ 'begin',
                              [ 'return',
                                [ 'json',
                                  [ 'binding',
                                    'href',
                                    [ 'getp',
                                      [ 'string', 'url' ],
                                      [ 'getp', [ 'string', 'ctx' ], [ 'this' ] ] ] ] ] ] ] ] ],
                        [ [ 'mode', 'reset' ],
                          [ 'sub',
                            [ [ [ 'std', 'attrs' ],
                                [ 'body',
                                  [ 'begin',
                                    [ 'return',
                                      [ 'json', [ 'binding', 'href', [ 'get', 'undefined' ] ] ] ] ] ] ] ] ] ] ] ] ] ] ] ] ] ] ]
    );
  });

});
