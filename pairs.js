/*
 * 自他動詞ペア データセット (core + N2-focus expansion)
 * ---------------------------------------------------------------------------
 * Editable: add/remove pairs freely. Each entry:
 *   ji  = 自動詞 (intransitive, "self-move")  — takes が
 *   ta  = 他動詞 (transitive,   "other-move") — takes を
 *   en  = English gloss
 *   ex  = example noun used to build sentences:  「{n}が ___」 / 「{n}を ___」
 *   pat = pairing-pattern id (see window.PATTERNS below) — drives the cheat
 *         sheet and the "drill one pattern" filter.
 *
 * Furigana format (fz): each kanji is followed by its reading in [brackets].
 *   "開[あ]ける"  →  ruby 開(あ)+ ける  ;  kana-only "あける"
 * Trailing kana (okurigana) live OUTSIDE the brackets so the conjugation
 * engine can transform them directly.  g = "godan" | "ichidan".
 */
window.PAIRS = [
  { ji:{w:"開く",   fz:"開[あ]く",       r:"あく",     g:"godan"},   ta:{w:"開ける",   fz:"開[あ]ける",     r:"あける",   g:"ichidan"}, en:"to open",            ex:{n:"ドア",     nfz:"ドア"}, pat:"u_eru" },
  { ji:{w:"閉まる", fz:"閉[し]まる",     r:"しまる",   g:"godan"},   ta:{w:"閉める",   fz:"閉[し]める",     r:"しめる",   g:"ichidan"}, en:"to close",           ex:{n:"窓",       nfz:"窓[まど]"}, pat:"aru_eru" },
  { ji:{w:"始まる", fz:"始[はじ]まる",   r:"はじまる", g:"godan"},   ta:{w:"始める",   fz:"始[はじ]める",   r:"はじめる", g:"ichidan"}, en:"to begin",           ex:{n:"授業",     nfz:"授[じゅ]業[ぎょう]"}, pat:"aru_eru" },
  { ji:{w:"終わる", fz:"終[お]わる",     r:"おわる",   g:"godan"},   ta:{w:"終える",   fz:"終[お]える",     r:"おえる",   g:"ichidan"}, en:"to finish",          ex:{n:"仕事",     nfz:"仕[し]事[ごと]"}, pat:"aru_eru" },
  { ji:{w:"入る",   fz:"入[はい]る",     r:"はいる",   g:"godan"},   ta:{w:"入れる",   fz:"入[い]れる",     r:"いれる",   g:"ichidan"}, en:"to enter / put in",  ex:{n:"お金",     nfz:"お金[かね]"}, pat:"irregular" },
  { ji:{w:"出る",   fz:"出[で]る",       r:"でる",     g:"ichidan"}, ta:{w:"出す",     fz:"出[だ]す",       r:"だす",     g:"godan"},   en:"to exit / take out", ex:{n:"ごみ",     nfz:"ごみ"}, pat:"irregular" },
  { ji:{w:"上がる", fz:"上[あ]がる",     r:"あがる",   g:"godan"},   ta:{w:"上げる",   fz:"上[あ]げる",     r:"あげる",   g:"ichidan"}, en:"to rise / raise",    ex:{n:"値段",     nfz:"値[ね]段[だん]"}, pat:"aru_eru" },
  { ji:{w:"下がる", fz:"下[さ]がる",     r:"さがる",   g:"godan"},   ta:{w:"下げる",   fz:"下[さ]げる",     r:"さげる",   g:"ichidan"}, en:"to fall / lower",    ex:{n:"気温",     nfz:"気[き]温[おん]"}, pat:"aru_eru" },
  { ji:{w:"集まる", fz:"集[あつ]まる",   r:"あつまる", g:"godan"},   ta:{w:"集める",   fz:"集[あつ]める",   r:"あつめる", g:"ichidan"}, en:"to gather",          ex:{n:"人",       nfz:"人[ひと]"}, pat:"aru_eru" },
  { ji:{w:"決まる", fz:"決[き]まる",     r:"きまる",   g:"godan"},   ta:{w:"決める",   fz:"決[き]める",     r:"きめる",   g:"ichidan"}, en:"to be decided / decide", ex:{n:"予定", nfz:"予[よ]定[てい]"}, pat:"aru_eru" },
  { ji:{w:"変わる", fz:"変[か]わる",     r:"かわる",   g:"godan"},   ta:{w:"変える",   fz:"変[か]える",     r:"かえる",   g:"ichidan"}, en:"to change",          ex:{n:"色",       nfz:"色[いろ]"}, pat:"aru_eru" },
  { ji:{w:"止まる", fz:"止[と]まる",     r:"とまる",   g:"godan"},   ta:{w:"止める",   fz:"止[と]める",     r:"とめる",   g:"ichidan"}, en:"to stop",            ex:{n:"車",       nfz:"車[くるま]"}, pat:"aru_eru" },
  { ji:{w:"見つかる",fz:"見[み]つかる",  r:"みつかる", g:"godan"},   ta:{w:"見つける", fz:"見[み]つける",   r:"みつける", g:"ichidan"}, en:"to be found / find", ex:{n:"鍵",       nfz:"鍵[かぎ]"}, pat:"aru_eru" },
  { ji:{w:"落ちる", fz:"落[お]ちる",     r:"おちる",   g:"ichidan"}, ta:{w:"落とす",   fz:"落[お]とす",     r:"おとす",   g:"godan"},   en:"to fall / drop",     ex:{n:"財布",     nfz:"財[さい]布[ふ]"}, pat:"iru_osu" },
  { ji:{w:"起きる", fz:"起[お]きる",     r:"おきる",   g:"ichidan"}, ta:{w:"起こす",   fz:"起[お]こす",     r:"おこす",   g:"godan"},   en:"to wake up / wake",  ex:{n:"子供",     nfz:"子[こ]供[ども]"}, pat:"iru_osu" },
  { ji:{w:"並ぶ",   fz:"並[なら]ぶ",     r:"ならぶ",   g:"godan"},   ta:{w:"並べる",   fz:"並[なら]べる",   r:"ならべる", g:"ichidan"}, en:"to line up",         ex:{n:"いす",     nfz:"いす"}, pat:"u_eru" },
  { ji:{w:"続く",   fz:"続[つづ]く",     r:"つづく",   g:"godan"},   ta:{w:"続ける",   fz:"続[つづ]ける",   r:"つづける", g:"ichidan"}, en:"to continue",        ex:{n:"話",       nfz:"話[はなし]"}, pat:"u_eru" },
  { ji:{w:"付く",   fz:"付[つ]く",       r:"つく",     g:"godan"},   ta:{w:"付ける",   fz:"付[つ]ける",     r:"つける",   g:"ichidan"}, en:"to be attached / attach / turn on", ex:{n:"電気", nfz:"電[でん]気[き]"}, pat:"u_eru" },
  { ji:{w:"消える", fz:"消[き]える",     r:"きえる",   g:"ichidan"}, ta:{w:"消す",     fz:"消[け]す",       r:"けす",     g:"godan"},   en:"to go out / turn off / erase", ex:{n:"火", nfz:"火[ひ]"}, pat:"irregular" },
  { ji:{w:"割れる", fz:"割[わ]れる",     r:"われる",   g:"ichidan"}, ta:{w:"割る",     fz:"割[わ]る",       r:"わる",     g:"godan"},   en:"to break / split",   ex:{n:"お皿",     nfz:"お皿[さら]"}, pat:"eru_u" },
  { ji:{w:"切れる", fz:"切[き]れる",     r:"きれる",   g:"ichidan"}, ta:{w:"切る",     fz:"切[き]る",       r:"きる",     g:"godan"},   en:"to be cut / cut",    ex:{n:"糸",       nfz:"糸[いと]"}, pat:"eru_u" },
  { ji:{w:"折れる", fz:"折[お]れる",     r:"おれる",   g:"ichidan"}, ta:{w:"折る",     fz:"折[お]る",       r:"おる",     g:"godan"},   en:"to snap / break / fold", ex:{n:"枝",   nfz:"枝[えだ]"}, pat:"eru_u" },
  { ji:{w:"取れる", fz:"取[と]れる",     r:"とれる",   g:"ichidan"}, ta:{w:"取る",     fz:"取[と]る",       r:"とる",     g:"godan"},   en:"to come off / take",  ex:{n:"ボタン",  nfz:"ボタン"}, pat:"eru_u" },
  { ji:{w:"焼ける", fz:"焼[や]ける",     r:"やける",   g:"ichidan"}, ta:{w:"焼く",     fz:"焼[や]く",       r:"やく",     g:"godan"},   en:"to burn / bake / grill", ex:{n:"パン", nfz:"パン"}, pat:"eru_u" },
  { ji:{w:"沸く",   fz:"沸[わ]く",       r:"わく",     g:"godan"},   ta:{w:"沸かす",   fz:"沸[わ]かす",     r:"わかす",   g:"godan"},   en:"to boil",            ex:{n:"お湯",     nfz:"お湯[ゆ]"}, pat:"u_kasu" },
  { ji:{w:"立つ",   fz:"立[た]つ",       r:"たつ",     g:"godan"},   ta:{w:"立てる",   fz:"立[た]てる",     r:"たてる",   g:"ichidan"}, en:"to stand / set up",  ex:{n:"旗",       nfz:"旗[はた]"}, pat:"u_eru" },
  { ji:{w:"建つ",   fz:"建[た]つ",       r:"たつ",     g:"godan"},   ta:{w:"建てる",   fz:"建[た]てる",     r:"たてる",   g:"ichidan"}, en:"to be built / build", ex:{n:"家",      nfz:"家[いえ]"}, pat:"u_eru" },
  { ji:{w:"直る",   fz:"直[なお]る",     r:"なおる",   g:"godan"},   ta:{w:"直す",     fz:"直[なお]す",     r:"なおす",   g:"godan"},   en:"to be fixed / fix",  ex:{n:"車",       nfz:"車[くるま]"}, pat:"ru_su" },
  { ji:{w:"増える", fz:"増[ふ]える",     r:"ふえる",   g:"ichidan"}, ta:{w:"増やす",   fz:"増[ふ]やす",     r:"ふやす",   g:"godan"},   en:"to increase",        ex:{n:"人口",     nfz:"人[じん]口[こう]"}, pat:"eru_yasu" },
  { ji:{w:"減る",   fz:"減[へ]る",       r:"へる",     g:"godan"},   ta:{w:"減らす",   fz:"減[へ]らす",     r:"へらす",   g:"godan"},   en:"to decrease",        ex:{n:"体重",     nfz:"体[たい]重[じゅう]"}, pat:"rasu" },
  { ji:{w:"動く",   fz:"動[うご]く",     r:"うごく",   g:"godan"},   ta:{w:"動かす",   fz:"動[うご]かす",   r:"うごかす", g:"godan"},   en:"to move",            ex:{n:"体",       nfz:"体[からだ]"}, pat:"u_kasu" },
  { ji:{w:"届く",   fz:"届[とど]く",     r:"とどく",   g:"godan"},   ta:{w:"届ける",   fz:"届[とど]ける",   r:"とどける", g:"ichidan"}, en:"to reach / deliver", ex:{n:"荷物",     nfz:"荷[に]物[もつ]"}, pat:"u_eru" },
  { ji:{w:"戻る",   fz:"戻[もど]る",     r:"もどる",   g:"godan"},   ta:{w:"戻す",     fz:"戻[もど]す",     r:"もどす",   g:"godan"},   en:"to return / put back", ex:{n:"本",     nfz:"本[ほん]"}, pat:"ru_su" },
  { ji:{w:"回る",   fz:"回[まわ]る",     r:"まわる",   g:"godan"},   ta:{w:"回す",     fz:"回[まわ]す",     r:"まわす",   g:"godan"},   en:"to turn / spin",     ex:{n:"ハンドル", nfz:"ハンドル"}, pat:"ru_su" },
  { ji:{w:"残る",   fz:"残[のこ]る",     r:"のこる",   g:"godan"},   ta:{w:"残す",     fz:"残[のこ]す",     r:"のこす",   g:"godan"},   en:"to remain / leave behind", ex:{n:"ご飯", nfz:"ご飯[はん]"}, pat:"ru_su" },
  { ji:{w:"進む",   fz:"進[すす]む",     r:"すすむ",   g:"godan"},   ta:{w:"進める",   fz:"進[すす]める",   r:"すすめる", g:"ichidan"}, en:"to advance",         ex:{n:"仕事",     nfz:"仕[し]事[ごと]"}, pat:"u_eru" },
  { ji:{w:"通る",   fz:"通[とお]る",     r:"とおる",   g:"godan"},   ta:{w:"通す",     fz:"通[とお]す",     r:"とおす",   g:"godan"},   en:"to pass through / let through", ex:{n:"車", nfz:"車[くるま]"}, pat:"ru_su" },
  { ji:{w:"育つ",   fz:"育[そだ]つ",     r:"そだつ",   g:"godan"},   ta:{w:"育てる",   fz:"育[そだ]てる",   r:"そだてる", g:"ichidan"}, en:"to grow / raise",    ex:{n:"野菜",     nfz:"野[や]菜[さい]"}, pat:"u_eru" },
  { ji:{w:"冷える", fz:"冷[ひ]える",     r:"ひえる",   g:"ichidan"}, ta:{w:"冷やす",   fz:"冷[ひ]やす",     r:"ひやす",   g:"godan"},   en:"to cool down / chill", ex:{n:"ビール", nfz:"ビール"}, pat:"eru_yasu" },
  { ji:{w:"温まる", fz:"温[あたた]まる", r:"あたたまる",g:"godan"},  ta:{w:"温める",   fz:"温[あたた]める", r:"あたためる",g:"ichidan"},en:"to warm up",         ex:{n:"料理",     nfz:"料[りょう]理[り]"}, pat:"aru_eru" },
  { ji:{w:"汚れる", fz:"汚[よご]れる",   r:"よごれる", g:"ichidan"}, ta:{w:"汚す",     fz:"汚[よご]す",     r:"よごす",   g:"godan"},   en:"to get dirty / dirty", ex:{n:"服",     nfz:"服[ふく]"}, pat:"reru_su" },
  { ji:{w:"壊れる", fz:"壊[こわ]れる",   r:"こわれる", g:"ichidan"}, ta:{w:"壊す",     fz:"壊[こわ]す",     r:"こわす",   g:"godan"},   en:"to break (down)",    ex:{n:"機械",     nfz:"機[き]械[かい]"}, pat:"reru_su" },
  { ji:{w:"濡れる", fz:"濡[ぬ]れる",     r:"ぬれる",   g:"ichidan"}, ta:{w:"濡らす",   fz:"濡[ぬ]らす",     r:"ぬらす",   g:"godan"},   en:"to get wet / wet",   ex:{n:"服",       nfz:"服[ふく]"}, pat:"rasu" },
  { ji:{w:"揺れる", fz:"揺[ゆ]れる",     r:"ゆれる",   g:"ichidan"}, ta:{w:"揺らす",   fz:"揺[ゆ]らす",     r:"ゆらす",   g:"godan"},   en:"to sway / shake",    ex:{n:"木",       nfz:"木[き]"}, pat:"rasu" },
  { ji:{w:"流れる", fz:"流[なが]れる",   r:"ながれる", g:"ichidan"}, ta:{w:"流す",     fz:"流[なが]す",     r:"ながす",   g:"godan"},   en:"to flow / pour",     ex:{n:"水",       nfz:"水[みず]"}, pat:"reru_su" },
  { ji:{w:"燃える", fz:"燃[も]える",     r:"もえる",   g:"ichidan"}, ta:{w:"燃やす",   fz:"燃[も]やす",     r:"もやす",   g:"godan"},   en:"to burn",            ex:{n:"ごみ",     nfz:"ごみ"}, pat:"eru_yasu" },
];

