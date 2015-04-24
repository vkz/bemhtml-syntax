exports.repQ = function repQ(s) {
  return JSON.stringify(s).replace(/^"|"$/g, "\'");
}
