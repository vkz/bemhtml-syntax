var js_beatufier_defaults = {
  "indent_size": 4,
  "indent_char": JSON.stringify(" "),
  "eol": JSON.stringify("\n"),
  "indent_level": 0,
  "indent_with_tabs": false,
  "dont_preserve_newlines": false,
  "max_preserve_newlines": 10,
  "jslint_happy": false,
  "space_after_anon_function": false,
  "brace_style": JSON.stringify("collapse"),
  "keep_array_indentation": false,
  "keep_function_indentation": false,
  "no_space_before_conditional": false,
  "break_chained_methods": false,
  "unescape_strings": false,
  "wrap_line_length": 0,
  "end_with_newline": false
};

var js_beautifier_opts = {
  s: "indent_size",
  c: "indent_char",
  e: "eol",
  l: "indent_level",
  t: "indent_with_tabs",
  p: "dont_preserve_newlines",
  m: "max_preserve_newlines",
  j: "jslint_happy",
  a: "space_after_anon_function",
  b: "brace_style",
  k: "keep_array_indentation",
  // no such cli flag in js-beautifier
  K: "keep_function_indentation",
  // no such cli flag in js-beautifier
  A: "no_space_before_conditional",
  B: "break_chained_methods",
  x: "unescape_strings",
  w: "wrap_line_length",
  n: "end_with_newline"
};

var cmd = module.exports = require('coa').Cmd();

function addBeautfierOpts(cmd) {

  Object.keys(js_beautifier_opts).forEach(function (o) {
    var NAME = js_beautifier_opts[o],
        FLAG = (typeof js_beatufier_defaults[NAME]) === 'boolean',
        LONG = NAME.replace(/_/g,'-'),
        DEF = js_beatufier_defaults[NAME],
        TITLE = '(default: ' + DEF + ')';
    var result = cmd.opt().name(NAME).title(TITLE)
          .short(o).long(LONG);

    if (FLAG)
      return result.flag().end();

    return result.val(function (v) {
      return ((typeof DEF) === 'number')?
        Number.parseInt(v):
        v;
    }).end();
  }, cmd);

  return cmd;
}

cmd
  .name('bemhtml')
  .helpful()
  .opt()
    .name('output').title('Output to file (default: stdout)')
    .short('o').long('output')
    .output()
    .end()
  .opt()
    .name('input').title('File to convert (default: stdin)')
    .short('i').long('input')
    .def(process.stdin)
    .val(function (v) {
      if (typeof v === "string") {
        var fs = require("fs");
        var s = fs.createReadStream(v, { encoding: 'utf8' });
        s.pause();
        return {stream: s, path: fs.realpathSync(v)};
      } else {
        return {stream: v, path: "stdin"}
      }
    })
    .end()
  .opt()
    .name('quotes').title('Prefer "single" or "double" quotes (default: "single")')
    .short('q').long('quotes')
    .val(function (v) {
      if (v === 'single' || v === 'double')
        return v;
      return this.reject('quotes must be "single" or "double"');
    })
    .end()
  .opt()
    .name('quote_keys').title('Quote object keys (default: false)')
    .short('Q').long('quote-keys')
    .flag()
    .end()
  .opt()
    .name('quote_reserved').title('Quote object keys that are reserved words (default: false)')
    .short('Qr').long('quote-reserved')
    .flag()
    .end()
  .opt()
    .name('replace_this_').title('Replace this._ with this in templates (default: false)')
    .short('Rt').long('replace-this')
    .flag()
    .end()
  .opt()
    .name('elemMatch').title('Wrap predicates with "this.elem" in "elemMatch" (default: false)')
    .short('eM').long('elem-match')
    .flag()
    .end()
  .opt()
    .name('wrapPattern').title('Use "wrap()" instead of "def()+applyCtx()+this.ctx()" pattern  (default: false)')
    .short('wP').long('wrap-pattern')
    .flag()
    .end()
  .opt()
    .name('assertHasBlock').title('Assert that every template has sub-predicate matching "block"  (default: false)')
    .short('aB').long('assert-has-block')
    .flag()
    .end()
  .opt()
    .name('assertNoThisElem').title('Assert "this.elem" is not used in predicates (default: false)')
    .short('aE').long('assert-no-this-elem')
    .flag()
    .end()
  .opt()
    .name('assertNoBuf').title('Assert "this._buf" is not used in templates (default: false)')
    .short('aF').long('assert-no-buf')
    .flag()
    .end()
  .opt()
    .name('returnFromDef').title('Always return in "default" mode, insert "return \'\'" when missing. (default: false)')
    .short('rD').long('return-from-def')
    .flag()
    .end()

addBeautfierOpts(cmd)
  .opt()
    .name('format').title('output "bemhtml" or "bh" (default: "bemhtml")')
    .short('f').long('format')
    .val(function (v) {
      if (v === 'bemhtml' || v === 'bh')
        return v;
      return this.reject('output format must be "bemhtml" or "bh"');
    })
    .req()
    .def('bemhtml')
    .end()
  .opt()
    .name('bhSet').title('Set bh-template options (default: { \"jsAttrName\": \"onclick\" , \"jsAttrScheme\": \"js\" })')
    .short('bhS').long('bhSet')
    .val(function(v) {return JSON.parse(v);})
    .end()
  .opt()
    .name('strictOff')
    .title('Ignore bh-incompatibility warnings, perform best-effort conversion')
    .short('S').long('strictOff')
    .flag()
    .end()
  .act(function(options) {
    return require('../lib/syntax')
      .run(options);
  });
