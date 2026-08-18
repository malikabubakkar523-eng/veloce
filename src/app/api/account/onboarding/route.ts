import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { preferredCategories = [], referralSource = "" } = body;

    // Normalize and clean category selections
    const categoriesArray = Array.isArray(preferredCategories)
      ? preferredCategories.map((c: string) => c.trim().toLowerCase())
      : [];

    const updatedUser = await db.user.update({
      where: { id: session.id },
      data: {
        preferredCategories: categoriesArray,
        referralSource: referralSource ? String(referralSource).trim() : null,
        isOnboarded: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Onboarding preferences saved successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        preferredCategories: updatedUser.preferredCategories,
        referralSource: updatedUser.referralSource,
        isOnboarded: updatedUser.isOnboarded,
      },
    });
  } catch (error) {
    console.error("Onboarding API Error:", error);
    return NextResponse.json(
      { error: "Failed to save onboarding preferences" },
      { status: 500 }
    );
  }
}
