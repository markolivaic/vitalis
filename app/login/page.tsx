/**
 * File: page.tsx
 * Description: Login and registration page with OAuth provider support.
 */

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Activity, Github, Mail, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (res?.ok) {
          router.push("/");
          router.refresh();
        } else {
          setError("Invalid credentials. Check your email and password.");
        }
      } else {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await res.json();

        if (res.ok) {
          setIsLogin(true);
          setError("");
          setPassword("");
        } else {
          setError(data.error || "Registration failed");
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative w-full max-w-md space-y-8">
        {/* Logo Section */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-violet-500 items-center justify-center mb-4 shadow-2xl shadow-emerald-500/20">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter text-white">
            VITALIS<span className="text-emerald-400">AI</span>
          </h1>
          <p className="text-zinc-500 uppercase tracking-[0.3em] text-xs">
            Human Performance Hub
          </p>
        </div>

        <GlassCard padding="lg" className="border-white/10 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <Input
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            )}
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />

            {error && (
              <p className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                {error}
              </p>
            )}

            <Button
              variant="emerald"
              className="w-full h-12 text-lg"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isLogin ? (
                "Initialize System"
              ) : (
                "Create Profile"
              )}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-900/50 px-4 text-zinc-500">
                Or bridge with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => signIn("github", { callbackUrl: "/" })}
              disabled={loading}
            >
              <Github className="w-4 h-4 mr-2" /> GitHub
            </Button>
            <Button
              variant="outline"
              onClick={() => signIn("google", { callbackUrl: "/" })}
              disabled={loading}
            >
              <Mail className="w-4 h-4 mr-2" /> Google
            </Button>
          </div>

          <p className="text-center mt-6 text-sm text-zinc-500">
            {isLogin ? "New subject?" : "Already registered?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-emerald-400 hover:underline font-medium"
              disabled={loading}
            >
              {isLogin ? "Create Access Key" : "Sign In"}
            </button>
          </p>
        </GlassCard>

        <p className="text-center text-xs text-zinc-600">
          By continuing, you agree to our Terms and Privacy Policy
        </p>
      </div>
    </div>
  );
}

