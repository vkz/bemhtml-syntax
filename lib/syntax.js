var syntax = exports,
    esprima = require("esprima"),
    ometajs = null,
    BEMHTMLParser = null,
    BEMHTMLTransformer = null,
    BEMHTMLToJS = null,
    beautify = require("js-beautify").js_beautify,
    kr = require("./kr");

function lazyLoad() {
  ometajs = require("ometajs");
  BEMHTMLParser = require("./ometa/bemhtml").BEMHTMLParser;
  BEMHTMLTransformer = require("./ometa/bemhtml").BEMHTMLTransformer;
  BEMHTMLToJS = require("./ometa/bemhtml").BEMHTMLToJS;
}

// Parse old bemhtml source
syntax.parse = function parse(source, opts) {
  lazyLoad();
  return BEMHTMLParser.matchAll(source, 'topLevel', opts);
};

// Krasota methods
syntax.kparse = kr.parse;
syntax.ktranslate = kr.translate;
syntax.kgenerate = kr.generate;
syntax.kcompile = kr.compile;

// Translate old ast to new ast
syntax.translate = function translate(ast, opts) {
  lazyLoad();
  // ast = BEMHTMLTransformer.match(ast, 'topLevel');
  return BEMHTMLTransformer.match(ast, 'topLevel', opts);
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
  var ast = syntax.translate(syntax.parse(source, opts), opts);
  return syntax.generate(ast, opts);
};

syntax.getBhConstructor = function getBhConverter() {
  return require('./convert').Stx;
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
      quote_keys: options.quote_keys,
      quote_reserved: options.quote_reserved,
      replace_this_: options.replace_this_,
      elemMatch: options.elemMatch,
      wrapPattern: options.wrapPattern,
      assertHasBlock: options.assertHasBlock,
      assertNoThisElem: options.assertNoThisElem,
      assertNoBuf: options.assertNoBuf,
      returnFromDef: options.returnFromDef,
      applySetsMode: options.applySetsMode,
      applyCheckFields: options.applyCheckFields
    },
        result;

    if (options.format === 'bh') {
      try {
        var Stx = syntax.getBhConstructor();
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

    if (options.format === 'bemhtml' ||
        options.format === 'bemxjst1') {
      result = syntax.compile(source, opts);
    }

    if (options.format === 'krasota' ||
        options.format === 'bemxjst4') {
      result = syntax.kcompile(source, opts);
    }

    output.write(beautify(result, getBeatufierOptions(options)));
    output.end('\n');
  }
}
