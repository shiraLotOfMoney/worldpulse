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
const prompt = `あなたは国際ニュースの専門アナリストです。現在の世界情勢に基づいて、以下のJSON構造でニュースデータを生成してください。

現在の日時: ${new Date().toISOString()}

以下の27カ国について、最新の実際の国際ニュースに基づいた情報を生成してください。架空のニュースではなく、実際に報道されている内容や直近の情勢を要約してください。

対象国 (ISOコード: 国名):
${Object.entries(COUNTRY_NAMES).map(([code, name]) => `${code}: ${name}`).join('\n')}

カテゴリは4種類: "conflict" (紛争・戦争), "tension" (緊張・不安定), "political" (政治ニュース), "economic" (経済ニュース)

出力するJSONの構造:

{
  "news": {
    "804": {
      "name": "ウクライナ",
      "cat": "conflict",
      "intensity": 0.0から1.0の数値,
      "pulse": true,
      "tags": ["タグ1", "タグ2"],
      "summary": "50〜80文字の状況要約",
      "articles": [
        {
          "cat": "conflict",
          "title": "ニュース見出し（40〜60文字）",
          "src": "情報源名",
          "publishedAt": "2026-03-02T07:30:00Z"
        }
      ]
    }
  },
  "ticker": [
    "速報テキスト1（30〜50文字）",
    "速報テキスト2",
    "速報テキスト3",
    "速報テキスト4",
    "速報テキスト5",
    "速報テキスト6",
    "速報テキスト7",
    "速報テキスト8",
    "速報テキスト9",
    "速報テキスト10",
    "速報テキスト11",
    "速報テキスト12"
  ],
  "hot": [
    {
      "cat": "conflict",
      "text": "注目ニューステキスト（30〜50文字）",
      "country": "国名",
      "src": "情報源名",
      "publishedAt": "2026-03-02T07:30:00Z"
    },
    {
      "cat": "political",
      "text": "注目ニューステキスト2",
      "country": "国名",
      "src": "情報源名",
      "publishedAt": "2026-03-02T06:00:00Z"
    },
    {
      "cat": "tension",
      "text": "注目ニューステキスト3",
      "country": "国名",
      "src": "情報源名",
      "publishedAt": "2026-03-02T05:00:00Z"
    },
    {
      "cat": "economic",
      "text": "注目ニューステキスト4",
      "country": "国名",
      "src": "情報源名",
      "publishedAt": "2026-03-02T04:00:00Z"
    }
  ]
}

ルール:
1. すべて日本語で記載すること
2. newsオブジェクトのキーはISO 3166-1 数値コード（文字列）を使うこと
3. 各国のarticlesは2〜4件
4. catは "conflict", "tension", "political", "economic" のいずれか
5. pulseはconflictカテゴリの国のみtrue、それ以外はfalseまたは省略
6. intensityはconflictが0.7〜1.0、tensionが0.6〜0.85、political/economicが0.5〜0.85
7. tickerはちょうど12件の速報テキスト（世界の主要ニュースを幅広く）
8. hotはちょうど4件の注目ニュース（異なるカテゴリを含める）
9. 情報源名は実在するメディア名を使用（Reuters, BBC, CNN, AP, 日経, 読売, WSJ, FT, Guardian 等）
10. publishedAtはISO 8601形式（例: "2026-03-02T07:30:00Z"）で指定する。現在時刻から最大1週間前までの範囲で、記事の性質に合わせたリアルなタイムスタンプを生成すること
11. 実際のニュースに基づく内容にすること。完全な捏造は避けること
12. 27カ国すべてについてデータを含めること（欠落させないこと）`;

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
          responseMimeType: 'application/json',
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

  let parsed;
  try {
    parsed = JSON.parse(text);
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
