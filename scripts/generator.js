import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// مسیرهای پایه
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const INPUT_ROOT = path.join(__dirname, '..', 'html');
const OUTPUT_ROOT = path.join(__dirname, '..', 'daily');

// دریافت همه فایل‌های html به‌صورت بازگشتی
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
    const relativePath = path.relative(INPUT_ROOT, htmlPath); // clothing/women/001.html
    const outputBase = relativePath.replace('.html', '');     // clothing/women/001
    const outputPngPath = path.join(OUTPUT_ROOT, `${outputBase}.png`); // daily/clothing/women/001.png

    // ساخت پوشه خروجی در صورت نیاز
    fs.mkdirSync(path.dirname(outputPngPath), { recursive: true });

    // تولید مقادیر آماری
    const sold = Math.min(980, 30 + dayOffset * 5);
    const likes = Math.min(750, Math.floor(sold * 0.75));
    const weekly = Math.floor(30 + (dayOffset % 20));
    const rating = Math.min(4.8, 3 + (dayOffset % 18) * 0.1);

    console.log(`🔢 Generated numbers: { sold: ${sold}, likes: ${likes}, weekly: ${weekly}, rating: ${rating.toFixed(1)} }`);

    // ویرایش HTML موقت با مقادیر جدید
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    htmlContent = htmlContent
      .replace(/⭐️<\/span> <strong>\d+<\/strong> out of 5/g, `⭐️</span> <strong>${rating.toFixed(1)}</strong> out of 5`)
      .replace(/📦<\/span> Sold: <strong>\d+<\/strong> units/g, `📦</span> Sold: <strong>${sold}</strong> units`)
      .replace(/
