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
