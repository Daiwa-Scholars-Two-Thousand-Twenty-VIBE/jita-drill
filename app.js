/* 自他動詞ドリル — quiz engine + UI.  Depends on conjugate.js + pairs.js. */
(function () {
  var J = window.JITA, PAIRS = window.PAIRS, P = window.PATTERNS;
  var $ = function (id) { return document.getElementById(id); };
  function patCount(id) { return PAIRS.filter(function (p) { return p.pat === id; }).length; }

  // ---- tiny persistence (best-effort; file:// in some browsers blocks it) -
  function savePref(k, v) { try { localStorage.setItem("jita_" + k, v); } catch (e) {} }
  function loadPref(k) { try { return localStorage.getItem("jita_" + k); } catch (e) { return null; } }

  // ---- display helpers ---------------------------------------------------
  var disp = { furigana: true, kana: false };
  function rv(fz) {                              // render a furigana string
    if (disp.kana) return J.toKana(fz);
    return disp.furigana ? J.toRuby(fz) : J.toKanji(fz);
  }
  function rn(noun) { return rv(noun.nfz); }    // render example noun

  // が/を contrast sentences shown under the feedback (polite form, natural)
  function exSentences(pair) {
    var n = pair.ex.nfz;
    var jiFz = n + "が" + J.conjFz(pair.ji.fz, pair.ji.g, "polite") + "。";
    var taFz = n + "を" + J.conjFz(pair.ta.fz, pair.ta.g, "polite") + "。";
    return { ji: { fz: jiFz, kana: J.toKana(jiFz) }, ta: { fz: taFz, kana: J.toKana(taFz) } };
  }
  function exHtml(s) { return disp.kana ? J.toKana(s.fz) : J.toRuby(s.fz); }

  function forms(fz) { return [J.toKana(fz), J.toKanji(fz)]; }   // accepted answers
  function rand(n) { return Math.floor(Math.random() * n); }
  function pick(arr) { return arr[rand(arr.length)]; }
  function norm(s) { return (s || "").normalize("NFKC").trim(); }

  // ---- speech ------------------------------------------------------------
  var voicesById = {};
  function populateVoices() {
    if (!window.speechSynthesis) {
      $("voice-note").textContent = "Speech synthesis is not available in this browser.";
      return;
    }
    var ja = speechSynthesis.getVoices().filter(function (v) { return /^ja(-|_|$)/i.test(v.lang); });
    var sel = $("voice"), prev = sel.value || loadPref("voiceURI");
    voicesById = {};
    sel.innerHTML = "";
    if (!ja.length) {
      sel.appendChild(new Option("(system default ja-JP)", ""));
      $("voice-note").textContent = "No Japanese voice installed — using the system default. " +
        "Tip: add one in your OS settings (macOS: System Settings → Accessibility → Spoken Content → Voices → 日本語).";
    } else {
      ja.forEach(function (v) {
        voicesById[v.voiceURI] = v;
        sel.appendChild(new Option(v.name + "  (" + v.lang + ")", v.voiceURI));
      });
      $("voice-note").textContent = ja.length + " Japanese voice" + (ja.length > 1 ? "s" : "") + " available.";
      if (prev && voicesById[prev]) sel.value = prev;
    }
  }

  function speak(text) {                         // always speaks (used by 🔊 buttons)
    if (!text || !window.speechSynthesis) return;
    try {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = "ja-JP";
      var v = voicesById[$("voice").value];
      if (v) u.voice = v;
      u.rate = parseFloat($("rate").value) || 0.9;
      speechSynthesis.speak(u);
    } catch (e) {}
  }

  // ---- question generators ----------------------------------------------
  function qPair(pair) {                          // pair production
    var ji2ta = Math.random() < 0.5;
    var shown = ji2ta ? pair.ji : pair.ta, tgt = ji2ta ? pair.ta : pair.ji;
    var tgtKind = ji2ta ? "ta" : "ji", shownKind = ji2ta ? "ji" : "ta";
    return {
      tag: ["mode", "Pair 自他ペア"], exs: exSentences(pair),
      prompt: '<span class="' + shownKind + '">' + rv(shown.fz) + "</span>",
      ask: '<span class="en">' + pair.en + "</span> &nbsp;→&nbsp; the <span class=\"target " +
           tgtKind + '">' + (tgtKind === "ta" ? "他動詞 (transitive)" : "自動詞 (intransitive)") + "</span> partner?",
      accept: forms(tgt.fz), answerFz: tgt.fz, en: pair.en,
      why: shownKind === "ji"
        ? J.toKanji(shown.fz) + " (自) ↔ " + J.toKanji(tgt.fz) + " (他)"
        : J.toKanji(shown.fz) + " (他) ↔ " + J.toKanji(tgt.fz) + " (自)",
      promptSpeak: J.toKana(shown.fz), speakText: J.toKana(tgt.fz),
    };
  }

  function qParticle(pair) {                      // particle fill-in-blank
    var useJi = Math.random() < 0.5;
    var side = useJi ? pair.ji : pair.ta, p = useJi ? "が" : "を";
    return {
      tag: ["mode", "Particle 助詞"], exs: exSentences(pair),
      prompt: rn(pair.ex) + '<span class="p">' + p + "</span> " + '<span class="blank">？</span> 。',
      ask: '<span class="en">' + pair.en + "</span> — fill the blank (plain or ます form)",
      accept: forms(side.fz).concat(forms(J.conjFz(side.fz, side.g, "polite"))),
      answerFz: side.fz, en: pair.en,
      why: "「" + p + "」→ " + (useJi ? "自動詞 (intransitive)" : "他動詞 (transitive)") +
           "　∴ " + J.toKanji(side.fz),
      promptSpeak: J.toKana(pair.ex.nfz) + p,
      speakText: J.toKana(pair.ex.nfz) + p + J.toKana(side.fz),
    };
  }

  function qCompose(pair, enabledForms) {         // pairing + conjugation
    var ji2ta = Math.random() < 0.5;
    var shown = ji2ta ? pair.ji : pair.ta, tgt = ji2ta ? pair.ta : pair.ji;
    var tgtKind = ji2ta ? "ta" : "ji";
    var form = pick(enabledForms), conj = J.conjFz(tgt.fz, tgt.g, form), label = J.FORMS[form];
    return {
      tag: ["mode", "Compose 複合"], exs: exSentences(pair),
      prompt: '<span class="' + (ji2ta ? "ji" : "ta") + '">' + rv(shown.fz) + "</span>",
      ask: '<span class="en">' + pair.en + "</span> &nbsp;→&nbsp; <span class=\"target " + tgtKind +
           '">' + (tgtKind === "ta" ? "他動詞" : "自動詞") + "</span> in <b>" + label + "</b>",
      accept: forms(conj), answerFz: conj, en: pair.en + " — " + label,
      why: J.toKanji(tgt.fz) + " → " + J.toKanji(conj),
      promptSpeak: J.toKana(shown.fz), speakText: J.toKana(conj),
    };
  }

  function qIdentify(pair) {                      // self/other recognition
    var useJi = Math.random() < 0.5, side = useJi ? pair.ji : pair.ta;
    return {
      tag: ["mode", "Identify 自他判別"], exs: exSentences(pair),
      prompt: rv(side.fz),
      ask: '<span class="en">' + pair.en + "</span> — 自動詞 or 他動詞?",
      choices: true, correctSide: useJi ? "ji" : "ta",
      answerFz: side.fz, en: pair.en,
      why: J.toKanji(side.fz) + " is " + (useJi ? "自動詞 (が)" : "他動詞 (を)"),
      promptSpeak: J.toKana(side.fz), speakText: J.toKana(side.fz),
    };
  }

  // ---- build the queue ---------------------------------------------------
  function buildQueue(s) {
    var gens = [];
    if (s.modes.pair)     gens.push(function (p) { return qPair(p); });
    if (s.modes.particle) gens.push(function (p) { return qParticle(p); });
    if (s.modes.compose)  gens.push(function (p) { return qCompose(p, s.forms); });
    if (s.modes.identify) gens.push(function (p) { return qIdentify(p); });
    var pool = s.pattern ? PAIRS.filter(function (p) { return p.pat === s.pattern; }) : PAIRS;
    if (!pool.length) pool = PAIRS;
    var q = [], lastPair = -1;
    for (var i = 0; i < s.count; i++) {
      var pi; do { pi = rand(pool.length); } while (pool.length > 1 && pi === lastPair);
      lastPair = pi;
      q.push(pick(gens)(pool[pi]));
    }
    return q;
  }

  // ---- state -------------------------------------------------------------
  var queue = [], idx = 0, score = 0, missed = [], answered = false, currentSettings = null;

  function show(id) {
    ["setup", "studylist", "quiz", "results"].forEach(function (s) { $(s).classList.add("hidden"); });
    $(id).classList.remove("hidden");
  }

  function readSettings() {
    var modes = {
      pair: $("m-pair").checked, particle: $("m-particle").checked,
      compose: $("m-compose").checked, identify: $("m-identify").checked,
    };
    var formIds = ["polite", "negative", "past", "te", "potential", "passive", "causative", "volitional", "imperative"];
    var enabledForms = formIds.filter(function (f) { return $("f-" + f).checked; });
    if (modes.compose && !enabledForms.length) enabledForms = ["polite"];
    return {
      modes: modes, forms: enabledForms, pattern: $("pattern").value,
      count: Math.max(1, Math.min(200, parseInt($("count").value, 10) || 20)),
      furigana: $("d-furigana").checked, kana: $("d-kana").checked,
    };
  }

  function runWith(s) {
    currentSettings = s;
    disp.furigana = s.furigana; disp.kana = s.kana;
    queue = buildQueue(s); idx = 0; score = 0; missed = [];
    show("quiz"); renderQ();
  }

  function start() {
    var s = readSettings();
    if (!s.modes.pair && !s.modes.particle && !s.modes.compose && !s.modes.identify) {
      alert("Pick at least one drill mode."); return;
    }
    runWith(s);
  }

  function renderQ() {
    answered = false;
    var q = queue[idx];
    $("q-count").textContent = (idx + 1) + " / " + queue.length;
    $("q-score").innerHTML = "Score: <b>" + score + "</b>";
    $("q-bar").style.width = (idx / queue.length * 100) + "%";

    $("q-tag").className = "tag " + q.tag[0];
    $("q-tag").textContent = q.tag[1];
    $("q-prompt").innerHTML = q.prompt;
    $("q-ask").innerHTML = q.ask;
    $("q-feedback").innerHTML = ""; $("q-feedback").className = "feedback hidden";
    $("q-replay").onclick = function () { speak(q.promptSpeak); };

    var inp = $("q-answer");               // always clear — even after an identify question
    inp.value = ""; inp.className = "answer"; inp.disabled = false;
    if (q.choices) {                       // identify mode: two buttons
      $("q-input-wrap").classList.add("hidden");
      $("q-choices").classList.remove("hidden");
    } else {
      $("q-choices").classList.add("hidden");
      $("q-input-wrap").classList.remove("hidden");
      inp.focus();
    }
    $("q-next").classList.add("hidden");
    $("q-submit").classList.toggle("hidden", !!q.choices);

    if ($("d-speak-prompt").checked) speak(q.promptSpeak);
  }

  function reveal(correct, q) {
    answered = true;
    if (correct) score++; else missed.push(q);
    var fb = $("q-feedback");
    fb.className = "feedback " + (correct ? "ok" : "bad");
    var ansHtml = (disp.kana ? J.toKana(q.answerFz) : J.toRuby(q.answerFz));
    fb.innerHTML =
      '<div class="verdict ' + (correct ? "ok" : "bad") + '">' +
        (correct ? "✓ 正解 Correct" : "✗ 不正解") + "</div>" +
      '<div class="ansline">' + ansHtml +
        ' <button class="speak" id="q-speak" title="Listen">🔊</button></div>' +
      '<div class="why">' + q.why + ' &nbsp;·&nbsp; <span class="en">' + q.en + "</span></div>" +
      '<div class="examples">' +
        '<div class="ex-line"><span class="extag ji">自</span> ' + exHtml(q.exs.ji) +
          ' <button class="speak" id="ex-ji" title="Listen">🔊</button></div>' +
        '<div class="ex-line"><span class="extag ta">他</span> ' + exHtml(q.exs.ta) +
          ' <button class="speak" id="ex-ta" title="Listen">🔊</button></div>' +
      "</div>";
    $("q-score").innerHTML = "Score: <b>" + score + "</b>";
    $("q-submit").classList.add("hidden");
    $("q-choices").classList.add("hidden");
    $("q-next").classList.remove("hidden");
    $("q-next").focus();
    $("q-speak").onclick = function () { speak(q.speakText); };
    $("ex-ji").onclick = function () { speak(q.exs.ji.kana); };
    $("ex-ta").onclick = function () { speak(q.exs.ta.kana); };
    if ($("d-speak").checked) speak(q.speakText);
  }

  function submitText() {
    if (answered) return;
    var q = queue[idx], val = norm($("q-answer").value);
    if (!val) return;
    var correct = q.accept.map(norm).indexOf(val) !== -1;
    var inp = $("q-answer");
    inp.className = "answer " + (correct ? "ok" : "bad"); inp.disabled = true;
    reveal(correct, q);
  }

  function choose(side) {
    if (answered) return;
    var q = queue[idx];
    reveal(side === q.correctSide, q);
  }

  function next() { idx++; if (idx >= queue.length) finish(); else renderQ(); }

  function finish() {
    if (window.speechSynthesis) speechSynthesis.cancel();
    show("results");
    var pct = Math.round(score / queue.length * 100);
    $("r-score").innerHTML = score + " / " + queue.length + ' &nbsp;<span class="pct">' + pct + "%</span>";
    var m = $("r-missed");
    if (!missed.length) {
      m.innerHTML = '<div class="item">パーフェクト！ No misses. 🎉</div>';
    } else {
      m.innerHTML = "<h2>Review (" + missed.length + ")</h2>" +
        missed.map(function (q) {
          return '<div class="item">' + J.toRuby(q.answerFz) +
            '<span class="en">' + q.why + "</span></div>";
        }).join("");
    }
  }

  // ---- patterns: dropdowns + cheat sheet ---------------------------------
  function fillPatternSelect(sel) {
    sel.innerHTML = "";
    sel.appendChild(new Option("All patterns (" + PAIRS.length + ")", ""));
    P.forEach(function (pt) { sel.appendChild(new Option(pt.sig + "  (" + patCount(pt.id) + ")", pt.id)); });
  }
  function relClass(r) { return (r === "the exception" || r === "memorize") ? "warn" : "high"; }

  function renderCheat() {
    $("cheat-body").innerHTML = P.map(function (pt) {
      var ex = PAIRS.filter(function (p) { return p.pat === pt.id; }).slice(0, 3)
        .map(function (p) { return J.toKanji(p.ji.fz) + "／" + J.toKanji(p.ta.fz); }).join("　·　");
      return '<div class="cheat-row' + (pt.trap ? " trap" : "") + '" data-pat="' + pt.id + '">' +
        '<div class="cheat-head"><span class="cheat-sig">' + pt.sig + "</span>" +
          '<span class="rel ' + relClass(pt.rel) + '">' + pt.rel + "</span></div>" +
        '<div class="cheat-types"><span class="ji">' + pt.ji + "</span> ／ <span class=\"ta\">" + pt.ta + "</span></div>" +
        '<div class="cheat-rule">' + pt.rule + "</div>" +
        '<div class="cheat-ex">例: ' + ex + ' <button class="mini" data-drill="' + pt.id + '">▶ drill these</button></div>' +
        "</div>";
    }).join("");
    [].forEach.call($("cheat-body").querySelectorAll(".cheat-row"), function (row) {
      row.addEventListener("click", function (e) {
        if (e.target.hasAttribute("data-drill")) return;
        $("study-pattern").value = row.getAttribute("data-pat"); renderStudy();
        $("study-search").scrollIntoView({ block: "nearest" });
      });
    });
    [].forEach.call($("cheat-body").querySelectorAll("[data-drill]"), function (b) {
      b.addEventListener("click", function (e) {
        e.stopPropagation(); $("pattern").value = b.getAttribute("data-drill"); start();
      });
    });
  }

  // ---- study list --------------------------------------------------------
  function renderStudy() {
    var q = norm($("study-search").value).toLowerCase(), pf = $("study-pattern").value;
    var rows = PAIRS.filter(function (p) {
      if (pf && p.pat !== pf) return false;
      if (!q) return true;
      return [p.ji.w, p.ji.r, p.ta.w, p.ta.r, p.en].join(" ").toLowerCase().indexOf(q) >= 0;
    });
    $("study-count").textContent = rows.length + " / " + PAIRS.length + " pairs";
    var box = $("study-rows");
    box.className = $("study-hide-en").checked ? "hide-en" : "";
    box.innerHTML = rows.map(function (p) {
      return '<div class="wl-row">' +
        '<div class="wl-ji">' + J.toRuby(p.ji.fz) + ' <button class="speak" data-say="' + J.toKana(p.ji.fz) + '">🔊</button></div>' +
        '<div class="wl-ta">' + J.toRuby(p.ta.fz) + ' <button class="speak" data-say="' + J.toKana(p.ta.fz) + '">🔊</button></div>' +
        '<div class="wl-en">' + p.en + "</div></div>";
    }).join("");
    [].forEach.call(box.querySelectorAll(".speak"), function (b) {
      b.onclick = function () { speak(b.getAttribute("data-say")); };
    });
  }

  // ---- wiring ------------------------------------------------------------
  function wire() {
    $("pool").innerHTML = "Pool: <b>" + PAIRS.length + "</b> 自他ペア";
    fillPatternSelect($("pattern"));
    fillPatternSelect($("study-pattern"));
    renderCheat();

    // restore audio prefs
    var r = loadPref("rate"); if (r) { $("rate").value = r; }
    $("rate-val").textContent = parseFloat($("rate").value).toFixed(1) + "×";
    if (loadPref("speak") === "1") $("d-speak").checked = true;
    if (loadPref("speakPrompt") === "1") $("d-speak-prompt").checked = true;

    // voices load asynchronously in most browsers
    populateVoices();
    if (window.speechSynthesis) speechSynthesis.onvoiceschanged = populateVoices;

    $("voice").addEventListener("change", function () { savePref("voiceURI", this.value); });
    $("voice-test").onclick = function () { speak("ドアが開きます。ドアを開けます。"); };
    $("rate").addEventListener("input", function () {
      $("rate-val").textContent = parseFloat(this.value).toFixed(1) + "×"; savePref("rate", this.value);
    });
    $("d-speak").addEventListener("change", function () { savePref("speak", this.checked ? "1" : "0"); });
    $("d-speak-prompt").addEventListener("change", function () { savePref("speakPrompt", this.checked ? "1" : "0"); });

    // setup actions
    $("start").onclick = start;
    $("open-study").onclick = function () { show("studylist"); renderStudy(); $("study-search").focus(); };
    $("d-kana").addEventListener("change", function () { $("d-furigana").disabled = this.checked; });

    // study list actions
    $("study-home").onclick = function () { show("setup"); };
    $("study-start").onclick = start;
    $("study-search").addEventListener("input", renderStudy);
    $("study-pattern").addEventListener("change", renderStudy);
    $("study-hide-en").addEventListener("change", renderStudy);

    // quiz actions
    $("q-submit").onclick = submitText;
    $("q-next").onclick = next;
    $("c-ji").onclick = function () { choose("ji"); };
    $("c-ta").onclick = function () { choose("ta"); };
    $("q-home").onclick = function () { if (window.speechSynthesis) speechSynthesis.cancel(); show("setup"); };
    $("q-restart").onclick = function () { if (currentSettings) runWith(currentSettings); };

    // results actions
    $("restart-same").onclick = function () { if (currentSettings) runWith(currentSettings); };
    $("restart").onclick = function () { show("setup"); };

    // keyboard — single handler; ignore the Enter that confirms an IME conversion
    // (e.isComposing / keyCode 229) so we never advance mid-composition and leak
    // the committed text into the next question's box.
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" || e.isComposing || e.keyCode === 229) return;
      if ($("quiz").classList.contains("hidden")) return;
      e.preventDefault();
      if (answered) next();
      else if (!queue[idx].choices) submitText();
    });
  }

  wire();
})();
