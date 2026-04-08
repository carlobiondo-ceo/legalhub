import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = [
    {
      email: process.env.SEED_ADMIN_EMAIL || "carlo.biondo@audienceserv.com",
      name: process.env.SEED_ADMIN_NAME || "Carlo Biondo",
      role: "admin" as const,
    },
    {
      email: process.env.SEED_LEGAL_EMAIL || "hue.nguyen@audienceserv.com",
      name: process.env.SEED_LEGAL_NAME || "Hue Nguyen",
      role: "legal" as const,
    },
    {
      email: process.env.SEED_CTO_EMAIL || "ninh@audienceserv.com",
      name: process.env.SEED_CTO_NAME || "Ninh",
      role: "admin" as const,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role },
      create: user,
    });
  }

  console.log(`Seed complete: ${users.length} users upserted.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
