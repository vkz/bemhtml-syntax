block('b').elem('link').wrap()(function() {
  return this.extend(this.ctx, {
    block: 'link',
    elem: undefined,
    mix: {
      block: this.block,
      elem: this.elem
    }
  });
})