// The original 46-pair set is the repair layer: high-frequency N4/N3 forms
// that still underpin N2 sentence choice. JLPT publishes no official vocab
// list, so the expansion below is deliberately labelled "N2 focus": pairs
// selected for formal reading, abstract change, and the project's SKM lesson 4.
window.PAIRS.forEach(function (p) { p.tier = "core"; });

window.PAIRS.push(
  { ji:{w:"空く",     fz:"空[あ]く",         r:"あく",       g:"godan"},   ta:{w:"空ける",   fz:"空[あ]ける",       r:"あける",     g:"ichidan"}, en:"to become vacant / make room",        ex:{n:"席",       nfz:"席[せき]"}, pat:"u_eru", tier:"n2" },
  { ji:{w:"混ざる",   fz:"混[ま]ざる",       r:"まざる",     g:"godan"},   ta:{w:"混ぜる",   fz:"混[ま]ぜる",       r:"まぜる",     g:"ichidan"}, en:"to become mixed / mix",               ex:{n:"材料",     nfz:"材[ざい]料[りょう]"}, pat:"aru_eru", tier:"n2" },
  { ji:{w:"広がる",   fz:"広[ひろ]がる",     r:"ひろがる",   g:"godan"},   ta:{w:"広げる",   fz:"広[ひろ]げる",     r:"ひろげる",   g:"ichidan"}, en:"to spread / expand something",        ex:{n:"影響",     nfz:"影[えい]響[きょう]"}, pat:"aru_eru", tier:"n2" },
  { ji:{w:"固まる",   fz:"固[かた]まる",     r:"かたまる",   g:"godan"},   ta:{w:"固める",   fz:"固[かた]める",     r:"かためる",   g:"ichidan"}, en:"to become firm / firm up",            ex:{n:"方針",     nfz:"方[ほう]針[しん]"}, pat:"aru_eru", tier:"n2" },
  { ji:{w:"高まる",   fz:"高[たか]まる",     r:"たかまる",   g:"godan"},   ta:{w:"高める",   fz:"高[たか]める",     r:"たかめる",   g:"ichidan"}, en:"to intensify / heighten",              ex:{n:"関心",     nfz:"関[かん]心[しん]"}, pat:"aru_eru", tier:"n2" },
  { ji:{w:"深まる",   fz:"深[ふか]まる",     r:"ふかまる",   g:"godan"},   ta:{w:"深める",   fz:"深[ふか]める",     r:"ふかめる",   g:"ichidan"}, en:"to deepen / deepen something",        ex:{n:"理解",     nfz:"理[り]解[かい]"}, pat:"aru_eru", tier:"n2" },
  { ji:{w:"強まる",   fz:"強[つよ]まる",     r:"つよまる",   g:"godan"},   ta:{w:"強める",   fz:"強[つよ]める",     r:"つよめる",   g:"ichidan"}, en:"to grow stronger / strengthen",        ex:{n:"規制",     nfz:"規[き]制[せい]"}, pat:"aru_eru", tier:"n2" },
  { ji:{w:"弱まる",   fz:"弱[よわ]まる",     r:"よわまる",   g:"godan"},   ta:{w:"弱める",   fz:"弱[よわ]める",     r:"よわめる",   g:"ichidan"}, en:"to weaken / weaken something",        ex:{n:"効果",     nfz:"効[こう]果[か]"}, pat:"aru_eru", tier:"n2" },
  { ji:{w:"定まる",   fz:"定[さだ]まる",     r:"さだまる",   g:"godan"},   ta:{w:"定める",   fz:"定[さだ]める",     r:"さだめる",   g:"ichidan"}, en:"to become fixed / establish",          ex:{n:"方針",     nfz:"方[ほう]針[しん]"}, pat:"aru_eru", tier:"n2" },
  { ji:{w:"収まる",   fz:"収[おさ]まる",     r:"おさまる",   g:"godan"},   ta:{w:"収める",   fz:"収[おさ]める",     r:"おさめる",   g:"ichidan"}, en:"to settle / bring under control",      ex:{n:"混乱",     nfz:"混[こん]乱[らん]"}, pat:"aru_eru", tier:"n2" },
  { ji:{w:"改まる",   fz:"改[あらた]まる",   r:"あらたまる", g:"godan"},   ta:{w:"改める",   fz:"改[あらた]める",   r:"あらためる", g:"ichidan"}, en:"to be renewed / revise",                ex:{n:"制度",     nfz:"制[せい]度[ど]"}, pat:"aru_eru", tier:"n2" },
  { ji:{w:"備わる",   fz:"備[そな]わる",     r:"そなわる",   g:"godan"},   ta:{w:"備える",   fz:"備[そな]える",     r:"そなえる",   g:"ichidan"}, en:"to be equipped / provide",             ex:{n:"機能",     nfz:"機[き]能[のう]"}, pat:"aru_eru", tier:"n2" },
  { ji:{w:"整う",     fz:"整[ととの]う",     r:"ととのう",   g:"godan"},   ta:{w:"整える",   fz:"整[ととの]える",   r:"ととのえる", g:"ichidan"}, en:"to be ready / put in order",            ex:{n:"準備",     nfz:"準[じゅん]備[び]"}, pat:"u_eru", tier:"n2" },
  { ji:{w:"倒れる",   fz:"倒[たお]れる",     r:"たおれる",   g:"ichidan"}, ta:{w:"倒す",     fz:"倒[たお]す",       r:"たおす",     g:"godan"},   en:"to fall over / knock down",            ex:{n:"木",       nfz:"木[き]"}, pat:"reru_su", tier:"n2" },
  { ji:{w:"外れる",   fz:"外[はず]れる",     r:"はずれる",   g:"ichidan"}, ta:{w:"外す",     fz:"外[はず]す",       r:"はずす",     g:"godan"},   en:"to come off / remove",                  ex:{n:"ボタン",   nfz:"ボタン"}, pat:"reru_su", tier:"n2" },
  { ji:{w:"隠れる",   fz:"隠[かく]れる",     r:"かくれる",   g:"ichidan"}, ta:{w:"隠す",     fz:"隠[かく]す",       r:"かくす",     g:"godan"},   en:"to be hidden / conceal",                ex:{n:"姿",       nfz:"姿[すがた]"}, pat:"reru_su", tier:"n2" },
  { ji:{w:"乱れる",   fz:"乱[みだ]れる",     r:"みだれる",   g:"ichidan"}, ta:{w:"乱す",     fz:"乱[みだ]す",       r:"みだす",     g:"godan"},   en:"to fall into disorder / disrupt",       ex:{n:"秩序",     nfz:"秩[ちつ]序[じょ]"}, pat:"reru_su", tier:"n2" },
  { ji:{w:"崩れる",   fz:"崩[くず]れる",     r:"くずれる",   g:"ichidan"}, ta:{w:"崩す",     fz:"崩[くず]す",       r:"くずす",     g:"godan"},   en:"to collapse / break down",              ex:{n:"バランス", nfz:"バランス"}, pat:"reru_su", tier:"n2" },
  { ji:{w:"離れる",   fz:"離[はな]れる",     r:"はなれる",   g:"ichidan"}, ta:{w:"離す",     fz:"離[はな]す",       r:"はなす",     g:"godan"},   en:"to separate / separate something",      ex:{n:"手",       nfz:"手[て]"}, pat:"reru_su", tier:"n2" },
  { ji:{w:"解ける",   fz:"解[と]ける",       r:"とける",     g:"ichidan"}, ta:{w:"解く",     fz:"解[と]く",         r:"とく",       g:"godan"},   en:"to become solved / solve",              ex:{n:"問題",     nfz:"問[もん]題[だい]"}, pat:"eru_u", tier:"n2" },
  { ji:{w:"溶ける",   fz:"溶[と]ける",       r:"とける",     g:"ichidan"}, ta:{w:"溶かす",   fz:"溶[と]かす",       r:"とかす",     g:"godan"},   en:"to melt / melt something",              ex:{n:"チョコ",   nfz:"チョコ"}, pat:"irregular", tier:"n2" },
  { ji:{w:"逃げる",   fz:"逃[に]げる",       r:"にげる",     g:"ichidan"}, ta:{w:"逃がす",   fz:"逃[に]がす",       r:"にがす",     g:"godan"},   en:"to escape / let escape",                ex:{n:"魚",       nfz:"魚[さかな]"}, pat:"irregular", tier:"n2" },
  { ji:{w:"散る",     fz:"散[ち]る",         r:"ちる",       g:"godan"},   ta:{w:"散らす",   fz:"散[ち]らす",       r:"ちらす",     g:"godan"},   en:"to scatter / scatter something",        ex:{n:"花びら",   nfz:"花[はな]びら"}, pat:"rasu", tier:"n2" },
  { ji:{w:"伸びる",   fz:"伸[の]びる",       r:"のびる",     g:"ichidan"}, ta:{w:"伸ばす",   fz:"伸[の]ばす",       r:"のばす",     g:"godan"},   en:"to grow / extend",                      ex:{n:"売上",     nfz:"売[うり]上[あげ]"}, pat:"irregular", tier:"n2" },
  { ji:{w:"浮かぶ",   fz:"浮[う]かぶ",       r:"うかぶ",     g:"godan"},   ta:{w:"浮かべる", fz:"浮[う]かべる",     r:"うかべる",   g:"ichidan"}, en:"to float / bring to mind or face",     ex:{n:"笑顔",     nfz:"笑[え]顔[がお]"}, pat:"u_eru", tier:"n2" },
  { ji:{w:"沈む",     fz:"沈[しず]む",       r:"しずむ",     g:"godan"},   ta:{w:"沈める",   fz:"沈[しず]める",     r:"しずめる",   g:"ichidan"}, en:"to sink / submerge",                    ex:{n:"船",       nfz:"船[ふね]"}, pat:"u_eru", tier:"n2" },
  { ji:{w:"伝わる",   fz:"伝[つた]わる",     r:"つたわる",   g:"godan"},   ta:{w:"伝える",   fz:"伝[つた]える",     r:"つたえる",   g:"ichidan"}, en:"to get across / convey",                ex:{n:"気持ち",   nfz:"気[き]持[も]ち"}, pat:"aru_eru", tier:"n2" },
  { ji:{w:"つながる", fz:"つながる",         r:"つながる",   g:"godan"},   ta:{w:"つなげる", fz:"つなげる",         r:"つなげる",   g:"ichidan"}, en:"to be connected / connect",            ex:{n:"回線",     nfz:"回[かい]線[せん]"}, pat:"aru_eru", tier:"n2" },
  { ji:{w:"重なる",   fz:"重[かさ]なる",     r:"かさなる",   g:"godan"},   ta:{w:"重ねる",   fz:"重[かさ]ねる",     r:"かさねる",   g:"ichidan"}, en:"to overlap / accumulate",               ex:{n:"色",       nfz:"色[いろ]"}, pat:"aru_eru", tier:"n2" },
  { ji:{w:"分かれる", fz:"分[わ]かれる",     r:"わかれる",   g:"ichidan"}, ta:{w:"分ける",   fz:"分[わ]ける",       r:"わける",     g:"ichidan"}, en:"to split up / divide",                  ex:{n:"グループ", nfz:"グループ"}, pat:"irregular", tier:"n2" },
  { ji:{w:"曲がる",   fz:"曲[ま]がる",       r:"まがる",     g:"godan"},   ta:{w:"曲げる",   fz:"曲[ま]げる",       r:"まげる",     g:"ichidan"}, en:"to bend / bend something",              ex:{n:"針金",     nfz:"針[はり]金[がね]"}, pat:"aru_eru", tier:"n2" },
  { ji:{w:"加わる",   fz:"加[くわ]わる",     r:"くわわる",   g:"godan"},   ta:{w:"加える",   fz:"加[くわ]える",     r:"くわえる",   g:"ichidan"}, en:"to be added / add",                     ex:{n:"変更",     nfz:"変[へん]更[こう]"}, pat:"aru_eru", tier:"n2" },
  { ji:{w:"埋まる",   fz:"埋[う]まる",       r:"うまる",     g:"godan"},   ta:{w:"埋める",   fz:"埋[う]める",       r:"うめる",     g:"ichidan"}, en:"to be filled / fill",                   ex:{n:"空欄",     nfz:"空[くう]欄[らん]"}, pat:"aru_eru", tier:"n2" },
  { ji:{w:"片付く",   fz:"片[かた]付[づ]く", r:"かたづく",   g:"godan"},   ta:{w:"片付ける", fz:"片[かた]付[づ]ける",r:"かたづける", g:"ichidan"}, en:"to be settled / put in order",          ex:{n:"仕事",     nfz:"仕[し]事[ごと]"}, pat:"u_eru", tier:"n2" },
  { ji:{w:"傾く",     fz:"傾[かたむ]く",     r:"かたむく",   g:"godan"},   ta:{w:"傾ける",   fz:"傾[かたむ]ける",   r:"かたむける", g:"ichidan"}, en:"to tilt / incline",                      ex:{n:"体",       nfz:"体[からだ]"}, pat:"u_eru", tier:"n2" },
  { ji:{w:"無くなる", fz:"無[な]くなる",     r:"なくなる",   g:"godan"},   ta:{w:"無くす",   fz:"無[な]くす",       r:"なくす",     g:"godan"},   en:"to go missing / lose",                   ex:{n:"鍵",       nfz:"鍵[かぎ]"}, pat:"irregular", tier:"n2" }
);

