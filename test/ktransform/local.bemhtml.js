block('b1').content()(function() {
  return local('reset', {
    'ctx.cache': null,
    _cachePos: this._buf.length,
    _bla: 'bla'
  })(function() {this._buf.length = 42;});
})


block('b2').content()(function() {
  local('reset', {
    'ctx.cache': null,
    _cachePos: this._buf.length,
    _bla: 'bla'
  })(function() {this._buf.length = 42;});
})
