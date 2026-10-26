"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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

const defaultSummary: ExpenseSummary = {
  count: 0,
  starredCount: 0,
  totalAmount: 0,
  breakdown: [],
};

export const ExpenseProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary>(defaultSummary);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    category: "",
    starred: false,
    q: "",
  });

  const buildQueryString = useCallback((f: FilterState) => {
    const params = new URLSearchParams();
    if (f.category && f.category.trim()) {
      params.set("category", f.category.trim());
    }
    if (f.starred) {
      params.set("starred", "true");
    }
    if (f.q && f.q.trim()) {
      params.set("q", f.q.trim());
    }
    const str = params.toString();
    return str ? `?${str}` : "";
  }, []);

  const fetchExpensesAndSummary = useCallback(
    async (currentFilters: FilterState) => {
      if (!user) {
        setExpenses([]);
        setSummary(defaultSummary);
        return;
      }

      setLoading(true);
      const query = buildQueryString(currentFilters);

      try {
        const [expRes, sumRes] = await Promise.all([
          fetch(`/api/expenses${query}`, { cache: "no-store" }),
          fetch(`/api/expenses/summary${query}`, { cache: "no-store" }),
        ]);

        if (expRes.ok && sumRes.ok) {
          const expData = await expRes.json();
          const sumData = await sumRes.json();
          setExpenses(expData);
          setSummary(sumData);
        }
      } catch (err) {
        console.error("Error fetching expenses and summary:", err);
      } finally {
        setLoading(false);
      }
    },
    [user, buildQueryString]
  );

  // Fetch when user changes or filters change
  useEffect(() => {
    if (user) {
      fetchExpensesAndSummary(filters);
    } else {
      setExpenses([]);
      setSummary(defaultSummary);
      setFilters({ category: "", starred: false, q: "" });
    }
  }, [user, filters, fetchExpensesAndSummary]);

  const setCategoryFilter = (category: string) => {
    setFilters((prev) => ({ ...prev, category }));
  };

  const setStarredFilter = (starred: boolean) => {
    setFilters((prev) => ({ ...prev, starred }));
  };

  const setSearchFilter = (q: string) => {
    setFilters((prev) => ({ ...prev, q }));
  };

  const clearFilters = () => {
    setFilters({ category: "", starred: false, q: "" });
  };

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

      // Re-fetch with current filters so list and summary update immediately
      await fetchExpensesAndSummary(filters);
      return { success: true };
    } catch {
      return { success: false, error: "Network error adding expense" };
    }
  };

  const toggleStar = async (id: string) => {
    const current = expenses.find((e) => e.id === id);
    if (!current) return { success: false, error: "Expense not found" };

    const newStarred = !current.starred;

    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ starred: newStarred }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Failed to toggle star" };
      }

      await fetchExpensesAndSummary(filters);
      return { success: true };
    } catch {
      return { success: false, error: "Network error updating star" };
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Failed to delete expense" };
      }

      await fetchExpensesAndSummary(filters);
      return { success: true };
    } catch {
      return { success: false, error: "Network error deleting expense" };
    }
  };

  const refreshExpenses = async () => {
    await fetchExpensesAndSummary(filters);
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
