import prisma from "./prisma";
import fs from "fs";
import path from "path";

// Local fallback store for offline development and testing
interface LocalUser {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

interface LocalExpense {
  id: string;
  userId: string;
  title: string;
  amount: number;
  category: string;
  note: string;
  starred: boolean;
  spentAt: string;
  createdAt: Date;
}

const LOCAL_STORAGE_FILE = path.join(process.cwd(), ".local_data.json");

function readLocalData(): { users: LocalUser[]; expenses: LocalExpense[] } {
  try {
    if (fs.existsSync(LOCAL_STORAGE_FILE)) {
      const content = fs.readFileSync(LOCAL_STORAGE_FILE, "utf-8");
      const parsed = JSON.parse(content);
      return {
        users: (parsed.users || []).map((u: any) => ({ ...u, createdAt: new Date(u.createdAt) })),
        expenses: (parsed.expenses || []).map((e: any) => ({ ...e, createdAt: new Date(e.createdAt) })),
      };
    }
  } catch {
    // ignore
  }
  return { users: [], expenses: [] };
}

function writeLocalData(data: { users: LocalUser[]; expenses: LocalExpense[] }) {
  try {
    fs.writeFileSync(LOCAL_STORAGE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // ignore
  }
}

const isDatabaseUrlConfigured = Boolean(
  process.env.DATABASE_URL &&
    process.env.DATABASE_URL.trim() !== "" &&
    !process.env.DATABASE_URL.includes("placeholder")
);

export const db = {
  // Users
  async findUserByEmail(email: string) {
    if (isDatabaseUrlConfigured) {
      try {
        return await prisma.user.findUnique({
          where: { email: email.toLowerCase().trim() },
        });
      } catch (err) {
        console.warn("Prisma error in findUserByEmail, falling back to local store:", err);
      }
    }
    const data = readLocalData();
    return data.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
  },

  async findUserById(id: string) {
    if (isDatabaseUrlConfigured) {
      try {
        return await prisma.user.findUnique({
          where: { id },
        });
      } catch (err) {
        console.warn("Prisma error in findUserById, falling back to local store:", err);
      }
    }
    const data = readLocalData();
    return data.users.find((u) => u.id === id) || null;
  },

  async createUser(data: { email: string; passwordHash: string }) {
    if (isDatabaseUrlConfigured) {
      try {
        return await prisma.user.create({
          data: {
            email: data.email.toLowerCase().trim(),
            passwordHash: data.passwordHash,
          },
        });
      } catch (err) {
        console.warn("Prisma error in createUser, falling back to local store:", err);
      }
    }
    const store = readLocalData();
    const newUser: LocalUser = {
      id: "usr_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      email: data.email.toLowerCase().trim(),
      passwordHash: data.passwordHash,
      createdAt: new Date(),
    };
    store.users.push(newUser);
    writeLocalData(store);
    return newUser;
  },

  // Expenses
  async findDuplicateExpense(userId: string, title: string, amount: number, spentAt: string, excludeId?: string) {
    if (isDatabaseUrlConfigured) {
      try {
        const where: any = {
          userId,
          title: title.trim(),
          amount,
          spentAt,
        };
        if (excludeId) {
          where.id = { not: excludeId };
        }
        return await prisma.expense.findFirst({ where });
      } catch (err) {
        console.warn("Prisma error in findDuplicateExpense, falling back to local store:", err);
      }
    }
    const store = readLocalData();
    return (
      store.expenses.find(
        (e) =>
          e.userId === userId &&
          e.title.toLowerCase().trim() === title.toLowerCase().trim() &&
          Number(e.amount.toFixed(2)) === Number(amount.toFixed(2)) &&
          e.spentAt === spentAt &&
          (!excludeId || e.id !== excludeId)
      ) || null
    );
  },

  async getExpenses(
    userId: string,
    filters: { category?: string; starred?: boolean; q?: string }
  ) {
    if (isDatabaseUrlConfigured) {
      try {
        const where: any = { userId };
        if (filters.category) {
          where.category = filters.category;
        }
        if (filters.starred !== undefined) {
          where.starred = filters.starred;
        }
        if (filters.q && filters.q.trim()) {
          const query = filters.q.trim();
          where.OR = [
            { title: { contains: query, mode: "insensitive" } },
            { note: { contains: query, mode: "insensitive" } },
          ];
        }

        const items = await prisma.expense.findMany({
          where,
          orderBy: [{ spentAt: "desc" }, { title: "asc" }],
        });

        // Case-insensitive sort for ties
        return items.sort((a, b) => {
          if (b.spentAt !== a.spentAt) {
            return b.spentAt.localeCompare(a.spentAt);
          }
          return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
        });
      } catch (err) {
        console.warn("Prisma error in getExpenses, falling back to local store:", err);
      }
    }

    const store = readLocalData();
    let userExpenses = store.expenses.filter((e) => e.userId === userId);

    if (filters.category) {
      userExpenses = userExpenses.filter(
        (e) => e.category.toLowerCase() === filters.category?.toLowerCase()
      );
    }
    if (filters.starred !== undefined) {
      userExpenses = userExpenses.filter((e) => e.starred === filters.starred);
    }
    if (filters.q && filters.q.trim()) {
      const q = filters.q.trim().toLowerCase();
      userExpenses = userExpenses.filter(
        (e) =>
          (e.title && e.title.toLowerCase().includes(q)) ||
          (e.note && e.note.toLowerCase().includes(q))
      );
    }

    return userExpenses.sort((a, b) => {
      if (b.spentAt !== a.spentAt) {
        return b.spentAt.localeCompare(a.spentAt);
      }
      return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
    });
  },

  async createExpense(data: {
    userId: string;
    title: string;
    amount: number;
    category: string;
    note?: string;
    spentAt: string;
    starred?: boolean;
  }) {
    if (isDatabaseUrlConfigured) {
      try {
        return await prisma.expense.create({
          data: {
            userId: data.userId,
            title: data.title.trim(),
            amount: Number(data.amount.toFixed(2)),
            category: data.category.trim(),
            note: (data.note || "").trim(),
            spentAt: data.spentAt.trim(),
            starred: Boolean(data.starred),
          },
        });
      } catch (err) {
        console.warn("Prisma error in createExpense, falling back to local store:", err);
      }
    }

    const store = readLocalData();
    const newExpense: LocalExpense = {
      id: "exp_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      userId: data.userId,
      title: data.title.trim(),
      amount: Number(data.amount.toFixed(2)),
      category: data.category.trim(),
      note: (data.note || "").trim(),
      spentAt: data.spentAt.trim(),
      starred: Boolean(data.starred),
      createdAt: new Date(),
    };
    store.expenses.push(newExpense);
    writeLocalData(store);
    return newExpense;
  },

  async findExpenseByIdAndUser(id: string, userId: string) {
    if (isDatabaseUrlConfigured) {
      try {
        return await prisma.expense.findFirst({
          where: { id, userId },
        });
      } catch (err) {
        console.warn("Prisma error in findExpenseByIdAndUser, falling back to local store:", err);
      }
    }
    const store = readLocalData();
    return store.expenses.find((e) => e.id === id && e.userId === userId) || null;
  },

  async updateExpense(
    id: string,
    userId: string,
    data: {
      title?: string;
      amount?: number;
      category?: string;
      note?: string;
      spentAt?: string;
      starred?: boolean;
    }
  ) {
    if (isDatabaseUrlConfigured) {
      try {
        const updateData: any = {};
        if (data.title !== undefined) updateData.title = data.title.trim();
        if (data.amount !== undefined) updateData.amount = Number(data.amount.toFixed(2));
        if (data.category !== undefined) updateData.category = data.category.trim();
        if (data.note !== undefined) updateData.note = data.note.trim();
        if (data.spentAt !== undefined) updateData.spentAt = data.spentAt.trim();
        if (data.starred !== undefined) updateData.starred = data.starred;

        return await prisma.expense.update({
          where: { id },
          data: updateData,
        });
      } catch (err) {
        console.warn("Prisma error in updateExpense, falling back to local store:", err);
      }
    }

    const store = readLocalData();
    const idx = store.expenses.findIndex((e) => e.id === id && e.userId === userId);
    if (idx === -1) return null;

    const existing = store.expenses[idx];
    const updated: LocalExpense = {
      ...existing,
      title: data.title !== undefined ? data.title.trim() : existing.title,
      amount: data.amount !== undefined ? Number(data.amount.toFixed(2)) : existing.amount,
      category: data.category !== undefined ? data.category.trim() : existing.category,
      note: data.note !== undefined ? data.note.trim() : existing.note,
      spentAt: data.spentAt !== undefined ? data.spentAt.trim() : existing.spentAt,
      starred: data.starred !== undefined ? Boolean(data.starred) : existing.starred,
    };
    store.expenses[idx] = updated;
    writeLocalData(store);
    return updated;
  },

  async deleteExpense(id: string, userId: string) {
    if (isDatabaseUrlConfigured) {
      try {
        await prisma.expense.delete({
          where: { id },
        });
        return true;
      } catch (err) {
        console.warn("Prisma error in deleteExpense, falling back to local store:", err);
      }
    }

    const store = readLocalData();
    const initialLen = store.expenses.length;
    store.expenses = store.expenses.filter((e) => !(e.id === id && e.userId === userId));
    writeLocalData(store);
    return store.expenses.length < initialLen;
  },
};
