import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// لازم برای __dirname معادل در ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

function generateStats(seed) {
  const rng = (s) => {
    let x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  const sold = Math.floor(30 + rng(seed) * (980 - 30));
  const likeRatio = 0.6 + rng(seed + 1) * 0.2;
  const likes = Math.floor(sold * likeRatio);
  const weekly = 30 + Math.floor(rng(seed + 2) * 21);
  const star = (3 + rng(seed + 3) * 1.8).toFixed(1);

  return { sold, likes, weekly, star };
}

function injectStats(html, stats) {
  return html
    .replace(/<span class="rating">.*?<\/span>/, `<span class="rating">⭐ ${stats.star} out of 5</span>`)
    .replace(/<span class="sold">.*?<\/span>/, `<span class="sold">📦 Sold: ${stats.sold} units</span>`)
    .replace(/<span class="likes">.*?<\/span>/, `<span class="likes">❤️ Liked by ${stats.likes} customers</span>`)
    .replace(/<span class="weekly">.*?<\/span>/, `<span class="weekly">📊 In the past 7 days, ${stats.weekly} more people bought this product.</span>`);
}

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox']
});

const page = await browser.newPage();
const htmlFiles = getAllHtmlFiles(INPUT_ROOT);

for (const htmlPath of htmlFiles) {
  const relativePath = path.relative(INPUT_ROOT, htmlPath);
  const outputPngPath = path.join(OUTPUT_ROOT, relativePath.replace('.html', '.png'));

  fs.mkdirSync(path.dirname(outputPngPath), { recursive: true });

  const seed = parseInt(relativePath.match(/\d+/)?.[0] || '1', 10);
  const stats = generateStats(seed);

  let html = fs.readFileSync(htmlPath, 'utf8');
  html = injectStats(html, stats);

  const fileUrl = 'data:text/html,' + encodeURIComponent(html);

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

  console.log(`✅ Screenshot created: ${outputPngPath}`);
}

await browser.close();
