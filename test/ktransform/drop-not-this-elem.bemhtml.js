function bla() {
  return;
}

// 0
block('input').content()(function () { return; })


// 0'
block('b').content()( function () { return; })

block('b').attrs()(function () { return; })



// 1
block('input').content()(function () { return; })


// 2
block('input').content()(function () { return; })


// 3
block('input').content()(function () { return; })


// 3'
block('input')(
  content()( function () { return; }),
  attrs()( function () { return; }))



// 4
block('input').content()(function () { return; })


// 4' -sub-
block('input')(
  content()(function () { return; }),
  elem('bla').content()(function () { return; }))



// 4' -sub-
block('input')(
  elem('bla').content()(function () { return; }),
  content()(function () { return; }))



// 4'' -sub-
// NOTE case where the sub templates need to be spliced in at the level above
block('input')(
  content()(function () { return; }),
  attrs()(function () { return; }),
  elem('bla').content()(function () { return; }))




// 5
block('input').content()(function () { return; })


// 5'
block('input').content()(function () { return; })


// 5'' -sub-
// TODO weird case that doesn't seem to pop up in real life yet would require
// much work. The only case where I prefer to just leave !this.elem as is and
// not drop it. For now.
block('input').match(function () { return this.isTrue; })(
  content()(function () { return; }),
  elemMatch(function () { return !this.elem; })(function () { return; }))
