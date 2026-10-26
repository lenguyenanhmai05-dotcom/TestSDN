"use client";

import React, { useState } from "react";
import { useExpenses } from "@/context/ExpenseContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PlusCircle, CheckCircle2, AlertCircle } from "lucide-react";

const CATEGORIES = ["Food", "Transport", "Bills", "Shopping", "Other"] as const;

function isFutureDate(dateStr: string): boolean {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return false;
  const inputDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 0, 0, 0);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return inputDate.getTime() > today.getTime();
}

export const ExpenseForm = () => {
  const { addExpense } = useExpenses();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    amount?: string;
    category?: string;
    date?: string;
    expense?: string;
  }>({});

  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Validation rules
  const validateTitle = (val: string) => {
    if (!val || !val.trim()) return "Title is required";
    if (val.trim().length > 80) return "Title must be at most 80 characters";
    return "";
  };

  const validateAmount = (val: string) => {
    if (val === "" || val === undefined || val === null) return "Amount is required";
    const num = Number(val);
    if (isNaN(num)) return "Amount is required";
    if (num <= 0) return "Amount must be a positive number";
    return "";
  };

  const validateCategory = (val: string) => {
    if (!val || !val.trim()) return "Please choose a category";
    if (!CATEGORIES.includes(val.trim() as any)) return "Invalid category";
    return "";
  };

  const validateDate = (val: string) => {
    if (!val || !val.trim()) return "Date is required";
    if (isFutureDate(val.trim())) return "Date cannot be in the future";
    return "";
  };

  // Live change handlers: error disappears when field becomes valid
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (hasSubmitted) {
      const err = validateTitle(val);
      setErrors((prev) => ({ ...prev, title: err || undefined, expense: undefined }));
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAmount(val);
    if (hasSubmitted) {
      const err = validateAmount(val);
      setErrors((prev) => ({ ...prev, amount: err || undefined, expense: undefined }));
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCategory(val);
    if (hasSubmitted) {
      const err = validateCategory(val);
      setErrors((prev) => ({ ...prev, category: err || undefined, expense: undefined }));
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDate(val);
    if (hasSubmitted) {
      const err = validateDate(val);
      setErrors((prev) => ({ ...prev, date: err || undefined, expense: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    setSuccess(false);

    const titleErr = validateTitle(title);
    const amountErr = validateAmount(amount);
    const categoryErr = validateCategory(category);
    const dateErr = validateDate(date);

    if (titleErr || amountErr || categoryErr || dateErr) {
      setErrors({
        title: titleErr || undefined,
        amount: amountErr || undefined,
        category: categoryErr || undefined,
        date: dateErr || undefined,
      });
      return;
    }

    setSubmitting(true);
    setErrors({});

    const result = await addExpense({
      title: title.trim(),
      amount: Number(amount),
      category: category.trim(),
      note: note ? note.trim() : "",
      spentAt: date.trim(),
    });

    setSubmitting(false);

    if (result.success) {
      setSuccess(true);
      setTitle("");
      setAmount("");
      setCategory("");
      setNote("");
      setDate("");
      setHasSubmitted(false);

      // Auto dismiss success after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } else {
      setErrors({ expense: result.error || "Failed to add expense" });
    }
  };

  return (
    <Card className="card-midnight rounded-2xl border-[#1b3554] shadow-[0_8px_30px_rgba(0,15,34,0.6)]">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-white">Add Expense</CardTitle>
      </CardHeader>
      <CardContent>
        {success && (
          <div
            data-testid="expense-success"
            className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-950/40 p-3 text-sm text-emerald-300 border border-emerald-800/60 font-medium"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Expense added</span>
          </div>
        )}

        {errors.expense && (
          <div
            data-testid="error-expense"
            className="mb-4 flex items-center gap-2 rounded-lg bg-rose-950/40 p-3 text-sm text-rose-300 border border-rose-800/60"
          >
            <AlertCircle className="h-4 w-4 text-rose-400" />
            <span className="text-rose-300 font-medium">{errors.expense}</span>
          </div>
        )}

        <form noValidate data-testid="expense-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="input-title" className="text-[#c0e6fd] font-semibold">Title *</Label>
            <Input
              id="input-title"
              data-testid="input-title"
              type="text"
              placeholder="e.g. Lunch with colleagues"
              value={title}
              onChange={handleTitleChange}
              className="input-midnight bg-[#091624] border-[#1b3554] text-[#e2f0fb] placeholder-[#5b86b6]/40"
            />
            {errors.title && (
              <p data-testid="error-title" className="text-xs text-rose-400 font-medium">
                {errors.title}
              </p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="input-amount" className="text-[#c0e6fd] font-semibold">Amount *</Label>
            <Input
              id="input-amount"
              data-testid="input-amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={handleAmountChange}
              className="input-midnight bg-[#091624] border-[#1b3554] text-[#e2f0fb] placeholder-[#5b86b6]/40 font-mono"
            />
            {errors.amount && (
              <p data-testid="error-amount" className="text-xs text-rose-400 font-medium">
                {errors.amount}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label htmlFor="input-category" className="text-[#c0e6fd] font-semibold">Category *</Label>
            <select
              id="input-category"
              data-testid="input-category"
              value={category}
              onChange={handleCategoryChange}
              className="flex h-10 w-full rounded-md border border-[#1b3554] bg-[#091624] px-3 py-2 text-sm text-[#e2f0fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5b86b6] focus-visible:ring-offset-0"
            >
              <option value="" className="bg-[#0c1a2c] text-slate-300">Choose category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#0c1a2c] text-[#e2f0fb]">
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p data-testid="error-category" className="text-xs text-rose-400 font-medium">
                {errors.category}
              </p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="input-date" className="text-[#c0e6fd] font-semibold">Date *</Label>
            <Input
              id="input-date"
              data-testid="input-date"
              type="date"
              value={date}
              onChange={handleDateChange}
              className="input-midnight bg-[#091624] border-[#1b3554] text-[#e2f0fb] placeholder-[#5b86b6]/40"
            />
            {errors.date && (
              <p data-testid="error-date" className="text-xs text-rose-400 font-medium">
                {errors.date}
              </p>
            )}
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label htmlFor="input-note" className="text-[#c0e6fd] font-semibold">Note (optional)</Label>
            <Input
              id="input-note"
              data-testid="input-note"
              type="text"
              placeholder="Additional details"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="input-midnight bg-[#091624] border-[#1b3554] text-[#e2f0fb] placeholder-[#5b86b6]/40"
            />
          </div>

          <Button
            type="submit"
            data-testid="btn-add-expense"
            className="w-full btn-midnight-primary border-0 text-white font-semibold h-10 mt-1"
            disabled={submitting}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>{submitting ? "Adding..." : "Add Expense"}</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
