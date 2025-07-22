import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// تعیین مسیرهای پایه
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

  for (const htmlPath of htmlFiles) {
    const fileName = path.basename(htmlPath);         // مثلاً "wo-001.html"
    const prefix = fileName.split('-')[0];            // "wo"

    // تعیین دایرکتوری خروجی بر اساس پیشوند
    let groupOffset = 0;
    let targetDir = '';  // ✅ خط اضافه‌شده برای رفع خطا

    switch (prefix) {
      case 'wo': groupOffset = 1000; targetDir = 'women'; break;
      case 'me': groupOffset = 2000; targetDir = 'men'; break;
      case 'ba': groupOffset = 3000; targetDir = 'bags'; break;
      case 'sh': groupOffset = 4000; targetDir = 'shoes'; break;
      case 'ki': groupOffset = 5000; targetDir = 'kids'; break;
      default:
        console.warn(`⚠️ Unknown prefix "${prefix}" in file ${fileName}, skipping.`);
        continue;
    }

    const outputDir = path.join(OUTPUT_ROOT, 'clothing', targetDir);
    const outputFile = fileName.replace('.html', '.png'); // مثل wo-001.png
    const outputPngPath = path.join(outputDir, outputFile);
    fs.mkdirSync(outputDir, { recursive: true });

    // خواندن HTML
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');

    // استخراج seed برای آمار مستقل
    const seedMatch = fileName.match(/\d+/);
    const seedBase = seedMatch ? parseInt(seedMatch[0]) : 1;
    const baseOffset = seedBase;

    // محاسبه آمار برای هر محصول
    htmlContent = htmlContent.replace(/<div class="product" id="(p\d+)">([\s\S]*?)<\/div>/g, (match, productId) => {
      const index = parseInt(productId.slice(1));
      const productSeed = groupOffset + seedBase * 100 + index;

      const maxSold = 980;
      const sold = Math.min(maxSold, Math.floor(30 + productSeed + dayOffset * 2.2 + (productSeed % 5) * Math.sin(dayOffset / 7)));
      const weekly = Math.min(Math.floor(sold / 4), Math.floor(10 + (sold % 10) + (Math.cos(dayOffset / 4 + productSeed) * 3)));
      const likes = Math.min(750, Math.floor(sold * (0.6 + Math.sin((productSeed + dayOffset) / 11) * 0.1)));
      const rating = Math.min(4.8, 3 + ((productSeed % 20) * 0.1 + (Math.sin(productSeed + dayOffset / 10) * 0.2)));

      return `<div class="product" id="${productId}">
        <p><span class="icon">⭐️</span> <strong>${rating.toFixed(1)}</strong> out of 5</p>
        <p><span class="icon">📦</span> Sold: <strong>${sold}</strong> units</p>
        <p><span class="icon">❤️</span> Liked by <strong>${likes}</strong> customers</p>
        <p><span class="icon">📊</span> In the past 7 days, <strong>${weekly}</strong> more<br><span style="color: transparent;">---</span>people bought this product.</p>
      </div>`;
    });

    // ایجاد فایل موقت و گرفتن اسکرین‌شات
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
  }

  await browser.close();
})();
