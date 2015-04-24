var syntax = exports,
    esprima = require("esprima"),
    ometajs = null,
    BEMHTMLParser = null,
    BEMHTMLIdentity = null,
    BEMHTMLToJS = null,
    beautify = require("js-beautify").js_beautify,
    pp = require("zeHelpers").prettyPrint;

function lazyLoad() {
  ometajs = require("ometajs");
  BEMHTMLParser = require("./ometa/bemhtml").BEMHTMLParser;
  BEMHTMLIdentity = require("./ometa/bemhtml").BEMHTMLIdentity;
  BEMHTMLToJS = require("./ometa/bemhtml").BEMHTMLToJS;
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

// Serialize new simplified AST into JavaScript code
syntax.generate = function generate(newAst) {
  lazyLoad();
  return BEMHTMLToJS.match(newAst, 'topLevel');
};

// Compile old source to new source
syntax.compile = function compile(source, ugly) {
  // If code is ECMAScript compatible - there is no need to use ometajs
  try {
    if (esprima.parse(source)) return source;
  } catch (e) {
  }

  lazyLoad();
  var ast = syntax.translate(syntax.parse(source));
  return syntax.generate(ast, ugly);
};

syntax.run = function run(options) {
    var input = [],
        output = options.output,
        stream = options.input.stream,
        path = options.input.path;

  stream.on('data', function(chunk) { input.push(chunk); })
    .on('end', function() { finish(input.join('')); })
    .resume();

  function finish(source) {
    var result = syntax.compile(source, true),
        // TODO accept beatifier options from cli
        options = { indent_size: 2 };
    output.write(beautify(result, options));
    output.end('\n');
  }
}
