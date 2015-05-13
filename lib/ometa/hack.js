exports.repQ = function repQ(s, q) {
  // TODO this hack is broken
  // a = { 'oframebust': "{'*.mtproxy1.yandex.net': '', '*.mtproxy2.yandex.net': '' }" };
  return (q === 'double')?
    JSON.stringify(s):
    JSON.stringify(s).replace(/^"|"$/g, "\'");
}
