"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Wallet, LogOut, ArrowRight, User as UserIcon } from "lucide-react";

export const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1b3554] bg-[#000f22]/90 backdrop-blur supports-[backdrop-filter]:bg-[#000f22]/80 shadow-[0_4px_20px_rgba(0,15,34,0.6)]">
      <div className="container flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 mx-auto">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight hover:opacity-90 transition">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#3f6593] to-[#5b86b6] text-white shadow-[0_0_15px_rgba(91,134,182,0.4)] border border-[#80aad3]/30">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="text-white font-extrabold tracking-tight">
            ExpenseTrail
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/expenses"
                data-testid="link-expenses"
                className="text-sm font-semibold text-[#80aad3] hover:text-[#c0e6fd] transition px-2 py-1"
              >
                Expenses
              </Link>

              <div className="flex items-center gap-2 rounded-full border border-[#3f6593]/60 bg-[#1b3554]/70 px-3.5 py-1 text-xs sm:text-sm text-[#c0e6fd] font-medium shadow-sm">
                <UserIcon className="h-3.5 w-3.5 text-[#80aad3]" />
                <span data-testid="user-email" className="truncate max-w-[150px] sm:max-w-[220px]">
                  {user.email}
                </span>
              </div>

              <button
                type="button"
                data-testid="btn-logout"
                onClick={logout}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[#1b3554] bg-[#0c1a2c] text-sm font-medium text-[#80aad3] hover:text-white hover:bg-[#1b3554] hover:border-[#3f6593] transition cursor-pointer"
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
                className="inline-flex items-center justify-center h-9 px-3.5 rounded-lg text-sm font-semibold text-[#80aad3] hover:text-white hover:bg-[#1b3554] transition cursor-pointer"
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
