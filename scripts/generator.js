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
        
      // 4 گروه Home
      case 'co': groupOffset = 41000; targetDir = 'cookware'; groupName = 'home'; break;
      case 'kt': groupOffset = 42000; targetDir = 'kitchentools'; groupName = 'home'; break;
      case 'st': groupOffset = 42500; targetDir = 'storage'; groupName = 'home'; break;
      case 'cl': groupOffset = 43000; targetDir = 'cleaningtools'; groupName = 'home'; break;
      case 'sc': groupOffset = 44000; targetDir = 'smartcleaners'; groupName = 'home'; break;
      case 'ta': groupOffset = 44500; targetDir = 'tableware'; groupName = 'home'; break;
      case 'li': groupOffset = 45000; targetDir = 'lighting'; groupName = 'home'; break;
      case 'te': groupOffset = 46000; targetDir = 'textiles'; groupName = 'home'; break;
      case 'de': groupOffset = 47000; targetDir = 'decor'; groupName = 'home'; break;
      case 'dg': groupOffset = 48000; targetDir = 'digitalgadgets'; groupName = 'home'; break;
      case 'hoo': groupOffset = 49000; targetDir = 'homeother'; groupName = 'home'; break;

      // 5 گروه Electronics
      case 'mo': groupOffset = 51000; targetDir = 'mobile'; groupName = 'electronics'; break;
      case 'tb': groupOffset = 52000; targetDir = 'tablets'; groupName = 'electronics'; break;
      case 'cp': groupOffset = 53000; targetDir = 'computers'; groupName = 'electronics'; break;
      case 'ch': groupOffset = 54000; targetDir = 'chargers'; groupName = 'electronics'; break;
      case 'he': groupOffset = 55000; targetDir = 'headphones'; groupName = 'electronics'; break;
      case 'sm': groupOffset = 56000; targetDir = 'smartwatches'; groupName = 'electronics'; break;
      case 'ca': groupOffset = 57000; targetDir = 'cables'; groupName = 'electronics'; break;
      case 'cm': groupOffset = 58000; targetDir = 'cameras'; groupName = 'electronics'; break;
      case 'elo': groupOffset = 59000; targetDir = 'electronicsother'; groupName = 'electronics'; break;

      // 6 گروه Vehicles
      case 'cr': groupOffset = 61000; targetDir = 'car'; groupName = 'vehicles'; break;
      case 'mt': groupOffset = 62000; targetDir = 'motorcycle'; groupName = 'vehicles'; break;
      case 'by': groupOffset = 63000; targetDir = 'bicycle'; groupName = 'vehicles'; break;
      case 'so': groupOffset = 64000; targetDir = 'scooters'; groupName = 'vehicles'; break;
      case 'ti': groupOffset = 65000; targetDir = 'tires'; groupName = 'vehicles'; break;
      case 'in': groupOffset = 66000; targetDir = 'interiorparts'; groupName = 'vehicles'; break;
      case 'ex': groupOffset = 67000; targetDir = 'exteriorparts'; groupName = 'vehicles'; break;
      case 'veo': groupOffset = 68000; targetDir = 'vehiclesother'; groupName = 'vehicles'; break;

      // 7 گروه Tools
      case 'hn': groupOffset = 71000; targetDir = 'handtools'; groupName = 'tools'; break;
      case 'po': groupOffset = 72000; targetDir = 'powertools'; groupName = 'tools'; break;
      case 'hr': groupOffset = 73000; targetDir = 'hardware'; groupName = 'tools'; break;
      case 'pa': groupOffset = 74000; targetDir = 'paintcoatings'; groupName = 'tools'; break;
      case 'pl': groupOffset = 75000; targetDir = 'plumbing'; groupName = 'tools'; break;
      case 'ee': groupOffset = 76000; targetDir = 'electricalsupplies'; groupName = 'tools'; break;
      case 'bu': groupOffset = 77000; targetDir = 'building'; groupName = 'tools'; break;
      case 'too': groupOffset = 79900; targetDir = 'toolsother'; groupName = 'tools'; break;

      // 8 گروه Plants
      case 'id': groupOffset = 81000; targetDir = 'indoorplants'; groupName = 'plants'; break;
      case 'ou': groupOffset = 82000; targetDir = 'outdoorplants'; groupName = 'plants'; break;
      case 'se': groupOffset = 83000; targetDir = 'seeds'; groupName = 'plants'; break;
      case 'pt': groupOffset = 84000; targetDir = 'pots'; groupName = 'plants'; break;
      case 'sf': groupOffset = 85000; targetDir = 'soilfertilizer'; groupName = 'plants'; break;
      case 'ga': groupOffset = 86000; targetDir = 'gardening'; groupName = 'plants'; break;
      case 'pn': groupOffset = 87000; targetDir = 'plantdecor'; groupName = 'plants'; break;
      case 'plo': groupOffset = 89900; targetDir = 'plantsother'; groupName = 'plants'; break;

      // 9 گروه Baby
      case 'bb': groupOffset = 91000; targetDir = 'babyclothing'; groupName = 'baby'; break;
      case 'to': groupOffset = 92000; targetDir = 'toys'; groupName = 'baby'; break;
      case 'bc': groupOffset = 93000; targetDir = 'babycare'; groupName = 'baby'; break;
      case 'mr': groupOffset = 94000; targetDir = 'maternitywear'; groupName = 'baby'; break;
      case 'ss': groupOffset = 95000; targetDir = 'strollers'; groupName = 'baby'; break;
      case 'fe': groupOffset = 96000; targetDir = 'feedingsupplies'; groupName = 'baby'; break;
      case 'sg': groupOffset = 97000; targetDir = 'schoolbags'; groupName = 'baby'; break;
      case 'bao': groupOffset = 99900; targetDir = 'babyother'; groupName = 'baby'; break;

      // 10 گروه Pet
      case 'pd': groupOffset = 101000; targetDir = 'petfood'; groupName = 'pet'; break;
      case 'py': groupOffset = 102000; targetDir = 'pettoys'; groupName = 'pet'; break;
      case 'bh': groupOffset = 103000; targetDir = 'bedshouses'; groupName = 'pet'; break;
      case 'gr': groupOffset = 104000; targetDir = 'grooming'; groupName = 'pet'; break;
      case 'bw': groupOffset = 105000; targetDir = 'bowlsfeeders'; groupName = 'pet'; break;
      case 'le': groupOffset = 106000; targetDir = 'leashes'; groupName = 'pet'; break;
      case 'ph': groupOffset = 107000; targetDir = 'pethygiene'; groupName = 'pet'; break;
      case 'peo': groupOffset = 109900; targetDir = 'petother'; groupName = 'pet'; break;

      // 11 گروه Sports
      case 'fi': groupOffset = 111000; targetDir = 'fitness'; groupName = 'sports'; break;
      case 'ce': groupOffset = 112000; targetDir = 'campingequipment'; groupName = 'sports'; break;
      case 'bs': groupOffset = 113000; targetDir = 'bicyclesscooters'; groupName = 'sports'; break;
      case 'tr': groupOffset = 114000; targetDir = 'travel'; groupName = 'sports'; break;
      case 'sb': groupOffset = 115000; targetDir = 'swimbeach'; groupName = 'sports'; break;
      case 'hk': groupOffset = 116000; targetDir = 'hiking'; groupName = 'sports'; break;
      case 'pi': groupOffset = 117000; targetDir = 'picnic'; groupName = 'sports'; break;
      case 'spo': groupOffset = 119900; targetDir = 'sportsother'; groupName = 'sports'; break;

      // 12 گروه Office
      case 'no': groupOffset = 121000; targetDir = 'notebooks'; groupName = 'office'; break;
      case 'pp': groupOffset = 122000; targetDir = 'penspencils'; groupName = 'office'; break;
      case 'of': groupOffset = 123000; targetDir = 'officesupplies'; groupName = 'office'; break;
      case 'sa': groupOffset = 124000; targetDir = 'stationery'; groupName = 'office'; break;
      case 'pr': groupOffset = 125000; targetDir = 'printers'; groupName = 'office'; break;
      case 'dc': groupOffset = 126000; targetDir = 'deskschairs'; groupName = 'office'; break;
      case 'ed': groupOffset = 127000; targetDir = 'educational'; groupName = 'office'; break;
      case 'ofo': groupOffset = 129900; targetDir = 'officeother'; groupName = 'office'; break;

      // 13 گروه Books
      case 'fc': groupOffset = 131000; targetDir = 'fiction'; groupName = 'book'; break;
      case 'nf': groupOffset = 132000; targetDir = 'nonfiction'; groupName = 'book'; break;
      case 'cb': groupOffset = 133000; targetDir = 'childrensbooks'; groupName = 'book'; break;
      case 'dr': groupOffset = 134000; targetDir = 'drawing'; groupName = 'book'; break;
      case 'pg': groupOffset = 135000; targetDir = 'painting'; groupName = 'book'; break;
      case 'di': groupOffset = 136000; targetDir = 'diykits'; groupName = 'book'; break;
      case 'mu': groupOffset = 137000; targetDir = 'musical'; groupName = 'book'; break;
      case 'boo': groupOffset = 139900; targetDir = 'bookother'; groupName = 'book'; break;
        
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
