import { GoogleGenAI } from '@google/genai';
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';

// ── Config ──
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set');
  process.exit(1);
}

const MODEL = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// ── Country codes (ISO 3166-1 numeric) ──
const COUNTRY_NAMES = {
  804:'ウクライナ', 643:'ロシア', 376:'イスラエル', 729:'スーダン',
  104:'ミャンマー', 887:'イエメン', 706:'ソマリア', 180:'コンゴ民主共和国',
  408:'北朝鮮', 364:'イラン', 862:'ベネズエラ', 760:'シリア',
  586:'パキスタン', 4:'アフガニスタン', 840:'アメリカ', 156:'中国',
  392:'日本', 410:'韓国', 276:'ドイツ', 250:'フランス',
  826:'イギリス', 356:'インド', 682:'サウジアラビア', 792:'トルコ',
  32:'アルゼンチン', 566:'ナイジェリア', 76:'ブラジル'
};

const COUNTRY_CODES = Object.keys(COUNTRY_NAMES);

// ── Prompt ──
const now = new Date().toISOString();
const prompt = `現在日時: ${now}

【ミッション】以下の27カ国・地域について、今この瞬間の最新ニュースをGoogle検索で調査し、実際に見つけた記事の情報だけを使ってJSONを出力すること。

【ステップ1: 調査】
次の国・地域それぞれについてGoogle検索を実行し、過去72時間以内に報道された実際のニュース記事を探せ。
検索クエリの例: "Ukraine war news today", "Israel Gaza latest", "North Korea missile 2026" など、英語・日本語どちらでも使ってよい。

調査対象 (ISOコード: 国名):
${Object.entries(COUNTRY_NAMES).map(([code, name]) => `${code}: ${name}`).join('\n')}

【ステップ2: 出力】
ステップ1で実際に検索して見つけた内容のみを使い、以下のJSON形式で出力せよ。
検索結果が見つからなかった国は直近の既知情勢で補完してよいが、その場合urlはnullにすること。
JSONオブジェクトのみを返し、コードブロック記号（\`\`\`）や前後の説明文は一切含めないこと。

{
  "news": {
    "804": {
      "name": "ウクライナ",
      "cat": "conflict",
      "intensity": 0.95,
      "pulse": true,
      "tags": ["紛争", "人道危機"],
      "summary": "検索で確認した直近の状況を50〜80文字で要約",
      "articles": [
        {
          "cat": "conflict",
          "title": "実際の記事見出しを日本語で40〜60文字",
          "src": "Reuters",
          "url": "https://実際の記事URL",
          "publishedAt": "2026-03-02T07:30:00Z"
        }
      ]
    }
  },
  "ticker": [
    "検索で確認した速報12件（各30〜50文字）",
    "速報2", "速報3", "速報4", "速報5", "速報6",
    "速報7", "速報8", "速報9", "速報10", "速報11", "速報12"
  ],
  "hot": [
    { "cat": "conflict",  "text": "検索で確認した最重要ニュース30〜50文字", "country": "国名", "src": "Reuters",  "publishedAt": "2026-03-02T07:00:00Z" },
    { "cat": "political", "text": "注目ニュース2",                          "country": "国名", "src": "BBC",      "publishedAt": "2026-03-02T06:00:00Z" },
    { "cat": "tension",   "text": "注目ニュース3",                          "country": "国名", "src": "AP",       "publishedAt": "2026-03-02T05:00:00Z" },
    { "cat": "economic",  "text": "注目ニュース4",                          "country": "国名", "src": "FT",       "publishedAt": "2026-03-02T04:00:00Z" }
  ]
}

【出力ルール】
- すべて日本語で記載（見出し・要約・タグ・速報テキスト）
- newsのキーはISO 3166-1数値コード（文字列）
- articles: 各国2〜4件。urlは検索で取得した実際のURL、なければnull
- publishedAt: ISO 8601形式。検索結果の実際の公開日時を使うこと
- cat: "conflict" / "tension" / "political" / "economic" のいずれか
- pulse: conflictのみtrue
- intensity: conflict=0.7〜1.0 / tension=0.6〜0.85 / political・economic=0.5〜0.85
- ticker: ちょうど12件
- hot: ちょうど4件、異なるcatを含める
- 27カ国すべてを含めること`;

