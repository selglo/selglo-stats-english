// clear-pngs.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// مسیر ریشه خروجی تصاویر
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_ROOT = path.join(__dirname, '..', 'daily');

// تابع بازگشتی برای پیدا کردن تمام فایل‌های .png
function clearAllPngs(dirPath) {
  const items = fs.readdirSync(dirPath);

  items.forEach(item => {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      clearAllPngs(fullPath); // ادامه در زیرپوشه‌ها
    } else if (item.endsWith('.png')) {
      fs.writeFileSync(fullPath, '');  // پاک کردن محتوا
      console.log(`✅ Cleared content: ${fullPath}`);
    }
  });
}

// اجرا
clearAllPngs(OUTPUT_ROOT);
