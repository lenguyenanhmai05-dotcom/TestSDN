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
      <Card className="w-full max-w-md card-midnight rounded-2xl border-[#EED9CC] bg-white shadow-[0_8px_30px_rgba(158,24,43,0.08)]">
        <CardHeader className="space-y-1 text-center pb-4">
          <CardTitle className="text-2xl font-bold text-[#2A080E]">Welcome back</CardTitle>
          <CardDescription className="text-[#7A4B54] font-normal">Enter your email and password to log in</CardDescription>
        </CardHeader>
        <CardContent>
          {errors.auth && (
            <div
              data-testid="error-auth"
              className="mb-4 flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-800 border border-rose-200"
            >
              <AlertCircle className="h-4 w-4 text-rose-600" />
              <span className="font-medium">{errors.auth}</span>
            </div>
          )}

          <form noValidate data-testid="login-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="login-email" className="text-[#2A080E] font-semibold">Email</Label>
              <Input
                id="login-email"
                data-testid="login-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={handleEmailChange}
                className="input-midnight bg-white border-[#EED9CC] text-[#2A080E] placeholder-[#A8858B]"
              />
              {errors.email && (
                <p data-testid="error-email" className="text-xs text-rose-600 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="login-password" className="text-[#2A080E] font-semibold">Password</Label>
              <Input
                id="login-password"
                data-testid="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
                className="input-midnight bg-white border-[#EED9CC] text-[#2A080E] placeholder-[#A8858B]"
              />
              {errors.password && (
                <p data-testid="error-password" className="text-xs text-rose-600 font-medium">
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

          <div className="mt-5 text-center text-sm text-[#7A4B54]">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#9E182B] hover:underline font-semibold">
              Register here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
