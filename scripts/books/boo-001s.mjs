import fs from 'fs'; 
import path from 'path';
import { createCanvas, loadImage } from 'canvas';

const INPUT_PATH = path.join('daily', 'books', 'booksother', 'boo-001.png');
const OUTPUT_DIR = path.join('daily', 'books', 'booksother', 'sliced');

const startX = 0;
const startY = 30;
const cropWidth = 460;
const cropHeight = 516;
const itemCount = 10;

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

(async () => {
  const image = await loadImage(INPUT_PATH);

  for (let i = 0; i < itemCount; i++) {
    const canvas = createCanvas(cropWidth, cropHeight);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      startX,
      startY + i * cropHeight,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    const buffer = canvas.toBuffer('image/png');
    const outputFileName = `boo001-${String(i + 1).padStart(3, '0')}.png`;
    const outputPath = path.join(OUTPUT_DIR, outputFileName);
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Created: ${outputFileName}`);
  }
})();
