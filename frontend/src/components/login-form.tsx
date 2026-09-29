"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Lock,
  User as UserIcon,
  CheckCircle2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage } from "@/lib/api/client";
import type { LoginCredentials } from "@/lib/types";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const registered = searchParams.get("registered") === "true";
  const queryIdentifier =
    searchParams.get("identifier") || searchParams.get("username") || "";

  const [identifier, setIdentifier] = useState(queryIdentifier);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isNotFoundError, setIsNotFoundError] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const errorRef = React.useRef<HTMLDivElement>(null);
  const bottomErrorRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (error) {
      (bottomErrorRef.current || errorRef.current)?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [error]);

  const handleFillDemo = (demoUser: string, demoPass: string) => {
    setIdentifier(demoUser);
    setPassword(demoPass);
    setError(null);
  };

  const handleDemoLogin = async (demoUser: string, demoPass: string) => {
    setError(null);
    setIsNotFoundError(false);
    setIsDemoLoading(demoUser);
    try {
      const credentials: LoginCredentials = {
        username: demoUser,
        email: demoUser,
        password: demoPass,
      };
      await login(credentials);
      setSuccessMsg(`Welcome, ${demoUser}! Redirecting...`);
      setTimeout(() => {
        router.push("/");
      }, 300);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Demo login failed. Please try manually.");
      setError(msg);
    } finally {
      setIsDemoLoading(null);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setIsNotFoundError(false);

    const cleanIdentifier = identifier.trim().toLowerCase();
    if (!cleanIdentifier || !password.trim()) {
      setError("Please enter your username or email and password.");
      return;
    }

    setIsLoading(true);
    try {
      // Send both username and email as cleanIdentifier so backend matches either!
      const credentials: LoginCredentials = {
        username: cleanIdentifier,
        email: cleanIdentifier,
        password,
      };

      await login(credentials);
      setSuccessMsg("Signed in successfully! Redirecting...");
      setTimeout(() => {
        router.push("/");
      }, 300);
    } catch (err: unknown) {
      const errMsg = getErrorMessage(
        err,
        "Login failed. Please check your credentials.",
      );
      setError(errMsg);
      if (
        errMsg.toLowerCase().includes("doesn't exist") ||
        errMsg.toLowerCase().includes("not exist") ||
        errMsg.toLowerCase().includes("not found")
      ) {
        setIsNotFoundError(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl overflow-hidden p-2 sm:p-5">
        <CardHeader className="text-center pb-2">
          <CardTitle
            className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Welcome back
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
            Sign in to your creator account on VideoTube
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2">
          {successMsg && (
            <div className="mb-4 px-4 py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs sm:text-sm text-emerald-400 flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 size={16} className="shrink-0 animate-bounce" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {registered && (
            <div className="mb-4 px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs sm:text-sm text-emerald-400 flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>Account created successfully! Please sign in below.</span>
            </div>
          )}

          {error && (
            <div
              ref={errorRef}
              className="mb-4 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs sm:text-sm text-red-400 flex flex-col gap-1.5 animate-in fade-in duration-200"
            >
              <p className="font-medium">{error}</p>
              {isNotFoundError && (
                <Link
                  href="/register"
                  className="font-semibold underline text-[var(--color-accent)] hover:opacity-80"
                >
                  Create an account instead →
                </Link>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <FieldGroup className="gap-3.5">
              <div className="flex flex-col gap-2.5">
                <Button
                  variant="outline"
                  type="button"
                  disabled={!!isDemoLoading || isLoading}
                  onClick={() => handleDemoLogin("fatty", "12345678")}
                  className="w-full h-11 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-hover)] text-xs sm:text-sm text-[var(--color-text-primary)] font-medium gap-2 transition-all cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="size-4 shrink-0 fill-current"
                  >
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                  </svg>
                  Continue with Apple
                </Button>

                <Button
                  variant="outline"
                  type="button"
                  disabled={!!isDemoLoading || isLoading}
                  onClick={() => handleDemoLogin("ayu", "12345678")}
                  className="w-full h-11 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-hover)] text-xs sm:text-sm text-[var(--color-text-primary)] font-medium gap-2 transition-all cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="size-4 shrink-0 fill-current"
                  >
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                  </svg>
                  Continue with Google
                </Button>
              </div>

              <FieldSeparator className="my-1 *:data-[slot=field-separator-content]:bg-[var(--color-surface)] *:data-[slot=field-separator-content]:text-[var(--color-text-tertiary)] *:data-[slot=field-separator-content]:text-xs">
                Or continue with username or email
              </FieldSeparator>

              <Field className="space-y-1">
                <FieldLabel
                  htmlFor="identifier"
                  className="text-xs font-medium text-[var(--color-text-secondary)]"
                >
                  Username or Email
                </FieldLabel>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--color-text-tertiary)]" />
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="blobataruser or you@example.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    className="h-11 rounded-full pl-10 pr-4 border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus-visible:border-[var(--color-accent)] focus-visible:ring-[var(--color-accent)]/20"
                  />
                </div>
              </Field>

              <Field className="space-y-1">
                <div className="flex items-center justify-between">
                  <FieldLabel
                    htmlFor="password"
                    className="text-xs font-medium text-[var(--color-text-secondary)]"
                  >
                    Password
                  </FieldLabel>
                  <a
                    href="#"
                    className="text-xs text-[var(--color-accent)] hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--color-text-tertiary)]" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 rounded-full pl-10 pr-10 border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus-visible:border-[var(--color-accent)] focus-visible:ring-[var(--color-accent)]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>

              {/* Demo Accounts Quick-fill / Instant Login */}
              <div className="rounded-2xl border border-[var(--color-border)]/60 bg-[var(--color-surface-2)]/40 p-2.5 flex items-center justify-between">
                <span className="text-[11px] text-[var(--color-text-tertiary)] font-medium">
                  Instant demo:
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={!!isDemoLoading || isLoading}
                    onClick={() => handleDemoLogin("fatty", "12345678")}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-accent)] transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                  >
                    {isDemoLoading === "fatty" && (
                      <span className="size-2.5 border border-current border-t-transparent rounded-full animate-spin" />
                    )}
                    fatty
                  </button>
                  <button
                    type="button"
                    disabled={!!isDemoLoading || isLoading}
                    onClick={() => handleDemoLogin("ayu", "12345678")}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-accent)] transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                  >
                    {isDemoLoading === "ayu" && (
                      <span className="size-2.5 border border-current border-t-transparent rounded-full animate-spin" />
                    )}
                    ayu
                  </button>
                  <button
                    type="button"
                    disabled={!!isDemoLoading || isLoading}
                    onClick={() => handleDemoLogin("blobataruser", "Password123!")}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-accent)] transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                  >
                    {isDemoLoading === "blobataruser" && (
                      <span className="size-2.5 border border-current border-t-transparent rounded-full animate-spin" />
                    )}
                    blobataruser
                  </button>
                </div>
              </div>

              {/* Bottom Error Display (Always visible on mobile above the submit button) */}
              {error && (
                <div
                  ref={bottomErrorRef}
                  className="px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs sm:text-sm text-red-400 flex flex-col gap-1.5 animate-in fade-in duration-200"
                >
                  <p className="font-medium">{error}</p>
                  {isNotFoundError && (
                    <Link
                      href="/register"
                      className="font-semibold underline text-[var(--color-accent)] hover:opacity-80"
                    >
                      Create an account instead →
                    </Link>
                  )}
                </div>
              )}

              <Field className="pt-1">
                <Button
                  type="submit"
                  disabled={isLoading || !!isDemoLoading}
                  onClick={(e) => {
                    // Ensures tap works even if virtual keyboard dismisses on mobile
                    handleSubmit(e);
                  }}
                  className="w-full h-11 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-black font-semibold text-sm shadow-md transition-all duration-150 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="size-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                <FieldDescription className="text-center text-xs text-[var(--color-text-secondary)] mt-3">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="text-[var(--color-accent)] font-semibold hover:underline"
                  >
                    Create an account
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center text-xs text-[var(--color-text-tertiary)]">
        By signing in, you agree to VideoTube&apos;s{" "}
        <a
          href="#"
          className="underline hover:text-[var(--color-text-secondary)]"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="#"
          className="underline hover:text-[var(--color-text-secondary)]"
        >
          Privacy Policy
        </a>
        .
      </FieldDescription>
    </div>
  );
}
