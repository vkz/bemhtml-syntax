block('b1').content()(function () { this.temp._bla = 0; this._o = 1; });

block('b1').content()(function () {return applyNext({'temp._bla': 2, '_o': 3});});
