const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const INPUT_ROOT = path.join(__dirname, '..', 'html');
const OUTPUT_ROOT = path.join(__dirname, '..', 'daily');

// تابع بازگشتی برای پیدا کردن همه فایل‌های .html
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

    // ساخت پوشه مقصد در صورت نیاز
    const outputDir = path.dirname(outputPngPath);
    fs.mkdirSync(outputDir, { recursive: true });

    const fileUrl = `file://${htmlPath}`;

    await page.setViewport({
      width: 450,           // مناسب برای موبایل
      height: 5000,         // برای نمایش همه 100 کالا
      deviceScaleFactor: 2  // وضوح بالا
    });

    await page.goto(fileUrl, { waitUntil: 'networkidle0' });

    await page.screenshot({
      path: outputPngPath,
      fullPage: true,
      omitBackground: true
    });

    console.log(`✅ Screenshot created: ${outputPngPath}`);
  }

  await browser.close();
})();
