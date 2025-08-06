import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// تعیین مسیرهای اصلی پروژه
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const INPUT_ROOT = path.join(__dirname, '..', 'html');
const OUTPUT_ROOT = path.join(__dirname, '..', 'daily');

// دریافت لیست همه فایل‌های HTML در مسیر ورودی
function getAllHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllHtmlFiles(fullPath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

(async () => {
  const today = new Date();
  const startDate = new Date('2025-07-01');
  const daysPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

  // محاسبه عدد شاخص بر اساس تاریخ روز
  const year = today.getFullYear() % 100;
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const dateFactor = Math.sqrt(year + month + Math.cbrt(day));

  // باز کردن مرورگر پاپیتیر
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // لیست فایل‌های HTML برای پردازش
  const htmlFiles = getAllHtmlFiles(INPUT_ROOT);

  for (const htmlPath of htmlFiles) {
    const fileName = path.basename(htmlPath);      // مثلاً "wo-001.html"
    const prefix = fileName.split('-')[0];         // "wo"

    // شناسایی گروه و دایرکتوری خروجی براساس prefix
    let groupOffset = 0, targetDir = '', groupName = '';

    switch (prefix) {
      // گروه اول: clothing
      case 'wo': groupOffset = 11000; targetDir = 'women'; groupName = 'clothing'; break;
      case 'me': groupOffset = 12000; targetDir = 'men'; groupName = 'clothing'; break;
      case 'ba': groupOffset = 13000; targetDir = 'bags'; groupName = 'clothing'; break;
      case 'sh': groupOffset = 14000; targetDir = 'shoes'; groupName = 'clothing'; break;
      case 'ki': groupOffset = 15000; targetDir = 'kids'; groupName = 'clothing'; break;
      case 'je': groupOffset = 16000; targetDir = 'jewelry'; groupName = 'clothing'; break;
      case 'wa': groupOffset = 17000; targetDir = 'watches'; groupName = 'clothing'; break;
      case 'su': groupOffset = 18000; targetDir = 'sunglasses'; groupName = 'clothing'; break;
      case 'ha': groupOffset = 18500; targetDir = 'hats'; groupName = 'clothing'; break;
      case 'sv': groupOffset = 19000; targetDir = 'scarves'; groupName = 'clothing'; break;
      case 'clo': groupOffset = 19500; targetDir = 'clothingother'; groupName = 'clothing'; break;

      // گروه دوم: beauty
      case 'sk': groupOffset = 21000; targetDir = 'skincare'; groupName = 'beauty'; break;
      case 'hi': groupOffset = 22000; targetDir = 'haircare'; groupName = 'beauty'; break;
      case 'bo': groupOffset = 23000; targetDir = 'bodycare'; groupName = 'beauty'; break;
      case 'ma': groupOffset = 24000; targetDir = 'makeup'; groupName = 'beauty'; break;
      case 'pe': groupOffset = 25000; targetDir = 'perfume'; groupName = 'beauty'; break;
      case 'hy': groupOffset = 26000; targetDir = 'hygienecare'; groupName = 'beauty'; break;
      case 'be': groupOffset = 27000; targetDir = 'beautytools'; groupName = 'beauty'; break;
      case 'beo': groupOffset = 28000; targetDir = 'beautyother'; groupName = 'beauty'; break;

      // گروه سوم: food
      case 're': groupOffset = 31000; targetDir = 'restaurants'; groupName = 'food'; break;
      case 'sn': groupOffset = 32000; targetDir = 'snacksstreet'; groupName = 'food'; break;
      case 'nu': groupOffset = 33000; targetDir = 'nutsfruits'; groupName = 'food'; break;
      case 'sw': groupOffset = 34000; targetDir = 'sweets'; groupName = 'food'; break;
      case 'ja': groupOffset = 34500; targetDir = 'jams'; groupName = 'food'; break;
      case 'pf': groupOffset = 35000; targetDir = 'picklesferments'; groupName = 'food'; break;
      case 'sp': groupOffset = 35500; targetDir = 'spices'; groupName = 'food'; break;
      case 'tc': groupOffset = 36000; targetDir = 'teacoffee'; groupName = 'food'; break;
      case 'ju': groupOffset = 37000; targetDir = 'juices'; groupName = 'food'; break;
      case 'lo': groupOffset = 38000; targetDir = 'localtrad'; groupName = 'food'; break;
      case 'ci': groupOffset = 39000; targetDir = 'cookingredients'; groupName = 'food'; break;
      case 'foo': groupOffset = 39500; targetDir = 'foodother'; groupName = 'food'; break;

      // 14 گروه Software
      case 'sl': groupOffset = 141000; targetDir = 'softwarelicenses'; groupName = 'software'; break;
      case 'mb': groupOffset = 142000; targetDir = 'mobileapps'; groupName = 'software'; break;
      case 'pc': groupOffset = 143000; targetDir = 'pcgames'; groupName = 'software'; break;
      case 'cg': groupOffset = 144000; targetDir = 'consolegames'; groupName = 'software'; break;
      case 'gi': groupOffset = 145000; targetDir = 'giftcards'; groupName = 'software'; break;
      case 'gg': groupOffset = 146000; targetDir = 'gaming'; groupName = 'software'; break;
      case 'mv': groupOffset = 147000; targetDir = 'moviesmusic'; groupName = 'software'; break;
      case 'soo': groupOffset = 149900; targetDir = 'softwareother'; groupName = 'software'; break;
        
      default:
        console.warn(`⚠️ پیشوند ناشناخته: ${prefix} → فایل نادیده گرفته شد`);
        continue;
    }

    const outputDir = path.join(OUTPUT_ROOT, groupName, targetDir);
    fs.mkdirSync(outputDir, { recursive: true });

    const outputFile = fileName.replace('.html', '.png');
    const outputPath = path.join(outputDir, outputFile);

    // خواندن و پردازش محتوای HTML
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    const seedBase = parseInt(fileName.match(/\d+/)?.[0] || '1');

    htmlContent = htmlContent.replace(/<div class="product" id="(p\d+)">([\s\S]*?)<\/div>/g, (match, id) => {
      const index = parseInt(id.slice(1));
      const seed = groupOffset + seedBase * 100 + index;

      const baseSold = 30 + (seed % 15);
      const maxSold = 980;
      const progress = (daysPassed % 180) / 180;
      const sold = Math.floor(baseSold + (maxSold - baseSold) * progress);

      const weekly = Math.min(Math.floor(sold / 4), Math.floor(10 + (sold % 10) + Math.cos(seed / 3 + dateFactor) * 2.5));
      const likes = Math.min(750, Math.floor(sold * (0.6 + Math.sin((seed + dateFactor) / 11) * 0.1)));
      const rating = Math.min(4.8, 3 + ((seed % 20) * 0.1 + Math.sin(seed + dateFactor / 10) * 0.2));

      return `<div class="product" id="${id}">
        <p><span class="icon">⭐️</span> <strong>${rating.toFixed(1)}</strong> out of 5</p>
        <p><span class="icon">📦</span> Sold: <strong>${sold}</strong> units</p>
        <p><span class="icon">❤️</span> Liked by <strong>${likes}</strong> customers</p>
        <p><span class="icon">📊</span> In the past 7 days, <strong>${weekly}</strong> more<br><span style="color: transparent;">---</span>people bought this product.</p>
      </div>`;
    });

    // ایجاد فایل موقت و رندر آن
    const tempPath = path.join(__dirname, 'temp.html');
    fs.writeFileSync(tempPath, htmlContent, 'utf8');

    await page.setViewport({ width: 390, height: 5000, deviceScaleFactor: 2 });
    await page.goto(`file://${tempPath}`, { waitUntil: 'networkidle0' });

    // حذف فایل قبلی اگر وجود دارد
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

    // گرفتن اسکرین‌شات و ذخیره
    await page.screenshot({
      path: outputPath,
      fullPage: true,
      omitBackground: true,
    });

    // حذف فایل موقت
    fs.unlinkSync(tempPath);
  }

  await browser.close();
})();
