block('b-inner').def()(function() {
    return (applyCtx({
        block: 'b-wrapper',
        content: this.ctx.content
    }), 42);
})
