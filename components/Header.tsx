"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Wallet, LogOut, ArrowRight, User as UserIcon } from "lucide-react";

export const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#F2E0D2] bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-[0_2px_15px_rgba(158,24,43,0.05)]">
      <div className="container flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 mx-auto">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight hover:opacity-90 transition">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#9E182B] to-[#C8344A] text-white shadow-[0_2px_10px_rgba(158,24,43,0.3)] border border-[#F2AFBC]/40">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="text-[#9E182B] font-extrabold tracking-tight">
            ExpenseTrail
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/expenses"
                data-testid="link-expenses"
                className="text-sm font-semibold text-[#7A4B54] hover:text-[#9E182B] transition px-2 py-1"
              >
                Expenses
              </Link>

              <div className="flex items-center gap-2 rounded-full border border-[#F9CBD6] bg-[#FFF5F7] px-3.5 py-1 text-xs sm:text-sm text-[#9E182B] font-medium shadow-sm">
                <UserIcon className="h-3.5 w-3.5 text-[#9E182B]" />
                <span data-testid="user-email" className="truncate max-w-[150px] sm:max-w-[220px]">
                  {user.email}
                </span>
              </div>

              <button
                type="button"
                data-testid="btn-logout"
                onClick={logout}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[#EED9CC] bg-[#FAF4EF] text-sm font-medium text-[#7A4B54] hover:text-[#9E182B] hover:bg-[#F2E0D2] hover:border-[#F2AFBC] transition cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/login"
                data-testid="btn-login"
                className="inline-flex items-center justify-center h-9 px-3.5 rounded-lg text-sm font-semibold text-[#7A4B54] hover:text-[#9E182B] hover:bg-[#FAF4EF] transition cursor-pointer"
              >
                Login
              </Link>

              <Link
                href="/register"
                data-testid="btn-register"
                className="btn-midnight-primary inline-flex items-center justify-center h-9 px-4 rounded-lg text-sm font-semibold transition cursor-pointer"
              >
                <span>Register</span>
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
