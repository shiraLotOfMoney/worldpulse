/* ════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════ */
const CAT_COLOR = {
  conflict:  'var(--conflict)',
  tension:   'var(--tension)',
  political: 'var(--political)',
  economic:  'var(--economic)',
};
const CAT_LABEL = {
  conflict:  '紛争・戦争',
  tension:   '緊張・不安定',
  political: '政治ニュース',
  economic:  '経済ニュース',
};

// key = ISO 3166-1 numeric
const NEWS = {
  // ── CONFLICT ──────────────────────────────
  804: {
    name:'ウクライナ', cat:'conflict', intensity:1.0, pulse:true,
    tags:['紛争','人道危機'],
    summary:'ロシアによる全面侵攻が継続。エネルギーインフラへの攻撃が激化し、人道状況が深刻化している。',
    articles:[
      {cat:'conflict', title:'キーウへのミサイル・ドローン攻撃が連夜続く。防空システムが一部を迎撃', src:'Reuters', time:'30分前'},
      {cat:'conflict', title:'東部前線でロシア軍が局所的に前進、ウクライナ軍が抵抗継続', src:'CNN', time:'2時間前'},
      {cat:'political', title:'ゼレンスキー大統領、欧米首脳に追加支援を要請', src:'BBC', time:'5時間前'},
      {cat:'economic',  title:'EU、ウクライナ復興基金として500億ユーロの拠出を承認', src:'Politico', time:'1日前'},
    ]
  },
  643: {
    name:'ロシア', cat:'conflict', intensity:0.9, pulse:true,
    tags:['紛争','制裁'],
    summary:'ウクライナへの軍事侵攻を継続。西側の制裁強化に対し中国・北朝鮮との連携を深める。',
    articles:[
      {cat:'conflict',  title:'ロシア軍、ウクライナ東部でゆっくりと前進。損失は甚大', src:'WSJ', time:'1時間前'},
      {cat:'political', title:'プーチン大統領、核ドクトリン変更を示唆。西側が強く警戒', src:'Guardian', time:'4時間前'},
      {cat:'economic',  title:'制裁の影響でロシアの石油収入が減少、財政赤字が拡大', src:'FT', time:'8時間前'},
      {cat:'political', title:'北朝鮮兵士をウクライナ前線に投入と米韓が確認', src:'AP', time:'2日前'},
    ]
  },
  376: {
    name:'イスラエル', cat:'conflict', intensity:0.95, pulse:true,
    tags:['紛争','中東'],
    summary:'ガザ地区での軍事作戦が継続。停戦交渉は断続的に続くが合意には至っていない。',
    articles:[
      {cat:'conflict',  title:'ガザ北部への空爆が続く。病院周辺の攻撃に国連が強く懸念', src:'Reuters', time:'45分前'},
      {cat:'political', title:'カタールで停戦交渉が再開。人質解放と引き換えに一時停戦を協議', src:'BBC', time:'3時間前'},
      {cat:'political', title:'ICCがイスラエル政府高官に逮捕状。外交的孤立が深まる', src:'AP', time:'6時間前'},
      {cat:'economic',  title:'イスラエル経済、戦時下でGDP成長が大幅に鈍化', src:'Economist', time:'2日前'},
    ]
  },
  729: {
    name:'スーダン', cat:'conflict', intensity:0.85, pulse:true,
    tags:['紛争','飢饉','人道危機'],
    summary:'軍とRSFの内戦が2023年から継続。世界最大規模の人道危機となっている。',
    articles:[
      {cat:'conflict', title:'スーダン内戦、死者数が推定15万人超に。避難民は1000万人を越えた', src:'UN News', time:'3時間前'},
      {cat:'conflict', title:'ダルフール地方で大規模な民族暴力。集落が焼き払われる', src:'Reuters', time:'6時間前'},
      {cat:'conflict', title:'WFP、飢饉レベルの食料危機が複数地域に拡大と警告', src:'WFP', time:'1日前'},
    ]
  },
  104: {
    name:'ミャンマー', cat:'conflict', intensity:0.8, pulse:true,
    tags:['内戦','民主化'],
    summary:'2021年のクーデター後、内戦が継続。抵抗勢力が主要都市周辺での攻勢を強めている。',
    articles:[
      {cat:'conflict',  title:'少数民族武装勢力の連合体が北部の戦略的要衝を制圧', src:'AFP', time:'4時間前'},
      {cat:'political', title:'軍政、中国との関係強化で制裁に対抗', src:'Reuters', time:'2日前'},
      {cat:'conflict',  title:'国内避難民が300万人超。タイ・インドへの流出も続く', src:'UNHCR', time:'3日前'},
    ]
  },
  887: {
    name:'イエメン', cat:'conflict', intensity:0.75, pulse:true,
    tags:['紛争','紅海危機'],
    summary:'フーシ派が紅海での船舶攻撃を継続。国際海運に深刻な影響が出ている。',
    articles:[
      {cat:'conflict',  title:'フーシ派、商船にドローン・ミサイル攻撃。紅海の通行が困難に', src:'Reuters', time:'2時間前'},
      {cat:'conflict',  title:'米英軍がフーシ派拠点を爆撃。サナア郊外でも空爆', src:'CNN', time:'6時間前'},
      {cat:'political', title:'サウジ仲介の和平交渉は膠着。フーシ派は攻撃停止を拒否', src:'BBC', time:'2日前'},
    ]
  },
  706: {
    name:'ソマリア', cat:'conflict', intensity:0.7, pulse:true,
    tags:['テロ','内戦'],
    summary:'アルシャバブが首都モガディシュや周辺地域でテロ攻撃を継続。',
    articles:[
      {cat:'conflict', title:'アルシャバブが首都ホテルを標的に自爆攻撃。50人以上が死亡', src:'Reuters', time:'5時間前'},
      {cat:'political', title:'AU平和維持軍の段階的撤退開始。治安悪化が懸念される', src:'AFP', time:'3日前'},
    ]
  },
  180: {
    name:'コンゴ民主共和国', cat:'conflict', intensity:0.75, pulse:true,
    tags:['紛争','資源争奪'],
    summary:'M23反乱軍がルワンダの支援を受けて東部主要都市ゴマを制圧。人道危機が深刻化。',
    articles:[
      {cat:'conflict',  title:'M23がゴマ制圧後も南キブ州へ侵攻を拡大', src:'Reuters', time:'1日前'},
      {cat:'political', title:'ルワンダ関与疑惑でアフリカ諸国が仲介に乗り出す', src:'BBC', time:'2日前'},
      {cat:'economic',  title:'コルタン・金など鉱物資源が争いの背景。多国籍企業も注目', src:'FT', time:'4日前'},
    ]
  },

  // ── TENSION ───────────────────────────────
  408: {
    name:'北朝鮮', cat:'tension', intensity:0.85,
    tags:['核・ミサイル','緊張'],
    summary:'核・ICBM開発を継続。ロシアへの兵士派遣と武器供与が確認されている。',
    articles:[
      {cat:'tension',   title:'北朝鮮がICBMを発射実験。推定射程は米本土に到達可能', src:'聯合ニュース', time:'3日前'},
      {cat:'conflict',  title:'北朝鮮兵士1万人以上がロシア・ウクライナ戦線に派遣と米韓が確認', src:'Reuters', time:'4日前'},
      {cat:'political', title:'金正恩、核放棄を否定。核保有国として永続的に認められるよう要求', src:'KCNA Watch', time:'1週間前'},
    ]
  },
  364: {
    name:'イラン', cat:'tension', intensity:0.8,
    tags:['核問題','代理紛争'],
    summary:'核濃縮を兵器級に近い水準まで加速。ハマス・フーシ派など代理勢力を通じた影響力を維持。',
    articles:[
      {cat:'tension',   title:'IAEAがイランの核濃縮量が大幅増加と報告。査察も拒否', src:'Reuters', time:'2日前'},
      {cat:'political', title:'米国・イスラエルがイラン核施設への先制攻撃を協議と報道', src:'NYT', time:'4日前'},
      {cat:'economic',  title:'厳しい制裁下でイランのインフレ率が40%超に', src:'WSJ', time:'5日前'},
    ]
  },
  862: {
    name:'ベネズエラ', cat:'tension', intensity:0.7,
    tags:['政治','人権弾圧'],
    summary:'マドゥロ政権が選挙不正を押し切り続投。反対派への弾圧が強化されている。',
    articles:[
      {cat:'tension',   title:'野党の主要候補者が拘束・追放。国際社会が非難声明', src:'Reuters', time:'3日前'},
      {cat:'political', title:'米国、追加制裁を発動。マドゥロ政権との交渉は決裂', src:'AP', time:'5日前'},
      {cat:'economic',  title:'累計700万人以上が国外脱出。南米で最大規模の難民危機', src:'UNHCR', time:'1週間前'},
    ]
  },
  760: {
    name:'シリア', cat:'tension', intensity:0.65,
    tags:['政治移行','テロ'],
    summary:'アサド政権崩壊後、新暫定政府が統治を試みる。治安安定化とISの残党活動が課題。',
    articles:[
      {cat:'tension',   title:'シリア暫定政府、新憲法制定に向けた国民対話を開始', src:'Reuters', time:'2日前'},
      {cat:'conflict',  title:'IS残党が中部砂漠地帯で活動を再開。政府軍が掃討作戦', src:'AFP', time:'3日前'},
      {cat:'economic',  title:'欧米が制裁を段階的に緩和。復興支援の枠組みを協議', src:'FT', time:'1週間前'},
    ]
  },
  586: {
    name:'パキスタン', cat:'tension', intensity:0.65,
    tags:['政治危機','経済'],
    summary:'イムラン・カーン元首相の収監に伴う政治的混乱が続く。IMFの支援で経済危機を回避。',
    articles:[
      {cat:'tension',   title:'イムラン・カーン、多数の訴追を受け長期収監の可能性', src:'Dawn', time:'3日前'},
      {cat:'economic',  title:'IMFとの協定に基づく改革が進捗。外貨準備高が回復', src:'Reuters', time:'5日前'},
    ]
  },
  4: {
    name:'アフガニスタン', cat:'tension', intensity:0.7,
    tags:['人道危機','タリバン'],
    summary:'タリバン政権下で女性の権利が完全に剥奪。経済は国際支援なしに機能不全が深刻。',
    articles:[
      {cat:'tension',  title:'タリバン、女性の公園・病院・大学への立ち入りを全面禁止', src:'Reuters', time:'4日前'},
      {cat:'economic', title:'経済規模が政変前の半分以下に縮小。失業率は50%超', src:'World Bank', time:'1週間前'},
    ]
  },

  // ── POLITICAL ─────────────────────────────
  840: {
    name:'アメリカ', cat:'political', intensity:0.85,
    tags:['政治','貿易','外交'],
    summary:'政権交代後の急激な政策転換が国内外に波及。関税・外交・安全保障で大きな変化。',
    articles:[
      {cat:'political', title:'トランプ政権、ウクライナへの軍事支援を大幅に削減', src:'WSJ', time:'3時間前'},
      {cat:'economic',  title:'主要国へ10〜25%の追加関税を発動。貿易戦争が本格化', src:'Reuters', time:'5時間前'},
      {cat:'political', title:'NATOへの関与を巡り欧州諸国との亀裂が表面化', src:'NYT', time:'1日前'},
      {cat:'economic',  title:'FRB、インフレと関税の影響を見極め金利据え置き', src:'FT', time:'2日前'},
    ]
  },
  156: {
    name:'中国', cat:'political', intensity:0.8,
    tags:['政治','経済','軍拡'],
    summary:'経済減速と不動産危機が続く中、軍事力の急速な拡大と台湾への圧力を強化。',
    articles:[
      {cat:'political', title:'中国軍が台湾周辺で過去最大規模の軍事演習を実施', src:'Reuters', time:'2日前'},
      {cat:'economic',  title:'中国GDPが目標の5%成長を下回る見通し。不動産危機が長引く', src:'Caixin', time:'3日前'},
      {cat:'political', title:'南シナ海でフィリピン船舶と衝突。ASEAN諸国が懸念を表明', src:'BBC', time:'4日前'},
      {cat:'economic',  title:'中国製EVが世界市場で急拡大。欧米が追加関税で対抗', src:'FT', time:'5日前'},
    ]
  },
  392: {
    name:'日本', cat:'political', intensity:0.6,
    tags:['経済','安全保障','外交'],
    summary:'金融正常化を進める一方、防衛費倍増と日米同盟強化を推進。円安・物価高が課題。',
    articles:[
      {cat:'economic',  title:'日銀が追加利上げ。長期金利が上昇し円高方向へ', src:'日経', time:'1日前'},
      {cat:'political', title:'石破内閣、防衛費GDP比2%達成を予算に明記', src:'読売', time:'2日前'},
      {cat:'political', title:'日米首脳会談、在日米軍の役割拡大と安保強化を確認', src:'朝日', time:'3日前'},
      {cat:'economic',  title:'トヨタ・ソニーなど主要企業が北米投資拡大。関税リスクに対応', src:'日経', time:'4日前'},
    ]
  },
  410: {
    name:'韓国', cat:'political', intensity:0.7,
    tags:['政治危機','経済'],
    summary:'戒厳令宣布と大統領弾劾を巡る政治危機の余波が続く。憲法裁が審理中。',
    articles:[
      {cat:'political', title:'憲法裁判所、大統領弾劾審理を継続。政治的混乱が長期化', src:'聯合ニュース', time:'2日前'},
      {cat:'economic',  title:'政治不安でウォンが対ドルで下落。外国人が韓国株を売り越し', src:'Yonhap', time:'3日前'},
      {cat:'political', title:'韓国軍、北朝鮮の挑発継続を受け警戒態勢を強化', src:'KBS', time:'4日前'},
    ]
  },
  276: {
    name:'ドイツ', cat:'political', intensity:0.65,
    tags:['政治','経済'],
    summary:'総選挙後の連立政権交渉が続く。2年連続のマイナス成長と製造業の空洞化が深刻。',
    articles:[
      {cat:'political', title:'CDU主導の連立政権形成に向けた協議が続く。財政政策で溝', src:'Spiegel', time:'2日前'},
      {cat:'economic',  title:'ドイツ製造業が2年連続縮小。エネルギーコスト高が競争力を削ぐ', src:'FT', time:'3日前'},
    ]
  },
  250: {
    name:'フランス', cat:'political', intensity:0.65,
    tags:['政治'],
    summary:'マクロン政権が議会少数与党のまま運営を継続。欧州防衛の主導権獲得を模索。',
    articles:[
      {cat:'political', title:'フランス政府、右派・左派双方からの不信任案を乗り越え政権維持', src:'Le Monde', time:'3日前'},
      {cat:'political', title:'マクロン大統領、米国抜きの欧州独自防衛体制の構築を提唱', src:'Reuters', time:'5日前'},
    ]
  },
  826: {
    name:'イギリス', cat:'political', intensity:0.6,
    tags:['政治','経済'],
    summary:'労働党政権が財政再建と経済成長の両立に苦心。EU関係の再構築も模索。',
    articles:[
      {cat:'political', title:'スターマー首相、EU・欧州防衛協力の強化を優先課題に', src:'Guardian', time:'3日前'},
      {cat:'economic',  title:'英財政計画が市場の信頼を得られず長期金利が上昇', src:'FT', time:'4日前'},
    ]
  },

  // ── ECONOMIC ──────────────────────────────
  356: {
    name:'インド', cat:'economic', intensity:0.65,
    tags:['経済成長','外交'],
    summary:'主要国最速の7%超成長を維持。「グローバルサウス」のリーダーとして多極外交を展開。',
    articles:[
      {cat:'economic',  title:'インドGDP成長率7.2%を達成。製造業とデジタル経済が牽引', src:'Economic Times', time:'2日前'},
      {cat:'political', title:'モディ首相が米中双方と関係を維持する「戦略的自律」路線', src:'Hindu', time:'4日前'},
    ]
  },
  682: {
    name:'サウジアラビア', cat:'economic', intensity:0.7,
    tags:['経済','外交'],
    summary:'ビジョン2030を推進し石油依存からの脱却を図る。中東外交の核として影響力を拡大。',
    articles:[
      {cat:'economic',  title:'サウジ、観光・テクノロジーへの投資が急拡大。非石油収入が増加', src:'FT', time:'2日前'},
      {cat:'economic',  title:'OPECプラスが追加減産を決定。原油価格を80ドル台に維持', src:'Reuters', time:'3日前'},
      {cat:'political', title:'イスラエルとの国交正常化交渉、ガザ情勢の悪化で中断', src:'WSJ', time:'1週間前'},
    ]
  },
  792: {
    name:'トルコ', cat:'economic', intensity:0.65,
    tags:['経済','外交'],
    summary:'超高インフレがようやく低下傾向に。NATOとロシア双方との独自外交路線を継続。',
    articles:[
      {cat:'economic',  title:'トルコのインフレ率が前年比50%台まで低下。ピークの85%から改善', src:'Reuters', time:'3日前'},
      {cat:'political', title:'エルドアン大統領、ウクライナ・ロシア双方との対話仲介を維持', src:'AFP', time:'5日前'},
    ]
  },
  32: {
    name:'アルゼンチン', cat:'economic', intensity:0.7,
    tags:['経済改革'],
    summary:'ミレイ大統領の急進的な緊縮政策が進行。インフレは沈静化も、貧困率が急上昇。',
    articles:[
      {cat:'economic', title:'アルゼンチンのインフレ率が月次で大幅低下。ミレイ政策の効果', src:'Reuters', time:'2日前'},
      {cat:'economic', title:'緊縮策の副作用で貧困率が40%超に。国民生活は苦境に', src:'BBC', time:'4日前'},
    ]
  },
  566: {
    name:'ナイジェリア', cat:'economic', intensity:0.6,
    tags:['経済','治安'],
    summary:'通貨ナイラの急落とインフレが市民を直撃。北部でのテロ活動も依然として続く。',
    articles:[
      {cat:'economic', title:'ナイジェリアのインフレ率が32%超。食料品・燃料の価格高騰が深刻', src:'Reuters', time:'3日前'},
      {cat:'conflict', title:'ボコ・ハラム系組織が北東部で住民を標的に攻撃を継続', src:'AFP', time:'5日前'},
    ]
  },
  76: {
    name:'ブラジル', cat:'economic', intensity:0.6,
    tags:['経済','環境'],
    summary:'ルーラ政権が福祉拡大と財政健全化の両立に苦心。通貨レアル安が続く。',
    articles:[
      {cat:'economic', title:'ブラジルレアルが対ドルで最安値圏。財政拡張への不安が背景', src:'Reuters', time:'2日前'},
      {cat:'political', title:'アマゾン保護政策と農業ロビーの対立が政局の火種に', src:'BBC', time:'4日前'},
    ]
  },
};

