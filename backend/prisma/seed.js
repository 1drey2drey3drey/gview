const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Populando banco com dados de exemplo...');

  await prisma.game.createMany({
    data: [
      {
        title: "Devil's Drizzle",
        slug: 'devils-drizzle',
        shortDescription: 'Plataformer 2D dark cute onde um garoto persegue seu guarda-chuva e enfrenta demônios sumérios.',
        coverUrl: 'https://picsum.photos/seed/devils/300/400',
        demoUrl: 'https://example.com/demos/devils-drizzle',
        status: 'FEATURED',
        genre: 'Plataformer 2D',
        studioName: 'Rainy Studio',
      },
      {
        title: 'Alien Strike',
        slug: 'alien-strike',
        shortDescription: 'Shooter retrô com estética synthwave, destrua invasores com seu time.',
        coverUrl: 'https://picsum.photos/seed/alien/300/400',
        demoUrl: 'https://example.com/demos/alien-strike',
        status: 'FEATURED',
        genre: 'Shooter',
        studioName: 'NeonByte Games',
      },
      {
        title: 'Sunny Trails',
        slug: 'sunny-trails',
        shortDescription: 'Aventura colorida por trilhas tropicais com combate e puzzles.',
        coverUrl: 'https://picsum.photos/seed/sunny/300/400',
        demoUrl: 'https://example.com/demos/sunny-trails',
        status: 'AVAILABLE',
        genre: 'Aventura',
        studioName: 'Tropik Dev',
      },
      {
        title: 'Alabaster Dawn',
        slug: 'alabaster-dawn',
        shortDescription: 'RPG de fantasia com visuais aquarela e sistemas de escolhas profundas.',
        coverUrl: 'https://picsum.photos/seed/alabaster/300/400',
        status: 'COMING_SOON',
        genre: 'RPG',
        studioName: 'Chalk & Ember',
      },
      {
        title: 'Scavland',
        slug: 'scavland',
        shortDescription: 'Survival horror atmosférico com luz apenas da sua lanterna.',
        coverUrl: 'https://picsum.photos/seed/scavland/300/400',
        status: 'COMING_SOON',
        genre: 'Horror',
        studioName: 'DarkCell Studio',
      },
    ],
    skipDuplicates: true,
  });

  console.log('Seed concluído!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
