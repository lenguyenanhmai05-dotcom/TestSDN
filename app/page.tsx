"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, TrendingUp, Tags, PieChart, Sparkles } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();

  const featureCards = [
    {
      title: "Track spending",
      description: "Log your daily expenses with title, exact amount, date, and optional notes in real time.",
      icon: <TrendingUp className="h-6 w-6 text-[#9E182B]" />,
    },
    {
      title: "Sort into categories",
      description: "Organize spending effortlessly into Food, Transport, Bills, Shopping, or Other.",
      icon: <Tags className="h-6 w-6 text-[#C4273E]" />,
    },
    {
      title: "See where it goes",
      description: "Get a live category breakdown and instant spending summary calculated over all matching items.",
      icon: <PieChart className="h-6 w-6 text-[#9E182B]" />,
    },
  ];

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-20 max-w-7xl mx-auto w-full">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#F9CBD6] bg-[#FFF0F3] text-[#9E182B] text-xs sm:text-sm font-semibold shadow-sm">
          <Sparkles className="h-4 w-4 text-[#9E182B]" />
          <span>SDN302 Practical Exam — ExpenseTrail</span>
        </div>

        <h1
          data-testid="home-title"
          className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-[#9E182B] via-[#C4273E] to-[#B82338] bg-clip-text text-transparent"
        >
          ExpenseTrail
        </h1>

        <p className="text-lg sm:text-xl text-[#6A4048] leading-relaxed max-w-2xl mx-auto font-normal">
          A personal expense tracker built with Next.js App Router, Prisma ORM, and Supabase PostgreSQL.
          Keep track of every dollar with category breakdowns and instant priority tagging.
        </p>

        <div className="flex items-center justify-center gap-4 pt-4">
          {user ? (
            <Link
              href="/expenses"
              className="btn-midnight-primary inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold shadow-md transition"
            >
              <span>Go to Expenses</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="btn-midnight-primary inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold shadow-md transition"
              >
                <span>Get Started</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="btn-midnight-secondary inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Feature Cards */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {featureCards.map((card, idx) => (
          <Card key={idx} className="card-midnight rounded-2xl border-[#EED9CC] bg-white transition duration-200 hover:border-[#F2AFBC] hover:shadow-[0_8px_30px_rgba(242,175,188,0.25)]">
            <CardHeader className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[#FFF0F3] border border-[#F9CBD6] w-fit">{card.icon}</div>
              <CardTitle className="text-xl font-bold text-[#2A080E]">{card.title}</CardTitle>
              <CardDescription className="text-sm leading-relaxed text-[#7A4B54] font-normal">
                {card.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </main>
  );
}