/* ════════════════════════════════════════════════════
   TICKER
═══════════════════════════════════════════════════════ */
const TICKER = [
  'ロシア、ウクライナ東部への砲撃を継続。民間人に犠牲者',
  'G7外相会議がウクライナへの継続的支援を確認',
  '北朝鮮がICBM発射実験。日本のEEZ外に落下',
  'ガザ停戦交渉がカタールで再開。人質解放条件で難航',
  'OPECプラスが追加減産を決定。原油価格が上昇',
  'IMF、2025年の世界経済成長率を3.1%と予測',
  'フーシ派、紅海での商船攻撃を継続。海運コストが急騰',
  'EU、対中国制裁の拡大を協議中',
  '日銀が追加利上げ。長期金利が1%超に',
  '米国が主要国へ追加関税を発動。貿易摩擦が激化',
  '中国、台湾周辺で大規模軍事演習。米空母が接近',
  'WHO、スーダン内戦の感染症拡大を警告',
];

/* ════════════════════════════════════════════════════
   HOT STORIES
═══════════════════════════════════════════════════════ */
const HOT = [
  { cat:'conflict',  text:'キーウへのドローン攻撃が連夜続く。防空網が応戦',              country:'ウクライナ', time:'30分前' },
  { cat:'political', text:'米国が主要貿易国に追加関税を発動。各国が報復措置を検討',      country:'アメリカ',   time:'1時間前' },
  { cat:'conflict',  text:'ガザ停戦交渉が再開。人質解放と引き換えの一時停戦を協議',    country:'イスラエル', time:'2時間前' },
  { cat:'economic',  text:'日銀が追加利上げを実施。17年ぶりの水準に',                  country:'日本',       time:'3時間前' },
];


