"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseSummary } from "@/components/ExpenseSummary";
import { ExpenseFilters } from "@/components/ExpenseFilters";
import { ExpenseList } from "@/components/ExpenseList";

export default function ExpensesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // While finding out whether user is logged in, show nothing to prevent content flash
  if (loading || !user) {
    return null;
  }

  return (
    <div data-testid="expenses-page" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* 1280px side-by-side layout: form and summary sit next to list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Desktop): Form and Summary */}
        <aside className="lg:col-span-5 space-y-6">
          <ExpenseForm />
          <ExpenseSummary />
        </aside>

        {/* Right Column (Desktop): Filters and List */}
        <main className="lg:col-span-7 space-y-6">
          <ExpenseFilters />
          <ExpenseList />
        </main>
      </div>
    </div>
  );
}
