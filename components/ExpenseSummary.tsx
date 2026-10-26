"use client";

import React from "react";
import { useExpenses } from "@/context/ExpenseContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DollarSign, Star, ListOrdered, PieChart } from "lucide-react";

export const ExpenseSummary = () => {
  const { summary } = useExpenses();
  const { count, starredCount, totalAmount, breakdown } = summary;

  return (
    <div className="space-y-6">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Expense Count */}
        <Card className="card-midnight rounded-xl border-[#1b3554] p-4 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,15,34,0.5)]">
          <div className="flex items-center justify-between text-[#80aad3] text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Expenses</span>
            <div className="p-1 rounded-md bg-[#1b3554] text-[#80aad3] border border-[#3f6593]/40">
              <ListOrdered className="h-4 w-4" />
            </div>
          </div>
          <div data-testid="expense-count" className="text-2xl font-bold font-mono text-white">
            {count}
          </div>
          <span className="text-[11px] text-[#80aad3] mt-1">Total items</span>
        </Card>

        {/* Starred Count */}
        <Card className="card-midnight rounded-xl border-[#1b3554] p-4 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,15,34,0.5)]">
          <div className="flex items-center justify-between text-[#80aad3] text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Starred</span>
            <div className="p-1 rounded-md bg-amber-950/50 text-amber-400 border border-amber-800/40">
              <Star className="h-4 w-4 fill-amber-400" />
            </div>
          </div>
          <div data-testid="starred-count" className="text-2xl font-bold font-mono text-amber-300">
            {starredCount}
          </div>
          <span className="text-[11px] text-[#80aad3] mt-1">Priority flags</span>
        </Card>

        {/* Total Amount */}
        <Card className="card-midnight rounded-xl border-[#1b3554] p-4 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,15,34,0.5)]">
          <div className="flex items-center justify-between text-[#80aad3] text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total</span>
            <div className="p-1 rounded-md bg-emerald-950/50 text-emerald-400 border border-emerald-800/40">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div data-testid="total-amount" className="text-2xl font-bold font-mono text-[#5eead4]">
            {totalAmount.toFixed(2)}
          </div>
          <span className="text-[11px] text-[#80aad3] mt-1">Current spending</span>
        </Card>
      </div>

      {/* Category Breakdown Container */}
      <Card className="card-midnight rounded-2xl border-[#1b3554] shadow-[0_8px_30px_rgba(0,15,34,0.6)]">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-[#80aad3]" />
            <CardTitle className="text-lg font-bold text-white">Category Breakdown</CardTitle>
          </div>
          <span className="text-xs text-[#c0e6fd] font-semibold px-2.5 py-0.5 rounded-full bg-[#1b3554] border border-[#3f6593]">
            {breakdown.length} {breakdown.length === 1 ? "category" : "categories"}
          </span>
        </CardHeader>
        <CardContent>
          <div data-testid="category-breakdown" className="space-y-2">
            {breakdown.length === 0 ? (
              <p className="text-sm text-[#80aad3] text-center py-4 italic">
                No category breakdown to display.
              </p>
            ) : (
              breakdown.map((item) => (
                <div
                  key={item.category}
                  data-testid="breakdown-row"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-[#1b3554] bg-[#0c1a2c]/80 hover:bg-[#142842] transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span data-testid="breakdown-name" className="text-sm font-semibold text-white">
                      {item.category}
                    </span>
                    <span className="text-xs text-[#80aad3] px-2 py-0.5 rounded bg-[#1b3554]">
                      <span data-testid="breakdown-count">{item.count}</span>{" "}
                      {item.count === 1 ? "expense" : "expenses"}
                    </span>
                  </div>
                  <span data-testid="breakdown-total" className="text-sm font-bold font-mono text-[#5eead4]">
                    {item.total.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
