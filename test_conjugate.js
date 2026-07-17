// Sanity tests for the conjugation engine.  Run:  node test_conjugate.js
var J = require("./conjugate.js");

var cases = [
  // [fz, group, form, expected-kana, expected-kanji]
  // --- ichidan ---
  ["開[あ]ける", "ichidan", "polite",     "あけます",   "開けます"],
  ["開[あ]ける", "ichidan", "negative",   "あけない",   "開けない"],
  ["開[あ]ける", "ichidan", "past",       "あけた",     "開けた"],
  ["開[あ]ける", "ichidan", "te",         "あけて",     "開けて"],
  ["開[あ]ける", "ichidan", "potential",  "あけられる", "開けられる"],
  ["開[あ]ける", "ichidan", "passive",    "あけられる", "開けられる"],
  ["開[あ]ける", "ichidan", "causative",  "あけさせる", "開けさせる"],
  ["開[あ]ける", "ichidan", "volitional", "あけよう",   "開けよう"],
  ["開[あ]ける", "ichidan", "imperative", "あけろ",     "開けろ"],
  ["出[で]る",   "ichidan", "te",         "でて",       "出て"],
  // --- godan: く (te/ta sound change) ---
  ["開[あ]く",   "godan", "polite",     "あきます",   "開きます"],
  ["開[あ]く",   "godan", "negative",   "あかない",   "開かない"],
  ["開[あ]く",   "godan", "past",       "あいた",     "開いた"],
  ["開[あ]く",   "godan", "te",         "あいて",     "開いて"],
  ["開[あ]く",   "godan", "potential",  "あける",     "開ける"],  // あく potential collides w/ あける(他) — expected
  ["開[あ]く",   "godan", "passive",    "あかれる",   "開かれる"],
  ["開[あ]く",   "godan", "volitional", "あこう",     "開こう"],
  // --- godan: す ---
  ["出[だ]す",   "godan", "past",       "だした",     "出した"],
  ["出[だ]す",   "godan", "te",         "だして",     "出して"],
  ["消[け]す",   "godan", "negative",   "けさない",   "消さない"],
  // --- godan: つ / る / う (って) ---
  ["立[た]つ",   "godan", "te",         "たって",     "立って"],
  ["止[と]まる", "godan", "past",       "とまった",   "止まった"],
  ["切[き]る",   "godan", "te",         "きって",     "切って"],   // 切る is godan despite る
  ["切[き]る",   "godan", "potential",  "きれる",     "切れる"],
  // --- godan: む / ぶ / ぬ (んで) ---
  ["進[すす]む", "godan", "te",         "すすんで",   "進んで"],
  ["並[なら]ぶ", "godan", "past",       "ならんだ",   "並んだ"],
  // --- godan: ぐ ---
  // (none in dataset, but engine should handle) e.g. 泳ぐ
  ["泳[およ]ぐ", "godan", "te",         "およいで",   "泳いで"],
  ["泳[およ]ぐ", "godan", "past",       "およいだ",   "泳いだ"],
  // --- godan: う ---
  ["変[か]わる", "godan", "negative",   "かわらない", "変わらない"],
  ["減[へ]る",   "godan", "negative",   "へらない",   "減らない"], // 減る is godan
];

var pass = 0, fail = 0;
cases.forEach(function (c) {
  var fz = c[0], group = c[1], form = c[2], expKana = c[3], expKanji = c[4];
  var out = J.conjFz(fz, group, form);
  var kana = J.toKana(out), kanji = J.toKanji(out);
  var ok = kana === expKana && kanji === expKanji;
  if (ok) { pass++; }
  else {
    fail++;
    console.log("FAIL " + fz + " [" + group + "/" + form + "]");
    console.log("   got  kana=" + kana + "  kanji=" + kanji);
    console.log("   want kana=" + expKana + "  kanji=" + expKanji);
  }
});

console.log("\n" + pass + " passed, " + fail + " failed.");
process.exit(fail ? 1 : 0);
