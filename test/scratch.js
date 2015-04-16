var fs = require('fs');
var path = require('path');
var pp = require("zeHelpers").prettyPrint;
var bemxjst = require("bem-xjst");
var compat = require('bemhtml-compat');
var ometajs = require("ometajs");

var TestGrammar = require("./scratch.ometajs").Test;

TestGrammar.matchAll('hello {', 'rule');


// ometajs exported grammars
// -------------------------
// { grammars: 
//    { AbstractGrammar: 
//       { [Function: AbstractGrammar]
//         super_: [Function: AbstractParser],
//         match: [Function: match],
//         matchAll: [Function: matchAll] },
//      BSJSParser: [Getter],
//      BSJSIdentity: [Getter],
//      BSJSTranslator: [Getter] },
//   compile: [Function: compile],
//   cli: { run: [Function: run] } }

// xjst exported grammars
// ----------------------
// var xjst = require('xjst'),
//     XJSTParser = xjst.XJSTParser,
//     XJSTIdentity = xjst.XJSTIdentity,
//     XJSTCompiler = xjst.XJSTCompiler,
//     Jail = require('./jail').Jail;
