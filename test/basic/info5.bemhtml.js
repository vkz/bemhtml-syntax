/*
 *
  long winded comment here with code inside

  block('logo')(
  tag()('img'),
  attrs()({alt: 'logo', href: 'http://...'})
  )
 *
*/

block('b-bla')(
  tag()('span'),
  mod('0-mode', 'v2').tag()('a'),
  //  mod 0-mode v2, tag:'a'
  mix()([{ elemMods: { m2: 'v2' } }]),
  js()(true)
)
