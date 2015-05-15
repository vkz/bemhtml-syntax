var syntax = require(".."),
    common = require("./common"),
    test = common.testCompile,
    testDir = common.testDir;

// TODO more granular tests that target specific grammar rules

describe('BEMHTMLToJS', function() {

  describe('Compile basic templates', function () {
    testDir('basic');
  });

  describe('Compile featured templates', function () {

    it('applyNext setting mode', function () {
      test(
        function () {/*
               block b1, content: applyNext({bla: 'bla', opa: 'opa'}, 'default', this._b = 42)
               */},
        {block: 'b1'});
    });

    it('force return applyNext', function () {
      test(
        function () {/*
               block b1, default: {
                 applyNext()
               }
               */},
        {block: 'b1'}),
      undefined,
      function () {/*
             block('b1').def()(function() {
             return applyNext()
             })
             */}
    });

    it('local with args', function () {
      test(
        function () {/*
             block b1, content: local(
               this.ctx.cache = null,
               this._cachePos = this._buf.length,
               this._bla = 'bla') {this._buf.length = 42;}
               */},
        {block: 'b1'});
    });

    it('string literals', function () {
      test(
        function () {/*
               block b-link, elem e1 {
                 attrs: {
                   'oframebust': "{'*.mtproxy1.yandex.net': '', '*.mtproxy2.yandex.net': '' }"
                 }
               }

               block b-link, elem e2 {
                 attrs: {
                   'oframebust': "{\"*.mtproxy1.yandex.net\": \"\", \"*.mtproxy2.yandex.net\": \"\" }"
                 }
               }

               block b-link, elem e3 {
                 attrs: {
                   'oframebust': '{"*.mtproxy1.yandex.net": "", "*.mtproxy2.yandex.net": "" }'
                 }
               }

               block b-link, elem e4 {
                 attrs: {
                   'oframebust': '{\'*.mtproxy1.yandex.net\': \'\', \'*.mtproxy2.yandex.net\': \'\' }'
                 }
               }
                                   */},
        [
          {block: 'b-link', elem: 'e1'},
          {block: 'b-link', elem: 'e2'},
          {block: 'b-link', elem: 'e3'},
          {block: 'b-link', elem: 'e4'}
        ],
        undefined,
      function () {/*
               block('b-link').elem('e1').attrs()({
                   oframebust: '{\'*.mtproxy1.yandex.net\': \'\', \'*.mtproxy2.yandex.net\': \'\' }'
               });

               block('b-link').elem('e2').attrs()({
                   oframebust: '{\"*.mtproxy1.yandex.net\": \"\", \"*.mtproxy2.yandex.net\": \"\" }'
               });

               block('b-link').elem('e3').attrs()({
                   oframebust: '{\"*.mtproxy1.yandex.net\": \"\", \"*.mtproxy2.yandex.net\": \"\" }'
               });

               block('b-link').elem('e4').attrs()({
                   oframebust: '{\'*.mtproxy1.yandex.net\': \'\', \'*.mtproxy2.yandex.net\': \'\' }'
               })
                                      */}
            );
    });

    it('should collapse single-stmt nesting', function () {
        test(function () {/*
      block head-stripe {
        elem x { tag: 'span' }
        elem age { tag: 'span' }
        elem agreement-button { tag: 'span' }
        elem close-text { tag: 'span' }
        elem text2 { tag: 'span' }
        elem close { tag: 'span' }
      }
      */},
      {block: "head-stripe", elem: "close"},
      undefined,
      function () {/*
        block("head-stripe")(
          elem("x").tag()("span"),
          elem("age").tag()("span"),
          elem("agreement-button").tag()("span"),
          elem("close-text").tag()("span"),
          elem("text2").tag()("span"),
          elem("close").tag()("span"))
             */}
            );
      });

    // END describe
  });
});
