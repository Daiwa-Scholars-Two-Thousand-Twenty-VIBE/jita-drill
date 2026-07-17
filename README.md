# 自他動詞ドリル — Transitive / Intransitive Drill

A self-contained static web drill for **self-move (自動詞, intransitive, が)** vs
**other-move (他動詞, transitive, を)** verb pairs.

**▶ Practise:** <https://daiwa-scholars-two-thousand-twenty-vibe.github.io/jita-drill/>

Conceptually inspired by [Don's Conjugation Drill](https://wkdonc.github.io/conjugation/drill.html),
but **no code is shared with it** — 自他 pairing is a *lexical* relationship, not
a conjugation, so none of Don's rules engine applies here. Everything in this
repo (dataset, conjugation engine, UI) is original, written from scratch, and
[MIT-licensed](LICENSE) — fork it, use it, build on it.

## Run it
No build step, no dependencies.
- **Just open `index.html`** in a browser (works straight from `file://`), or
- Serve it from this folder: `python3 -m http.server 8765` → <http://localhost:8765/>

Tests for the conjugation engine: `node test_conjugate.js`.

## Study list (self-study before drilling)
**📖 単語リスト · Study the pairs first** opens a browsable table of all pairs:
自動詞 (が) | 他動詞 (を) | meaning, each with furigana and a per-word 🔊 button.
Search filters by kanji / kana / English; **Hide meanings** turns it into a
self-test. Jump straight into a drill from there.

## Pairing patterns (rules cheat-sheet + per-pattern drilling)
Every pair carries a `pat` tag (see `window.PATTERNS` in `pairs.js`). This powers:
- **📐 自他のパターン cheat-sheet** at the top of the study screen — each pattern's
  rule, reliability badge, live examples, and a **▶ drill these** button. The
  ⚠️ "exception" card is the -える/-う trap where -える is *intransitive*.
- **Pattern filter** on the setup screen (and the study list) — restrict the
  drill to one pattern, e.g. grind only the -ある/-える set or only the trap set.
- Click any cheat-sheet row to filter the study list to that pattern.

## Four drill modes
1. **Pair production** — shown 開く (自) → produce the partner 開ける (他), both directions.
2. **Particle fill-in-blank** — ドアが ___ / ドアを ___ → choose the member by the が/を cue.
3. **Compose with conjugation** — pick the partner *and* conjugate it (past, て, potential…).
4. **Identify 自/他** — tag a verb self/other-move (recognition warm-up).

During a drill: **⌂ Home** (back to setup) and **↺ Restart set** are always available;
the results screen offers **↺ Try again (same settings)**. After each answer the
feedback shows the が/を **example-sentence contrast** (自 〜が… / 他 〜を…, polite
form) with a 🔊 on each line. Japanese-input note: pressing Enter to *confirm* an
IME conversion never advances the question (an `isComposing` guard), so committed
text can't leak into the next box.

## Audio / voice mode
- **Voice picker** lists the installed Japanese (ja-*) system voices; **🔊 Test** previews.
- **Speed** slider (0.5–1.5×). Voice + speed + speak toggles persist via localStorage.
- **Auto-speak prompts** and **Auto-speak answers** toggles, plus an always-on 🔊 replay
  button on every prompt and revealed answer. Particle mode speaks the full example sentence.
- No Japanese voice installed? macOS: System Settings → Accessibility → Spoken Content → Voices → 日本語.

Display options: furigana (ruby), kana-only. Answers are accepted in kana **or** kanji;
particle mode also accepts the polite (ます) form.

## Files
| file | what |
|------|------|
| `index.html` | markup + screens |
| `style.css`  | styling |
| `conjugate.js` | conjugation engine + furigana parser (godan/ichidan, 9 forms). Also runs in Node. |
| `pairs.js`   | **the dataset** — edit this to add/remove pairs |
| `app.js`     | quiz engine + UI logic |
| `test_conjugate.js` | `node test_conjugate.js` — sanity tests for the engine |

## Adding a pair
Append to `window.PAIRS` in `pairs.js`:

```js
{ ji:{w:"閉まる", fz:"閉[し]まる", r:"しまる", g:"godan"},
  ta:{w:"閉める", fz:"閉[し]める", r:"しめる", g:"ichidan"},
  en:"to close", ex:{n:"窓", nfz:"窓[まど]"}, pat:"aru_eru" },
```

- `fz` = furigana string: each kanji followed by its reading in `[brackets]`;
  okurigana stay outside the brackets so conjugation can transform them.
- `g` = `"godan"` or `"ichidan"` (get this right — it drives conjugation).
- `ex.n` / `ex.nfz` = the example noun used to build the が/を sentences.
- `pat` = pattern id, one of the `window.PATTERNS` ids in `pairs.js`
  (`aru_eru`, `u_eru`, `eru_u`, `eru_yasu`, `reru_su`, `rasu`, `ru_su`,
  `iru_osu`, `u_kasu`, `irregular`). Feeds the cheat-sheet + pattern filter.

After editing, re-run `node test_conjugate.js` if you touched the engine.

## Licence

[MIT](LICENSE) © 2026 [daignrd](https://github.com/daignrd). The 自他 pair
dataset, conjugation engine and UI are all original work — fork it, use it,
build on it.
