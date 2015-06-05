var kr = exports,
    esprima = require("esprima"),
    ometajs = null,
    KParser = null,
    KTransformer = null,
    KSerializer = null;

function lazyLoad() {
  ometajs = require("ometajs");
  KParser = require("./ometa/bemhtml-krasota").Parser;
  // KTransformer = require("./ometa/bemhtml-krasota").Transformer;
  // KSerializer = require("./ometa/bemhtml-krasota").Serializer;
}

// Parse old bemhtml source
kr.parse = function parse(source) {
  lazyLoad();
  return KParser.match(source, 'topLevel');
};
