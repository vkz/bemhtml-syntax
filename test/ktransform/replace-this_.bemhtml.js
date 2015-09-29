block('a').def()(function() {
    return applyCtx(this.extend(this.ctx, {
        elem: 'bla'
    }));
})

block('b').def()(function() {
    return apply(this.bla);
})

block('c').match(function () { return this.isSimple(this.ctx); })(function () { return this.bla; })
