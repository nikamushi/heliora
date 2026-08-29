"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IconArrowRight, IconHeartbeat } from "@tabler/icons-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      // For now, let's just go to dashboard on success simulation
      window.location.href = "/dashboard";
    }, 1500);
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* LEFT COLUMN: FORM */}
      <div className="flex flex-1 flex-col justify-center px-8 sm:px-16 md:px-24 lg:px-32">
        <div className="w-full max-w-[400px] mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 mb-12 group text-neutral-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white">
              <IconHeartbeat size={18} stroke={2} />
            </div>
            <span className="text-xl font-bold tracking-tight">HELIORA</span>
          </Link>

          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-2">
            Welcome back
          </h1>
          <p className="text-neutral-500 mb-8">
            Log in to your account to view your health profile.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-700">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-neutral-50/50 border-neutral-200 focus-visible:ring-neutral-900"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-neutral-700">Password</Label>
                <Link href="/forgot-password" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 bg-neutral-50/50 border-neutral-200 focus-visible:ring-neutral-900"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-neutral-900 hover:bg-neutral-800 text-white font-medium group mt-2" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
              {!isLoading && <IconArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-neutral-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-neutral-900 hover:underline underline-offset-4">
              Sign up
            </Link>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: BRAND PANEL */}
      <div className="hidden lg:flex flex-1 relative bg-neutral-950 overflow-hidden items-center justify-center p-12">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neutral-800/40 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 max-w-md text-white">
          <blockquote className="space-y-6">
            <p className="text-3xl font-medium leading-tight tracking-tight text-neutral-100">
              "We believe that understanding your health shouldn't require a medical degree. Predictive, proactive, and deeply personal."
            </p>
            <footer className="text-neutral-400 font-medium">
              The Heliora Team
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
