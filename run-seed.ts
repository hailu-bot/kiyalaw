import { seedMattersIfEmpty } from './lib/data/matters.seed';

async function main() {
  console.log('Running seed...');
  await seedMattersIfEmpty();
  console.log('Seed complete.');
}

main().catch(console.error);
