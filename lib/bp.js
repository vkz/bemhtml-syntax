var Blueprint = exports,
    lo = require('lodash'),
    vm = require('vm'),
    util = require('util'),
    esprima = require('esprima'),
    uglify = require('uglify-js'),
    // escodegen = require('escodegen'),
    compat  = require('bemhtml-compat'),
    beautifyHtml = require('js-beautify').html,
    bemxjst = require('bem-xjst'),
    BH = require('bh').BH;

function prettyPrint(obj, opts) {
    opts || (opts = {});
    var prompt = String(opts.prompt || ''),
        wrappedObj = lo.isString(obj) && obj || util.inspect(obj, {depth: 300, colors: false}),
        lenmax = lo(wrappedObj.split('\n'))
            .map(function(s) { return s.length })
            .max()
            .value(),
        len = Math.min(lenmax, 75),
        prefix =  repeatStr(len, '<').magenta.bold + '\n',
        postfix = repeatStr(len, '>').cyan.bold + '\n',
        padding = Math.max(len - prompt.length - 1, 0),
        msg = '\n' + wrappedObj + '\n';
    prompt = prompt ? repeatStr(padding, ' ') + prompt.magenta : '';

    if(opts.stringify) return msg;
    console.log(prefix, prompt, msg, postfix, '\n');
}

function repeatStr(len, str) {
    return (new Array(len)).join(str);
}

function addPrettyPrinter(obj, def) {
    obj.pp = def?
        function(options) {
            return prettyPrint(this[def], options);
        } :
        function(what, options) {
            return prettyPrint(what, options);
        };
};
Blueprint.addPrettyPrinter = addPrettyPrinter;
Blueprint.pp = prettyPrint;

function Classes() {
    this._classes = {};
}

Classes.prototype = {
    addClass: function addClass(fullClass) {
        // subClass is "1.2" ==> "1" ==> "c1"
        fullClass = fullClass.split('.');
        var classes = this._classes,
            baseClass = fullClass[0],
            subClass = fullClass[1];
        (classes[baseClass] || (classes[baseClass] = {}))[subClass] = true;
        return this;
    },

    classifyPredic: function classifyPredic(predic) {
        predic.ctx && this.addClass('2.1');
        predic.bem && this.addClass('2.2');
        predic.custom && this.addClass('2.3');
        return this;
    },

    classifyBody: function classifyPredic(body) {
        body.ctx && this.addClass('3.2');
        (body.apply || body.js) && this.addClass('3.3');
        // if none of ctx, apply, js fields set to true, classify into 3.1
        body.ctx || body.apply || body.js || this.addClass('3.1');
        return this;
    },

    _classesDescs: {
        '1.1': 'flat predicates',
        '1.2': 'nested predicates',
        '2.1': 'predicates with references to this.ctx',
        '2.2': 'predicates with references to BEM context fields', // be good to show which ones
        '2.3': 'predicates with references to custom context fields', // again, which ones
        '3.1': 'body that returns static JSON',
        '3.2': 'body that returns JSON with references to this.ctx',
        '3.3': 'body that invokes arbitrary JavaScript' // again, give details to the user
    },

    describe: function describe(fullClass) {
        var that = this;
        if (lo.isNumber(fullClass) || lo.isString(fullClass)) return this._classesDescs[fullClass];

        return lo(this._classes).reduce(
            function (ac, subClasses, baseClass) {
                return ac + lo(subClasses).reduce(
                    function (ac, _, subClass) {
                        fullClass = baseClass + '.' + subClass;
                        return ac + ' * ' + that._classesDescs[fullClass] + '\n';
                    },
                    '');
            },
            '');
    }
};

Blueprint.Classes = Classes;

function Bh(src) {
    this.src = src;
};

Bh.prototype = {
    isValidJS: function isValidJS() {
        try {
          // var tree = esprima.parse(this.src, { range: true, tokens: true, comment: true });
          var tree = esprima.parse(this.src);
        } catch(e) {
            var srcMessage = this.src.split('\n')[e.lineNumber - 1];
            if(srcMessage.length > 80) {
                var left = Math.max(0, e.index - 40),
                    right = e.index + Math.min(40, srcMessage.length - e.index);
                srcMessage = srcMessage.slice(left, right);
                e.index -= left;
            }

            srcMessage += '\n' + lo.range(srcMessage.length).map(function(_, i) {
                return i === e.index ? '^' : i < e.index ? '-' : '';
            }).join('') + '\n';

             throw Error(
                'Failed to beautify generated bh-template because: '
                    + e.message + '\n\n'
                    + srcMessage + '\n');
        }
      return this;
    },

    match: function(json, options) {
        this.isValidJS();

        var bh = new BH()
                .enableInfiniteLoopDetection(true)
                .setOptions(options || {}),
            fbh,
            html;

        try {
            fbh = vm.runInNewContext('(function(module) { ' + this.src + '\n return module.exports })({})');
            fbh(bh); //populate bh with stuff from fbh-template
            html = bh.apply(json);
        } catch(e) {
            throw Error(
                'Failed to match generated bh-template against json because: '
                    + e.message + '\n');
        }
        return beautifyHtml(html);
    }
};
addPrettyPrinter(Bh.prototype, 'src');
Blueprint.Bh = Bh;

function Bemhtml(src) {
    this.src = lo.isFunction(src) ? src.toString().replace(/^function\s*\(\)\s*{\/\*|\*\/}$/g, '') : src;
};

Bemhtml.prototype = {
    match: function (json) {
        var srcjs = compat.transpile(this.src),
            compiled = bemxjst.compile(srcjs, {});
        return beautifyHtml(compiled.apply.call (json));
    }
};
addPrettyPrinter(Bemhtml.prototype, 'src');
Blueprint.Bemhtml = Bemhtml;

function Ast(ast) {
    this.ast = ast;
}
Ast.prototype.get = function() { return this.ast; };
addPrettyPrinter(Ast.prototype, 'ast');
Blueprint.Ast = Ast;

Blueprint.formatWarnings = function formatWarnings(err) {
    return lo.reduce(
        err.warnings,
        function(msg, warning) {return msg + ' * ' + warning + '\n';},
        '');
};

Blueprint.getClassification = function getClassification(stx) {
    return 'Template classification\n' + stx.class.describe();
};
