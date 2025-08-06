// حذف همه فایل‌های PNG داخل دایرکتوری‌های daily/.../sliced/
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..', 'daily');

function deletePngsInSlicedDirs(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === 'sliced') {
        const slicedFiles = fs.readdirSync(fullPath);
        for (const file of slicedFiles) {
          if (file.endsWith('.png')) {
            const filePath = path.join(fullPath, file);
            fs.unlinkSync(filePath);
            console.log(`🗑️ Deleted: ${filePath}`);
          }
        }
      } else {
        deletePngsInSlicedDirs(fullPath);
      }
    }
  }
}

deletePngsInSlicedDirs(ROOT_DIR);
console.log('✅ All sliced PNG files deleted.');
