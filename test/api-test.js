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
        extAst = syntax.translate(ast),
        newCode = files['new'],
        input = files['json'];

    // if (t === 'info1' || t === 'info2') {
    if (t === 'info9') {
    // if (false) {
      console.log('\n ---------------------------------------\n', t, '\n');
      console.log(oldCode);

      console.log('~~~');
      console.log(newCode);

      console.log('~~~ ' + "parsing ...");
      pp(ast, {prompt: "ast"});

      console.log('~~~ ' + "translating ...");
      pp(extAst, {prompt: "syntax.translate(ast)"});

      console.log('~~~ ' + "compiling ...");
      pp(esgen(esprima.parse(syntax.compile(oldCode))), {prompt: "syntax.compile(extAst)"});

      var jsonAst = [ 'json', [ 'binding', 'this.temp._bla', [ 'get', 'true' ] ] ],
          assgnAst = [ 'getp',
                      [ 'string', '_bla' ],
                       [ 'getp', [ 'string', 'temp' ], [ 'this' ] ] ];

      var B = require('../lib/ometa/bemhtml').Binding;
      pp(B.match(assgnAst, 'stmt'), {prompt: "B.match(assgnAst, 'stmt')"});

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

function test(name, oldCode, newCode, input) {
  var result;
  it("compile " + name, function () {

    try {
      result = syntax.compile(oldCode);
    } catch (e) {
      throw e
    };

    assert.equal(
      esgen(esprima.parse(result)),
      esgen(esprima.parse(newCode)));

    describe("Compiled " + name + " when applied should", function () {

      it("produce the same HTML as compat-compiled", function () {
        assert.equal(
          toHtml(result, input),
          toHtml(compat.transpile(oldCode), input));
      });

      it("produce the same HTML as hand-written template", function () {
        assert.equal(
          toHtml(result, input),
          toHtml(newCode, input));
      });
    });
  });
}

function run(tests) {
  Object.keys(tests).forEach(function (name) {

    var files = tests[name],
        oldCode = files['old'],
        newCode = files['new'],
        input = files['json'];

    test(name, oldCode, newCode, input);
  });
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
                [ 'body', [ 'literal', [ 'string', 'wrap' ] ] ] ],
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
                [ 'body', [ 'literal', [ 'string', 'span' ] ] ] ],
              [ [ 'xjst',
                  [ 'getp',
                    [ 'string', 'url' ],
                    [ 'getp', [ 'string', 'ctx' ], [ 'this' ] ] ] ],
                [ [ [ 'tag' ],
                    [ 'body', [ 'literal', [ 'string', 'a' ] ] ] ],
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
                          [ 'literal',
                            [ 'json', [ 'binding', 'href', [ 'get', 'undefined' ] ] ] ] ] ] ] ] ] ] ] ] ] ]);
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
        [ ['template',
           [ [ 'block', [ 'string', 'b-wrapper' ] ],
             [ 'sub',
               [ [ [ 'std', 'tag' ],
                   [ 'body', [ 'literal', [ 'string', 'wrap' ] ] ] ],
                 [ [ 'std', 'content' ],
                   [ 'body',
                     [ 'begin',
                       [ 'return',
                         [ 'getp',
                           [ 'string', 'content' ],
                           [ 'getp', [ 'string', 'ctx' ], [ 'this' ] ] ] ] ] ] ] ] ] ]],
          ['template',
           [ [ 'block', [ 'string', 'b-inner' ] ],
             [ 'dot',
               [ [ 'std', 'def' ],
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
                               [ 'getp', [ 'string', 'ctx' ], [ 'this' ] ] ] ] ] ] ] ] ] ] ] ]] ] );
  });

  it('AST for a template with custom mode and predicate', function() {
    var source = tests.info7.old;
    var ast = syntax.parse(source);
    var extAst = syntax.translate(ast);
    assert.deepEqual(
      extAst,
      [ ['template',
         [ [ 'block', [ 'string', 'b-link' ] ],
           [ 'dot',
             [ [ 'elem', [ 'string', 'e1' ] ],
               [ 'sub',
                 [ [ [ 'std', 'tag' ],
                     [ 'body', [ 'literal', [ 'string', 'span' ] ] ] ],
                   [ [ 'match',
                       [ 'getp',
                         [ 'string', 'url' ],
                         [ 'getp', [ 'string', 'ctx' ], [ 'this' ] ] ] ],
                     [ 'sub',
                       [ [ [ 'std', 'tag' ],
                           [ 'body', [ 'literal', [ 'string', 'a' ] ] ] ],
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
                         [ [ 'mode', '"reset"' ],
                           [ 'sub',
                             [ [ [ 'std', 'attrs' ],
                                 [ 'body',
                                   [ 'literal',
                                     [ 'json', [ 'binding', 'href', [ 'get', 'undefined' ] ] ] ] ] ] ] ] ] ] ] ] ] ] ] ] ]] ]
    );
  });

});

describe('BEMHTML/Compile should ', function() {
  run(tests);
});
