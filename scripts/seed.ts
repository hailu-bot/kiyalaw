import { seedMattersIfEmpty } from '../lib/data/matters.seed';

seedMattersIfEmpty()
  .then((r) => {
    console.log('Seed complete:', JSON.stringify(r, null, 2));
    process.exit(0);
  })
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  });
