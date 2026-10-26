import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

const VALID_CATEGORIES = ["Food", "Transport", "Bills", "Shopping", "Other"] as const;

function isFutureDate(dateStr: string): boolean {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return false;
  const inputDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 0, 0, 0);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return inputDate.getTime() > today.getTime();
}

function formatExpense(e: any) {
  return {
    id: e.id,
    title: e.title,
    amount: Number(e.amount),
    category: e.category,
    note: e.note || "",
    starred: Boolean(e.starred),
    spentAt: e.spentAt,
    createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : new Date(e.createdAt).toISOString(),
  };
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || undefined;
  const starredParam = searchParams.get("starred");
  const starred = starredParam === "true" ? true : undefined;
  const q = searchParams.get("q") || undefined;

  const expenses = await db.getExpenses(session.userId, {
    category,
    starred,
    q,
  });

  return NextResponse.json(expenses.map(formatExpense), { status: 200 });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { title, amount, category, note, spentAt } = body;

    // Title validation
    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (title.trim().length > 80) {
      return NextResponse.json({ error: "Title must be at most 80 characters" }, { status: 400 });
    }

    // Amount validation
    if (amount === undefined || amount === null || amount === "" || typeof amount === "string" && isNaN(Number(amount))) {
      return NextResponse.json({ error: "Amount is required" }, { status: 400 });
    }
    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
      return NextResponse.json({ error: "Amount is required" }, { status: 400 });
    }
    if (numAmount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
    }

    // Category validation
    if (!category || typeof category !== "string" || !category.trim()) {
      return NextResponse.json({ error: "Please choose a category" }, { status: 400 });
    }
    if (!VALID_CATEGORIES.includes(category.trim() as any)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // Date / spentAt validation
    if (!spentAt || typeof spentAt !== "string" || !spentAt.trim()) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }
    if (isFutureDate(spentAt.trim())) {
      return NextResponse.json({ error: "Date cannot be in the future" }, { status: 400 });
    }

    // Duplicate check
    const duplicate = await db.findDuplicateExpense(
      session.userId,
      title.trim(),
      numAmount,
      spentAt.trim()
    );
    if (duplicate) {
      return NextResponse.json(
        { error: "Duplicate expense: an expense with the same title, amount and date already exists" },
        { status: 409 }
      );
    }

    const created = await db.createExpense({
      userId: session.userId,
      title: title.trim(),
      amount: numAmount,
      category: category.trim(),
      note: note ? String(note).trim() : "",
      spentAt: spentAt.trim(),
      starred: false,
    });

    return NextResponse.json(formatExpense(created), { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/expenses:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
