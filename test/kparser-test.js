var syntax = require(".."),
    assert = require("assert"),
    test = require("./common").testKParse;

describe('BemhtmlKParser', function() {

  it('should parse multiple templates', function() {
    test(function () {/*
       block b-wrapper {
         tag: 'wrap'
         content: this.ctx.content
       }

       block b-inner, default: applyCtx({ block: 'b-wrapper', content: this.ctx.content })
                */},
         []);
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
         []);
  });

});
