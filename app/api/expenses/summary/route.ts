import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

const CATEGORY_PRIORITY: Record<string, number> = {
  Food: 1,
  Transport: 2,
  Bills: 3,
  Shopping: 4,
  Other: 5,
};

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

  const count = expenses.length;
  const starredCount = expenses.filter((e) => Boolean(e.starred)).length;
  const rawTotal = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalAmount = Number(rawTotal.toFixed(2));

  // Category breakdown
  const categoryMap: Record<string, { count: number; total: number }> = {};
  for (const exp of expenses) {
    const cat = exp.category;
    if (!categoryMap[cat]) {
      categoryMap[cat] = { count: 0, total: 0 };
    }
    categoryMap[cat].count += 1;
    categoryMap[cat].total += Number(exp.amount);
  }

  const breakdown = Object.entries(categoryMap)
    .map(([cat, data]) => ({
      category: cat,
      count: data.count,
      total: Number(data.total.toFixed(2)),
    }))
    .sort((a, b) => {
      // Ordered by total amount descending
      if (b.total !== a.total) {
        return b.total - a.total;
      }
      // Equal totals are ordered Food, then Transport, then Bills, then Shopping, then Other
      const prioA = CATEGORY_PRIORITY[a.category] || 99;
      const prioB = CATEGORY_PRIORITY[b.category] || 99;
      return prioA - prioB;
    });

  return NextResponse.json(
    {
      count,
      starredCount,
      totalAmount,
      breakdown,
    },
    { status: 200 }
  );
}
