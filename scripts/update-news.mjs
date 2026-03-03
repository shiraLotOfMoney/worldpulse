import { GoogleGenAI } from '@google/genai';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';

// ── Config ──
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) { console.error('GEMINI_API_KEY is not set'); process.exit(1); }

const MODEL       = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const ARTICLES_FILE = 'data/articles.json';
const NEWS_FILE     = 'data/news.json';
const KEEP_HOURS    = 72;   // 記事を保持する時間
const MAX_PER_COUNTRY = 6;  // Phase 2 に渡す国ごとの最大記事数

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// ── Country codes (ISO 3166-1 numeric) ──
const COUNTRY_NAMES = {
  804:'ウクライナ', 643:'ロシア',    376:'イスラエル',  729:'スーダン',
  104:'ミャンマー', 887:'イエメン',  706:'ソマリア',    180:'コンゴ民主共和国',
  408:'北朝鮮',    364:'イラン',    862:'ベネズエラ',  760:'シリア',
  586:'パキスタン', 4:'アフガニスタン', 840:'アメリカ', 156:'中国',
  392:'日本',      410:'韓国',      276:'ドイツ',      250:'フランス',
  826:'イギリス',  356:'インド',    682:'サウジアラビア', 792:'トルコ',
  32:'アルゼンチン', 566:'ナイジェリア', 76:'ブラジル',
};

// ── Helper: JSONを文字列から抽出 ──
function extractJSON(raw) {
  const md = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (md) return md[1].trim();
  const arrStart = raw.indexOf('[');
  const objStart = raw.indexOf('{');
  if (arrStart !== -1 && (objStart === -1 || arrStart < objStart)) {
    const end = raw.lastIndexOf(']');
    if (end !== -1) return raw.slice(arrStart, end + 1);
  }
  if (objStart !== -1) {
    const end = raw.lastIndexOf('}');
    if (end !== -1) return raw.slice(objStart, end + 1);
  }
  return raw;
}

// ── Helper: Gemini呼び出し（リトライ付き） ──
async function callGemini(prompt, useSearch = false) {
  const config = useSearch
    ? { tools: [{ googleSearch: {} }], temperature: 0.3 }
    : { responseMimeType: 'application/json', temperature: 0.5 };

  for (let attempt = 0; attempt <= 2; attempt++) {
    try {
      console.log(`  attempt ${attempt + 1}...`);
      const res = await ai.models.generateContent({ model: MODEL, contents: prompt, config });
      return res.text;
    } catch (e) {
      console.error(`  attempt ${attempt + 1} failed: ${e.message}`);
      if (attempt === 2) throw e;
      await new Promise(r => setTimeout(r, (attempt + 1) * 5000));
    }
  }
}

// ════════════════════════════════════════════════════
// Phase 1: 記事収集（Search grounding で実際に検索）
// ════════════════════════════════════════════════════
async function collectArticles() {
  const now = new Date().toISOString();
  const countryList = Object.entries(COUNTRY_NAMES)
    .map(([code, name]) => `${code}: ${name}`).join('\n');

  const prompt = `現在日時: ${now}

【タスク】以下27カ国・地域の最新ニュースをGoogle検索で今すぐ調査し、実際に見つけた記事を返せ。

調査対象 (ISOコード: 国名):
${countryList}

【検索指示】
- 各国について "国名 news today"、"国名 latest 2026"、"国名 conflict/politics/economy 2026" などで検索せよ
- 英語・日本語どちらのクエリでもよい
- 過去48時間以内に公開された記事を優先すること
- 各国2〜4件を目標に検索すること

【出力】
実際に検索で見つけた記事のみをJSON配列で返せ。前後の説明文は不要。
[
  {
    "countryCode": "804",
    "cat": "conflict",
    "title": "記事の見出しを日本語で",
    "src": "Reuters",
    "url": "https://実際の記事URL",
    "publishedAt": "2026-03-03T10:00:00Z",
    "snippet": "記事の内容を1〜2文で日本語要約"
  }
]

catは "conflict" / "tension" / "political" / "economic" のいずれか。
URLは検索で実際に確認したもののみ記載し、不明な場合はnullにすること。`;

  console.log('[Phase 1] Searching for articles...');
  const text = await callGemini(prompt, true);

  let newArticles = [];
  try {
    newArticles = JSON.parse(extractJSON(text));
    if (!Array.isArray(newArticles)) throw new Error('not an array');
  } catch (e) {
    console.error('Failed to parse collected articles:', e.message);
    console.error('Raw response (first 400):', text.substring(0, 400));
    newArticles = [];
  }

  // 既存の記事を読み込む
  let existing = [];
  if (existsSync(ARTICLES_FILE)) {
    try {
      const data = JSON.parse(readFileSync(ARTICLES_FILE, 'utf-8'));
      existing = Array.isArray(data.articles) ? data.articles : [];
    } catch (e) {
      console.warn('Could not read existing articles:', e.message);
    }
  }

  // URLでdedup、新しい記事だけ追加
  const urlSet = new Set(existing.map(a => a.url).filter(Boolean));
  const collectedAt = new Date().toISOString();
  let addedCount = 0;
  for (const a of newArticles) {
    if (!a.countryCode || !a.title) continue;
    if (a.url && urlSet.has(a.url)) continue;
    existing.push({ ...a, collectedAt });
    if (a.url) urlSet.add(a.url);
    addedCount++;
  }

  // KEEP_HOURS を超えた古い記事を削除
  const cutoff = new Date(Date.now() - KEEP_HOURS * 60 * 60 * 1000).toISOString();
  const pruned = existing.filter(a => {
    const ts = a.publishedAt || a.collectedAt;
    return ts && ts >= cutoff;
  });

  writeFileSync(ARTICLES_FILE, JSON.stringify({ articles: pruned, updatedAt: collectedAt }, null, 2));
  console.log(`[Phase 1] +${addedCount} new | ${pruned.length} total stored (${KEEP_HOURS}h window)`);

  return pruned;
}

