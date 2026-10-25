// Dataset integrity tests. Run: node test_content.js
global.window = {};
var J = require("./conjugate.js");
require("./pairs.js");
require("./contexts.js");

var pairs = window.PAIRS, patterns = window.PATTERNS, contexts = window.CONTEXTS;
var failures = [];
function check(condition, message) { if (!condition) failures.push(message); }

var patternIds = {};
patterns.forEach(function (pattern) { patternIds[pattern.id] = true; });
var pairMap = {}, words = {};
pairs.forEach(function (pair, index) {
  var key = pair.ji.w + "|" + pair.ta.w;
  check(!pairMap[key], "duplicate pair: " + key);
  pairMap[key] = pair;
  check(patternIds[pair.pat], "unknown pattern on " + key + ": " + pair.pat);
  check(pair.tier === "core" || pair.tier === "n2", "invalid tier on " + key);
  ["ji", "ta"].forEach(function (side) {
    var verb = pair[side];
    check(verb.g === "godan" || verb.g === "ichidan", "invalid group: " + verb.w);
    check(J.toKanji(verb.fz) === verb.w, "furigana kanji mismatch: " + verb.w + " -> " + J.toKanji(verb.fz));
    check(J.toKana(verb.fz) === verb.r, "furigana reading mismatch: " + verb.w + " -> " + J.toKana(verb.fz));
    words[verb.w] = (words[verb.w] || 0) + 1;
  });
  check(pair.ex && pair.ex.n && pair.ex.nfz, "missing example noun at pair " + index);
});

var formIds = Object.keys(J.FORMS), contextIds = {};
contexts.forEach(function (context) {
  check(!contextIds[context.id], "duplicate context id: " + context.id);
  contextIds[context.id] = true;
  check(!!pairMap[context.pair], "context references missing pair: " + context.id + " -> " + context.pair);
  check(context.side === "ji" || context.side === "ta", "invalid context side: " + context.id);
  check(formIds.indexOf(context.form) >= 0, "invalid context form: " + context.id + " -> " + context.form);
  check(!!context.before && !!context.after && !!context.en && !!context.lens && !!context.why, "incomplete context: " + context.id);
  if (pairMap[context.pair]) {
    var verb = pairMap[context.pair][context.side];
    var answer = J.conjFz(verb.fz, verb.g, context.form);
    check(answer !== verb.fz || context.form === "dictionary", "conjugation did not change: " + context.id);
  }
});

check(pairs.length === 82, "expected 82 pairs, found " + pairs.length);
check(pairs.filter(function (p) { return p.tier === "n2"; }).length === 36, "expected 36 N2-focus pairs");
check(contexts.length === 35, "expected 35 contexts, found " + contexts.length);

if (failures.length) {
  console.error(failures.length + " content test failure(s):\n- " + failures.join("\n- "));
  process.exit(1);
}
console.log(pairs.length + " pairs, " + contexts.length + " contexts, " + patterns.length + " patterns: all content checks passed.");
