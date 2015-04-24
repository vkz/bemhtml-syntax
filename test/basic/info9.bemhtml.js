block('b1').content()(function () { return [this.ctx._bla + ' = ', this._o];});

block('b1').content()(function () {return applyNext({'ctx._bla': 'bla', '_o': 3});});
