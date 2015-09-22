block('b-wrapper')(
  tag()('wrap'),
  content()(function () { return this.ctx.content;})
)

block('b-inner').replace()(function () {
  return applyCtx({ block: 'b-wrapper', content: this.ctx.content });
})
