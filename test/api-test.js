var syntax = require('..');
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var pp = require("zeHelpers").prettyPrint;
var bemxjst = require("bem-xjst");
var compat = require('bemhtml-compat');


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

templates.forEach(function (t) {
  var files = tests[t],
      oldCode = ibem + compat.transpile(files['old']),
      newCode = ibem + files['new'],
      input = files['json'];

  var oldResult  = bemxjst.compile(oldCode, {}).apply.call(input),
      newResult  = bemxjst.compile(newCode, {}).apply.call(input);

  pp(oldResult, {prompt: "old syntax"});
  pp(newResult, {prompt: "new syntax"});
});


describe('BEMHTML/syntax', function() {
  function getSource(fn) {
    return fn.toString().replace(/^function\s*\(\)\s*{\/\*|\*\/}$/g, '');
  }

  it('should parse old source', function() {
    assert(false);
  });

  it('should transpile old source', function() {
    assert(false);
  });

  it('should transpile old & new sources', function() {
    assert(false);
  });
});
