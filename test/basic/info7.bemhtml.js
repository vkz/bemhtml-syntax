block('b-link').elem('e1')(
  tag()('span'),
  match(this.ctx.url)(
    tag()('a'),
    attrs()(function () { return { href: this.ctx.url }; }),
    mode('reset').attrs()({ href: undefined })
  )
)
