import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..', 'daily');

function clearPngFilesInSlicedDirs(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === 'sliced') {
        const slicedFiles = fs.readdirSync(fullPath);
        for (const file of slicedFiles) {
          if (file.endsWith('.png')) {
            const filePath = path.join(fullPath, file);
            fs.writeFileSync(filePath, ''); // فقط خالی کن، حذف نکن
            console.log(`✂️ Cleared content: ${filePath}`);
          }
        }
      } else {
        clearPngFilesInSlicedDirs(fullPath);
      }
    }
  }
}

clearPngFilesInSlicedDirs(ROOT_DIR);
console.log('✅ All sliced PNG file contents cleared.');
