####Install
`git clone https://github.com/vkz/bemhtml-syntax.git`
`cd bemhtml-syntax`
`npm install`

`npm test` will run tests.

**TODO** final indentation should obviously be in bem-style not generic produced by Esprima+Escodegen combo.

####Use

```shell

kozin@:~/Documents/bemhtml-syntax$ bin/bemhtml-syntax -h

Usage:
  bemhtml-syntax [OPTIONS] [ARGS]


Options:
  -h, --help : Help
  -o OUTPUT, --output=OUTPUT : Output to file (default: stdout)
  -i INPUT, --input=INPUT : File to convert (default: stdin)

```

####API

```javascript
var syntax = require("bemhtml-syntax");

var source = 'block b1, tag: "a"';

// Parse BEMHTML code
var ast = syntax.parse(source);

// Transform AST for serialisation
var newAst = syntax.translate(ast);

// Serialise to JavaScript
var jsCode1 = syntax.generate(newAst);

/* Returns:
 * block('b1').tag()('a');
 */

// Or do everything in one go
var jsCode2 = syntax.compile(source);
```
