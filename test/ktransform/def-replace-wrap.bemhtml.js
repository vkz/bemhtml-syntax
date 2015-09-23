block('b1')(
  elem('e1').wrap()( function () {
    return applyCtx({
      block: 'wrapper',
      content: this.ctx
    });
  }),

  elemMatch(function () { return this.elem === 'e2' && this._buf === this.bla; }).content()(function () { return applyCtx({block: 'wrapper', content: 'ctx' }) }),

  elem('e3').replace()(function () { return applyCtx({block: 'wrapper', content: 'ctx' }) }),

  elem('e4').def()(function () { return apply({test: 42, elemMods: 'bla'});}))