// ── Validation ──
function validate(data) {
  if (!data.news || typeof data.news !== 'object') {
    console.error('Validation: missing news object');
    return false;
  }

  const newsKeys = Object.keys(data.news);
  const missing = COUNTRY_CODES.filter(c => !newsKeys.includes(c));
  if (missing.length > 5) {
    console.error(`Validation: too many missing countries (${missing.length}): ${missing.join(', ')}`);
    return false;
  }
  if (missing.length > 0) {
    console.warn(`Warning: ${missing.length} countries missing: ${missing.join(', ')}`);
  }

  const validCats = ['conflict', 'tension', 'political', 'economic'];
  for (const [code, entry] of Object.entries(data.news)) {
    if (!entry.name || !entry.cat || !entry.summary || !Array.isArray(entry.articles)) {
      console.error(`Validation: invalid entry structure for country ${code}`);
      return false;
    }
    if (!validCats.includes(entry.cat)) {
      console.error(`Validation: invalid category "${entry.cat}" for country ${code}`);
      return false;
    }
    if (typeof entry.intensity !== 'number' || entry.intensity < 0 || entry.intensity > 1) {
      console.error(`Validation: invalid intensity ${entry.intensity} for country ${code}`);
      return false;
    }
    if (entry.articles.length < 1) {
      console.error(`Validation: no articles for country ${code}`);
      return false;
    }
    for (const art of entry.articles) {
      if (!art.cat || !art.title || !art.src || (!art.publishedAt && !art.time)) {
        console.error(`Validation: invalid article structure for country ${code}`);
        return false;
      }
    }
  }

  if (!Array.isArray(data.ticker) || data.ticker.length < 8) {
    console.error(`Validation: ticker has ${data.ticker?.length ?? 0} items (need >= 8)`);
    return false;
  }

  if (!Array.isArray(data.hot) || data.hot.length < 3) {
    console.error(`Validation: hot has ${data.hot?.length ?? 0} items (need >= 3)`);
    return false;
  }
  for (const h of data.hot) {
    if (!h.cat || !h.text || !h.country || !h.src || (!h.publishedAt && !h.time)) {
      console.error('Validation: invalid hot story structure');
      return false;
    }
  }

  return true;
}

// ── Generate with retry ──
async function generateWithRetry(maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1}: calling ${MODEL}...`);
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.7,
        },
      });
      return response.text;
    } catch (e) {
      console.error(`Attempt ${attempt + 1} failed:`, e.message);
      if (attempt === maxRetries) throw e;
      const waitMs = (attempt + 1) * 5000;
      console.log(`Retrying in ${waitMs / 1000}s...`);
      await new Promise(r => setTimeout(r, waitMs));
    }
  }
}

// ── Main ──
async function main() {
  const text = await generateWithRetry();

  function extractJSON(raw) {
    const md = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (md) return md[1].trim();
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start !== -1 && end !== -1) return raw.slice(start, end + 1);
    return raw;
  }

  let parsed;
  try {
    parsed = JSON.parse(extractJSON(text));
  } catch (e) {
    console.error('JSON parse failed:', e.message);
    console.error('Raw response (first 500 chars):', text.substring(0, 500));
    process.exit(1);
  }

  if (!validate(parsed)) {
    console.error('Validation failed.');
    process.exit(1);
  }

  parsed.updatedAt = new Date().toISOString();

  if (!existsSync('data')) mkdirSync('data');
  writeFileSync('data/news.json', JSON.stringify(parsed, null, 2), 'utf-8');

  const countryCount = Object.keys(parsed.news).length;
  console.log(`Done: ${countryCount} countries, ${parsed.ticker.length} ticker, ${parsed.hot.length} hot stories`);
  console.log(`Updated at: ${parsed.updatedAt}`);
}

main().catch(e => {
  console.error('Fatal error:', e.message);
  process.exit(1);
});