/* ════════════════════════════════════════════════════
   MAP
═══════════════════════════════════════════════════════ */
let activeFilter = 'all';
let selectedId = null;

const colMap = {
  conflict:  '#ff2233',
  tension:   '#ff8800',
  political: '#1a90ff',
  economic:  '#00d4aa',
};

function getBaseColor(id) {
  const d = NEWS[id];
  if (!d) return '#0b1e2e';
  return colMap[d.cat] || '#0b1e2e';
}

function getOpacity(id) {
  const d = NEWS[id];
  if (!d) return 0.5;
  return 0.3 + d.intensity * 0.55;
}

function shouldDim(id) {
  if (activeFilter === 'all') return false;
  const d = NEWS[id];
  if (!d) return true;
  return d.cat !== activeFilter;
}

async function buildMap() {
  const W = window.innerWidth, H = window.innerHeight;
  const svg = d3.select('#world-svg')
    .attr('width', W).attr('height', H);

  // defs: glow filter
  const defs = svg.append('defs');
  const glow = defs.append('filter').attr('id','glow').attr('x','-50%').attr('y','-50%').attr('width','200%').attr('height','200%');
  glow.append('feGaussianBlur').attr('stdDeviation','4').attr('result','blur');
  const merge = glow.append('feMerge');
  merge.append('feMergeNode').attr('in','blur');
  merge.append('feMergeNode').attr('in','SourceGraphic');

  // ocean
  svg.append('rect').attr('width',W).attr('height',H).attr('fill','#030d18');

  const g = svg.append('g').attr('id','map-g');

  const proj = d3.geoNaturalEarth1()
    .scale(W / 6.3)
    .translate([W / 2, H / 2 + 20]);
  const path = d3.geoPath().projection(proj);

  let world;
  try {
    world = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
  } catch(e) {
    document.body.innerHTML += '<div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:red;font-family:monospace;font-size:14px;z-index:9999">⚠ 地図データ読み込み失敗。ネットワークを確認してください。</div>';
    return;
  }

  const countries = topojson.feature(world, world.objects.countries);

  // draw countries
  const paths = g.selectAll('.country')
    .data(countries.features)
    .join('path')
    .attr('class','country')
    .attr('d', path)
    .attr('fill', d => getBaseColor(+d.id))
    .attr('fill-opacity', d => getOpacity(+d.id))
    .attr('stroke','#0a1a28')
    .attr('stroke-width', 0.4)
    .on('mousemove', function(ev, d) { onHover(ev, d); })
    .on('mouseleave', function(ev, d) { onLeave(ev, d); })
    .on('click', function(ev, d) { onClick(ev, d); });

  // borders
  g.append('path')
    .datum(topojson.mesh(world, world.objects.countries, (a,b) => a!==b))
    .attr('fill','none').attr('stroke','#0a1a28').attr('stroke-width',0.4)
    .attr('d', path);

  // conflict pulse markers
  countries.features.forEach(f => {
    const d = NEWS[+f.id];
    if (!d || !d.pulse) return;
    const c = path.centroid(f);
    if (!c || isNaN(c[0]) || isNaN(c[1])) return;

    const mg = g.append('g').attr('transform',`translate(${c[0]},${c[1]})`);

    // animated rings
    for (let i = 0; i < 3; i++) {
      mg.append('circle')
        .attr('r', 5)
        .attr('fill','none')
        .attr('stroke','#ff2233')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.9)
        .style('filter','url(#glow)')
        .append('animate').attr('attributeName','r')
          .attr('values','5;22').attr('dur','2.4s')
          .attr('begin', `${i * 0.8}s`)
          .attr('repeatCount','indefinite');

      mg.select('circle:last-of-type').append('animate')
        .attr('attributeName','opacity')
        .attr('values','0.9;0').attr('dur','2.4s')
        .attr('begin', `${i * 0.8}s`)
        .attr('repeatCount','indefinite');
    }

    // solid center dot
    mg.append('circle')
      .attr('r', 4).attr('fill','#ff2233')
      .attr('opacity', 0.95)
      .style('filter','url(#glow)')
      .style('pointer-events','none');
  });

  // ── zoom / pan ──
  const zoom = d3.zoom()
    .scaleExtent([1, 10])
    .on('zoom', ev => g.attr('transform', ev.transform));
  svg.call(zoom);
  svg.on('dblclick.zoom', null);

  // ── filter buttons ──
  document.querySelectorAll('.flt').forEach(btn => {
    btn.addEventListener('click', function() {
      activeFilter = this.dataset.f;
      document.querySelectorAll('.flt').forEach(b => {
        b.className = 'flt';
      });
      this.classList.add(`active-${activeFilter}`);

      paths.transition().duration(350)
        .attr('fill', d => shouldDim(+d.id) ? '#0b1e2e' : getBaseColor(+d.id))
        .attr('fill-opacity', d => shouldDim(+d.id) ? 0.25 : getOpacity(+d.id));
    });
  });

  window.addEventListener('resize', () => {
    const nw = window.innerWidth, nh = window.innerHeight;
    svg.attr('width', nw).attr('height', nh);
    svg.select('rect').attr('width', nw).attr('height', nh);
    proj.scale(nw/6.3).translate([nw/2, nh/2+20]);
    paths.attr('d', path);
  });

  window._paths = paths; // expose for filter re-renders
}

