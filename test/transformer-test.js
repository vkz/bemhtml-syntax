var syntax = require(".."),
    assert = require("assert"),
    test = require("./common").testTransform;

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
                           [ 'getp',
                             [ 'string', 'url' ],
                             [ 'getp', [ 'string', 'ctx' ], [ 'this' ] ] ] ],
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

});
