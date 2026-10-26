"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    auth?: string;
  }>({});

  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validation functions
  const validateEmail = (val: string) => {
    if (!val || !val.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (val: string) => {
    if (!val) return "Password is required";
    if (val.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const validateConfirmPassword = (val: string, pwd: string) => {
    if (!val) return "Confirm password is required";
    if (val !== pwd) return "Passwords do not match";
    return "";
  };

  // Live change handlers: error disappears when field becomes valid!
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
      let confirmErr = errors.confirmPassword;
      if (confirmPassword) {
        confirmErr = validateConfirmPassword(confirmPassword, val) || undefined;
      }
      setErrors((prev) => ({
        ...prev,
        password: err || undefined,
        confirmPassword: confirmErr,
        auth: undefined,
      }));
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setConfirmPassword(val);
    if (hasSubmitted) {
      const err = validateConfirmPassword(val, password);
      setErrors((prev) => ({ ...prev, confirmPassword: err || undefined, auth: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    setSuccess(false);

    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    const confirmErr = validateConfirmPassword(confirmPassword, password);

    if (emailErr || passErr || confirmErr) {
      setErrors({
        email: emailErr || undefined,
        password: passErr || undefined,
        confirmPassword: confirmErr || undefined,
      });
      return;
    }

    setLoading(true);
    setErrors({});

    const result = await register(email.trim(), password, confirmPassword);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setHasSubmitted(false);
    } else {
      setErrors({ auth: result.error || "Registration failed" });
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md card-midnight rounded-2xl border-[#EED9CC] bg-white shadow-[0_8px_30px_rgba(158,24,43,0.08)]">
        <CardHeader className="space-y-1 text-center pb-4">
          <CardTitle className="text-2xl font-bold text-[#2A080E]">Create an account</CardTitle>
          <CardDescription className="text-[#7A4B54] font-normal">Enter your email and password to register</CardDescription>
        </CardHeader>
        <CardContent>
          {success && (
            <div
              data-testid="form-success"
              className="mb-4 flex flex-col gap-1.5 rounded-lg bg-emerald-50 p-3.5 text-sm text-emerald-800 border border-emerald-200 font-medium"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Registration successful</span>
              </div>
              <Link
                href="/login"
                className="mt-1 text-xs text-[#9E182B] hover:underline font-semibold w-fit"
              >
                Click here to log in now &rarr;
              </Link>
            </div>
          )}

          {errors.auth && (
            <div
              data-testid="error-auth"
              className="mb-4 flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-800 border border-rose-200"
            >
              <AlertCircle className="h-4 w-4 text-rose-600" />
              <span className="font-medium">{errors.auth}</span>
            </div>
          )}

          <form noValidate data-testid="register-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="register-email" className="text-[#2A080E] font-semibold">Email</Label>
              <Input
                id="register-email"
                data-testid="register-email"
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
              <Label htmlFor="register-password" className="text-[#2A080E] font-semibold">Password</Label>
              <Input
                id="register-password"
                data-testid="register-password"
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

            <div className="space-y-1.5">
              <Label htmlFor="register-confirm-password" className="text-[#2A080E] font-semibold">Confirm Password</Label>
              <Input
                id="register-confirm-password"
                data-testid="register-confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className="input-midnight bg-white border-[#EED9CC] text-[#2A080E] placeholder-[#A8858B]"
              />
              {errors.confirmPassword && (
                <p data-testid="error-confirm-password" className="text-xs text-rose-600 font-medium">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <Button
              type="submit"
              data-testid="register-submit"
              className="w-full btn-midnight-primary border-0 text-white font-semibold h-10 mt-2"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-5 text-center text-sm text-[#7A4B54]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#9E182B] hover:underline font-semibold">
              Login here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
