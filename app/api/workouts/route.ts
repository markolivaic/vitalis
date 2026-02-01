/**
 * Vitalis AI | Health & Performance Hub
 * File: route.ts
 * Description: API endpoints for workout CRUD operations.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type { WorkoutExercise } from "@/lib/types";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const workouts = await prisma.workout.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
    });

    const data = workouts.map((workout) => ({
      ...workout,
      date: workout.date.toISOString(),
      exercises: workout.exercises as WorkoutExercise[],
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to fetch workouts:", error);
    return NextResponse.json(
      { error: "Failed to fetch workouts" },
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
    const { name, duration, totalVolume, notes, exercises } = body;

    if (!name || !exercises) {
      return NextResponse.json(
        { error: "Missing required fields: name and exercises" },
        { status: 400 }
      );
    }

    const newWorkout = await prisma.workout.create({
      data: {
        userId: session.user.id,
        name,
        duration: duration || null,
        totalVolume: totalVolume || 0,
        notes: notes || null,
        exercises: exercises,
      },
    });

    return NextResponse.json(
      {
        data: {
          ...newWorkout,
          date: newWorkout.date.toISOString(),
          exercises: newWorkout.exercises as WorkoutExercise[],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to save workout:", error);
    return NextResponse.json(
      { error: "Failed to save workout" },
      { status: 500 }
    );
  }
}
