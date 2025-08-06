// ساخت 100 فایل خالی png با فرمت xx001-001.png تا xx001-100.png برای همه گروه‌ها
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..', 'daily');

const codeMap = {
  women: 'wo', men: 'me', kids: 'ki', shoes: 'sh', bags: 'ba', jewelry: 'je', watches: 'wa', sunglasses: 'su', hats: 'ha', scarves: 'sv', clothingother: 'clo',
  skincare: 'sk', haircare: 'hi', bodycare: 'bo', makeup: 'ma', perfume: 'pe', hygienecare: 'hy', beautytools: 'be', beautyother: 'beo',
  restaurants: 're', snacksstreet: 'sn', nutsfruits: 'nu', sweets: 'sw', jams: 'ja', picklesferments: 'pf', spices: 'sp', teacoffee: 'tc', juices: 'ju', localtrad: 'lo', cookingredients: 'ci', foodother: 'foo',
  cookware: 'co', kitchentools: 'kt', storage: 'st', cleaningtools: 'cl', smartcleaners: 'sc', tableware: 'ta', lighting: 'li', textiles: 'te', decor: 'de', digitalgadgets: 'dg', homeother: 'hoo',
  mobile: 'mo', tablets: 'tb', computers: 'cp', chargers: 'ch', headphones: 'he', smartwatches: 'sm', cables: 'ca', cameras: 'cm', electronicsother: 'elo',
  car: 'cr', motorcycle: 'mt', bicycle: 'by', scooters: 'so', tires: 'ti', interiorparts: 'in', exteriorparts: 'ex', vehiclesother: 'veo',
  handtools: 'hn', powertools: 'po', hardware: 'hr', paintcoatings: 'pa', plumbing: 'pl', electricalsupplies: 'ee', building: 'bu', toolsother: 'too',
  indoorplants: 'id', outdoorplants: 'ou', seeds: 'se', pots: 'pt', soilfertilizer: 'sf', gardening: 'ga', plantdecor: 'pn', plantsother: 'plo',
  babyclothing: 'bb', toys: 'to', babycare: 'bc', maternitywear: 'mr', strollers: 'ss', feedingsupplies: 'fe', schoolbags: 'sg', babyother: 'bao',
  petfood: 'pd', pettoys: 'py', bedshouses: 'bh', grooming: 'gr', bowlsfeeders: 'bw', leashes: 'le', pethygiene: 'ph', petother: 'peo',
  fitness: 'fi', campingequipment: 'ce', bicyclesscooters: 'bs', travel: 'tr', swimbeach: 'sb', hiking: 'hk', picnic: 'pi', sportsother: 'spo',
  notebooks: 'no', penspencils: 'pp', officesupplies: 'of', stationery: 'sa', printers: 'pr', deskschairs: 'dc', educational: 'ed', officeother: 'ofo',
  fiction: 'fc', nonfiction: 'nf', childrensbooks: 'cb', drawing: 'dr', painting: 'pg', diykits: 'di', musical: 'mu', booksother: 'boo',
  softwarelicenses: 'sl', mobileapps: 'mb', pcgames: 'pc', consolegames: 'cg', giftcards: 'gi', gaming: 'gg', moviesmusic: 'mv', softwareother: 'soo',
};

function generatePngs(dir) {
  for (const group of fs.readdirSync(dir)) {
    const groupPath = path.join(dir, group);
    if (!fs.statSync(groupPath).isDirectory()) continue;

    for (const sub of fs.readdirSync(groupPath)) {
      const subPath = path.join(groupPath, sub);
      if (!fs.statSync(subPath).isDirectory()) continue;

      const slicedPath = path.join(subPath, 'sliced');
      if (!fs.existsSync(slicedPath)) fs.mkdirSync(slicedPath, { recursive: true });

      const code = codeMap[sub];
      if (!code) {
        console.warn(`⛔️ skipped: unknown code for ${sub}`);
        continue;
      }

      const prefix = `${code}001`;

      for (let i = 1; i <= 100; i++) {
        const idx = i.toString().padStart(3, '0');
        const fileName = `${prefix}-${idx}.png`;
        const filePath = path.join(slicedPath, fileName);
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, '');
          console.log(`🟢 created: ${fileName}`);
        } else {
          console.log(`⚪ skipped (exists): ${fileName}`);
        }
        console.log(`🟢 created: ${fileName}`);
      }
    }
  }
}

generatePngs(ROOT_DIR);
console.log('✅ done: sliced png files generated.');
