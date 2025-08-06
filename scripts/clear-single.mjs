import fs from 'fs';
import path from 'path';

const filePath = path.resolve('daily/baby/babycare/bc-001.png');

if (fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, ''); // فقط خالی‌اش می‌کنیم
  console.log('✔ File content cleared.');
} else {
  console.log('⚠ File not found:', filePath);
}
