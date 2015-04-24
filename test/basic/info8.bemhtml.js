block('b1').tag()('span')

block('b1')(
  tag()(function() { return applyNext(); }),
  content()('b1 content')
);
