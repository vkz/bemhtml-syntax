block('b1')(
  elemMatch(function () { return this.elem === 'separator'; })([]),
  elemMatch(function () { return this.elem === 'bla'; })([])
)

elemMatch(function () { return this.elem === 'separator'; }). block('b2')( function () {return 'bla'})
