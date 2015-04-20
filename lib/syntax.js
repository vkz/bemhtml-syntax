var syntax = exports;
var esprima = require('esprima');
var ometajs = null;
var BEMHTMLParser = null;
var BEMHTMLToXJST = null;
var XJSTToJS = null;

var pp = require("zeHelpers").prettyPrint;

function lazyLoad() {
  ometajs = require('ometajs');
  BEMHTMLParser = require('./ometa/bemhtml').BEMHTMLParser;
  BEMHTMLToXJST = require('./ometa/bemhtml').BEMHTMLToXJST;
  XJSTToJS = require('./ometa/bemhtml').XJSTToJS;
}

// Parse old bemhtml source
syntax.parse = function parse(source) {
  lazyLoad();
  return BEMHTMLParser.matchAll(source, 'topLevel');
};

// Translate old ast to new ast
syntax.translate = function translate(ast) {
  lazyLoad();
  ast = BEMHTMLToXJST.match(ast, 'topLevel');
  return BEMHTMLToXJST.match(ast, 'topLevel');
};

// Transpile old source to new source
syntax.transpile = function transpile(source) {
  // If code is ECMAScript compatible - there is no need to use ometajs
  try {
    if (esprima.parse(source)) return source;
  } catch (e) {
  }

  lazyLoad();
  var ast = syntax.parse(source);
  ast = BEMHTMLToXJST.match(ast, 'topLevel');
  return XJSTToJS.match(ast, 'topLevel');
};
