/* 自他動詞ラボ — adaptive quiz engine. Depends on conjugate.js, pairs.js, contexts.js. */
(function () {
  "use strict";

  var J = window.JITA;
  var PAIRS = window.PAIRS || [];
  var PATTERNS = window.PATTERNS || [];
  var CONTEXTS = window.CONTEXTS || [];
  var $ = function (id) { return document.getElementById(id); };
  var pairMap = {};

  function pairKey(pair) { return pair.ji.w + "|" + pair.ta.w; }
  PAIRS.forEach(function (pair) { pairMap[pairKey(pair)] = pair; });

  // ---- persistence + learning model ------------------------------------
  function savePref(key, value) { try { localStorage.setItem("jita_" + key, value); } catch (e) {} }
  function loadPref(key) { try { return localStorage.getItem("jita_" + key); } catch (e) { return null; } }
  function loadLearning() {
    try { return JSON.parse(localStorage.getItem("jita_learning_v2") || "{}") || {}; }
    catch (e) { return {}; }
  }
  var learning = loadLearning();
  function saveLearning() { try { localStorage.setItem("jita_learning_v2", JSON.stringify(learning)); } catch (e) {} }
  function statFor(key) {
    return learning[key] || { attempts: 0, correct: 0, streak: 0, totalMs: 0, fastestMs: null, lastSeen: 0 };
  }
  function accuracy(stat) { return stat.attempts ? stat.correct / stat.attempts : 0; }
  function avgMs(stat) { return stat.attempts ? stat.totalMs / stat.attempts : Infinity; }
  function isAutomatic(stat) { return stat.attempts >= 3 && accuracy(stat) >= .8 && stat.streak >= 3 && avgMs(stat) <= 8000; }
  function isWeak(stat) { return stat.attempts > 0 && (accuracy(stat) < .8 || stat.streak < 2 || avgMs(stat) > 10000); }
  function learningWeight(key, weakFirst) {
    if (!weakFirst) return 1;
    var s = statFor(key);
    if (!s.attempts) return 3;
    return 1 + (1 - accuracy(s)) * 5 + (s.streak === 0 ? 2 : 0) + (avgMs(s) > 8000 ? 1.5 : 0);
  }
  function recordAnswer(q, correct, elapsed) {
    var s = statFor(q.pairKey);
    s.attempts += 1;
    s.correct += correct ? 1 : 0;
    s.streak = correct ? s.streak + 1 : 0;
    s.totalMs += elapsed;
    s.fastestMs = s.fastestMs === null ? elapsed : Math.min(s.fastestMs, elapsed);
    s.lastSeen = Date.now();
    learning[q.pairKey] = s;
    saveLearning();
  }
  function renderDashboard() {
    var attempts = 0, correct = 0, mastered = 0, weak = 0;
    PAIRS.forEach(function (p) {
      var s = statFor(pairKey(p));
      attempts += s.attempts; correct += s.correct;
      if (isAutomatic(s)) mastered++;
      else if (isWeak(s)) weak++;
    });
    $("stat-attempts").textContent = attempts;
    $("stat-accuracy").textContent = attempts ? Math.round(correct / attempts * 100) + "%" : "—";
    $("stat-mastered").textContent = mastered;
    $("stat-weak").textContent = weak;
  }

  // ---- display helpers --------------------------------------------------
  var disp = { furigana: true, kana: false };
  function rv(fz) {
    if (disp.kana) return J.toKana(fz);
    return disp.furigana ? J.toRuby(fz) : J.toKanji(fz);
  }
  function rn(noun) { return rv(noun.nfz); }
  function exSentences(pair) {
    var n = pair.ex.nfz;
    var jiFz = n + "が" + J.conjFz(pair.ji.fz, pair.ji.g, "polite") + "。";
    var taFz = n + "を" + J.conjFz(pair.ta.fz, pair.ta.g, "polite") + "。";
    return { ji: { fz: jiFz, kana: J.toKana(jiFz) }, ta: { fz: taFz, kana: J.toKana(taFz) } };
  }
  function exHtml(sentence) { return disp.kana ? J.toKana(sentence.fz) : (disp.furigana ? J.toRuby(sentence.fz) : J.toKanji(sentence.fz)); }
  function forms(fz) {
    var values = [J.toKana(fz), J.toKanji(fz)];
    return values.filter(function (v, i) { return values.indexOf(v) === i; });
  }
  function norm(value) { return (value || "").normalize("NFKC").trim().replace(/[。.]$/, ""); }
  function rand(n) { return Math.floor(Math.random() * n); }
  function pick(array) { return array[rand(array.length)]; }
  function weightedPick(array, keyFn, useWeights) {
    if (!array.length) return null;
    var weights = array.map(function (item) { return learningWeight(keyFn(item), useWeights); });
    var total = weights.reduce(function (sum, n) { return sum + n; }, 0);
    var cursor = Math.random() * total;
    for (var i = 0; i < array.length; i++) { cursor -= weights[i]; if (cursor <= 0) return array[i]; }
    return array[array.length - 1];
  }

  // ---- speech -----------------------------------------------------------
  var voicesById = {};
  function populateVoices() {
    if (!window.speechSynthesis) { $("voice-note").textContent = "Speech synthesis is unavailable in this browser."; return; }
    var ja = speechSynthesis.getVoices().filter(function (voice) { return /^ja(-|_|$)/i.test(voice.lang); });
    var select = $("voice"), previous = select.value || loadPref("voiceURI");
    voicesById = {}; select.innerHTML = "";
    if (!ja.length) {
      select.appendChild(new Option("System default (ja-JP)", ""));
      $("voice-note").textContent = "No installed Japanese voice found; using the system default.";
    } else {
      ja.forEach(function (voice) { voicesById[voice.voiceURI] = voice; select.appendChild(new Option(voice.name + " (" + voice.lang + ")", voice.voiceURI)); });
      $("voice-note").textContent = ja.length + " Japanese voice" + (ja.length === 1 ? "" : "s") + " available.";
      if (previous && voicesById[previous]) select.value = previous;
    }
  }
  function speak(text) {
    if (!text || !window.speechSynthesis) return;
    try {
      speechSynthesis.cancel();
      var utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ja-JP";
      if (voicesById[$("voice").value]) utterance.voice = voicesById[$("voice").value];
      utterance.rate = parseFloat($("rate").value) || .9;
      speechSynthesis.speak(utterance);
    } catch (e) {}
  }

  // ---- question generators --------------------------------------------
  function baseQuestion(pair) { return { pair: pair, pairKey: pairKey(pair), tier: pair.tier, exs: exSentences(pair), retries: 0 }; }
  function qPair(pair) {
    var jiToTa = Math.random() < .5;
    var shown = jiToTa ? pair.ji : pair.ta, target = jiToTa ? pair.ta : pair.ji;
    var shownKind = jiToTa ? "ji" : "ta", targetKind = jiToTa ? "ta" : "ji";
    return Object.assign(baseQuestion(pair), {
      tag: "Pair production", prompt: '<span class="' + shownKind + '">' + rv(shown.fz) + "</span>",
      ask: '<span class="en">' + pair.en + '</span> → produce the <span class="target ' + targetKind + '">' + (targetKind === "ji" ? "自動詞" : "他動詞") + " partner</span>.",
      accept: forms(target.fz), answerFz: target.fz, en: pair.en,
      why: J.toKanji(pair.ji.fz) + " (自) ↔ " + J.toKanji(pair.ta.fz) + " (他)",
      promptSpeak: J.toKana(shown.fz), speakText: J.toKana(target.fz)
    });
  }
  function qParticle(pair) {
    var useJi = Math.random() < .5, side = useJi ? pair.ji : pair.ta, particle = useJi ? "が" : "を";
    return Object.assign(baseQuestion(pair), {
      tag: "Particle sentence", prompt: rn(pair.ex) + '<span class="p">' + particle + '</span> <span class="blank">？</span>。',
      ask: '<span class="en">' + pair.en + "</span> — type the dictionary or polite form.",
      accept: forms(side.fz).concat(forms(J.conjFz(side.fz, side.g, "polite"))), answerFz: side.fz, en: pair.en,
      why: "「" + particle + "」selects " + (useJi ? "the change/result (自動詞)" : "the affected object (他動詞)") + ".",
      promptSpeak: J.toKana(pair.ex.nfz) + particle, speakText: J.toKana(pair.ex.nfz) + particle + J.toKana(side.fz)
    });
  }
  function qCompose(pair, enabledForms) {
    var jiToTa = Math.random() < .5;
    var shown = jiToTa ? pair.ji : pair.ta, target = jiToTa ? pair.ta : pair.ji;
    var targetKind = jiToTa ? "ta" : "ji", form = pick(enabledForms);
    var conjugated = J.conjFz(target.fz, target.g, form), collision = null;
    var otherWord = jiToTa ? pair.ji.w : pair.ta.w;
    if (form === "potential" && J.toKanji(conjugated) === otherWord) collision = "Form collision: this potential form looks identical to the other member of the pair. Use the sentence frame—not the surface ending—to parse it.";
    return Object.assign(baseQuestion(pair), {
      tag: "Pair + conjugation", prompt: '<span class="' + (jiToTa ? "ji" : "ta") + '">' + rv(shown.fz) + "</span>",
      ask: '<span class="en">' + pair.en + '</span> → <span class="target ' + targetKind + '">' + (targetKind === "ji" ? "自動詞" : "他動詞") + "</span> in <b>" + J.FORMS[form] + "</b>.",
      accept: forms(conjugated), answerFz: conjugated, en: pair.en,
      why: J.toKanji(target.fz) + " → " + J.toKanji(conjugated), lesson: collision,
      promptSpeak: J.toKana(shown.fz), speakText: J.toKana(conjugated)
    });
  }
  function qIdentify(pair) {
    var useJi = Math.random() < .5, side = useJi ? pair.ji : pair.ta;
    return Object.assign(baseQuestion(pair), {
      tag: "Identify", prompt: rv(side.fz), ask: '<span class="en">' + pair.en + "</span> — which camera does this verb use?",
      choices: true, correctSide: useJi ? "ji" : "ta", answerFz: side.fz, en: pair.en,
      why: J.toKanji(side.fz) + " is " + (useJi ? "自動詞: focus on the change/state." : "他動詞: focus on the actor's effect on an object."),
      promptSpeak: J.toKana(side.fz), speakText: J.toKana(side.fz)
    });
  }
  function qContext(context) {
    var pair = pairMap[context.pair], side = context.side === "ji" ? pair.ji : pair.ta;
    var answer = J.conjFz(side.fz, side.g, context.form);
    var fullSentence = context.before + answer + context.after;
    return Object.assign(baseQuestion(pair), {
      tag: "N2 sentence", lens: context.lens, contextId: context.id,
      prompt: rv(context.before) + '<span class="blank">？</span>' + rv(context.after),
      ask: '<span class="en">' + context.en + "</span> — type the missing verb in <b>" + J.FORMS[context.form] + "</b>.",
      accept: forms(answer), answerFz: answer, answerSentenceFz: fullSentence, en: context.en,
      why: context.side === "ji" ? "自動詞: the camera stays on the change, state, or outcome." : "他動詞: the camera stays on the actor causing a change.",
      lesson: context.why, promptSpeak: "", speakText: J.toKana(fullSentence)
    });
  }

  // ---- queue ------------------------------------------------------------
  function filteredPairs(settings) {
    return PAIRS.filter(function (pair) {
      return (settings.tier === "all" || pair.tier === settings.tier) && (!settings.pattern || pair.pat === settings.pattern) &&
        (!settings.search || [pair.ji.w, pair.ji.r, pair.ta.w, pair.ta.r, pair.en].join(" ").toLowerCase().indexOf(settings.search) >= 0);
    });
  }
  function filteredContexts(settings, pairPool) {
    var keys = {};
    pairPool.forEach(function (pair) { keys[pairKey(pair)] = true; });
    return CONTEXTS.filter(function (context) { return !!keys[context.pair]; });
  }
  function buildQueue(settings) {
    var pairPool = filteredPairs(settings), contextPool = filteredContexts(settings, pairPool), modes = [];
    if (settings.modes.context && contextPool.length) modes.push("context");
    if (settings.modes.pair) modes.push("pair");
    if (settings.modes.particle) modes.push("particle");
    if (settings.modes.compose) modes.push("compose");
    if (settings.modes.identify) modes.push("identify");
    if (!modes.length || !pairPool.length) return [];
    var queue = [], lastKey = "";
    for (var i = 0; i < settings.count; i++) {
      var mode = pick(modes), q = null, guard = 0;
      do {
        if (mode === "context") q = qContext(weightedPick(contextPool, function (c) { return c.pair; }, settings.weakFirst));
        else {
          var pair = weightedPick(pairPool, pairKey, settings.weakFirst);
          q = mode === "pair" ? qPair(pair) : mode === "particle" ? qParticle(pair) : mode === "compose" ? qCompose(pair, settings.forms) : qIdentify(pair);
        }
        guard++;
      } while (q.pairKey === lastKey && pairPool.length > 1 && guard < 8);
      queue.push(q); lastKey = q.pairKey;
    }
    return queue;
  }

  // ---- session state ----------------------------------------------------
  var queue = [], idx = 0, score = 0, missed = [], answered = false;
  var currentSettings = null, questionStarted = 0, sessionStarted = 0, answerTimes = [], fastCorrect = 0;

  function show(id) {
    ["setup", "studylist", "quiz", "results"].forEach(function (section) { $(section).classList.add("hidden"); });
    $(id).classList.remove("hidden"); window.scrollTo(0, 0);
    if (id === "setup") renderDashboard();
  }
  function selectedForms() {
    var ids = ["polite", "negative", "negativePast", "past", "te", "potential", "passive", "causative", "volitional", "imperative"];
    return ids.filter(function (form) { return $("f-" + form).checked; });
  }
  function readSettings() {
    var modes = { context: $("m-context").checked, pair: $("m-pair").checked, particle: $("m-particle").checked, compose: $("m-compose").checked, identify: $("m-identify").checked };
    var formsEnabled = selectedForms();
    if (modes.compose && !formsEnabled.length) formsEnabled = ["polite"];
    return {
      modes: modes, forms: formsEnabled, tier: $("tier").value, pattern: $("pattern").value,
      weakFirst: $("weak-first").checked, count: Math.max(1, Math.min(100, parseInt($("count").value, 10) || 12)),
      furigana: $("d-furigana").checked, kana: $("d-kana").checked, recycle: true
    };
  }
  function runWith(settings, suppliedQueue) {
    currentSettings = settings; disp.furigana = settings.furigana; disp.kana = settings.kana;
    queue = suppliedQueue || buildQueue(settings);
    if (!queue.length) { alert("No questions match those filters. Enable another mode or broaden the content filter."); return; }
    idx = 0; score = 0; missed = []; answerTimes = []; fastCorrect = 0; sessionStarted = Date.now();
    show("quiz"); renderQuestion();
  }
  function start() {
    var settings = readSettings();
    if (!Object.keys(settings.modes).some(function (mode) { return settings.modes[mode]; })) { alert("Choose at least one retrieval mode."); return; }
    runWith(settings);
  }
  function applyPreset(name) {
    ["context", "pair", "particle", "compose", "identify"].forEach(function (mode) { $("m-" + mode).checked = false; });
    $("pattern").value = ""; $("weak-first").checked = true;
    if (name === "n2") { $("tier").value = "n2"; $("m-context").checked = true; $("m-pair").checked = true; $("count").value = 12; }
    if (name === "viewpoint") { $("tier").value = "all"; $("m-context").checked = true; $("count").value = 16; }
    if (name === "repair") { $("tier").value = "core"; $("m-pair").checked = true; $("m-particle").checked = true; $("count").value = 15; }
    updatePool(); start();
  }

  function renderQuestion() {
    answered = false; questionStarted = Date.now();
    var q = queue[idx];
    $("q-count").textContent = (idx + 1) + " / " + queue.length;
    $("q-score").textContent = score + " / " + idx;
    $("q-bar").style.width = (idx / queue.length * 100) + "%";
    $("q-pace").textContent = answerTimes.length ? (answerTimes.reduce(function (a, b) { return a + b; }, 0) / answerTimes.length / 1000).toFixed(1) + "s" : "—";
    $("q-tag").textContent = q.tag;
    $("q-lens").textContent = q.lens || ""; $("q-lens").classList.toggle("hidden", !q.lens);
    $("q-prompt").innerHTML = q.prompt; $("q-ask").innerHTML = q.ask;
    $("q-feedback").innerHTML = ""; $("q-feedback").className = "feedback hidden";
    $("q-replay").classList.toggle("hidden", !q.promptSpeak); $("q-replay").onclick = function () { speak(q.promptSpeak); };
    var input = $("q-answer"); input.value = ""; input.className = "answer"; input.disabled = false;
    if (q.choices) { $("q-input-wrap").classList.add("hidden"); $("q-choices").classList.remove("hidden"); }
    else { $("q-choices").classList.add("hidden"); $("q-input-wrap").classList.remove("hidden"); input.focus(); }
    $("q-next").classList.add("hidden"); $("q-submit").classList.toggle("hidden", !!q.choices);
    $("q-skip").classList.remove("hidden");
    if ($("d-speak-prompt").checked && q.promptSpeak) speak(q.promptSpeak);
  }
  function feedbackExamples(q) {
    return '<div class="examples"><div class="ex-line"><span class="extag ji">自</span>' + exHtml(q.exs.ji) + '<button class="speak" id="ex-ji" aria-label="Listen to intransitive example">🔊</button></div>' +
      '<div class="ex-line"><span class="extag ta">他</span>' + exHtml(q.exs.ta) + '<button class="speak" id="ex-ta" aria-label="Listen to transitive example">🔊</button></div></div>';
  }
  function reveal(correct, q) {
    answered = true;
    var elapsed = Math.max(250, Date.now() - questionStarted); answerTimes.push(elapsed);
    if (correct) { score++; if (elapsed <= 8000) fastCorrect++; }
    else {
      missed.push(q);
      if (currentSettings.recycle && q.retries < 1) {
        var retry = Object.assign({}, q, { retries: 1, tag: q.tag + " · retry" });
        queue.splice(Math.min(idx + 4, queue.length), 0, retry);
        $("q-count").textContent = (idx + 1) + " / " + queue.length;
      }
    }
    recordAnswer(q, correct, elapsed);
    var feedback = $("q-feedback"), answerHtml = disp.kana ? J.toKana(q.answerFz) : (disp.furigana ? J.toRuby(q.answerFz) : J.toKanji(q.answerFz));
    var fullLine = q.answerSentenceFz ? '<div class="lesson">' + rv(q.answerSentenceFz) + "</div>" : "";
    feedback.className = "feedback " + (correct ? "ok" : "bad");
    feedback.innerHTML = '<div class="verdict ' + (correct ? "ok" : "bad") + '">' + (correct ? "✓ 正解" : (currentSettings.recycle && q.retries < 1 ? "↻ Review now · retry later" : "Review this answer")) + " · " + (elapsed / 1000).toFixed(1) + "s</div>" +
      '<div class="ansline">' + answerHtml + '<button class="speak" id="q-speak" aria-label="Listen to answer">🔊</button></div>' +
      '<div class="why">' + q.why + ' <span class="en">· ' + q.en + "</span></div>" + fullLine +
      (q.lesson ? '<div class="lesson">↳ ' + q.lesson + "</div>" : "") + feedbackExamples(q);
    $("q-score").textContent = score + " / " + (idx + 1);
    $("q-skip").classList.add("hidden");
    $("q-pace").textContent = (answerTimes.reduce(function (a, b) { return a + b; }, 0) / answerTimes.length / 1000).toFixed(1) + "s";
    $("q-submit").classList.add("hidden"); $("q-choices").classList.add("hidden"); $("q-next").classList.remove("hidden"); $("q-next").focus();
    $("q-speak").onclick = function () { speak(q.speakText); }; $("ex-ji").onclick = function () { speak(q.exs.ji.kana); }; $("ex-ta").onclick = function () { speak(q.exs.ta.kana); };
    if ($("d-speak").checked) speak(q.speakText);
  }
  function submitText() {
    if (answered) return;
    var q = queue[idx], value = norm($("q-answer").value); if (!value) return;
    var correct = q.accept.map(norm).indexOf(value) !== -1;
    $("q-answer").className = "answer " + (correct ? "ok" : "bad"); $("q-answer").disabled = true; reveal(correct, q);
  }
  function choose(side) { if (!answered) reveal(side === queue[idx].correctSide, queue[idx]); }
  function next() { idx++; if (idx >= queue.length) finish(); else renderQuestion(); }
  function durationLabel(ms) { var sec = Math.round(ms / 1000); return sec < 60 ? sec + "s" : Math.floor(sec / 60) + "m " + (sec % 60) + "s"; }
  function finish() {
    if (window.speechSynthesis) speechSynthesis.cancel();
    show("results"); renderDashboard();
    var total = Date.now() - sessionStarted, pct = Math.round(score / queue.length * 100), average = answerTimes.reduce(function (a, b) { return a + b; }, 0) / Math.max(1, answerTimes.length);
    $("r-score").innerHTML = score + " / " + queue.length + ' <span class="pct">' + pct + "%</span>";
    $("r-time").textContent = durationLabel(total); $("r-pace").textContent = (average / 1000).toFixed(1) + "s / answer"; $("r-auto").textContent = fastCorrect + " ≤ 8s";
    var unique = {}, review = [];
    missed.forEach(function (q) { if (!unique[q.contextId || q.pairKey]) { unique[q.contextId || q.pairKey] = true; review.push(q); } });
    $("r-retry-missed").classList.toggle("hidden", !review.length);
    $("r-retry-missed").onclick = function () { var retryQueue = review.map(function (q) { return Object.assign({}, q, { retries: 1, tag: q.tag.replace(" · retry", "") }); }); var settings = Object.assign({}, currentSettings, { recycle: false, count: retryQueue.length }); runWith(settings, retryQueue); };
    if (!review.length) $("r-missed").innerHTML = '<div class="lesson">パーフェクト。Now leave the drill and get more Japanese input.</div>';
    else $("r-missed").innerHTML = "<h3>Review these decisions</h3>" + review.map(function (q) { return '<div class="item"><span>' + J.toRuby(q.answerFz) + '</span><span class="en">' + q.why + "</span></div>"; }).join("");
  }

  // ---- patterns + study list -------------------------------------------
  function patCount(id, tier) { return PAIRS.filter(function (p) { return p.pat === id && (!tier || tier === "all" || p.tier === tier); }).length; }
  function fillPatternSelect(select) {
    select.innerHTML = ""; select.appendChild(new Option("All patterns", ""));
    PATTERNS.forEach(function (pattern) { select.appendChild(new Option(pattern.sig + " (" + patCount(pattern.id) + ")", pattern.id)); });
  }
  function relClass(label) { return label === "the exception" || label === "memorize" ? "warn" : "high"; }
  function renderCheat() {
    $("cheat-body").innerHTML = PATTERNS.map(function (pattern) {
      var examples = PAIRS.filter(function (p) { return p.pat === pattern.id; }).slice(0, 3).map(function (p) { return p.ji.w + "／" + p.ta.w; }).join(" · ");
      return '<div class="cheat-row' + (pattern.trap ? " trap" : "") + '" data-pat="' + pattern.id + '"><div class="cheat-head"><span class="cheat-sig">' + pattern.sig + '</span><span class="rel ' + relClass(pattern.rel) + '">' + pattern.rel + '</span></div><div class="cheat-types"><span class="ji">' + pattern.ji + '</span> ／ <span class="ta">' + pattern.ta + '</span></div><div class="cheat-rule">' + pattern.rule + '</div><div class="cheat-ex">例: ' + examples + "</div></div>";
    }).join("");
    Array.prototype.forEach.call($("cheat-body").querySelectorAll(".cheat-row"), function (row) { row.onclick = function () { $("study-pattern").value = row.getAttribute("data-pat"); renderStudy(); $("study-search").scrollIntoView({ block: "nearest" }); }; });
  }
  function renderStudy() {
    var query = norm($("study-search").value).toLowerCase(), pattern = $("study-pattern").value, tier = $("study-tier").value;
    var rows = PAIRS.filter(function (p) {
      if (pattern && p.pat !== pattern) return false; if (tier !== "all" && p.tier !== tier) return false;
      return !query || [p.ji.w, p.ji.r, p.ta.w, p.ta.r, p.en].join(" ").toLowerCase().indexOf(query) >= 0;
    });
    $("study-count").textContent = rows.length + " / " + PAIRS.length + " pairs";
    var box = $("study-rows"); box.className = $("study-hide-en").checked ? "hide-en" : "";
    box.innerHTML = rows.map(function (p) {
      var s = statFor(pairKey(p)), status = isAutomatic(s) ? '<span class="status-pill solid">automatic</span>' : isWeak(s) ? '<span class="status-pill weak">weak</span>' : "";
      return '<div class="wl-row"><div class="wl-ji">' + J.toRuby(p.ji.fz) + '<button class="speak" data-say="' + J.toKana(p.ji.fz) + '" aria-label="Listen">🔊</button></div><div class="wl-ta">' + J.toRuby(p.ta.fz) + '<button class="speak" data-say="' + J.toKana(p.ta.fz) + '" aria-label="Listen">🔊</button></div><div class="wl-en">' + p.en + '<div class="meta"><span class="level-pill ' + p.tier + '">' + (p.tier === "n2" ? "N2 focus" : "core") + "</span>" + status + "</div></div></div>";
    }).join("");
    Array.prototype.forEach.call(box.querySelectorAll(".speak"), function (button) { button.onclick = function () { speak(button.getAttribute("data-say")); }; });
  }
  function updatePool() {
    var settings = readSettings(), pairs = filteredPairs(settings), contexts = filteredContexts(settings, pairs);
    $("pool").textContent = pairs.length + " pairs" + (settings.modes.context ? " · " + contexts.length + " sentence cues" : "");
  }

  // ---- wiring -----------------------------------------------------------
  function wire() {
    fillPatternSelect($("pattern")); fillPatternSelect($("study-pattern")); renderCheat(); renderDashboard(); updatePool();
    var exam = new Date("2026-12-06T00:00:00+09:00"), days = Math.ceil((exam - new Date()) / 86400000);
    $("exam-days").textContent = days > 0 ? days + " days" : (days === 0 ? "today" : "checkpoint passed");
    var rate = loadPref("rate"); if (rate) $("rate").value = rate;
    $("rate-val").textContent = parseFloat($("rate").value).toFixed(1) + "×";
    if (loadPref("speak") === "1") $("d-speak").checked = true;
    if (loadPref("speakPrompt") === "1") $("d-speak-prompt").checked = true;
    populateVoices(); if (window.speechSynthesis) speechSynthesis.onvoiceschanged = populateVoices;
    $("voice").onchange = function () { savePref("voiceURI", this.value); };
    $("voice-test").onclick = function () { speak("電気が消えます。電気を消します。"); };
    $("rate").oninput = function () { $("rate-val").textContent = parseFloat(this.value).toFixed(1) + "×"; savePref("rate", this.value); };
    $("d-speak").onchange = function () { savePref("speak", this.checked ? "1" : "0"); };
    $("d-speak-prompt").onchange = function () { savePref("speakPrompt", this.checked ? "1" : "0"); };
    $("d-kana").onchange = function () { $("d-furigana").disabled = this.checked; };
    ["tier", "pattern", "m-context", "m-pair", "m-particle", "m-compose", "m-identify"].forEach(function (id) { $(id).addEventListener("change", updatePool); });
    Array.prototype.forEach.call(document.querySelectorAll("[data-preset]"), function (button) { button.onclick = function () { applyPreset(button.getAttribute("data-preset")); }; });
    $("start").onclick = start; $("open-study").onclick = function () { show("studylist"); renderStudy(); $("study-search").focus(); };
    $("study-home").onclick = function () { show("setup"); };
    $("study-search").oninput = renderStudy; $("study-pattern").onchange = renderStudy; $("study-tier").onchange = renderStudy; $("study-hide-en").onchange = renderStudy;
    $("study-start").onclick = function () {
      $("tier").value = $("study-tier").value; $("pattern").value = $("study-pattern").value;
      var settings = readSettings();
      settings.search = norm($("study-search").value).toLowerCase();
      settings.modes = { pair: true };
      updatePool(); runWith(settings);
    };
    $("q-skip").onclick = function () {
      if (answered) return;
      $("q-answer").disabled = true;
      reveal(false, queue[idx]);
    };
    $("q-submit").onclick = submitText; $("q-next").onclick = next; $("c-ji").onclick = function () { choose("ji"); }; $("c-ta").onclick = function () { choose("ta"); };
    $("q-home").onclick = function () { if (window.speechSynthesis) speechSynthesis.cancel(); show("setup"); }; $("q-restart").onclick = function () { if (currentSettings) runWith(currentSettings); };
    $("restart-same").onclick = function () { if (currentSettings) runWith(currentSettings); }; $("restart").onclick = function () { show("setup"); };
    document.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" || event.isComposing || event.keyCode === 229 || $("quiz").classList.contains("hidden")) return;
      if (event.target.closest("button, select, summary, a")) return;
      event.preventDefault(); if (answered) next(); else if (!queue[idx].choices) submitText();
    });
  }

  wire();
})();
