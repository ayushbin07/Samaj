"use client";

import * as React from "react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User as UserIcon,
  AtSign,
  Camera,
  Upload,
  Sparkles,
  X,
  Layers,
  Smile,
  Palette,
} from "lucide-react";

import { UserAvatar, BLOBATAR_EXPRESSIONS } from "@/components/ui/user-avatar";
import type { BlobatarConfig } from "@/lib/types";
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
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage } from "@/lib/api/client";

const REG_EXPRESSIONS = [
  { key: "happy", label: "Happy" },
  { key: "idle", label: "Idle" },
  { key: "wink", label: "Wink" },
  { key: "surprised", label: "Surprised" },
  { key: "love", label: "Love" },
  { key: "thinking", label: "Thinking" },
];

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { register, login } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Avatar Choice: "blobatar" (Default) | "upload" | "both"
  const [avatarChoice, setAvatarChoice] = useState<"blobatar" | "upload" | "both">(
    "blobatar"
  );
  const [initialDisplayChoice, setInitialDisplayChoice] = useState<"upload" | "blobatar">(
    "upload"
  );

  // Blobatar customization preview
  const [regExpression, setRegExpression] = useState("happy");
  const [regHue, setRegHue] = useState<number | undefined>(undefined);
  const [regShape, setRegShape] = useState<number>(0.5);

  // Upload file state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExistingUserError, setIsExistingUserError] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const bottomErrorRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (error) {
      (bottomErrorRef.current || errorRef.current)?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [error]);

  const handleFileSelection = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please choose a valid image file (JPEG, PNG, SVG, WebP).");
      return;
    }
    setError(null);
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleClearUploadedFile = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setIsExistingUserError(false);

    const cleanFullName = fullName.trim();
    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, "");
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanFullName || !cleanUsername || !cleanEmail || !password.trim()) {
      setError("Please fill out all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    const formData = new FormData();
    formData.append("fullName", cleanFullName);
    formData.append("email", cleanEmail);
    formData.append("username", cleanUsername);
    formData.append("password", password);

    // Prepare blobatar configuration
    const blobatarConfig: BlobatarConfig = {
      expression: regExpression,
      ...(regHue !== undefined ? { hue: regHue } : {}),
      traits: { shape: regShape },
    };
    formData.append("blobatar", JSON.stringify(blobatarConfig));

    // Handle avatar file and avatarType
    if (avatarChoice === "blobatar") {
      formData.append("avatarType", "blobatar");
    } else if (avatarChoice === "upload") {
      if (avatarFile) {
        formData.append("avatar", avatarFile);
        formData.append("avatarType", "upload");
      } else {
        // Fall back gracefully to blobatar if no photo uploaded
        formData.append("avatarType", "blobatar");
      }
    } else if (avatarChoice === "both") {
      if (avatarFile) {
        formData.append("avatar", avatarFile);
        formData.append("avatarType", initialDisplayChoice);
      } else {
        formData.append("avatarType", "blobatar");
      }
    }

    setIsLoading(true);
    try {
      await register(formData);
      setSuccessMsg("Account created! Signing you in...");

      // Auto login after successful registration
      try {
        await login({
          username: cleanUsername,
          email: cleanEmail,
          password,
        });
        setTimeout(() => {
          router.push("/");
        }, 300);
      } catch (loginErr) {
        console.warn("Auto-login failed after registration:", loginErr);
        router.push(
          `/login?registered=true&identifier=${encodeURIComponent(cleanUsername)}`,
        );
      }
    } catch (err: unknown) {
      const errMsg = getErrorMessage(
        err,
        "Registration failed. Please try again.",
      );
      setError(errMsg);
      if (
        errMsg.toLowerCase().includes("already exists") ||
        errMsg.toLowerCase().includes("exist")
      ) {
        setIsExistingUserError(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const previewIdentity = cleanFallbackIdentity(username, fullName);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl overflow-hidden p-2 sm:p-5">
        <CardHeader className="text-center pb-3">
          <CardTitle
            className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Create an account
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
            Join the creator community on Samaj
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-1">
          {successMsg && (
            <div className="mb-4 px-4 py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs sm:text-sm text-emerald-400 flex items-center gap-2 animate-in fade-in duration-200">
              <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {error && (
            <div
              ref={errorRef}
              className="mb-5 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs sm:text-sm text-red-400 flex flex-col gap-1.5 animate-in fade-in duration-200"
            >
              <p className="font-medium">{error}</p>
              {isExistingUserError && (
                <Link
                  href={`/login?identifier=${encodeURIComponent(username.trim().toLowerCase())}`}
                  className="font-semibold underline text-[var(--color-accent)] hover:opacity-80"
                >
                  Go to Sign In →
                </Link>
              )}
            </div>
          )}

          {/* Profile Avatar Selection Section */}
          <div className="mb-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/60 p-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                How would you like to use your profile avatar?
              </p>
              <p className="text-[11px] text-[var(--color-text-secondary)]">
                Choose your preferred avatar. You can change or toggle anytime in Settings.
              </p>
            </div>

            {/* Avatar Choice Segmented Control */}
            <div className="grid grid-cols-3 p-1 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] gap-1">
              <button
                type="button"
                onClick={() => {
                  setAvatarChoice("blobatar");
                  setError(null);
                }}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                  avatarChoice === "blobatar"
                    ? "bg-[var(--color-accent)] text-black shadow-sm"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                )}
              >
                <Sparkles size={13} />
                <span>Blobatar</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAvatarChoice("upload");
                  setError(null);
                }}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                  avatarChoice === "upload"
                    ? "bg-[var(--color-accent)] text-black shadow-sm"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                )}
              >
                <Camera size={13} />
                <span>Photo</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAvatarChoice("both");
                  setError(null);
                }}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                  avatarChoice === "both"
                    ? "bg-[var(--color-accent)] text-black shadow-sm"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                )}
              >
                <Layers size={13} />
                <span>Both</span>
              </button>
            </div>

            {/* Blobatar Preview & Controls */}
            {(avatarChoice === "blobatar" || avatarChoice === "both") && (
              <div className="flex flex-col items-center gap-3 p-3 rounded-2xl bg-[var(--color-surface)]/70 border border-[var(--color-border)]">
                <div className="relative group p-1.5 rounded-full ring-2 ring-[var(--color-accent)]/50 bg-[var(--color-surface)] shadow-md">
                  <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden flex items-center justify-center">
                    <UserAvatar
                      fallbackName={previewIdentity}
                      blobatarOverrides={{
                        expression: regExpression,
                        hue: regHue,
                        traits: { shape: regShape },
                      }}
                      animate="always"
                      className="w-full h-full"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-[var(--color-text-tertiary)] text-center max-w-xs">
                  A unique Blobatar will be deterministically generated for your account.
                </p>

                {/* Expression Buttons */}
                <div className="w-full flex items-center justify-center gap-1 flex-wrap">
                  {REG_EXPRESSIONS.map((exp) => (
                    <button
                      key={exp.key}
                      type="button"
                      onClick={() => setRegExpression(exp.key)}
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-[11px] transition-all cursor-pointer border",
                        regExpression === exp.key
                          ? "bg-[var(--color-accent)] text-black border-[var(--color-accent)] font-semibold"
                          : "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                      )}
                    >
                      {exp.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Photo Upload Area */}
            {(avatarChoice === "upload" || avatarChoice === "both") && (
              <div className="flex flex-col items-center">
                {avatarPreview ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative group w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden ring-2 ring-[var(--color-accent)] shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleClearUploadedFile}
                        className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity text-white cursor-pointer"
                        title="Remove photo"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <p className="text-xs text-[var(--color-text-secondary)] truncate max-w-[200px]">
                        {avatarFile?.name}
                      </p>
                      <button
                        type="button"
                        onClick={handleClearUploadedFile}
                        className="text-xs text-red-400 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "w-full border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer transition-all",
                      isDragging
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
                        : "border-[var(--color-border)] hover:border-[var(--color-accent)]/50 bg-[var(--color-surface)]/50"
                    )}
                  >
                    <div className="p-2 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                      <Upload size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                        Upload Profile Photo
                      </p>
                      <p className="text-[10px] text-[var(--color-text-tertiary)]">
                        PNG, JPG, WebP (up to 5MB)
                      </p>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  id="avatar-upload-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {avatarChoice === "both" && avatarPreview && (
                  <div className="w-full mt-3 pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs">
                    <span className="text-[var(--color-text-secondary)]">
                      Show initially:
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setInitialDisplayChoice("upload")}
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[11px] cursor-pointer transition-all",
                          initialDisplayChoice === "upload"
                            ? "bg-[var(--color-accent)] text-black font-semibold"
                            : "bg-[var(--color-surface)] text-[var(--color-text-secondary)]"
                        )}
                      >
                        Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => setInitialDisplayChoice("blobatar")}
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[11px] cursor-pointer transition-all",
                          initialDisplayChoice === "blobatar"
                            ? "bg-[var(--color-accent)] text-black font-semibold"
                            : "bg-[var(--color-surface)] text-[var(--color-text-secondary)]"
                        )}
                      >
                        Blobatar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Registration Input Form */}
          <form onSubmit={handleSubmit}>
            <FieldGroup className="gap-3.5">
              <Field className="space-y-1">
                <FieldLabel
                  htmlFor="reg-fullname"
                  className="text-xs font-medium text-[var(--color-text-secondary)]"
                >
                  Full Name
                </FieldLabel>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--color-text-tertiary)]" />
                  <Input
                    id="reg-fullname"
                    type="text"
                    placeholder="Jane Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="h-11 rounded-full pl-10 pr-4 border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus-visible:border-[var(--color-accent)] focus-visible:ring-[var(--color-accent)]/20"
                  />
                </div>
              </Field>

              <Field className="space-y-1">
                <FieldLabel
                  htmlFor="reg-username"
                  className="text-xs font-medium text-[var(--color-text-secondary)]"
                >
                  Username
                </FieldLabel>
                <div className="relative">
                  <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--color-text-tertiary)]" />
                  <Input
                    id="reg-username"
                    type="text"
                    placeholder="janedoe"
                    value={username}
                    onChange={(e) => {
                      const nextUsername = e.target.value
                        .toLowerCase()
                        .replace(/\s/g, "");
                      setUsername(nextUsername);
                    }}
                    required
                    className="h-11 rounded-full pl-10 pr-4 border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus-visible:border-[var(--color-accent)] focus-visible:ring-[var(--color-accent)]/20"
                  />
                </div>
              </Field>

              <Field className="space-y-1">
                <FieldLabel
                  htmlFor="reg-email"
                  className="text-xs font-medium text-[var(--color-text-secondary)]"
                >
                  Email
                </FieldLabel>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--color-text-tertiary)]" />
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 rounded-full pl-10 pr-4 border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus-visible:border-[var(--color-accent)] focus-visible:ring-[var(--color-accent)]/20"
                  />
                </div>
              </Field>

              <Field className="space-y-1">
                <FieldLabel
                  htmlFor="reg-password"
                  className="text-xs font-medium text-[var(--color-text-secondary)]"
                >
                  Password
                </FieldLabel>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--color-text-tertiary)]" />
                  <Input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 rounded-full pl-10 pr-10 border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus-visible:border-[var(--color-accent)] focus-visible:ring-[var(--color-accent)]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-full mt-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[#09090B] font-bold text-sm transition-all shadow-md active:scale-[0.99] cursor-pointer"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <span className="size-4 border-2 border-[#09090B] border-t-transparent rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </FieldGroup>
          </form>

          {error && (
            <div
              ref={bottomErrorRef}
              className="mt-4 px-4 py-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 text-center font-medium animate-in fade-in duration-200"
            >
              {error}
            </div>
          )}

          <div className="mt-5 text-center text-xs text-[var(--color-text-secondary)]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[var(--color-accent)] hover:underline"
            >
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function cleanFallbackIdentity(username: string, fullName: string) {
  const u = username.trim().toLowerCase().replace(/\s+/g, "");
  if (u) return u;
  const f = fullName.trim().toLowerCase().replace(/\s+/g, "");
  if (f) return f;
  return "newuser";
}