/* ── interactions ── */
const tooltip = document.getElementById('tooltip');

function onHover(ev, d) {
  const info = NEWS[+d.id];
  if (!info) return;

  document.getElementById('tt-name').textContent = info.name;
  const tagEl = document.getElementById('tt-tag');
  tagEl.textContent = CAT_LABEL[info.cat] || info.cat;
  tagEl.style.color = colMap[info.cat] || '#fff';
  document.getElementById('tt-txt').textContent = info.summary;

  tooltip.classList.add('show');
  posTooltip(ev);
}

function posTooltip(ev) {
  const W = window.innerWidth, H = window.innerHeight;
  let x = ev.clientX + 18, y = ev.clientY - 10;
  if (x + 220 > W) x = ev.clientX - 230;
  if (y + 120 > H) y = ev.clientY - 130;
  tooltip.style.left = x + 'px';
  tooltip.style.top  = y + 'px';
}

document.addEventListener('mousemove', ev => {
  if (tooltip.classList.contains('show')) posTooltip(ev);
});

function onLeave(ev, d) {
  tooltip.classList.remove('show');
}

function onClick(ev, d) {
  const info = NEWS[+d.id];
  if (!info) return;
  openPanel(info);
}

/* ── panel ── */
function openPanel(info) {
  document.getElementById('panel-country').textContent = info.name;
  document.getElementById('panel-summary').textContent = info.summary;

  const tagsEl = document.getElementById('panel-tags');
  tagsEl.innerHTML = info.tags.map(t =>
    `<span class="ptag ${info.cat}">${t}</span>`
  ).join('');

  const artEl = document.getElementById('panel-articles');
  artEl.innerHTML = info.articles.map(a => `
    <div class="article">
      <div class="art-cat ${a.cat}">${CAT_LABEL[a.cat] || a.cat}</div>
      <div class="art-title">${a.title}</div>
      <div class="art-meta">
        <span class="art-src">${a.src}</span>
        <span>${a.time}</span>
      </div>
    </div>
  `).join('');

  document.getElementById('news-panel').classList.add('open');
  document.getElementById('hot-stories').style.opacity = '0';
  document.getElementById('hot-stories').style.pointerEvents = 'none';
}

document.getElementById('panel-close').addEventListener('click', () => {
  document.getElementById('news-panel').classList.remove('open');
  document.getElementById('hot-stories').style.opacity = '1';
  document.getElementById('hot-stories').style.pointerEvents = 'auto';
});

/* ── hot stories ── */
function buildHotStories() {
  const catClass = { conflict:'', tension:'ten', political:'pol', economic:'eco' };
  document.getElementById('hot-stories').innerHTML = HOT.map(h => `
    <div class="hs-card ${catClass[h.cat] || ''}">
      <div class="hs-tag" style="color:${colMap[h.cat]}">${CAT_LABEL[h.cat]}</div>
      <div class="hs-title">${h.text}</div>
      <div class="hs-meta">${h.country} · ${h.time}</div>
    </div>
  `).join('');
}

/* ── ticker ── */
function buildTicker() {
  const doubled = [...TICKER, ...TICKER];
  document.getElementById('tick-track').innerHTML =
    doubled.map(t => `<span class="tick-item">${t}</span>`).join('');
}

/* ── boot ── */
buildMap();
buildHotStories();
buildTicker();
