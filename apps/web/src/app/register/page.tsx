"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IconArrowRight, IconHeartbeat } from "@tabler/icons-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    // Simulate registration
    setTimeout(() => {
      setIsLoading(false);
      window.location.href = "/onboarding/consent";
    }, 1500);
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* LEFT COLUMN: BRAND PANEL */}
      <div className="hidden lg:flex flex-1 relative bg-neutral-100 overflow-hidden items-center justify-center p-12 border-r border-neutral-200">
        <div className="absolute top-0 left-0 w-full h-full opacity-30" style={{ backgroundImage: 'radial-gradient(#d4d4d4 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        
        <div className="relative z-10 max-w-md text-neutral-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900 text-white mb-8 shadow-xl">
            <IconHeartbeat size={24} stroke={2} />
          </div>
          <h2 className="text-4xl font-semibold tracking-tight mb-4">
            Start your preventive health journey.
          </h2>
          <p className="text-neutral-600 text-lg leading-relaxed">
            Join thousands of users who are taking control of their future health through predictive lifestyle analysis and actionable insights.
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: FORM */}
      <div className="flex flex-1 flex-col justify-center px-8 sm:px-16 md:px-24 lg:px-32 bg-white">
        <div className="w-full max-w-[400px] mx-auto">
          <div className="lg:hidden mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-neutral-900">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white">
                <IconHeartbeat size={18} stroke={2} />
              </div>
              <span className="text-xl font-bold tracking-tight">HELIORA</span>
            </Link>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-2">
            Create an account
          </h1>
          <p className="text-neutral-500 mb-8">
            Enter your details below to create your account and get started.
          </p>

          <form onSubmit={handleRegister} className="space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-neutral-700">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 bg-neutral-50/50 border-neutral-200 focus-visible:ring-neutral-900"
              />
            </div>

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
              <Label htmlFor="password" className="text-neutral-700">Password</Label>
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-neutral-700">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-11 bg-neutral-50/50 border-neutral-200 focus-visible:ring-neutral-900"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-neutral-900 hover:bg-neutral-800 text-white font-medium group mt-4" 
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create account"}
              {!isLoading && <IconArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-neutral-500">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-neutral-900 hover:underline underline-offset-4">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
