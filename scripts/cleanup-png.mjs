import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..', 'daily');

// بازگشتی همه فایل‌های .png را حذف می‌کند
function deletePngFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      deletePngFiles(fullPath); // رفتن به پوشه‌های داخلی
    } else if (file.endsWith('.png')) {
      fs.unlinkSync(fullPath);
      console.log(`❌ Deleted: ${fullPath}`);
    }
  }
}

deletePngFiles(ROOT);
