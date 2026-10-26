"use client";

import React from "react";
import { useExpenses } from "@/context/ExpenseContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RotateCcw, Star } from "lucide-react";

const CATEGORIES = ["Food", "Transport", "Bills", "Shopping", "Other"] as const;

export const ExpenseFilters = () => {
  const { filters, setCategoryFilter, setStarredFilter, setSearchFilter, clearFilters } =
    useExpenses();

  return (
    <div className="card-midnight rounded-xl border-[#1b3554] p-4 shadow-[0_4px_20px_rgba(0,15,34,0.5)] space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#80aad3]" />
          <Input
            data-testid="search-input"
            type="text"
            placeholder="Search by title or note..."
            value={filters.q}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="input-midnight pl-9 h-10 bg-[#091624] border-[#1b3554] text-[#e2f0fb] placeholder-[#5b86b6]/40"
          />
        </div>

        {/* Category filter select (empty value = All) */}
        <div className="w-full sm:w-44">
          <select
            data-testid="filter-category"
            value={filters.category}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="flex h-10 w-full rounded-md border border-[#1b3554] bg-[#091624] px-3 py-2 text-sm text-[#e2f0fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5b86b6]"
          >
            <option value="" className="bg-[#0c1a2c] text-slate-300">All</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-[#0c1a2c] text-[#e2f0fb]">
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Starred filter checkbox */}
        <div className="flex items-center gap-2 px-3 py-2 border border-[#1b3554] rounded-md bg-[#091624] h-10">
          <input
            id="filter-starred"
            data-testid="filter-starred"
            type="checkbox"
            checked={filters.starred}
            onChange={(e) => setStarredFilter(e.target.checked)}
            className="h-4 w-4 rounded border-[#1b3554] accent-[#5b86b6] cursor-pointer"
          />
          <label htmlFor="filter-starred" className="text-sm font-medium cursor-pointer flex items-center gap-1.5 text-[#80aad3] hover:text-[#c0e6fd]">
            <Star className={`h-3.5 w-3.5 ${filters.starred ? "text-amber-400 fill-amber-400" : "text-[#5b86b6]"}`} />
            <span>Starred</span>
          </label>
        </div>

        {/* Clear Filters Button */}
        <Button
          type="button"
          variant="outline"
          data-testid="btn-clear-filters"
          onClick={clearFilters}
          className="gap-1.5 h-10 shrink-0 border-[#1b3554] bg-[#1b3554]/60 text-[#80aad3] hover:text-white hover:bg-[#1b3554]"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Clear</span>
        </Button>
      </div>
    </div>
  );
};
