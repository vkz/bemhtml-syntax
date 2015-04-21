var syntax = exports;
var esprima = require('esprima');
var ometajs = null;
var BEMHTMLParser = null;
var BEMHTMLIdentity = null;
var BEMHTMLToJS = null;

var pp = require("zeHelpers").prettyPrint;

function lazyLoad() {
  ometajs = require('ometajs');
  BEMHTMLParser = require('./ometa/bemhtml').BEMHTMLParser;
  BEMHTMLIdentity = require('./ometa/bemhtml').BEMHTMLIdentity;
  BEMHTMLToJS = require('./ometa/bemhtml').BEMHTMLToJS;
}

// Parse old bemhtml source
syntax.parse = function parse(source) {
  lazyLoad();
  return BEMHTMLParser.matchAll(source, 'topLevel');
};

// Translate old ast to new ast
syntax.translate = function translate(ast) {
  lazyLoad();
  ast = BEMHTMLIdentity.match(ast, 'topLevel');
  return BEMHTMLIdentity.match(ast, 'topLevel');
};

// Transpile old source to new source
syntax.compile = function compile(source) {
  // If code is ECMAScript compatible - there is no need to use ometajs
  try {
    if (esprima.parse(source)) return source;
  } catch (e) {
  }

  lazyLoad();
  var ast = syntax.translate(syntax.parse(source));
  return BEMHTMLToJS.match(ast, 'topLevel');
};
