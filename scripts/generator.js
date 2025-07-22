import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// مسیرهای اصلی
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const INPUT_ROOT = path.join(__dirname, '..', 'html');
const OUTPUT_ROOT = path.join(__dirname, '..', 'daily', 'clothing');

// تابع بازگشتی برای دریافت همه HTML‌ها
function getAllHtmlFiles(dirPath, fileList = []) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllHtmlFiles(fullPath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const htmlFiles = getAllHtmlFiles(INPUT_ROOT);

  for (const htmlPath of htmlFiles) {
    const baseName = path.basename(htmlPath); // مثال: wo-001.html
    const prefix = baseName.split('-')[0];    // مثال: "wo"

    // 🔢 تنظیم پوشه و seed اختصاصی
    let targetDir = '';
    let baseSeed = 0;

    switch (prefix) {
      case 'wo':
        targetDir = 'women';
        baseSeed = 100;
        break;
      case 'me':
        targetDir = 'men';
        baseSeed = 200;
        break;
      case 'ba':
        targetDir = 'bags';
        baseSeed = 300;
        break;
      case 'sh':
        targetDir = 'shoes';
        baseSeed = 400;
        break;
      case 'ki':
        targetDir = 'kids';
        baseSeed = 500;
        break;
      case 'to':
        targetDir = 'toys';
        baseSeed = 600;
        break;
      case 'be':
        targetDir = 'beauty';
        baseSeed = 700;
        break;
      default:
        targetDir = 'unknown';
        baseSeed = 999;
        break;
    }

    const outputDir = path.join(OUTPUT_ROOT, targetDir);
    fs.mkdirSync(outputDir, { recursive: true });

    const outputFile = baseName.replace('.html', '.png');
    const outputPath = path.join(outputDir, outputFile);

    // خواندن و پردازش HTML
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');

    htmlContent = htmlContent.replace(/<div class="product" id="(p\d+)">([\s\S]*?)<\/div>/g, (match, productId) => {
      const index = parseInt(productId.slice(1));   // 1 تا 10
      const offset = baseSeed + index;              // عدد یکتا و متفاوت برای هر محصول

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
