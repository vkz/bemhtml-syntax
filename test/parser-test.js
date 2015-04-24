var syntax = require(".."),
    assert = require("assert"),
    test = require("./common").testParse;

describe('BEMHTMLParser', function() {

  it('should parse multiple templates', function() {
    test(function () {/*
       block b-wrapper {
         tag: 'wrap'
         content: this.ctx.content
       }

       block b-inner, default: applyCtx({ block: 'b-wrapper', content: this.ctx.content })
                */},
         [ [ [ 'block', [ 'string', 'b-wrapper' ] ],
             [ [ [ 'tag' ],
                 [ 'body', [ 'literal', [ 'string', 'wrap' ] ] ] ],
               [ [ 'content' ],
                 [ 'body',
                   [ 'begin',
                     [ 'return',
                       [ 'getp',
                         [ 'string', 'content' ],
                         [ 'getp', [ 'string', 'ctx' ], [ 'this' ] ] ] ] ] ] ] ] ],
           [ [ 'block', [ 'string', 'b-inner' ] ],
             [ [ 'default' ],
               [ 'body',
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
                             [ 'getp', [ 'string', 'ctx' ], [ 'this' ] ] ] ] ] ] ] ] ] ] ] ]);
  });

  it('should parse deeply nested template', function() {
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
         [ [ [ 'block', [ 'string', 'b-link' ] ],
             [ [ 'elem', [ 'string', 'e1' ] ],
               [ [ [ 'tag' ],
                   [ 'body', [ 'literal', [ 'string', 'span' ] ] ] ],
                 [ [ 'xjst',
                     [ 'getp',
                       [ 'string', 'url' ],
                       [ 'getp', [ 'string', 'ctx' ], [ 'this' ] ] ] ],
                   [ [ [ 'tag' ],
                       [ 'body', [ 'literal', [ 'string', 'a' ] ] ] ],
                     [ [ 'attrs' ],
                       [ 'body',
                         [ 'begin',
                           [ 'return',
                             [ 'json',
                               [ 'binding',
                                 'href',
                                 [ 'getp',
                                   [ 'string', 'url' ],
                                   [ 'getp', [ 'string', 'ctx' ], [ 'this' ] ] ] ] ] ] ] ] ],
                     [ [ 'reset' ],
                       [ [ [ 'attrs' ],
                           [ 'body',
                             [ 'literal',
                               [ 'json', [ 'binding', 'href', [ 'get', 'undefined' ] ] ] ] ] ] ] ] ] ] ] ] ] ]);
  });

});
