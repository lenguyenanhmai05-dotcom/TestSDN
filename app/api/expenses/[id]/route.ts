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

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const existing = await db.findExpenseByIdAndUser(id, session.userId);
  if (!existing) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const updates: any = {};

    // Validate title if present
    if (body.title !== undefined) {
      if (typeof body.title !== "string" || !body.title.trim()) {
        return NextResponse.json({ error: "Title is required" }, { status: 400 });
      }
      if (body.title.trim().length > 80) {
        return NextResponse.json({ error: "Title must be at most 80 characters" }, { status: 400 });
      }
      updates.title = body.title.trim();
    }

    // Validate amount if present
    if (body.amount !== undefined) {
      const numAmount = Number(body.amount);
      if (isNaN(numAmount)) {
        return NextResponse.json({ error: "Amount is required" }, { status: 400 });
      }
      if (numAmount <= 0) {
        return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
      }
      updates.amount = numAmount;
    }

    // Validate category if present
    if (body.category !== undefined) {
      if (typeof body.category !== "string" || !body.category.trim()) {
        return NextResponse.json({ error: "Please choose a category" }, { status: 400 });
      }
      if (!VALID_CATEGORIES.includes(body.category.trim() as any)) {
        return NextResponse.json({ error: "Invalid category" }, { status: 400 });
      }
      updates.category = body.category.trim();
    }

    // Validate spentAt if present
    if (body.spentAt !== undefined) {
      if (typeof body.spentAt !== "string" || !body.spentAt.trim()) {
        return NextResponse.json({ error: "Date is required" }, { status: 400 });
      }
      if (isFutureDate(body.spentAt.trim())) {
        return NextResponse.json({ error: "Date cannot be in the future" }, { status: 400 });
      }
      updates.spentAt = body.spentAt.trim();
    }

    // Note if present
    if (body.note !== undefined) {
      updates.note = body.note ? String(body.note).trim() : "";
    }

    // Starred if present
    if (body.starred !== undefined) {
      updates.starred = Boolean(body.starred);
    }

    // Duplicate check if changing title, amount, or spentAt
    const newTitle = updates.title !== undefined ? updates.title : existing.title;
    const newAmount = updates.amount !== undefined ? updates.amount : existing.amount;
    const newSpentAt = updates.spentAt !== undefined ? updates.spentAt : existing.spentAt;

    if (
      updates.title !== undefined ||
      updates.amount !== undefined ||
      updates.spentAt !== undefined
    ) {
      const duplicate = await db.findDuplicateExpense(
        session.userId,
        newTitle,
        newAmount,
        newSpentAt,
        id
      );
      if (duplicate) {
        return NextResponse.json(
          { error: "Duplicate expense: an expense with the same title, amount and date already exists" },
          { status: 409 }
        );
      }
    }

    const updated = await db.updateExpense(id, session.userId, updates);
    if (!updated) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json(formatExpense(updated), { status: 200 });
  } catch (error) {
    console.error("Error in PATCH /api/expenses/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const deleted = await db.deleteExpense(id, session.userId);
  if (!deleted) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
