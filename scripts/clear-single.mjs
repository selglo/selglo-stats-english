import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// تعیین مسیر دقیق فایل
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetFile = path.join(__dirname, '..', 'daily', 'baby', 'babycare', 'bc-001.png');

// اگر وجود داشت، خالی‌اش کن
if (fs.existsSync(targetFile)) {
  fs.writeFileSync(targetFile, '');
  console.log('✅ File cleared:', targetFile);
} else {
  console.log('❌ File not found:', targetFile);
}
