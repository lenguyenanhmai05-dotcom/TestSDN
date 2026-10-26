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
        <Card className="card-midnight rounded-xl border-[#EED9CC] bg-white p-4 flex flex-col justify-between shadow-[0_4px_20px_rgba(158,24,43,0.04)]">
          <div className="flex items-center justify-between text-[#7A4B54] text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Expenses</span>
            <div className="p-1 rounded-md bg-[#FFF0F3] text-[#9E182B] border border-[#F9CBD6]">
              <ListOrdered className="h-4 w-4" />
            </div>
          </div>
          <div data-testid="expense-count" className="text-2xl font-bold font-mono text-[#2A080E]">
            {count}
          </div>
          <span className="text-[11px] text-[#7A4B54] mt-1">Total items</span>
        </Card>

        {/* Starred Count */}
        <Card className="card-midnight rounded-xl border-[#EED9CC] bg-white p-4 flex flex-col justify-between shadow-[0_4px_20px_rgba(158,24,43,0.04)]">
          <div className="flex items-center justify-between text-[#7A4B54] text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Starred</span>
            <div className="p-1 rounded-md bg-amber-50 text-amber-500 border border-amber-200">
              <Star className="h-4 w-4 fill-amber-400" />
            </div>
          </div>
          <div data-testid="starred-count" className="text-2xl font-bold font-mono text-amber-600">
            {starredCount}
          </div>
          <span className="text-[11px] text-[#7A4B54] mt-1">Priority flags</span>
        </Card>

        {/* Total Amount */}
        <Card className="card-midnight rounded-xl border-[#EED9CC] bg-white p-4 flex flex-col justify-between shadow-[0_4px_20px_rgba(158,24,43,0.04)]">
          <div className="flex items-center justify-between text-[#7A4B54] text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total</span>
            <div className="p-1 rounded-md bg-[#FDF2F4] text-[#9E182B] border border-[#F2AFBC]">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div data-testid="total-amount" className="text-2xl font-bold font-mono text-[#9E182B]">
            {totalAmount.toFixed(2)}
          </div>
          <span className="text-[11px] text-[#7A4B54] mt-1">Current spending</span>
        </Card>
      </div>

      {/* Category Breakdown Container */}
      <Card className="card-midnight rounded-2xl border-[#EED9CC] bg-white shadow-[0_4px_20px_rgba(158,24,43,0.04)]">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-[#9E182B]" />
            <CardTitle className="text-lg font-bold text-[#2A080E]">Category Breakdown</CardTitle>
          </div>
          <span className="text-xs text-[#9E182B] font-semibold px-2.5 py-0.5 rounded-full bg-[#FFF0F3] border border-[#F9CBD6]">
            {breakdown.length} {breakdown.length === 1 ? "category" : "categories"}
          </span>
        </CardHeader>
        <CardContent>
          <div data-testid="category-breakdown" className="space-y-2">
            {breakdown.length === 0 ? (
              <p className="text-sm text-[#7A4B54] text-center py-4 italic">
                No category breakdown to display.
              </p>
            ) : (
              breakdown.map((item) => (
                <div
                  key={item.category}
                  data-testid="breakdown-row"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-[#EED9CC] bg-[#FAF5F1] hover:bg-[#F2E0D2]/50 hover:border-[#F2AFBC] transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span data-testid="breakdown-name" className="text-sm font-semibold text-[#2A080E]">
                      {item.category}
                    </span>
                    <span className="text-xs text-[#7A4B54] px-2 py-0.5 rounded bg-white border border-[#EED9CC]">
                      <span data-testid="breakdown-count">{item.count}</span>{" "}
                      {item.count === 1 ? "expense" : "expenses"}
                    </span>
                  </div>
                  <span data-testid="breakdown-total" className="text-sm font-bold font-mono text-[#9E182B]">
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
