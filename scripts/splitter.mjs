import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage } from 'canvas';

// حل مشکل __dirname در ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// مسیر فایل تصویری اصلی
const INPUT_PATH = path.join(__dirname, '..', 'daily', 'clothing', 'women', '001.png');

// مسیر ذخیره برش‌ها
const OUTPUT_DIR = path.join(__dirname, '..', 'daily', 'clothing', 'women', 'sliced');

// مشخصات تصویر
const TOTAL_ITEMS = 10;
const ITEM_HEIGHT = 120;
const IMAGE_WIDTH = 390;
const PADDING = 0;

(async () => {
  // اطمینان از وجود فولدر مقصد
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const image = await loadImage(INPUT_PATH);
  const canvas = createCanvas(IMAGE_WIDTH, ITEM_HEIGHT);
  const ctx = canvas.getContext('2d');

  for (let i = 0; i < TOTAL_ITEMS; i++) {
    ctx.clearRect(0, 0, IMAGE_WIDTH, ITEM_HEIGHT);
    ctx.drawImage(
      image,
      0,
      i * (ITEM_HEIGHT + PADDING),
      IMAGE_WIDTH,
      ITEM_HEIGHT,
      0,
      0,
      IMAGE_WIDTH,
      ITEM_HEIGHT
    );

    const buffer = canvas.toBuffer('image/png');
    const fileName = 001-${String(i + 1).padStart(3, '0')}.png;
    const filePath = path.join(OUTPUT_DIR, fileName);
    fs.writeFileSync(filePath, buffer);
    console.log(`✅ Saved: ${fileName}`);
  }
})();
