"use client";

import React from "react";
import { useExpenses } from "@/context/ExpenseContext";
import { Button } from "@/components/ui/button";
import { Star, Trash2, Calendar, FileText, Inbox } from "lucide-react";

export const ExpenseList = () => {
  const { expenses, toggleStar, deleteExpense, loading } = useExpenses();

  return (
    <div data-testid="expense-list" className="space-y-3">
      {expenses.length === 0 ? (
        <div
          data-testid="expenses-empty"
          className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-[#EED9CC] bg-[#FAF5F1] shadow-sm"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF0F3] text-[#9E182B] mb-3 border border-[#F9CBD6]">
            <Inbox className="h-6 w-6" />
          </div>
          <p className="text-base font-semibold text-[#2A080E]">No expenses found</p>
          <p className="text-xs text-[#7A4B54] mt-1 max-w-xs">
            {loading ? "Loading transactions..." : "No expenses match your criteria or none have been added yet."}
          </p>
        </div>
      ) : (
        expenses.map((expense) => {
          const isStarred = Boolean(expense.starred);
          const formattedAmount = Number(expense.amount).toFixed(2);

          return (
            <div
              key={expense.id}
              data-testid="expense-item"
              className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-xl border transition ${
                isStarred
                  ? "border-[#F2AFBC] bg-[#FFF8FA] shadow-[0_4px_16px_rgba(242,175,188,0.22)]"
                  : "card-midnight border-[#EED9CC] bg-white hover:border-[#F2AFBC] shadow-[0_2px_12px_rgba(158,24,43,0.03)]"
              }`}
            >
              {/* Star toggle button */}
              <button
                type="button"
                data-testid="btn-toggle-star"
                aria-pressed={isStarred ? "true" : "false"}
                onClick={() => toggleStar(expense.id)}
                className={`p-2 rounded-lg border transition ${
                  isStarred
                    ? "border-amber-300 bg-amber-50 text-amber-500"
                    : "border-[#EED9CC] bg-[#FAF5F1] text-[#A8858B] hover:text-amber-500 hover:border-amber-300 hover:bg-amber-50"
                }`}
                title={isStarred ? "Unstar expense" : "Star expense"}
              >
                <Star className={`h-4 w-4 ${isStarred ? "fill-amber-400" : ""}`} />
              </button>

              {/* Expense Details */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span data-testid="expense-title" className="font-semibold text-sm sm:text-base text-[#2A080E] truncate">
                    {expense.title}
                  </span>
                  <span
                    data-testid="expense-category"
                    className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-[#F9CBD6] bg-[#FFF0F3] text-[#9E182B]"
                  >
                    {expense.category}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#7A4B54] flex-wrap">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-[#9E182B]" />
                    <span data-testid="expense-date">{expense.spentAt}</span>
                  </div>
                  {expense.note && (
                    <div className="flex items-center gap-1 truncate max-w-[200px] sm:max-w-xs text-[#7A4B54]">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-[#9E182B]" />
                      <span className="truncate">{expense.note}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Amount and Delete Action */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span data-testid="expense-amount" className="font-mono font-bold text-base sm:text-lg text-[#9E182B]">
                    {formattedAmount}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="btn-delete-expense"
                  onClick={() => deleteExpense(expense.id)}
                  className="h-8 w-8 text-[#A8858B] hover:text-rose-600 hover:bg-rose-50"
                  title="Delete expense"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
