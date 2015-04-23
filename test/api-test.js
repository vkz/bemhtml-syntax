var syntax = require(".."),
    ometajs = require("ometajs"),
    assert = require("assert"),
    fs = require("fs"),
    path = require("path"),
    pp = require("zeHelpers").prettyPrint,
    bemxjst = require("bem-xjst"),
    compat = require("bemhtml-compat"),
    esprima = require("esprima"),
    esgen = require("escodegen").generate,
    // TODO pull proper latest i-bem.bemhtml from bem-core
    ibem = require("./fixtures/i-bem");


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
        newCode = files['new'],
        input = files['json'];

    // pp(esgen(esprima.parse(compat.transpile(
    //   getSource(function () {/*
    //            block b1, content: local(
    //                    this.ctx.cache = null,
    //                    this._cachePos = this._buf.length) {this._buf.length = 42;}
    //            */})))), {prompt: "esprima.parse(),"});

    // console.log('######### compiling example');
    // var res = syntax.translate(syntax.parse(
    //   getSource(
    //     function () {/*
    //            block b1, content: func(1)
    //            */})));
    // pp(res, {prompt: "res"});

    // if (t === 'info6' || t === 'info7') {
    // if (t === '/Users/kozin/Documents/bemhtml-syntax/test/veged/granny-dac.bemhtml') {
    // if (t === '/Users/kozin/Documents/bemhtml-syntax/test/veged/granny.bemhtml') {
    // if (t === '/Users/kozin/Documents/bemhtml-syntax/test/veged/images.bemhtml') {
    // if (t === '/Users/kozin/Documents/bemhtml-syntax/test/veged/web4.bemhtml') {
    // if (t === '/Users/kozin/Documents/bemhtml-syntax/test/veged/test.bemhtml') {
    // if (t === '/Users/kozin/Documents/bemhtml-syntax/test/veged/images-broken.bemhtml') {
    if (false) {
      console.log('\n ---------------------------------------\n', t, '\n');
      // console.log(oldCode);

      // console.log('~~~ ' + 'transpiling ...');
      // var transpiled = compat.transpile(oldCode);
      // pp(esgen(esprima.parse(transpiled)), {prompt: "transpiled"});

      // console.log('~~~');
      // console.log(newCode);

      console.log('~~~ ' + "parsing ...");
      var ast = syntax.parse(oldCode);
      // pp(ast, {prompt: "ast"});

      console.log('~~~ ' + "translating ...");
      var extAst = syntax.translate(ast);
      // pp(extAst, {prompt: "syntax.translate(ast)"});

      // var out = fs.readFileSync(path.join(dir, '/veged/out.js') , utf8);
      // pp(out, {prompt: "out"});
      // pp(esgen(esprima.parse(out)), {prompt: "esprima.parse(out)"});

      console.log('~~~ ' + "compiling ...");
      pp(syntax.compile(oldCode), {prompt: "syntax.compile(extAst)"});

      // var B = require('../lib/ometa/bemhtml').Binding;
      // pp(B.match(assgnAst, 'stmt'), {prompt: "B.match(assgnAst, 'stmt')"});

    }

  });
}

// var vegedDir = path.join(dir, 'veged'),
//     vegedFiles = fs.readdirSync(vegedDir).filter(function (f) {
//       return /\.bemhtml$/i.test(f);
//     }).map(function (f) {
//       return path.resolve(path.join(vegedDir, f));
//     }),
//     vegedTemplates =  vegedFiles.reduce(function (ts, f) {
//       ts[f] = {
//         'old': fs.readFileSync(f, utf8),
//         'new': '',
//         'json':  ''
//       };
//       return ts;
//     }, {});
// pp(vegedFiles, {prompt: "vegedTemplates"});

var bemSiteDir = path.join(dir, 'bem-site-engine'),
    bemSiteFiles = fs.readdirSync(bemSiteDir).filter(function (f) {
      return /\.bemhtml$/i.test(f);
    }).map(function (f) {
      return path.resolve(path.join(bemSiteDir, f));
    }),
    bemSiteTemplates =  bemSiteFiles.reduce(function (ts, f) {
      ts[f] = {
        'old': fs.readFileSync(f, utf8),
        'new': fs.readFileSync(f + '.js', utf8),
        'json':  ''
      };
      return ts;
    }, {});

// show(vegedTemplates);
// show(bemSiteTemplates);
// show(tests);

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

    if (input) {
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
    }
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

function runTest(f, input, shouldBe) {
  var source = getSource(f);
  try {
    var out = syntax.compile(source);
  } catch (e) {
    throw e
  };

  var result = shouldBe || toHtml(compat.transpile(source), input);
  // pp(esgen(esprima.parse(compat.transpile(source))), {prompt: "compat.transpile(source)"});
  assert.equal(toHtml(out, input), result);
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
        [ [ 'template',
            [ [ 'block', [ 'string', 'b-wrapper' ] ],
              [ 'sub',
                [ [ [ 'std', 'tag' ],
                    [ 'body', [ 'literal', [ 'string', 'wrap' ] ] ] ],
                  [ [ 'std', 'content' ],
                    [ 'body',
                      [ 'func',
                        null,
                        [],
                        [ 'begin',
                          [ 'return',
                            [ 'getp',
                              [ 'string', 'content' ],
                              [ 'getp', [ 'string', 'ctx' ], [ 'this' ] ] ] ] ] ] ] ] ] ] ] ],
          [ 'template',
            [ [ 'block', [ 'string', 'b-inner' ] ],
              [ 'dot',
                [ [ 'std', 'def' ],
                  [ 'body',
                    [ 'func',
                      null,
                      [],
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
                                  [ 'getp', [ 'string', 'ctx' ], [ 'this' ] ] ] ] ] ] ] ] ] ] ] ] ] ] ] );
  });

  it('AST for a template with custom mode and predicate', function() {
    var source = tests.info7.old;
    var ast = syntax.parse(source);
    var extAst = syntax.translate(ast);
    assert.deepEqual(
      extAst,
      [ [ 'template',
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
                              [ 'func',
                                null,
                                [],
                                [ 'begin',
                                  [ 'return',
                                    [ 'json',
                                      [ 'binding',
                                        'href',
                                        [ 'getp',
                                          [ 'string', 'url' ],
                                          [ 'getp', [ 'string', 'ctx' ], [ 'this' ] ] ] ] ] ] ] ] ] ],
                          [ [ 'mode', '"reset"' ],
                            [ 'sub',
                              [ [ [ 'std', 'attrs' ],
                                  [ 'body',
                                    [ 'literal',
                                      [ 'json', [ 'binding', 'href', [ 'get', 'undefined' ] ] ] ] ] ] ] ] ] ] ] ] ] ] ] ] ] ] ]
    );
  });

});

describe('BEMHTML/Compile should ', function() {
  run(tests);
});

describe('BEMHTML/Compile should handle assorted tests', function () {

  it('apply with all sorts of args', function () {
    runTest(
      function () {/*
             block b1, content: applyNext({bla: 'bla', opa: 'opa'}, 'default', this._b = 42)
             */},
      {block: 'b1'});
  });

  it('local', function () {
    runTest(
      function () {/*
             block b1, content: local(
             this.ctx.cache = null,
             this._cachePos = this._buf.length,
             this._bla = 'bla') {this._buf.length = 42;}
             */},
      {block: 'b1'});
  });

});
