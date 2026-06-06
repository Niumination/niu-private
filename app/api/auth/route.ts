import { NextRequest, NextResponse } from "next/server";
import { getSession, getAdminPassword } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const { password } = await req.json();

    const adminPassword = getAdminPassword();

    if (password === adminPassword) {
      session.isLoggedIn = true;
      session.username = "admin";
      await session.save();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Invalid password" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const session = await getSession();
  session.destroy();
  return NextResponse.json({ success: true });
}
