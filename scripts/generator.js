import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// مسیرهای پایه
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const INPUT_ROOT = path.join(__dirname, '..', 'html');
const OUTPUT_ROOT = path.join(__dirname, '..', 'daily');

// گرفتن همه فایل‌های HTML داخل html/
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
    const relativePath = path.relative(INPUT_ROOT, htmlPath);  // مثل clothing/women/001.html
    const outputBase = relativePath.replace('.html', '');       // clothing/women/001
    const outputPngPath = path.join(OUTPUT_ROOT, `${outputBase}.png`);  // daily/clothing/women/001.png

    // پوشه خروجی اگر وجود نداشت ایجاد شود
    fs.mkdirSync(path.dirname(outputPngPath), { recursive: true });

    // آمار ساختگی
    const sold = Math.min(980, 30 + dayOffset * 5);
    const likes = Math.min(750, Math.floor(sold * 0.75));
    const weekly = Math.floor(30 + (dayOffset % 20));
    const rating = Math.min(4.8, 3 + (dayOffset % 18) * 0.1);

    console.log(`🔢 Generated stats: sold=${sold}, likes=${likes}, weekly=${weekly}, rating=${rating.toFixed(1)}`);

    // جایگزینی در HTML
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    htmlContent = htmlContent
      .replace(/<strong>111<\/strong>/g, `<strong>${rating.toFixed(1)}</strong>`)
      .replace(/<strong>222<\/strong>/g, `<strong>${sold}</strong>`)
      .replace(/<strong>333<\/strong>/g, `<strong>${likes}</strong>`)
      .replace(/<strong>444<\/strong>/g, `<strong>${weekly}</strong>`);

    const tempHtmlPath = path.join(__dirname, 'temp.html');
    fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');
    console.log(`✅ HTML edited → temp.html`);

    // اسکرین‌شات از فایل HTML
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

    // حذف فایل موقت
    fs.unlinkSync(tempHtmlPath);
    console.log(`🧹 Temp file deleted`);
  }

  await browser.close();
})();
