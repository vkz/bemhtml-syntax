var syntax = exports,
    esprima = require("esprima"),
    ometajs = null,
    BEMHTMLParser = null,
    BEMHTMLTransformer = null,
    BEMHTMLToJS = null,
    beautify = require("js-beautify").js_beautify;

function lazyLoad() {
  ometajs = require("ometajs");
  BEMHTMLParser = require("./ometa/bemhtml").BEMHTMLParser;
  BEMHTMLTransformer = require("./ometa/bemhtml").BEMHTMLTransformer;
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
  ast = BEMHTMLTransformer.match(ast, 'topLevel');
  return BEMHTMLTransformer.match(ast, 'topLevel');
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

function getBeatufierOptions(options) {
  var opts = [
    "indent_size",
    "indent_char",
    "eol",
    "indent_level",
    "indent_with_tabs",
    "max_preserve_newlines",
    "jslint_happy",
    "space_after_anon_function",
    "brace_style",
    "keep_array_indentation",
    "keep_function_indentation",
    "break_chained_methods",
    "unescape_strings",
    "wrap_line_length",
    "end_with_newline"
  ],
      result = {};
  // Take care of inverted options first
  if(options.hasOwnProperty("dont_preserve_newlines"))
    result.preserve_newlines = false;

  if(options.hasOwnProperty("no_space_before_conditional"))
    result.space_before_conditional = false;

  opts.forEach(function (o) {
    if(options.hasOwnProperty(o))
      result[o] = options[o];
  });
  return result;
}

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
        boptions = getBeatufierOptions(options);
    output.write(beautify(result, boptions));
    output.end('\n');
  }
}
