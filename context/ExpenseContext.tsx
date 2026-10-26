"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "./AuthContext";

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  note: string;
  starred: boolean;
  spentAt: string;
  createdAt: string;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  total: number;
}

export interface ExpenseSummary {
  count: number;
  starredCount: number;
  totalAmount: number;
  breakdown: CategoryBreakdown[];
}

export interface FilterState {
  category: string;
  starred: boolean;
  q: string;
}

interface ExpenseContextType {
  expenses: Expense[];
  summary: ExpenseSummary;
  loading: boolean;
  filters: FilterState;
  setCategoryFilter: (category: string) => void;
  setStarredFilter: (starred: boolean) => void;
  setSearchFilter: (q: string) => void;
  clearFilters: () => void;
  addExpense: (expenseData: {
    title: string;
    amount: number;
    category: string;
    note?: string;
    spentAt: string;
  }) => Promise<{ success: boolean; error?: string }>;
  toggleStar: (id: string) => Promise<{ success: boolean; error?: string }>;
  deleteExpense: (id: string) => Promise<{ success: boolean; error?: string }>;
  refreshExpenses: () => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const CATEGORY_PRIORITY: Record<string, number> = {
  Food: 1,
  Transport: 2,
  Bills: 3,
  Shopping: 4,
  Other: 5,
};

const defaultSummary: ExpenseSummary = {
  count: 0,
  starredCount: 0,
  totalAmount: 0,
  breakdown: [],
};

const initialFilters: FilterState = {
  category: "",
  starred: false,
  q: "",
};

export const ExpenseProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [rawExpenses, setRawExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // Load expenses once after login; clear cleanly on logout
  useEffect(() => {
    let isMounted = true;

    if (user) {
      setLoading(true);
      fetch("/api/expenses", { cache: "no-store" })
        .then(async (res) => {
          if (!res.ok) return [];
          return res.json();
        })
        .then((data) => {
          if (isMounted) {
            setRawExpenses(Array.isArray(data) ? data : []);
          }
        })
        .catch(() => {
          if (isMounted) {
            setRawExpenses([]);
          }
        })
        .finally(() => {
          if (isMounted) {
            setLoading(false);
          }
        });
    } else {
      setRawExpenses([]);
      setFilters(initialFilters);
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const setCategoryFilter = useCallback((category: string) => {
    setFilters((prev) => ({ ...prev, category }));
  }, []);

  const setStarredFilter = useCallback((starred: boolean) => {
    setFilters((prev) => ({ ...prev, starred }));
  }, []);

  const setSearchFilter = useCallback((q: string) => {
    setFilters((prev) => ({ ...prev, q }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  // Filtered expenses shared across list and summary
  const expenses = useMemo(() => {
    return rawExpenses.filter((item) => {
      if (filters.category && filters.category.trim() && item.category !== filters.category.trim()) {
        return false;
      }
      if (filters.starred && !item.starred) {
        return false;
      }
      if (filters.q && filters.q.trim()) {
        const query = filters.q.trim().toLowerCase();
        const matchTitle = (item.title || "").toLowerCase().includes(query);
        const matchNote = (item.note || "").toLowerCase().includes(query);
        if (!matchTitle && !matchNote) {
          return false;
        }
      }
      return true;
    });
  }, [rawExpenses, filters]);

  // Live summary and breakdown calculated over matching items
  const summary = useMemo<ExpenseSummary>(() => {
    const count = expenses.length;
    const starredCount = expenses.filter((e) => Boolean(e.starred)).length;
    const rawTotal = expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    const totalAmount = Number(rawTotal.toFixed(2));

    const categoryMap: Record<string, { count: number; total: number }> = {};
    for (const exp of expenses) {
      const cat = exp.category;
      if (!categoryMap[cat]) {
        categoryMap[cat] = { count: 0, total: 0 };
      }
      categoryMap[cat].count += 1;
      categoryMap[cat].total += Number(exp.amount || 0);
    }

    const breakdown = Object.entries(categoryMap)
      .map(([cat, data]) => ({
        category: cat,
        count: data.count,
        total: Number(data.total.toFixed(2)),
      }))
      .sort((a, b) => {
        if (b.total !== a.total) {
          return b.total - a.total;
        }
        const prioA = CATEGORY_PRIORITY[a.category] || 99;
        const prioB = CATEGORY_PRIORITY[b.category] || 99;
        return prioA - prioB;
      });

    return {
      count,
      starredCount,
      totalAmount,
      breakdown,
    };
  }, [expenses]);

  const addExpense = async (expenseData: {
    title: string;
    amount: number;
    category: string;
    note?: string;
    spentAt: string;
  }) => {
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseData),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Failed to add expense" };
      }

      setRawExpenses((prev) => [data, ...prev]);
      return { success: true };
    } catch {
      return { success: false, error: "Network error adding expense" };
    }
  };

  const toggleStar = async (id: string) => {
    const current = rawExpenses.find((e) => e.id === id);
    if (!current) return { success: false, error: "Expense not found" };

    const newStarred = !current.starred;

    // Optimistically update
    setRawExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, starred: newStarred } : e))
    );

    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ starred: newStarred }),
      });

      const data = await res.json();
      if (!res.ok) {
        // Rollback on failure
        setRawExpenses((prev) =>
          prev.map((e) => (e.id === id ? { ...e, starred: current.starred } : e))
        );
        return { success: false, error: data.error || "Failed to toggle star" };
      }

      return { success: true };
    } catch {
      setRawExpenses((prev) =>
        prev.map((e) => (e.id === id ? { ...e, starred: current.starred } : e))
      );
      return { success: false, error: "Network error updating star" };
    }
  };

  const deleteExpense = async (id: string) => {
    const currentList = rawExpenses;
    setRawExpenses((prev) => prev.filter((e) => e.id !== id));

    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        setRawExpenses(currentList);
        return { success: false, error: data.error || "Failed to delete expense" };
      }

      return { success: true };
    } catch {
      setRawExpenses(currentList);
      return { success: false, error: "Network error deleting expense" };
    }
  };

  const refreshExpenses = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch("/api/expenses", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setRawExpenses(Array.isArray(data) ? data : []);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        summary,
        loading,
        filters,
        setCategoryFilter,
        setStarredFilter,
        setSearchFilter,
        clearFilters,
        addExpense,
        toggleStar,
        deleteExpense,
        refreshExpenses,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpenses must be used within an ExpenseProvider");
  }
  return context;
};

