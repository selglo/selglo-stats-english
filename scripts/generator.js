import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const INPUT_ROOT = path.join(__dirname, '..', 'html');
const OUTPUT_ROOT = path.join(__dirname, '..', 'daily');

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
    const relativePath = path.relative(INPUT_ROOT, htmlPath); // مثل clothing/bags/ba-001.html
    const parsed = path.parse(relativePath);
    const outputDir = path.join(OUTPUT_ROOT, parsed.dir);     // مثل daily/clothing/bags
    const outputFile = parsed.name + '.png';                  // مثل ba-001.png
    const outputPath = path.join(outputDir, outputFile);

    fs.mkdirSync(outputDir, { recursive: true });

    let htmlContent = fs.readFileSync(htmlPath, 'utf8');

    // seed بر اساس نام فایل (ba-001 → 101, ki-001 → 201 ...)
    const seedMatch = parsed.name.match(/\d+/);
    const seedBase = seedMatch ? parseInt(seedMatch[0]) : 1;
    const baseOffset = seedBase;

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
