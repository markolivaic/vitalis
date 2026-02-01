/**
 * Vitalis AI | Health & Performance Hub
 * File: seed.ts
 * Description: Database seeding script for exercises and foods.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { exerciseDatabase, foodDatabase } from "../lib/mock-data";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting database seed...");

  console.log("Seeding exercises...");
  for (const ex of exerciseDatabase) {
    await prisma.exercise.upsert({
      where: { name: ex.name },
      update: {},
      create: {
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        equipment: ex.equipment,
      },
    });
  }

  console.log("Seeding foods...");
  for (const food of foodDatabase) {
    await prisma.food.upsert({
      where: { name: food.name },
      update: {},
      create: {
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fats: food.fats,
        servingSize: food.servingSize,
        servingUnit: food.servingUnit,
      },
    });
  }

  console.log("Creating default admin user...");
  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@vitalis.ai" },
    update: {},
    create: {
      email: "admin@vitalis.ai",
      password: hashedPassword,
      name: "System Admin",
      role: "admin",
      age: 30,
      weight: 75,
      height: 175,
      gender: "male",
      goal: "maintenance",
      activityLevel: 1.55,
      calorieTarget: 2200,
      proteinTarget: 165,
      carbsTarget: 220,
      fatsTarget: 65,
    },
  });

  console.log("Admin user created: admin@vitalis.ai / admin123");
  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
