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
          className="card-midnight flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-[#1b3554] shadow-sm"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1b3554] text-[#80aad3] mb-3 border border-[#3f6593]/40">
            <Inbox className="h-6 w-6" />
          </div>
          <p className="text-base font-semibold text-white">No expenses found</p>
          <p className="text-xs text-[#80aad3] mt-1 max-w-xs">
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
                  ? "border-[#5b86b6] bg-[#10243d]/90 shadow-[0_4px_20px_rgba(91,134,182,0.22)]"
                  : "card-midnight border-[#1b3554] hover:border-[#3f6593] shadow-[0_4px_16px_rgba(0,15,34,0.4)]"
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
                    ? "border-amber-700/60 bg-amber-950/40 text-amber-400"
                    : "border-[#1b3554] bg-[#091624] text-[#5b86b6] hover:text-amber-400 hover:border-amber-600/50 hover:bg-amber-950/20"
                }`}
                title={isStarred ? "Unstar expense" : "Star expense"}
              >
                <Star className={`h-4 w-4 ${isStarred ? "fill-amber-400" : ""}`} />
              </button>

              {/* Expense Details */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span data-testid="expense-title" className="font-semibold text-sm sm:text-base text-white truncate">
                    {expense.title}
                  </span>
                  <span
                    data-testid="expense-category"
                    className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-[#3f6593] bg-[#1b3554] text-[#c0e6fd]"
                  >
                    {expense.category}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#80aad3] flex-wrap">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-[#5b86b6]" />
                    <span data-testid="expense-date">{expense.spentAt}</span>
                  </div>
                  {expense.note && (
                    <div className="flex items-center gap-1 truncate max-w-[200px] sm:max-w-xs text-[#80aad3]">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-[#5b86b6]" />
                      <span className="truncate">{expense.note}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Amount and Delete Action */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span data-testid="expense-amount" className="font-mono font-bold text-base sm:text-lg text-[#5eead4]">
                    {formattedAmount}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="btn-delete-expense"
                  onClick={() => deleteExpense(expense.id)}
                  className="h-8 w-8 text-[#80aad3] hover:text-rose-400 hover:bg-rose-950/40"
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
