import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// تنظیمات مسیر و فایل
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const INPUT_ROOT = path.join(__dirname, '..', 'html');
const OUTPUT_ROOT = path.join(__dirname, '..', 'daily');

// دریافت لیست فایل‌های HTML به‌صورت بازگشتی
// تابع بازگشتی برای پیدا کردن همه فایل‌های .html
function getAllHtmlFiles(dirPath, fileList = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
@@ -24,61 +20,40 @@ function getAllHtmlFiles(dirPath, fileList = []) {
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
    const relativePath = path.relative(INPUT_ROOT, htmlPath);
    const outputPngPath = path.join(OUTPUT_ROOT, relativePath.replace('.html', '.png'));

    // ساخت پوشه مقصد در صورت نیاز
    const outputDir = path.dirname(outputPngPath);
    fs.mkdirSync(outputDir, { recursive: true });

    const fileUrl = `file://${htmlPath}`;
    const fileUrl = file://${htmlPath};

    await page.setViewport({
      width: 390,
      height: 5000,
      deviceScaleFactor: 2
      width: 390,           // مناسب برای موبایل
      height: 5000,         // برای نمایش همه 100 کالا
      deviceScaleFactor: 2  // وضوح بالا
    });

    // محاسبه آمار
    const sold = Math.min(980, 30 + dayOffset * 5);
    const likes = Math.min(750, Math.floor(sold * 0.75));
    const weekly = Math.floor(30 + (dayOffset % 20));
    const rating = Math.min(4.8, 3 + (dayOffset % 18) * 0.1);

    // جایگزینی مقادیر در HTML
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    htmlContent = htmlContent
      .replace(/⭐️ … out of 5/, `⭐️ ${rating.toFixed(1)} out of 5`)
      .replace(/📦 Sold: … units/, `📦 Sold: ${sold} units`)
      .replace(/❤️ Liked by … customers/, `❤️ Liked by ${likes} customers`)
      .replace(/📊 In the past 7 days, … more/, `📊 In the past 7 days, ${weekly} more`);
    const tempHtmlPath = path.join(__dirname, 'temp.html');
    fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');
    console.log(`🔧 Temp HTML written to ${tempHtmlPath}`);

    await page.goto(`file://${tempHtmlPath}`, { waitUntil: 'networkidle0' });
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });

    await page.screenshot({
      path: outputPngPath,
      fullPage: true,
      omitBackground: true
    });

    console.log(`📸 Screenshot saved to ${outputPngPath}`);

    fs.unlinkSync(tempHtmlPath);
    console.log(`✅ Generated: ${outputPngPath}`);
    console.log(✅ Screenshot created: ${outputPngPath});
  }

  await browser.close();
