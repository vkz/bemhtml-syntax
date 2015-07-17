var syntax = require(".."),
    assert = require("assert"),
    common = require("./common"),
    test = common.testTransform,
    path = require("path");

describe('BEMHTMLIdentity', function() {

  it('should transform AST for multiple templates', function() {
    test(function () {/*
       block b-wrapper {
         tag: 'wrap'
         content: this.ctx.content
       }

       block b-inner, default: applyCtx({ block: 'b-wrapper', content: this.ctx.content })
                */},
         [ [ 'template',
             [ [ 'block', [ 'string', 'b-wrapper' ] ],
               [ 'sub',
                 [ [ [ 'std', 'tag' ],
                     [ 'body', [ 'literal', [ 'string', 'wrap' ] ] ] ],
                   [ [ 'std', 'content' ],
                     [ 'body',
                       [ 'func',
                         null,
                         [],
                         [ 'begin',
                           [ 'return',
                             [ 'getp',
                               [ 'string', 'content' ],
                               [ 'getp', [ 'string', 'ctx' ], [ 'this' ] ] ] ] ] ] ] ] ] ] ] ],
           [ 'template',
             [ [ 'block', [ 'string', 'b-inner' ] ],
               [ 'dot',
                 [ [ 'std', 'def' ],
                   [ 'body',
                     [ 'func',
                       null,
                       [],
                       [ 'begin',
                         [ 'return',
                           [ 'call',
                             [ 'get', 'applyCtx' ],
                             [ 'json',
                               [ 'binding', 'block', [ 'string', 'b-wrapper' ] ],
                               [ 'binding',
                                 'content',
                                 [ 'getp',
                                   [ 'string', 'content' ],
                                   [ 'getp', [ 'string', 'ctx' ], [ 'this' ] ] ] ] ] ] ] ] ] ] ] ] ] ] ]);
  });

  it('should transform AST for a deeply nested template', function() {
    test(function () {/*
       block b-link, elem e1 {
         tag: 'span'
         this.ctx.url {
           tag: 'a'
           attrs: { href: this.ctx.url }
           reset {
             attrs: { href: undefined }
           }
         }
       }
                */},
         [ [ 'template',
             [ [ 'block', [ 'string', 'b-link' ] ],
               [ 'dot',
                 [ [ 'elem', [ 'string', 'e1' ] ],
                   [ 'sub',
                     [ [ [ 'std', 'tag' ],
                         [ 'body', [ 'literal', [ 'string', 'span' ] ] ] ],
                       [ [ 'match',
                           [ 'func',
                             null,
                             [],
                             [ 'begin',
                               [ 'stmt',
                                 [ 'return',
                                   [ 'getp',
                                     [ 'string', 'url' ],
                                     [ 'getp', [ 'string', 'ctx' ], [ 'this' ] ] ] ] ] ] ] ],
                         [ 'sub',
                           [ [ [ 'std', 'tag' ],
                               [ 'body', [ 'literal', [ 'string', 'a' ] ] ] ],
                             [ [ 'std', 'attrs' ],
                               [ 'body',
                                 [ 'func',
                                   null,
                                   [],
                                   [ 'begin',
                                     [ 'return',
                                       [ 'json',
                                         [ 'binding',
                                           'href',
                                           [ 'getp',
                                             [ 'string', 'url' ],
                                             [ 'getp', [ 'string', 'ctx' ], [ 'this' ] ] ] ] ] ] ] ] ] ],
                             [ [ 'mode', '"reset"' ],
                               [ 'dot',
                                 [ [ 'std', 'attrs' ],
                                   [ 'body',
                                     [ 'literal',
                                       [ 'json', [ 'binding', 'href', [ 'get', 'undefined' ] ] ] ] ] ] ] ] ] ] ] ] ] ] ] ] ] ]);
  });

  var drop = 'drop-notelem',
      dropFile = path
        .join(path.dirname(module.filename), 'featured/' + drop + '.bemhtml');
  it('should drop !this.elem predicates', function () {
    test(common.maybeRead(dropFile),
         require('./featured/' + drop +'.result').ast);});

  var elemMatch = 'elemMatch',
      elemMatchFile = path
        .join(path.dirname(module.filename), 'featured/' + elemMatch + '.bemhtml');
  it('should elemMatch predicates with this.elem', function () {
    test(common.maybeRead(elemMatchFile),
         require('./featured/' + elemMatch +'.result').ast);});

  var replaceThisUnder = 'replace-this-underscore',
      replaceThisUnderFile = path
        .join(path.dirname(module.filename), 'featured/' + replaceThisUnder + '.bemhtml');
  it('should replace this._ with this', function () {
    test(common.maybeRead(replaceThisUnderFile),
         require('./featured/' + replaceThisUnder +'.result').ast,
         { replace_this_: true });});

});
