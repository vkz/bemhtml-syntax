block('b').def()(function () {
  return applyCtx({
    block: 'wrapper',
    content: this.ctx
  });
})
