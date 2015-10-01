block('slider')(function() {
  applyNext({
    a: 'first'
  });
  if (bla) {
    test();
    applyNext({});
  } else {
    applyNext('first', {});
    return 'bla';
  }
  return apply();
})

block('button').mod('round', 'yes').def()(function() {
  return applyNext({
    'ctx.mods[\'only-icon\']': 'bla'
  });
})
