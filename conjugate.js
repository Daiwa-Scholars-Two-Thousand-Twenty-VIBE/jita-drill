/*
 * Conjugation engine + furigana parser.
 * Works in the browser (attaches to window.JITA) and in Node (module.exports)
 * so the logic can be unit-tested with `node test_conjugate.js`.
 *
 * Operates directly on the furigana string (fz), e.g. "書[か]く".
 * Conjugation only ever touches the trailing okurigana (kana outside the
 * brackets), so kanji + readings are preserved automatically.
 */
(function (root) {
  // final-kana transforms for godan verbs
  var GODAN = {
    "く": { a:"か", i:"き", e:"け", o:"こ", te:"いて", ta:"いた" },
    "ぐ": { a:"が", i:"ぎ", e:"げ", o:"ご", te:"いで", ta:"いだ" },
    "す": { a:"さ", i:"し", e:"せ", o:"そ", te:"して", ta:"した" },
    "つ": { a:"た", i:"ち", e:"て", o:"と", te:"って", ta:"った" },
    "ぬ": { a:"な", i:"に", e:"ね", o:"の", te:"んで", ta:"んだ" },
    "ぶ": { a:"ば", i:"び", e:"べ", o:"ぼ", te:"んで", ta:"んだ" },
    "む": { a:"ま", i:"み", e:"め", o:"も", te:"んで", ta:"んだ" },
    "る": { a:"ら", i:"り", e:"れ", o:"ろ", te:"って", ta:"った" },
    "う": { a:"わ", i:"い", e:"え", o:"お", te:"って", ta:"った" },
  };

  // Human-readable labels for the supported forms (English + Japanese)
  var FORMS = {
    dictionary: "dictionary 辞書形",
    polite:     "polite ます形",
    negative:   "negative ない形",
    past:       "past た形",
    te:         "て form て形",
    potential:  "potential 可能形",
    passive:    "passive 受身形",
    causative:  "causative 使役形",
    volitional: "volitional 意向形",
    imperative: "imperative 命令形",
  };

  // Conjugate a furigana string. Returns the conjugated fz string.
  function conjFz(fz, group, form) {
    if (form === "dictionary") return fz;

    if (group === "ichidan") {
      var stem = fz.replace(/る$/, ""); // drop trailing る
      switch (form) {
        case "polite":     return stem + "ます";
        case "negative":   return stem + "ない";
        case "past":       return stem + "た";
        case "te":         return stem + "て";
        case "potential":  return stem + "られる";
        case "passive":    return stem + "られる";
        case "causative":  return stem + "させる";
        case "volitional": return stem + "よう";
        case "imperative": return stem + "ろ";
      }
    }

    if (group === "godan") {
      var last = fz.slice(-1);
      var base = fz.slice(0, -1);
      var m = GODAN[last];
      if (!m) return fz; // unknown ending, leave untouched
      switch (form) {
        case "polite":     return base + m.i + "ます";
        case "negative":   return base + m.a + "ない";
        case "past":       return base + m.ta;
        case "te":         return base + m.te;
        case "potential":  return base + m.e + "る";
        case "passive":    return base + m.a + "れる";
        case "causative":  return base + m.a + "せる";
        case "volitional": return base + m.o + "う";
        case "imperative": return base + m.e;
      }
    }
    return fz;
  }

  // --- furigana string helpers -------------------------------------------
  // Each "X[yy]" attaches reading yy to the single preceding character X.
  var FZ_RE = /(.)\[(.*?)\]/g;

  function toKanji(fz) { return fz.replace(FZ_RE, "$1"); }   // 書[か]く -> 書く
  function toKana(fz)  { return fz.replace(FZ_RE, "$2"); }   // 書[か]く -> かく
  function toRuby(fz)  {                                      // 書[か]く -> ruby markup
    return fz.replace(FZ_RE, "<ruby>$1<rt>$2</rt></ruby>");
  }

  var api = { conjFz: conjFz, toKanji: toKanji, toKana: toKana, toRuby: toRuby, FORMS: FORMS };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.JITA = api;
})(typeof window !== "undefined" ? window : this);
