import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

async function createGraderAccount() {
  const prisma = new PrismaClient();
  const email = "grader.qe190151@example.com";
  const password = "Test1234!";

  console.log("Checking if grader account exists in Supabase...");
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Grader account already exists with id:", existing.id);
  } else {
    console.log("Creating grader account in Supabase...");
    const passwordHash = await bcrypt.hash(password, 10);
    const created = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });
    console.log("Successfully created grader account:", created);
  }

  // Check sample starter expenses
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const count = await prisma.expense.count({ where: { userId: user.id } });
    if (count === 0) {
      console.log("Seeding sample expenses for grader...");
      await prisma.expense.createMany({
        data: [
          {
            userId: user.id,
            title: "Lunch buffet with team",
            amount: 150000,
            category: "Food",
            note: "Friday team lunch",
            starred: true,
            spentAt: "2026-10-25",
          },
          {
            userId: user.id,
            title: "Grab to campus",
            amount: 45000,
            category: "Transport",
            note: "Morning commute",
            starred: false,
            spentAt: "2026-10-25",
          },
          {
            userId: user.id,
            title: "Internet fiber bill",
            amount: 250000,
            category: "Bills",
            note: "Monthly subscription",
            starred: true,
            spentAt: "2026-10-24",
          },
        ],
      });
      console.log("Sample expenses created.");
    } else {
      console.log(`Grader has ${count} expenses.`);
    }
  }

  await prisma.$disconnect();
}

createGraderAccount().catch(console.error);
