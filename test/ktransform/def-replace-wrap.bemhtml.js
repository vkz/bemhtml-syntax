block('b1')(
  elem('e1').wrap()( function () {
    return {
      block: 'wrapper',
      content: this.ctx
    };
  }),

  elem('e3').replace()(function () { return {block: 'wrapper', content: 'ctx' } }),

  elem('e4').def()(function () { return apply({test: 42, elemMods: 'bla'});}))
