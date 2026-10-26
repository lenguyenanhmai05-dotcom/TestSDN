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
    <div className="card-midnight rounded-xl border-[#EED9CC] bg-white p-4 shadow-[0_4px_20px_rgba(158,24,43,0.04)] space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9E182B]" />
          <Input
            data-testid="search-input"
            type="text"
            placeholder="Search by title or note..."
            value={filters.q}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="input-midnight pl-9 h-10 bg-white border-[#EED9CC] text-[#2A080E] placeholder-[#A8858B]"
          />
        </div>

        {/* Category filter select (empty value = All) */}
        <div className="w-full sm:w-44">
          <select
            data-testid="filter-category"
            value={filters.category}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="flex h-10 w-full rounded-md border border-[#EED9CC] bg-white px-3 py-2 text-sm text-[#2A080E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9E182B]"
          >
            <option value="" className="bg-white text-slate-500">All</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-white text-[#2A080E]">
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Starred filter checkbox */}
        <div className="flex items-center gap-2 px-3 py-2 border border-[#EED9CC] rounded-md bg-white h-10">
          <input
            id="filter-starred"
            data-testid="filter-starred"
            type="checkbox"
            checked={filters.starred}
            onChange={(e) => setStarredFilter(e.target.checked)}
            className="h-4 w-4 rounded border-[#EED9CC] accent-[#9E182B] cursor-pointer"
          />
          <label htmlFor="filter-starred" className="text-sm font-medium cursor-pointer flex items-center gap-1.5 text-[#7A4B54] hover:text-[#9E182B]">
            <Star className={`h-3.5 w-3.5 ${filters.starred ? "text-amber-500 fill-amber-400" : "text-[#A8858B]"}`} />
            <span>Starred</span>
          </label>
        </div>

        {/* Clear Filters Button */}
        <Button
          type="button"
          variant="outline"
          data-testid="btn-clear-filters"
          onClick={clearFilters}
          className="gap-1.5 h-10 shrink-0 border-[#EED9CC] bg-[#FAF4EF] text-[#7A4B54] hover:text-[#9E182B] hover:bg-[#F2E0D2]"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Clear</span>
        </Button>
      </div>
    </div>
  );
};