/*
 * Pairing patterns — drives the cheat sheet and the per-pattern drill filter.
 * `rel` is a reliability label; `trap:true` flags the one that breaks the
 * naive "eru = transitive" intuition. Examples are pulled live from PAIRS.
 */
window.PATTERNS = [
  { id:"aru_eru",  sig:"～aる ／ ～eる",          ji:"a-row + る (自)", ta:"e-row + る (他)", rel:"high",
    rule:"A productive vowel-change family: the a-row godan side is usually <b>自</b>, while the e-row ichidan partner is <b>他</b>. Strong cue, not a law." },
  { id:"u_eru",    sig:"～う (五段) ／ ～える",     ji:"-う 五段 (自)",  ta:"-える (他)",  rel:"high",
    rule:"Plain godan = self-mover; the -える partner is transitive." },
  { id:"eru_u",    sig:"～える ／ ～う (五段)",     ji:"-える (自) ⚠️",  ta:"-う 五段 (他)", rel:"the exception", trap:true,
    rule:"In this family, the -える verb is <b>intransitive</b>. Some forms also match a transitive verb's potential: 割れる can mean “break” or “can break”, depending on context. Learn the pair; -える alone does not identify transitivity." },
  { id:"eru_yasu", sig:"～える ／ ～やす",         ji:"-える (自)",     ta:"-やす (他)",  rel:"high",
    rule:"-やす is a -す transitive → 他. The -える side is the self-mover." },
  { id:"reru_su",  sig:"～れる ／ ～す",           ji:"-れる (自)",     ta:"-す (他)",    rel:"high",
    rule:"-す = transitive. The -れる side is the spontaneous self-mover." },
  { id:"rasu",     sig:"～れる・る ／ ～らす",      ji:"-れる/-る (自)", ta:"-らす (他)",  rel:"high",
    rule:"-らす is a -す transitive → 他." },
  { id:"ru_su",    sig:"～る ／ ～す",             ji:"-る 五段 (自)",  ta:"-す (他)",    rel:"high",
    rule:"-す = transitive; the -る godan side is the self-mover." },
  { id:"iru_osu",  sig:"～きる・ちる ／ ～おす",    ji:"-きる/ちる (自)", ta:"-おす (他)",  rel:"high",
    rule:"-おす is a -す transitive → 他." },
  { id:"u_kasu",   sig:"～く ／ ～かす",           ji:"-く (自)",       ta:"-かす (他)",  rel:"high",
    rule:"-かす is a -す transitive → 他." },
  { id:"irregular",sig:"不規則 (memorize)",        ji:"—",              ta:"—",           rel:"memorize",
    rule:"No clean morphological rule — learn these individually." },
];
