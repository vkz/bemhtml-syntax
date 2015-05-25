[BEMHTML] source code converter:
- old syntax to new JS-syntax
- old syntax to [BH] (exposes [bemhtml-source-convert] functionality)
###### Disclaimer ######
_Given the impedence mismatch between Bemhtml and Bh it does not seem possible to convert every template or guarantee that the applicative semantics of the source is preserved in the result. Bemhtml is much too expressive and lenient to deliver on such promise. The ability to apply templates in a modified context powered by [xjst] methods **apply**, **applyNext**, **applyCtx** employing the result is one feature prominantly missing in Bh. Its **applyBase** method carries a very particular meaning that doesn't map clearly on Bemhtml machinery and as of this writing appears to be broken anyway._

####Install
`npm -g install bemhtml-syntax`

####Use

```shell
bemhtml-syntax [OPTIONS] [ARGS]

# convert to new JS-syntax (bemhtml is the default and -f can be dropped)
bemhtml-syntax -f bemhtml [OPTIONS] [ARGS]

# convert to BH
bemhtml-syntax -f bh [OPTIONS] [ARGS]
```

`-S` flag aka `--strictOff` is the only option specific to BH converter and as
the name suggests turns the default strict compiler mode off. Generally we don't
recommend it, but this may help you convert many more templates to BH without
warnings so it's there for when you have a fairly big BEMHTML template you want
to convert to BH and you'd rather have some skeleton you can flesh out rather
than starting completely from scratch. The result is not guaranteed to carry
proper BEMHTML semantics over to BH and assumes that you'll fix it by hand.

Other options mostly control the code-style of generated code. E.g. you may
prefer `-q double` quotes for strings and enforcing `-Q` quotes around object
keys, etc. Most options used by [js-beautify][] should just work.

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
// bemhtml-syntax -f bemhtml -q "double" -Q -i test/basic/info6.bemhtml
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

// BH converter (see notes in [bemhtml-source-convert] repo)
var bhStxConstructor = syntax.getBhConstructor(),
    stx = new bhStxConstructor(source, options);
```

[js-beautify]: https://github.com/beautify-web/js-beautify
[Bemhtml]:    http://bem.info/tags/bem-core-v2.3.0/#
[Bemhtml/Ru]: http://ru.bem.info/technology/bemhtml/2.3.0/rationale/
[Bh]:         https://github.com/bem/bh
[xjst]:       https://github.com/veged/xjst
[bemhtml-source-convert]: https://github.com/vkz/bemhtml-source-convert
