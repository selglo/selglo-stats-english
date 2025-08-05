import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// مسیر پایه
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_ROOT = path.join(__dirname, '..', 'daily');

// تابع بازگشتی برای دریافت فایل‌های PNG (به‌جز دایرکتوری‌های sliced)
function getAllPngFiles(dir, result = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'sliced') {
        getAllPngFiles(fullPath, result);
      }
    } else if (entry.isFile() && fullPath.endsWith('.png')) {
      result.push(fullPath);
    }
  }
  return result;
}

// شروع
const allPngFiles = getAllPngFiles(OUTPUT_ROOT);
for (const filePath of allPngFiles) {
  fs.writeFileSync(filePath, '');
  console.log('✅ Cleared content:', filePath);
}
