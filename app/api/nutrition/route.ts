/**
 * Vitalis AI | Health & Performance Hub
 * File: route.ts
 * Description: API endpoints for nutrition log CRUD operations.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json(
      { error: "Date parameter required" },
      { status: 400 }
    );
  }

  try {
    const logs = await prisma.nutritionLog.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: new Date(`${date}T00:00:00.000Z`),
          lt: new Date(`${date}T23:59:59.999Z`),
        },
      },
      orderBy: { date: "asc" },
    });

    const data = logs.map((log) => ({
      id: log.id,
      foodId: log.id,
      foodName: log.foodName,
      servings: log.servings,
      calories: log.calories,
      protein: log.protein,
      carbs: log.carbs,
      fats: log.fats,
      mealType: log.mealType,
      date: log.date.toISOString(),
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to fetch nutrition logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch nutrition logs" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { foodName, calories, protein, carbs, fats, servings, mealType, date } = body;

    if (!foodName || !mealType || !date) {
      return NextResponse.json(
        { error: "Missing required fields: foodName, mealType, date" },
        { status: 400 }
      );
    }

    const log = await prisma.nutritionLog.create({
      data: {
        userId: session.user.id,
        date: new Date(date),
        foodName,
        calories: Math.round(calories || 0),
        protein: protein || 0,
        carbs: carbs || 0,
        fats: fats || 0,
        servings: servings || 1,
        mealType,
      },
    });

    return NextResponse.json(
      {
        data: {
          id: log.id,
          foodId: log.id,
          foodName: log.foodName,
          servings: log.servings,
          calories: log.calories,
          protein: log.protein,
          carbs: log.carbs,
          fats: log.fats,
          mealType: log.mealType,
          date: log.date.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to save nutrition log:", error);
    return NextResponse.json(
      { error: "Failed to save nutrition log" },
      { status: 500 }
    );
  }
}
