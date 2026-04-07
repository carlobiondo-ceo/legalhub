import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "carlo@audienceserv.com";
  const adminName = process.env.SEED_ADMIN_NAME || "Carlo Biondo";
  const legalEmail = process.env.SEED_LEGAL_EMAIL || "hue@audienceserv.com";
  const legalName = process.env.SEED_LEGAL_NAME || "Hue";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: adminName,
      role: "admin",
    },
  });

  await prisma.user.upsert({
    where: { email: legalEmail },
    update: {},
    create: {
      email: legalEmail,
      name: legalName,
      role: "legal",
    },
  });

  console.log("Seed complete: Carlo (admin) and Hue (legal) created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
