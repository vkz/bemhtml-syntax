exports.repQ = function repQ(s, q) {
  // NOTE this hack is stolen from Indutny's bsjs.ometajs Parser grammar (see
  // its 'str' rule for a thorough string parsing)
  return (q === 'double')?
    JSON.stringify(s):
    JSON.stringify(s).replace(/["']/g, swap);
}

function swap(quote) {
  return quote === '"' ? '\'' : '"';
}
