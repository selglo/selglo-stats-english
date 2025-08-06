import fs from 'fs';
import path from 'path';

const baseDir = path.resolve('daily');

function clearPngFiles(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);

    // ⛔ از مسیرهای شامل "sliced" صرف‌نظر کن
    if (item.isDirectory()) {
      if (fullPath.includes('sliced')) continue;
      clearPngFiles(fullPath);
    } else if (item.isFile() && item.name.endsWith('.png')) {
      fs.writeFileSync(fullPath, ''); // پاک کردن محتوا
      console.log('✔ Cleared:', fullPath);
    }
  }
}

clearPngFiles(baseDir);
