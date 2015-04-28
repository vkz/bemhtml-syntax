
Convert BEMHTML in old-syntax into new JS-style syntax.
####Install
`npm -g install bemhtml-syntax`

####Use

```shell
bemhtml-syntax [OPTIONS] [ARGS]
```

For example, convert
```js
// cat test/basic/info6.bemhtml
// ----------------------------
block b-wrapper {
    tag: 'wrap'
    content: this.ctx.content
}

block b-inner, default: applyCtx({ block: 'b-wrapper', content: this.ctx.content })
```
into
```js
// bemhtml-syntax -q "double" -Q -i test/basic/info6.bemhtml
// ---------------------------------------------------------
block("b-wrapper")(
    tag()("wrap"),
    content()(function() {
        return this.ctx.content
    })
);

block("b-inner").def()(function() {
    return applyCtx({
        "block": "b-wrapper",
        "content": this.ctx.content
    })
})
```
Accepts a handful of options to control code-formatting. Of note:
```shell
  -q QUOTES, --quotes=QUOTES : Prefer "single" or "double" quotes (default: "single")
  -Q, --quote-keys : Quote object keys (default: false)
  -s INDENT_SIZE, --indent-size=INDENT_SIZE : (default: 4)
  -p, --dont-preserve-newlines : (default: false)
```
Most options used by [js-beautify][] should just work.
  
####API

```javascript
var syntax = require('bemhtml-syntax'),
    source = 'block b1, tag: "a"',
    options = { indent_size: 2 };

// Parse BEMHTML code
var ast = syntax.parse(source);

// Transform AST for serialisation
var newAst = syntax.translate(ast);

// Serialise to JavaScript
var jsCode1 = syntax.generate(newAst, options);

// Or do everything in one go
var jsCode2 = syntax.compile(source, options);
```

[js-beautify]: https://github.com/beautify-web/js-beautify
