import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// مسیرهای پایه
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const INPUT_ROOT = path.join(__dirname, '..', 'html');
const OUTPUT_ROOT = path.join(__dirname, '..', 'daily');

// تابع بازگشتی برای دریافت همه فایل‌های HTML
function getAllHtmlFiles(dirPath, fileList = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllHtmlFiles(fullPath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(fullPath);
    }
  });
  return fileList;
}

(async () => {
  const today = new Date();
  const startDate = new Date('2025-07-01');
  const dayOffset = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const htmlFiles = getAllHtmlFiles(INPUT_ROOT);

  console.log('✅ HTML files found:', htmlFiles.map(f => path.relative(INPUT_ROOT, f)));

  for (const htmlPath of htmlFiles) {
    const relativePath = path.relative(INPUT_ROOT, htmlPath); // مثل clothing/women/wo-001.html
    console.log('🚀 Processing:', relativePath);

    const outputBase = relativePath.replace(/\.html$/, '').replace(/\\/g, '/'); // اصلاح مسیر ویندوز
    const outputPngPath = path.join(OUTPUT_ROOT, `${outputBase}.png`);
    fs.mkdirSync(path.dirname(outputPngPath), { recursive: true });

    // خواندن محتوای HTML
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');

    // جایگزینی محتوای آماری برای هر محصول
    htmlContent = htmlContent.replace(/<div class="product" id="(p\d+)">([\s\S]*?)<\/div>/g, (match, productId, content) => {
      const index = parseInt(productId.slice(1));
      const offset = dayOffset + index * 3;

      const sold = Math.min(980, 30 + offset * 5);
      const baseLikeRatio = 0.65 + (Math.sin(offset / 7) * 0.05);
      const likes = Math.min(750, Math.floor(sold * baseLikeRatio));
      const weekly = Math.max(10, Math.floor((sold * 0.045) + (Math.random() * 6 - 3)));
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

    const tempHtmlPath = path.join(__dirname, 'temp.html');
    fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');

    await page.setViewport({ width: 390, height: 5000, deviceScaleFactor: 2 });
    await page.goto(`file://${tempHtmlPath}`, { waitUntil: 'networkidle0' });

    await page.screenshot({
      path: outputPngPath,
      fullPage: true,
      omitBackground: true
    });

    fs.unlinkSync(tempHtmlPath);
    console.log('✅ Created:', outputPngPath);
  }

  await browser.close();
  console.log('🎉 All screenshots generated successfully.');
})();
