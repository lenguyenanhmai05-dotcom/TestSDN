"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    auth?: string;
  }>({});

  const [loading, setLoading] = useState(false);

  const validateEmail = (val: string) => {
    if (!val || !val.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (val: string) => {
    if (!val) return "Password is required";
    return "";
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (hasSubmitted) {
      const err = validateEmail(val);
      setErrors((prev) => ({ ...prev, email: err || undefined, auth: undefined }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (hasSubmitted) {
      const err = validatePassword(val);
      setErrors((prev) => ({ ...prev, password: err || undefined, auth: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);

    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);

    if (emailErr || passErr) {
      setErrors({
        email: emailErr || undefined,
        password: passErr || undefined,
      });
      return;
    }

    setLoading(true);
    setErrors({});

    const result = await login(email.trim(), password);
    setLoading(false);

    if (result.success) {
      router.push("/expenses");
    } else {
      setErrors({ auth: result.error || "Invalid email or password" });
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md card-midnight rounded-2xl border-[#1b3554] shadow-[0_12px_40px_rgba(0,15,34,0.7)]">
        <CardHeader className="space-y-1 text-center pb-4">
          <CardTitle className="text-2xl font-bold text-white">Welcome back</CardTitle>
          <CardDescription className="text-[#80aad3] font-normal">Enter your email and password to log in</CardDescription>
        </CardHeader>
        <CardContent>
          {errors.auth && (
            <div
              data-testid="error-auth"
              className="mb-4 flex items-center gap-2 rounded-lg bg-rose-950/40 p-3 text-sm text-rose-300 border border-rose-800/60"
            >
              <AlertCircle className="h-4 w-4 text-rose-400" />
              <span className="font-medium">{errors.auth}</span>
            </div>
          )}

          <form noValidate data-testid="login-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="login-email" className="text-[#c0e6fd] font-semibold">Email</Label>
              <Input
                id="login-email"
                data-testid="login-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={handleEmailChange}
                className="input-midnight bg-[#091624] border-[#1b3554] text-[#e2f0fb] placeholder-[#5b86b6]/40"
              />
              {errors.email && (
                <p data-testid="error-email" className="text-xs text-rose-400 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="login-password" className="text-[#c0e6fd] font-semibold">Password</Label>
              <Input
                id="login-password"
                data-testid="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
                className="input-midnight bg-[#091624] border-[#1b3554] text-[#e2f0fb] placeholder-[#5b86b6]/40"
              />
              {errors.password && (
                <p data-testid="error-password" className="text-xs text-rose-400 font-medium">
                  {errors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              data-testid="login-submit"
              className="w-full btn-midnight-primary border-0 text-white font-semibold h-10 mt-2"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-5 text-center text-sm text-[#80aad3]">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#c0e6fd] hover:underline font-semibold">
              Register here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
