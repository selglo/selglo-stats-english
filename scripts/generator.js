import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// تنظیم مسیر‌ها
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const INPUT_ROOT = path.join(__dirname, '..', 'html');
const OUTPUT_ROOT = path.join(__dirname, '..', 'daily');

// دریافت همه فایل‌های HTML به صورت بازگشتی
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

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  const htmlFiles = getAllHtmlFiles(INPUT_ROOT);

  for (const htmlPath of htmlFiles) {
    const relativePath = path.relative(INPUT_ROOT, htmlPath);  // مثلاً clothing/women/001.html

    // تبدیل مسیر خروجی به همان مسیر فعلی ولی با نام جدید 0011.png
    const outputBase = relativePath.replace('.html', '');
    const outputPngPath = path.join(OUTPUT_ROOT, `${outputBase}1.png`);  // 0011.png

    // ساخت پوشه خروجی فقط در صورت نبود (همان مسیر اصلی قبلی)
    fs.mkdirSync(path.dirname(outputPngPath), { recursive: true });

    // ساخت مسیر جدید برای فایل خروجی: 0011.png
    const outputPngPath = path.join(outputDir, `${outputBase}1.png`);

    // آمار نمونه برای تست (بعداً قابل تغییر است)
    const sold = Math.min(980, 30 + dayOffset * 5);
    const likes = Math.min(750, Math.floor(sold * 0.75));
    const weekly = Math.floor(30 + (dayOffset % 20));
    const rating = Math.min(4.8, 3 + (dayOffset % 18) * 0.1);

    console.log(`🔢 Generated numbers: { sold: ${sold}, likes: ${likes}, weekly: ${weekly}, rating: ${rating.toFixed(1)} }`);

    // خواندن و ویرایش HTML
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    htmlContent = htmlContent
      .replace(/⭐️ (\.\.\.|…) out of 5/, `⭐️ ${rating.toFixed(1)} out of 5`)
      .replace(/📦 Sold: (\.\.\.|…) units/, `📦 Sold: ${sold} units`)
      .replace(/❤️ Liked by (\.\.\.|…) customers/, `❤️ Liked by ${likes} customers`)
      .replace(/📊 In the past 7 days, (\.\.\.|…) more people bought this product\./, `📊 In the past 7 days, ${weekly} more people bought this product.`);

    const tempHtmlPath = path.join(__dirname, 'temp.html');
    fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');
    console.log(`🧠 HTML replaced and saved to temp file`);

    // بارگذاری و ساخت اسکرین‌شات
    const fileUrl = `file://${tempHtmlPath}`;
    await page.setViewport({
      width: 390,
      height: 5000,
      deviceScaleFactor: 2
    });

    await page.goto(fileUrl, { waitUntil: 'networkidle0' });

    await page.screenshot({
      path: outputPngPath,
      fullPage: true,
      omitBackground: true
    });

    console.log(`📸 Screenshot saved to ${outputPngPath}`);

    fs.unlinkSync(tempHtmlPath);
    console.log(`🧹 Temp file deleted`);
  }

  await browser.close();
})();
