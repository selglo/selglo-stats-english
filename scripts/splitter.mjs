import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';

const INPUT_PATH = path.join('daily', 'clothing', 'women', '001.png');
const OUTPUT_DIR = path.join('daily', 'clothing', 'women', 'sliced');
const TOTAL_ITEMS = 10;
const ITEM_HEIGHT = 120; // مطابق CSS در HTML
const IMAGE_WIDTH = 390; // مطابق viewport
const PADDING = 0; // اگر فاصله‌ای بین آیتم‌ها نباشد

// مطمئن شو که فولدر خروجی وجود دارد
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

(async () => {
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
    const outputFileName = 001-${String(i + 1).padStart(3, '3')}.png;
    const outputPath = path.join(OUTPUT_DIR, outputFileName);
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Saved: ${outputFileName}`);
  }
})();