// ════════════════════════════════════════════════════
// Phase 2: 表示データ生成（収集記事を分析して news.json を作る）
// ════════════════════════════════════════════════════
async function generateDisplay(articles) {
  // 国ごとにグループ化、新しい順にソートして最大MAX_PER_COUNTRY件に絞る
  const byCountry = {};
  for (const a of articles) {
    const code = String(a.countryCode);
    if (!byCountry[code]) byCountry[code] = [];
    byCountry[code].push(a);
  }
  for (const code in byCountry) {
    byCountry[code].sort((a, b) =>
      (b.publishedAt || b.collectedAt).localeCompare(a.publishedAt || a.collectedAt)
    );
    byCountry[code] = byCountry[code].slice(0, MAX_PER_COUNTRY);
  }

  const now = new Date().toISOString();
  const countryCodes = Object.keys(COUNTRY_NAMES).join(', ');

  const prompt = `現在日時: ${now}

【タスク】以下は過去${KEEP_HOURS}時間に収集した国際ニュース記事（国別）だ。
この記事データを分析し、ニュース地図サイト用の表示データをJSON形式で出力せよ。

【収集記事（国コード別）】
${JSON.stringify(byCountry, null, 2)}

【出力形式】以下のJSONを返せ（説明文・コードブロック不要）:
{
  "news": {
    "804": {
      "name": "ウクライナ",
      "cat": "conflict",
      "intensity": 0.95,
      "pulse": true,
      "tags": ["紛争", "人道危機"],
      "summary": "収集記事から読み取った現状を50〜80文字で",
      "articles": [
        {
          "cat": "conflict",
          "title": "記事タイトル（日本語）",
          "src": "Reuters",
          "url": "https://収集記事の実際のURL",
          "publishedAt": "2026-03-03T10:00:00Z"
        }
      ]
    }
  },
  "ticker": ["速報1", "速報2", "速報3", "速報4", "速報5", "速報6", "速報7", "速報8", "速報9", "速報10", "速報11", "速報12"],
  "hot": [
    { "cat": "conflict",  "text": "最重要ニュース30〜50文字", "country": "ウクライナ", "src": "Reuters", "publishedAt": "2026-03-03T10:00:00Z" },
    { "cat": "political", "text": "注目ニュース2",            "country": "アメリカ",   "src": "AP",      "publishedAt": "2026-03-03T09:00:00Z" },
    { "cat": "tension",   "text": "注目ニュース3",            "country": "北朝鮮",     "src": "BBC",     "publishedAt": "2026-03-03T08:00:00Z" },
    { "cat": "economic",  "text": "注目ニュース4",            "country": "日本",       "src": "日経",    "publishedAt": "2026-03-03T07:00:00Z" }
  ]
}

【分析ルール】
- 収集記事の件数・内容・重要度からintensityとcatを判断すること
- hotは収集記事の中で最も緊急性・重要性が高いもの4件（異なるcat）を選ぶこと
- tickerは全体から重要なニュースを12件ピックアップすること
- articlesのurl・publishedAtは収集記事の値をそのまま使うこと（加工しない）
- 収集記事が0件の国は直近の既知情勢で補完し、urlはnullにすること
- pulse: conflictのみtrue
- intensity: conflict=0.7〜1.0 / tension=0.6〜0.85 / political・economic=0.5〜0.85
- 以下27カ国すべてを含めること: ${countryCodes}`;

  console.log('[Phase 2] Generating display from collected articles...');
  const text = await callGemini(prompt, false);

  let display;
  try {
    display = JSON.parse(extractJSON(text));
  } catch (e) {
    console.error('Failed to parse display JSON:', e.message);
    console.error('Raw response (first 500):', text.substring(0, 500));
    process.exit(1);
  }

  if (!display.news || !display.ticker || !display.hot) {
    console.error('Invalid display structure (missing news/ticker/hot)');
    process.exit(1);
  }

  display.updatedAt = new Date().toISOString();
  writeFileSync(NEWS_FILE, JSON.stringify(display, null, 2));
  console.log(`[Phase 2] Display generated: ${Object.keys(display.news).length} countries`);
}

// ── Main ──
async function main() {
  if (!existsSync('data')) mkdirSync('data');

  const articles = await collectArticles();
  await generateDisplay(articles);

  console.log('Done.');
}

main().catch(e => {
  console.error('Fatal error:', e.message);
  process.exit(1);
});
