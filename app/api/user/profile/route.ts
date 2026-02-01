/**
 * File: route.ts
 * Description: API endpoints for user profile management with dynamic macro recalculation.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { calculateBMR, calculateTDEE, calculateMacros } from "@/lib/utils";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        age: true,
        weight: true,
        height: true,
        gender: true,
        goal: true,
        activityLevel: true,
        calorieTarget: true,
        proteinTarget: true,
        carbsTarget: true,
        fatsTarget: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, age, weight, height, gender, goal, activityLevel } = body;

    // Validate required fields for recalculation
    if (
      weight === undefined ||
      height === undefined ||
      age === undefined ||
      !gender ||
      !goal ||
      activityLevel === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields for profile update" },
        { status: 400 }
      );
    }

    // Validate gender and goal values
    if (!["male", "female"].includes(gender)) {
      return NextResponse.json(
        { error: "Invalid gender value" },
        { status: 400 }
      );
    }

    if (!["muscle", "fat_loss", "maintenance"].includes(goal)) {
      return NextResponse.json(
        { error: "Invalid goal value" },
        { status: 400 }
      );
    }

    // Calculate BMR using Mifflin-St Jeor formula
    const bmr = calculateBMR(weight, height, age, gender as "male" | "female");

    // Calculate TDEE (Total Daily Energy Expenditure)
    const tdee = calculateTDEE(bmr, activityLevel);

    // Apply goal modifier to calories
    let calorieTarget = tdee;
    if (goal === "muscle") {
      calorieTarget = Math.round(tdee * 1.1); // +10% surplus
    } else if (goal === "fat_loss") {
      calorieTarget = Math.round(tdee * 0.8); // -20% deficit
    }

    // Calculate macro targets
    const macros = calculateMacros(
      calorieTarget,
      goal as "muscle" | "fat_loss" | "maintenance"
    );

    // Update user in database with recalculated targets
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || undefined,
        age,
        weight,
        height,
        gender,
        goal,
        activityLevel,
        calorieTarget,
        proteinTarget: macros.protein,
        carbsTarget: macros.carbs,
        fatsTarget: macros.fats,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        age: true,
        weight: true,
        height: true,
        gender: true,
        goal: true,
        activityLevel: true,
        calorieTarget: true,
        proteinTarget: true,
        carbsTarget: true,
        fatsTarget: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      data: updatedUser,
      meta: {
        bmr,
        tdee,
        goalModifier:
          goal === "muscle" ? "+10%" : goal === "fat_loss" ? "-20%" : "0%",
      },
    });
  } catch (error) {
    console.error("Failed to update user profile:", error);
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    );
  }
}
