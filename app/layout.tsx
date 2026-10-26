import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ExpenseProvider } from "@/context/ExpenseContext";
import { Header } from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ExpenseTrail - Personal Expense Tracker",
  description: "Track what was spent, how much, on which category, and when with live analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ExpenseProvider>
            <div className="min-h-screen flex flex-col bg-background text-foreground">
              <Header />
              <div className="flex-1 flex flex-col">{children}</div>
            </div>
          </ExpenseProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
