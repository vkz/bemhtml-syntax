var syntax = require(".."),
    assert = require("assert"),
    bemxjst = require("bem-xjst"),
    ibem = require('fs')
      .readFileSync(
        __dirname + '/../bower_components/bem-core/common.blocks/i-bem/i-bem.bemhtml',
        'utf8'),
    compat = require("bemhtml-compat"),
    esprima = require("esprima"),
    es = require("escodegen"),
    esgen = es.generate,
    path = require("path"),
    fs = require("fs"),
    beautify = require("js-beautify").js_beautify,
    krasota = require("krasota"),
    KParser = krasota.KrasotaJSParser;

var pp = require("zeHelpers").prettyPrint;

var common = exports;

function getSource(fn) {
  if (typeof fn === 'string') return fn;
  return fn.toString().replace(/^function\s*\(\)\s*{\/\*|\*\/}$/g, '');
};
common.getSource = getSource;

function testParse(source, result) {
    var code = getSource(source),
        ast = syntax.parse(code);
  assert.deepEqual(ast, result );
}
common.testParse = testParse;

function empty(a) { return a.length === 0; }
function isAst(a) { return Array.isArray(a); }
function isPrim(a) { return !isAst(a); }
function dropTag(a, tag) {
  return a.filter(function (el) {
    return !isAst(el) || (el[0] !== tag);
  });
}

function astEqual(a, b, skipTag) {
  if (skipTag) {
    a = dropTag(a, skipTag);
    b = dropTag(b, skipTag);
  }

  if (empty(a)) {
    return empty(b);
  }

  if (a.length !== b.length) return false;

  return a.reduce(function (res, aNode, i) {
    var bNode = b[i];

    // propagate false
    if (!res) return false;

    if (isAst(aNode)) {
      return isAst(bNode) && astEqual(aNode, bNode, skipTag);
    } else {
      return isPrim(bNode) && (aNode === bNode);
    }
  }, true);
}
common.astEqual = astEqual;

function testTransform(source, result, options) {
    var code = getSource(source),
        ast = syntax.parse(code, options),
        extAst = syntax.translate(ast, options);
    assert.deepEqual(extAst, result );
}
common.testTransform = testTransform;

function testKTransform(source, result, options) {
  var sAst = KParser.match(syntax.kcompile(source, options), 'topLevel'),
      rAst = KParser.match(result, 'topLevel');
  assert.ok(common.astEqual(sAst, rAst, 'spacesAndComments'));
}
common.testKTransform = testKTransform;

function testKParse(source, result, skipTag) {
  var ast = syntax.kparse(source);
  // pp(ast, {prompt: "ast"});
  // assert.deepEqual(ast, result );
  assert.ok(astEqual(ast, result, skipTag));
}
common.testKParse = testKParse;

function toHtml(source, input) {
  return bemxjst.compile(ibem + source, {}).apply.call(input);
}
common.toHtml;

function testCompile(source, json, html, target) {
  var code = getSource(source),
      compiled = syntax.compile(code),
      result = html || (json && toHtml(compat.transpile(code), json));

  // Test against a hand-written template when supplied
  if (target) {
    target = getSource(target);
    // generated code
    assert.equal(
      esgen(esprima.parse(compiled)),
      esgen(esprima.parse(target)));

    // HTML via target
    json && assert.equal(
      toHtml(compiled, json),
      toHtml(target, json));
  };

  // HTML provided or via compat
  result && assert.equal(
    toHtml(compiled, json),
    result);
}
common.testCompile = testCompile;

function testKCompile(source, json, html, target) {
  var code = getSource(source),
      compiled = syntax.kcompile(code),
      result = html || (json && toHtml(compat.transpile(code), json));

  var poptions = {range: true, tokens: true, comment: true};

  // Test against a hand-written template when supplied
  if (target) {
    target = getSource(target);
    // generated code
    var cast = esprima.parse(compiled, poptions);
    var tast = esprima.parse(target, poptions);
    cast = es.attachComments(cast, cast.comments, cast.tokens);
    tast = es.attachComments(tast, tast.comments, tast.tokens);
    // check esprima+escodegen equality
    assert.equal(
      es.generate(cast, {comment: true}),
      es.generate(tast, {comment: true}));
    // check js-beautify equality with newlines preserved
    assert.equal(
      beautify(compiled, {"preserve_newlines": true}),
      beautify(target, {"preserve_newlines": true}));
    // HTML via target
    json && assert.equal(
      toHtml(compiled, json),
      toHtml(target, json));
  };

  // HTML provided or via compat
  result && assert.equal(
    toHtml(compiled, json),
    result);
}
common.testKCompile = testKCompile;

function maybeRead(f) {
  var utf8 = { encoding:'utf8' };
  try {
    return fs.readFileSync(f, utf8);
  } catch (e) {
    return undefined;
  }
}
common.maybeRead = maybeRead;

function testDir(dirname, test) {
  // Parameterise with test-arg:
  // test === testCompile to check BEMHTML grammars
  // test === testKCompile to check Krasota grammars
  test = (typeof test === 'function' && test) || testCompile;
  var dir = path.join(path.dirname(module.filename), dirname),
      tests = fs.readdirSync(dir).filter(function (f) {
        return /\.bemhtml$/i.test(f);
      }).map(function (f) {
        return path.basename(f, '.bemhtml');
      }).forEach(function (name) {
        var base = dir + '/' + name,
            source = maybeRead(base + '.bemhtml'),
            target = maybeRead(base + '.bemhtml.js'),
            json = (new Function('return ' + maybeRead(base + '.json')))(),
            html = maybeRead(base + '.html'),
            msg = maybeRead(base + '.msg') || name;
        it(msg, function () {
          test(source, json, html, target);
        });
      });
}
common.testDir = testDir;
