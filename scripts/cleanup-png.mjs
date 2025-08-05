// scripts/cleanup-png.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..', 'daily');

function deletePngsRecursively(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      deletePngsRecursively(fullPath);
    } else if (file.endsWith('.png')) {
      fs.unlinkSync(fullPath);
      console.log(`🗑️ Deleted: ${fullPath}`);
    }
  }
}

console.log(`🚀 Starting cleanup in: ${ROOT_DIR}`);
deletePngsRecursively(ROOT_DIR);
console.log('✅ Cleanup complete.');
