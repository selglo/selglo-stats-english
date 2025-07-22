import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// مسیرهای پایه
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const INPUT_ROOT = path.join(__dirname, '..', 'html');
const OUTPUT_ROOT = path.join(__dirname, '..', 'daily/clothing');

// دریافت همه فایل‌های HTML
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

// نگاشت پیشوند به پوشه
function groupCodeToFolder(code) {
  return {
    ba: 'bags',
    me: 'men',
    wo: 'women',
    sh: 'shoes',
    ki: 'kids'
  }[code] || 'unknown';
}

(async () => {
  const today = new Date();
  const startDate = new Date('2025-07-01');
  const dayOffset = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const htmlFiles = getAllHtmlFiles(INPUT_ROOT);

  for (const htmlPath of htmlFiles) {
    const parsed = path.parse(htmlPath);           // مانند wo-001.html
    const groupCode = parsed.name.slice(0, 2);     // استخراج "wo"
    const groupFolder = groupCodeToFolder(groupCode);  // تبدیل به women

    const outputDir = path.join(OUTPUT_ROOT, groupFolder);  // مسیر خروجی نهایی
    const outputFile = parsed.name + '.png';       // مانند wo-001.png
    const outputPath = path.join(outputDir, outputFile);    // مسیر کامل ذخیره

    fs.mkdirSync(outputDir, { recursive: true });

    let htmlContent = fs.readFileSync(htmlPath, 'utf8');

    // استخراج seed از نام فایل
    const seedMatch = parsed.name.match(/\d+/);
    const seedBase = seedMatch ? parseInt(seedMatch[0]) : 1;
    const baseOffset = seedBase;

    // جایگزینی محتوای محصول‌ها
    htmlContent = htmlContent.replace(/<div class="product" id="(p\d+)">([\s\S]*?)<\/div>/g, (match, productId) => {
      const index = parseInt(productId.slice(1));
      const offset = baseOffset + index;

      const sold = Math.min(980, 30 + offset * 5);
      const likes = Math.min(750, Math.floor(sold * (0.6 + Math.sin(offset / 5) * 0.1)));
      const weekly = Math.floor(30 + (sold % 20));
      const rating = Math.min(4.8, 3 + ((offset % 20) * 0.1 + (Math.random() - 0.5) * 0.2));

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
      path: outputPath,
      fullPage: true,
      omitBackground: true
    });

    fs.unlinkSync(tempHtmlPath);
  }

  await browser.close();
})();
