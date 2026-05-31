/**
 * Seeds Postgres from the shared seed catalogue. Safe to run repeatedly.
 *   npm run prisma:seed
 */
import { PrismaClient } from '@prisma/client';
import { competitions, winners } from '../src/data/competitions';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding competitions…');
  for (const c of competitions) {
    await prisma.competition.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        id: c.id,
        slug: c.slug,
        title: c.title,
        subtitle: c.subtitle,
        category: c.category,
        status: c.status,
        image: c.image,
        gallery: c.gallery,
        ticketPrice: c.ticketPrice,
        totalTickets: c.totalTickets,
        ticketsSold: c.ticketsSold,
        maxPerUser: c.maxPerUser,
        cashAlternative: c.cashAlternative ?? null,
        drawDate: new Date(c.drawDate),
        description: c.description,
        highlights: c.highlights,
        skillQuestion: c.skillQuestion as object,
        instantWins: (c.instantWins ?? null) as object | null,
        featured: c.featured,
      },
    });
  }

  console.log('Seeding winners…');
  for (const w of winners) {
    await prisma.winner.upsert({
      where: { id: w.id },
      update: {},
      create: {
        id: w.id,
        name: w.name,
        location: w.location,
        prize: w.prize,
        competitionTitle: w.competitionTitle,
        image: w.image,
        ticketNumber: w.ticketNumber,
        drawnAt: new Date(w.drawnAt),
        quote: w.quote ?? null,
      },
    });
  }

  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
