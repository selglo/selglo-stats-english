import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// مسیرهای پایه
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_HTML = path.join(__dirname, '..', 'html', 'clothing', 'base.html');
const OUTPUT_ROOT = path.join(__dirname, '..', 'daily');
const STATE_PATH = path.join(__dirname, '..', 'data', 'state.json');

// برای تخصیص seed متفاوت به هر گروه
const SEED_BASE = {
  "clothing/women/001": 101,
  "clothing/men/M-001": 201,
  "clothing/kids/K-001": 301,
  "clothing/shoes/SH-001": 401,
  "clothing/bags/BA-001": 501
};

const today = new Date();
const startDate = new Date('2025-07-01');
const dayOffset = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

const state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
const batches = state.batches;

const generateHtmlForBatch = (batchPath, seedStart = 100) => {
  let html = fs.readFileSync(INPUT_HTML, 'utf8');

  html = html.replace(/<div class="product" id="(p\d+)">([\s\S]*?)<\/div>/g, (match, productId, content) => {
    const index = parseInt(productId.slice(1));
    const seed = seedStart + index;
    const offset = dayOffset + seed;

    // 📦 فروش کل: فقط افزایشی
    const sold = Math.min(980, 30 + offset * 5);

    // ❤️ لایک‌ها: افزایشی با نوسان نرم
    const baseLikeRatio = 0.65 + (Math.sin(offset / 7) * 0.05);
    const likes = Math.min(750, Math.floor(sold * baseLikeRatio));

    // 📊 فروش ۷ روز اخیر: نوسانی ولی نزدیک به 4٪–5٪ فروش
    const weekly = Math.max(10, Math.floor((sold * 0.045) + (Math.random() * 6 - 3)));

    // ⭐️ امتیاز: رشد ملایم با نوسان جزئی
    const ratingBase = 3.5 + (offset / 120);
    const ratingNoise = (Math.random() - 0.5) * 0.2;
    const rating = Math.max(3.0, Math.min(4.9, ratingBase + ratingNoise));

    return `<div class="product" id="${productId}">
      <p><span class="icon">⭐️</span> <strong>${rating.toFixed(1)}</strong> out of 5</p>
      <p><span class="icon">📦</span> Sold: <strong>${sold}</strong> units</p>
      <p><span class="icon">❤️</span> Liked by <strong>${likes}</strong> customers</p>
      <p><span class="icon">📊</span> In the past 7 days, <strong>${weekly}</strong> more<br><span style="color: transparent;">---</span>people bought this product.</p>
    </div>`;
  });

  return html;
};

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  for (const batchPath in batches) {
    const batch = batches[batchPath];
    const outputPath = path.join(OUTPUT_ROOT, `${batchPath}.png`);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    const seedStart = SEED_BASE[batchPath] || batch.lastSeed || 100;
    const htmlContent = generateHtmlForBatch(batchPath, seedStart);
    const tempHtmlPath = path.join(__dirname, 'temp.html');
    fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');

    await page.setViewport({ width: 390, height: 5000, deviceScaleFactor: 2 });
    await page.goto(`file://${tempHtmlPath}`, { waitUntil: 'networkidle0' });

    await page.screenshot({
      path: outputPath,
      fullPage: true,
      omitBackground: true
    });

    console.log(`✅ Generated: ${outputPath}`);
    fs.unlinkSync(tempHtmlPath);

    // بروزرسانی وضعیت state
    batch.generated = true;
    batch.lastGenerated = new Date().toISOString();
  }

  state.lastGenerated = new Date().toISOString();
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');

  await browser.close();
})();
