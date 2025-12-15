function fixFilename(name) {
  if (/[ÐÑ]/.test(name)) {
    try {
      return Buffer.from(name, "latin1").toString("utf8");
    } catch (_) {}
  }
  return name;
}

function normalize(arr) {
  return Array.isArray(arr) ? arr.slice().sort((a, b) => a - b) : [];
}

function sameArray(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

module.exports = {
  fixFilename,
  normalize,
  sameArray,
};
