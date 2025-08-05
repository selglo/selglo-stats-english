import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_ROOT = path.join(__dirname, '..', 'daily');

function clearPngFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // اگر نام پوشه "sliced" نبود، برو داخلش
      if (file !== 'sliced') {
        clearPngFiles(fullPath);
      }
    } else if (file.endsWith('.png')) {
      // فایل‌های PNG را فقط پاک می‌کنیم (محتوا خالی میشه ولی فایل حذف نمی‌شه)
      fs.writeFileSync(fullPath, '');
      console.log(`✅ Cleared content: ${fullPath}`);
    }
  }
}

clearPngFiles(OUTPUT_ROOT);
