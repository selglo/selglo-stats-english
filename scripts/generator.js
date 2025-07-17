import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// تنظیم مسیرها
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const INPUT_ROOT = path.join(__dirname, '..', 'html');
const OUTPUT_ROOT = path.join(__dirname, '..', 'daily');

// دریافت لیست تمام فایل‌های HTML به‌صورت بازگشتی
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
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  const htmlFiles = getAllHtmlFiles(INPUT_ROOT);

  for (const htmlPath of htmlFiles) {
    const relativePath = path.relative(INPUT_ROOT, htmlPath);
    const outputPngPath = path.join(OUTPUT_ROOT, relativePath.replace('.html', '.png'));
    const outputDir = path.dirname(outputPngPath);
    fs.mkdirSync(outputDir, { recursive: true });

    const fileUrl = `file://${htmlPath}`;

    await page.setViewport({
      width: 390,
      height: 5000,
      deviceScaleFactor: 2
    });

    console.log(`📄 Loading: ${fileUrl}`);
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });

    // منتظر باش تا دیتا توسط جاوااسکریپت رندر شود
    await page.waitForSelector('#stats .item');

    await page.screenshot({
      path: outputPngPath,
      fullPage: true,
      omitBackground: true
    });

    console.log(`📸 Screenshot saved to ${outputPngPath}`);
  }

  await browser.close();
})();
