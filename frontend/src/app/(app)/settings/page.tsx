"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/api/client";
import { Input, Button, UserAvatar, BLOBATAR_EXPRESSIONS, isValidUploadedAvatar } from "@/components/ui";
import type { BlobatarConfig } from "@/lib/types";
import {
  Settings,
  User as UserIcon,
  Lock,
  Camera,
  Image as ImageIcon,
  Sparkles,
  Check,
  RotateCcw,
  Palette,
  Smile,
  Sliders,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const EXPRESSIONS = [
  { key: "idle", label: "Idle" },
  { key: "happy", label: "Happy" },
  { key: "sad", label: "Sad" },
  { key: "mad", label: "Mad" },
  { key: "surprised", label: "Surprised" },
  { key: "wink", label: "Wink" },
  { key: "sleepy", label: "Sleepy" },
  { key: "smug", label: "Smug" },
  { key: "unsure", label: "Unsure" },
  { key: "scared", label: "Scared" },
  { key: "love", label: "Love" },
  { key: "shy", label: "Shy" },
  { key: "sick", label: "Sick" },
  { key: "thinking", label: "Thinking" },
];

const PRESET_COLORS = [
  "#7c3aed",
  "#2563eb",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#8b5cf6",
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, refreshUser, logout } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false);

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);
  const [switchingAvatarType, setSwitchingAvatarType] = useState(false);
  const [savingBlobatar, setSavingBlobatar] = useState(false);

  // Active avatar mode ("blobatar" | "upload")
  const [activeAvatarType, setActiveAvatarType] = useState<"blobatar" | "upload">(
    user?.avatarType === "upload" && isValidUploadedAvatar(user?.avatar)
      ? "upload"
      : "blobatar"
  );

  // Blobatar Customization State
  const [blobatarHue, setBlobatarHue] = useState<number | undefined>(
    user?.blobatar?.hue !== undefined ? user.blobatar.hue : undefined
  );
  const [blobatarTone, setBlobatarTone] = useState<number | undefined>(
    user?.blobatar?.tone !== undefined ? user.blobatar.tone : undefined
  );
  const [blobatarExpression, setBlobatarExpression] = useState<string>(
    user?.blobatar?.expression || "idle"
  );
  const [blobatarShape, setBlobatarShape] = useState<number>(
    typeof (user?.blobatar?.traits as any)?.shape === "number"
      ? (user?.blobatar?.traits as any).shape
      : 0.5
  );
  const [blobatarEyeRatio, setBlobatarEyeRatio] = useState<number>(
    typeof (user?.blobatar?.traits as any)?.["eye.ratio"] === "number"
      ? (user?.blobatar?.traits as any)["eye.ratio"]
      : 0.5
  );
  const [blobatarEyeGap, setBlobatarEyeGap] = useState<number>(
    typeof (user?.blobatar?.traits as any)?.["eye.gap"] === "number"
      ? (user?.blobatar?.traits as any)["eye.gap"]
      : 0.5
  );
  const [blobatarBodyColor, setBlobatarBodyColor] = useState<string>(
    (user?.blobatar?.palette as any)?.body || ""
  );
  const [blobatarEyeColor, setBlobatarEyeColor] = useState<string>(
    (user?.blobatar?.palette as any)?.eye || ""
  );

  const [avatarMsg, setAvatarMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [profileMsg, setProfileMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever authenticated user updates
  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setEmail(user.email);
      setActiveAvatarType(
        user.avatarType === "upload" && isValidUploadedAvatar(user.avatar)
          ? "upload"
          : "blobatar"
      );
      if (user.blobatar) {
        setBlobatarHue(user.blobatar.hue);
        setBlobatarTone(user.blobatar.tone);
        setBlobatarExpression(user.blobatar.expression || "idle");
        if (user.blobatar.traits) {
          const t = user.blobatar.traits as any;
          if (typeof t.shape === "number") setBlobatarShape(t.shape);
          if (typeof t["eye.ratio"] === "number")
            setBlobatarEyeRatio(t["eye.ratio"]);
          if (typeof t["eye.gap"] === "number")
            setBlobatarEyeGap(t["eye.gap"]);
        }
        if (user.blobatar.palette) {
          const p = user.blobatar.palette as any;
          if (p.body) setBlobatarBodyColor(p.body);
          if (p.eye) setBlobatarEyeColor(p.eye);
        }
      }
    }
  }, [user]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-16">
        <div className="rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] p-10 md:p-14 text-center shadow-xl max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-[var(--color-accent-soft)] flex items-center justify-center mx-auto mb-4">
            <Settings size={30} className="text-[var(--color-accent)]" />
          </div>
          <h1
            className="text-2xl font-bold text-[var(--color-text-primary)] mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Sign in to access settings
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            Manage your channel branding, profile details, and account security.
          </p>
          <Link href="/login">
            <Button
              color="primary"
              size="md"
              radius="full"
              className="px-6 font-semibold shadow-md"
            >
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Live overrides for interactive preview
  const liveBlobatarOverrides: BlobatarConfig = {
    hue: blobatarHue,
    tone: blobatarTone,
    expression: blobatarExpression,
    traits: {
      shape: blobatarShape,
      "eye.ratio": blobatarEyeRatio,
      "eye.gap": blobatarEyeGap,
    },
    palette: {
      ...(blobatarBodyColor ? { body: blobatarBodyColor } : {}),
      ...(blobatarEyeColor ? { eye: blobatarEyeColor } : {}),
    },
  };

  // Preview user object mirroring active selection
  const userHasPhoto = isValidUploadedAvatar(user?.avatar);
  const previewUser = {
    ...user,
    avatar: userHasPhoto ? user?.avatar : undefined,
    avatarType: activeAvatarType,
    blobatar: liveBlobatarOverrides,
  };

  const handleSwitchAvatarType = async (newType: "blobatar" | "upload") => {
    if (newType === "upload" && !userHasPhoto) {
      setAvatarMsg({
        type: "error",
        text: "No uploaded profile picture found. Please upload a photo before selecting photo avatar.",
      });
      return;
    }

    setActiveAvatarType(newType);
    setSwitchingAvatarType(true);
    setAvatarMsg(null);
    try {
      // Store avatar choice directly in MongoDB database
      await authApi.switchAvatarType(newType);
      await refreshUser();
      setAvatarMsg({
        type: "success",
        text: `Active profile avatar choice saved in database: switched to ${
          newType === "blobatar" ? "Blobatar" : "Profile Picture"
        }.`,
      });
    } catch (err: unknown) {
      setAvatarMsg({
        type: "error",
        text: getErrorMessage(err, "Failed to save avatar preference in database."),
      });
    } finally {
      setSwitchingAvatarType(false);
    }
  };

  const handleResetBlobatarConfig = async () => {
    setSavingBlobatar(true);
    setAvatarMsg(null);
    try {
      await authApi.updateBlobatarConfig({});
      await refreshUser();
      setBlobatarHue(undefined);
      setBlobatarTone(undefined);
      setBlobatarExpression("idle");
      setBlobatarShape(0.5);
      setBlobatarEyeRatio(0.5);
      setBlobatarEyeGap(0.5);
      setBlobatarBodyColor("");
      setBlobatarEyeColor("");
      setActiveAvatarType("blobatar");
      setAvatarMsg({
        type: "success",
        text: "Blobatar reset to natural ID defaults.",
      });
    } catch (err: unknown) {
      setAvatarMsg({
        type: "error",
        text: getErrorMessage(err, "Failed to reset Blobatar."),
      });
    } finally {
      setSavingBlobatar(false);
    }
  };

  const handleAvatarFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    setAvatarMsg(null);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      await authApi.updateAvatar(formData);
      await refreshUser();
      setActiveAvatarType("upload");
      setAvatarMsg({
        type: "success",
        text: "Profile picture uploaded and set as active avatar.",
      });
    } catch (err: unknown) {
      setAvatarMsg({
        type: "error",
        text: getErrorMessage(err, "Failed to upload avatar."),
      });
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverLoading(true);
    setProfileMsg(null);
    try {
      const formData = new FormData();
      formData.append("coverImage", file);
      await authApi.updateCoverImage(formData);
      await refreshUser();
      setProfileMsg({
        type: "success",
        text: "Cover image updated successfully.",
      });
    } catch (err: unknown) {
      setProfileMsg({
        type: "error",
        text: getErrorMessage(err, "Failed to update cover image."),
      });
    } finally {
      setCoverLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setProfileMsg(null);
    setProfileLoading(true);
    try {
      await authApi.updateAccount({ fullName, email });
      await authApi.updateBlobatarConfig(liveBlobatarOverrides);
      await refreshUser();
      setProfileMsg({ type: "success", text: "Your account changes have been saved." });
    } catch (err: unknown) {
      setProfileMsg({
        type: "error",
        text: getErrorMessage(err, "Update failed."),
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    setPasswordLoading(true);
    try {
      await authApi.changePassword({ oldPassword, newPassword });
      setOldPassword("");
      setNewPassword("");
      setPasswordMsg({
        type: "success",
        text: "Password changed successfully.",
      });
    } catch (err: unknown) {
      setPasswordMsg({
        type: "error",
        text: getErrorMessage(err, "Password change failed."),
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-12 space-y-10">
      {/* Header */}
      <div className="bezel-shell enter-stage">
        <div className="bezel-core px-7 py-8 sm:px-10 sm:py-10">
        <div className="flex items-center gap-2 mb-2">
          <Settings size={22} className="text-[var(--color-accent)]" />
          <h1
            className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Settings
          </h1>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Manage your account profile, channel branding, and avatar preferences
        </p>
        </div>
      </div>

      {/* Profile Avatar & Channel Branding Section */}
      <section className="bezel-shell enter-stage-delayed">
        <div className="bezel-core p-6 md:p-8 space-y-7">
        <div>
          <h2 className="font-semibold text-[var(--color-text-primary)] text-lg mb-1 flex items-center gap-2">
            <Sparkles size={18} className="text-[var(--color-accent)]" />
            Profile Avatar & Branding
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Choose whether to display your uploaded photo or customizable
            Blobatar. You can switch between them at any time.
          </p>
        </div>

        {avatarMsg && (
          <div
            className={cn(
              "px-4 py-3 rounded-2xl text-xs sm:text-sm border transition-all animate-in fade-in duration-200",
              avatarMsg.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            )}
          >
            {avatarMsg.text}
          </div>
        )}

        {/* Cover Image Banner */}
        <div>
          <p className="text-xs text-[var(--color-text-secondary)] mb-2 font-medium">
            Channel Banner
          </p>
          <div
            className="w-full h-40 md:h-48 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center relative overflow-hidden group bg-cover bg-center"
            style={
              user?.coverImage
                ? { backgroundImage: `url(${user.coverImage})` }
                : undefined
            }
          >
            <Button
              size="sm"
              variant="flat"
              isLoading={coverLoading}
              onPress={() => coverInputRef.current?.click()}
              className="bg-black/70 hover:bg-black/90 text-white backdrop-blur-sm rounded-full font-medium shadow"
              startContent={<ImageIcon size={14} />}
            >
              {user?.coverImage ? "Change Banner" : "Upload Banner"}
            </Button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverChange}
            />
          </div>
        </div>

        {/* Avatar Type Selector Segmented Control */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Active Profile Avatar
          </label>
          <div className="grid grid-cols-2 max-w-md p-1.5 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] gap-1.5">
            <button
              type="button"
              disabled={switchingAvatarType}
              onClick={() => handleSwitchAvatarType("blobatar")}
              className={cn(
                "flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer",
                activeAvatarType === "blobatar"
                  ? "bg-[var(--color-accent)] text-black shadow-md"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]"
              )}
            >
              <Sparkles size={16} />
              <span>Blobatar</span>
              {activeAvatarType === "blobatar" && (
                <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  Active
                </span>
              )}
            </button>
            <button
              type="button"
              disabled={switchingAvatarType}
              onClick={() => handleSwitchAvatarType("upload")}
              className={cn(
                "flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer",
                activeAvatarType === "upload"
                  ? "bg-[var(--color-accent)] text-black shadow-md"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]"
              )}
            >
              <Camera size={16} />
              <span>Profile Picture</span>
              {activeAvatarType === "upload" && (
                <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  Active
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Live Avatar Preview Card */}
        <div className="p-5 md:p-6 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group shrink-0">
            <UserAvatar
              user={previewUser}
              blobatarOverrides={liveBlobatarOverrides}
              animate="always"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-[var(--color-accent)]/20 shadow-xl"
            />
            {activeAvatarType === "upload" && (
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarLoading}
                className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white cursor-pointer"
                title="Upload or change profile picture"
              >
                <Camera size={22} />
              </button>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h3 className="font-bold text-base text-[var(--color-text-primary)]">
                {user?.fullName}
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--color-accent-soft)] text-[var(--color-accent)] w-fit mx-auto sm:mx-0">
                {activeAvatarType === "blobatar"
                  ? "🎨 Blobatar Active"
                  : "📷 Uploaded Picture Active"}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {activeAvatarType === "blobatar"
                ? `Generated deterministically from your ID (${user?._id}). Saved in database.`
                : userHasPhoto
                ? "Using your custom uploaded profile picture. Saved in database."
                : "No uploaded picture found yet. Upload one below, or enjoy your Blobatar."}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <Button
                size="sm"
                variant="flat"
                isLoading={avatarLoading}
                onPress={() => avatarInputRef.current?.click()}
                className="rounded-full text-xs font-semibold bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]"
                startContent={<Camera size={14} />}
              >
                {userHasPhoto ? "Change Photo" : "Upload Photo"}
              </Button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFileUpload}
              />
            </div>
          </div>
        </div>

        {/* Blobatar Customization Panel (Always customizable & previewable) */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/40 p-5 md:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
            <div>
              <h3 className="font-semibold text-sm text-[var(--color-text-primary)] flex items-center gap-2">
                <Sliders size={16} className="text-[var(--color-accent)]" />
                Customize Blobatar Appearance
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Live interactive customization. Changes reflect immediately in
                the preview above.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="light"
                isLoading={savingBlobatar}
                onPress={handleResetBlobatarConfig}
                className="rounded-full text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                startContent={<RotateCcw size={13} />}
              >
                Reset to ID Defaults
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Expression Picker */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--color-text-primary)] flex items-center gap-1.5">
                <Smile size={14} className="text-[var(--color-accent)]" />
                Expression ({blobatarExpression})
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                {EXPRESSIONS.map((exp) => (
                  <button
                    key={exp.key}
                    type="button"
                    onClick={() => setBlobatarExpression(exp.key)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                      blobatarExpression === exp.key
                        ? "bg-[var(--color-accent)] text-black font-semibold shadow-sm"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
                    )}
                  >
                    {exp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hue Slider (0 - 360 deg) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--color-text-primary)] flex items-center gap-1.5">
                  <Palette size={14} className="text-[var(--color-accent)]" />
                  Hue Angle
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[var(--color-accent)]">
                    {blobatarHue !== undefined ? `${blobatarHue}°` : "Derived from ID"}
                  </span>
                  {blobatarHue !== undefined && (
                    <button
                      type="button"
                      onClick={() => setBlobatarHue(undefined)}
                      className="text-[10px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={blobatarHue ?? 180}
                onChange={(e) => setBlobatarHue(Number(e.target.value))}
                className="w-full h-3 rounded-full cursor-pointer appearance-none bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-cyan-500 via-blue-500 via-purple-500 to-red-500"
              />
            </div>

            {/* Tone Slider (0.00 - 0.99) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--color-text-primary)]">
                  Tone (Pale to Ink)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[var(--color-accent)]">
                    {blobatarTone !== undefined ? blobatarTone.toFixed(2) : "Derived from ID"}
                  </span>
                  {blobatarTone !== undefined && (
                    <button
                      type="button"
                      onClick={() => setBlobatarTone(undefined)}
                      className="text-[10px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="0.99"
                step="0.01"
                value={blobatarTone ?? 0.5}
                onChange={(e) => setBlobatarTone(Number(e.target.value))}
                className="w-full accent-[var(--color-accent)] cursor-pointer"
              />
            </div>

            {/* Shape Silhouette (Trait) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--color-text-primary)]">
                  Silhouette Shape
                </label>
                <span className="text-xs font-mono text-[var(--color-accent)]">
                  {blobatarShape.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={blobatarShape}
                onChange={(e) => setBlobatarShape(Number(e.target.value))}
                className="w-full accent-[var(--color-accent)] cursor-pointer"
              />
            </div>

            {/* Eye Ratio */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--color-text-primary)]">
                  Eye Roundness / Ratio
                </label>
                <span className="text-xs font-mono text-[var(--color-accent)]">
                  {blobatarEyeRatio.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={blobatarEyeRatio}
                onChange={(e) => setBlobatarEyeRatio(Number(e.target.value))}
                className="w-full accent-[var(--color-accent)] cursor-pointer"
              />
            </div>

            {/* Eye Gap */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--color-text-primary)]">
                  Eye Spacing / Gap
                </label>
                <span className="text-xs font-mono text-[var(--color-accent)]">
                  {blobatarEyeGap.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={blobatarEyeGap}
                onChange={(e) => setBlobatarEyeGap(Number(e.target.value))}
                className="w-full accent-[var(--color-accent)] cursor-pointer"
              />
            </div>

            {/* Body Palette Color Override */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--color-text-primary)] flex items-center gap-1.5">
                  <Palette size={14} className="text-[var(--color-accent)]" />
                  Custom Body Palette Color (Optional Override)
                </label>
                {blobatarBodyColor && (
                  <button
                    type="button"
                    onClick={() => setBlobatarBodyColor("")}
                    className="text-[10px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] underline cursor-pointer"
                  >
                    Reset Palette
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setBlobatarBodyColor(color)}
                    style={{ backgroundColor: color }}
                    className={cn(
                      "w-7 h-7 rounded-full border-2 transition-transform cursor-pointer hover:scale-110",
                      blobatarBodyColor === color
                        ? "border-white scale-110 shadow-md ring-2 ring-[var(--color-accent)]"
                        : "border-transparent"
                    )}
                    title={color}
                  />
                ))}
                <div className="flex items-center gap-2 ml-2">
                  <input
                    type="color"
                    value={blobatarBodyColor || "#7c3aed"}
                    onChange={(e) => setBlobatarBodyColor(e.target.value)}
                    className="w-7 h-7 rounded-full border-0 p-0 cursor-pointer bg-transparent"
                    title="Choose custom color"
                  />
                  <span className="text-xs font-mono text-[var(--color-text-secondary)]">
                    {blobatarBodyColor || "Natural tone"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Profile Information */}
      <section className="bezel-shell">
        <div className="bezel-core p-6 md:p-8">
        <div className="flex items-center gap-3 mb-2">
          <UserIcon size={18} className="text-[var(--color-accent)]" />
          <h2 className="font-semibold text-[var(--color-text-primary)] text-base">
            Profile Information
          </h2>
        </div>
        <p className="text-xs text-[var(--color-text-secondary)] mb-6">
          Update your public creator name and account email address.
        </p>

        <div className="space-y-6">
          {profileMsg && (
            <div
              className={`px-4 py-3 rounded-2xl text-sm border ${
                profileMsg.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
            >
              {profileMsg.text}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              id="settings-fullname"
              label="Full Name"
              value={fullName}
              onValueChange={setFullName}
              classNames={inputClassNames}
            />
            <Input
              id="settings-email"
              label="Email"
              type="email"
              value={email}
              onValueChange={setEmail}
              classNames={inputClassNames}
            />
          </div>
        </div>
        </div>
      </section>

      {/* Change Password */}
      <section className="bezel-shell">
        <div className="bezel-core p-2">
        <button
          type="button"
          onClick={() => setIsPasswordFormOpen((isOpen) => !isOpen)}
          className="group flex w-full items-center justify-between rounded-[1.6rem] px-5 py-5 text-left transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[var(--color-surface-2)] cursor-pointer"
          aria-expanded={isPasswordFormOpen}
        >
          <span className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]"><Lock size={17} /></span>
            <span>
              <span className="block font-semibold text-[var(--color-text-primary)]">Change password</span>
              <span className="mt-0.5 block text-xs text-[var(--color-text-secondary)]">Use a long, unique password to keep this account secure.</span>
            </span>
          </span>
          <span className={cn("flex size-8 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-accent)] transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1", isPasswordFormOpen && "rotate-180")}><ChevronDown size={16} /></span>
        </button>

        {isPasswordFormOpen && <form onSubmit={handlePasswordChange} className="enter-stage mx-5 mb-5 space-y-5 rounded-[1.45rem] bg-[var(--color-surface-2)] p-5 sm:p-6">
          {passwordMsg && (
            <div
              className={`px-4 py-3 rounded-2xl text-sm border ${
                passwordMsg.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
            >
              {passwordMsg.text}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              id="settings-old-password"
              label="Current Password"
              type="password"
              value={oldPassword}
              onValueChange={setOldPassword}
              classNames={inputClassNames}
            />
            <Input
              id="settings-new-password"
              label="New Password"
              type="password"
              value={newPassword}
              onValueChange={setNewPassword}
              classNames={inputClassNames}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              isLoading={passwordLoading}
              size="md"
              color="primary"
            >
              Update Password
            </Button>
            <button type="button" onClick={() => setIsPasswordFormOpen(false)} className="text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer">Cancel</button>
          </div>
        </form>}
        </div>
      </section>

      {/* Account Session & Sign Out */}
      <section className="bezel-shell">
        <div className="bezel-core p-6 md:p-8">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
          Account Session
        </h2>
        <p className="text-xs text-[var(--color-text-secondary)] mb-4">
          Logged in as{" "}
          <span className="font-semibold text-[var(--color-text-primary)]">
            {user?.fullName || user?.username}
          </span>{" "}
          (@{user?.username})
        </p>
        <Button
          type="button"
          color="danger"
          variant="flat"
          size="md"
          onPress={async () => {
            await logout();
            router.push("/login");
          }}
        >
          Sign Out of Samaj
        </Button>
        </div>
      </section>

      <div className="sticky bottom-5 z-10 flex justify-end">
        <Button
          type="button"
          isLoading={profileLoading}
          onPress={handleSaveSettings}
          color="primary"
          size="lg"
          className="group h-12 rounded-full px-3 pl-6 font-semibold shadow-[0_18px_38px_-24px_rgba(68,43,17,0.72)]"
        >
          <span>Save all changes</span>
          <span className="ml-2 flex size-8 items-center justify-center rounded-full bg-black/10 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-px"><Check size={15} /></span>
        </Button>
      </div>
    </div>
  );
}

const inputClassNames = {
  label: "text-[var(--color-text-secondary)] text-xs font-semibold",
  inputWrapper:
    "bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] group-data-[focus=true]:border-[var(--color-accent)] shadow-none rounded-full px-4",
  input:
    "text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]",
};
