exports.repQ = function repQ(s, q) {
  return (q === 'double')?
    JSON.stringify(s):
    JSON.stringify(s).replace(/[']/g, "\\'").replace(/^"|"$/g, "\'")
}
