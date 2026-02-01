/**
 * File: route.ts
 * Description: API endpoints for exercise CRUD operations.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const exercises = await prisma.exercise.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ data: exercises });
  } catch (error) {
    console.error("Failed to fetch exercises:", error);
    return NextResponse.json(
      { error: "Failed to fetch exercises" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, muscleGroup, equipment } = body;

    if (!name || !muscleGroup || !equipment) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newExercise = await prisma.exercise.create({
      data: { name, muscleGroup, equipment },
    });

    return NextResponse.json({ data: newExercise }, { status: 201 });
  } catch (error) {
    console.error("Failed to create exercise:", error);
    return NextResponse.json(
      { error: "Failed to create exercise" },
      { status: 500 }
    );
  }
}
