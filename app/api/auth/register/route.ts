import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password, confirmPassword } = body;

    // Email validation
    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    // Password validation
    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Confirm password validation
    if (!confirmPassword || typeof confirmPassword !== "string") {
      return NextResponse.json({ error: "Confirm password is required" }, { status: 400 });
    }
    if (confirmPassword !== password) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    // Check duplicate
    const existing = await db.findUserByEmail(email.trim());
    if (existing) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await db.createUser({
      email: email.trim(),
      passwordHash,
    });

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/auth/register:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
