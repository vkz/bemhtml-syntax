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
syntax.generate = function generate(newAst, opts) {
  lazyLoad();
  return BEMHTMLToJS.match(newAst, 'topLevel', opts);
};

// Compile old source to new source
syntax.compile = function compile(source, opts) {
  // NOTE If code is ECMAScript compatible - there is no need to use ometajs
  // Because js is ignored no beautification is performed. If you want to
  // beautify stuff, pass non-empty options object.
  try {
    if (esprima.parse(source) && Object.keys(opts).length === 0) return source;
  } catch (e) {
  }

  lazyLoad();
  var ast = syntax.translate(syntax.parse(source));
  return syntax.generate(ast, opts);
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
    var opts = {
      quotes: options.quotes || 'single',
      quote_keys: options.quote_keys
    },
        result;

    if (options.format === 'bh') {
      try {
        var Stx = require('./convert').Stx;
        opts.strict = !options.strictOff;
        result = new Stx(source, opts)
          .bh
          .src;
      } catch (e) {
        process.stderr.write(e.message);
        process.stderr.end('\n');
        throw e;
      }
    }

    if (options.format === 'bemhtml') {
      result = syntax.compile(source, opts);
    }

    output.write(beautify(result, getBeatufierOptions(options)));
    output.end('\n');
  }
}
