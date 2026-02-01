/**
 * Vitalis AI | Health & Performance Hub
 * File: route.ts
 * Description: API endpoint for deleting a specific nutrition log entry.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const log = await prisma.nutritionLog.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!log) {
      return NextResponse.json(
        { error: "Nutrition log not found" },
        { status: 404 }
      );
    }

    await prisma.nutritionLog.delete({
      where: { id },
    });

    return NextResponse.json({ data: { message: "Deleted" } });
  } catch (error) {
    console.error("Failed to delete nutrition log:", error);
    return NextResponse.json(
      { error: "Failed to delete nutrition log" },
      { status: 500 }
    );
  }
}
