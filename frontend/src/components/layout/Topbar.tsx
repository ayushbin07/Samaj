"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Bell, Plus, LogOut, User as UserIcon, Settings, ChevronDown, LogIn, Download } from "lucide-react";

import { UserAvatar } from "@/components/ui/user-avatar";
import { useAuth } from "@/contexts/AuthContext";
import { usePwa } from "@/app/pwa-provider";
import { useState, useRef } from "react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { triggerHaptic } from "@/lib/haptics";

export default function Topbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { isInstallable, isInstalled, installPwa } = usePwa();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/community?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    triggerHaptic();
    setMenuOpen(false);
    await logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md flex items-center px-4 gap-4">
      {/* Sidebar Trigger & Mobile Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <SidebarTrigger
          onClick={() => triggerHaptic()}
          className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
        />
        <Link
          href="/"
          onClick={() => triggerHaptic()}
          className="md:hidden flex items-center gap-2 font-bold text-lg text-[var(--color-text-primary)] shrink-0"
        >
          <span className="text-[var(--color-accent)] font-black">●</span>
          <span style={{ fontFamily: "var(--font-display)" }}>Community</span>
        </Link>
      </div>

      {/* Search - Highly Rounded Pill */}
      <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-auto">
        <div className="flex items-center gap-2.5 h-10 px-4 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] hover:border-[var(--color-border-hover)] focus-within:border-[var(--color-accent)] focus-within:ring-1 focus-within:ring-[var(--color-accent)] transition-all">
          <Search size={16} className="text-[var(--color-text-tertiary)] shrink-0" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search people, posts, communities..."
            className="flex-1 bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none"
          />
        </div>
      </form>

      {/* Right side */}
      <div className="flex items-center gap-2 shrink-0">
        {isInstallable && !isInstalled && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              installPwa();
            }}
            className="h-8 px-3 rounded-full bg-[var(--color-accent)]/15 hover:bg-[var(--color-accent)] text-[var(--color-accent)] hover:text-[#09090B] border border-[var(--color-accent)]/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
            title="Install Community App"
          >
            <Download size={13} className="stroke-[2.5]" />
            <span className="hidden sm:inline">Install</span>
          </button>
        )}

        {isAuthenticated ? (

          <>
            <Link href="/community" onClick={() => triggerHaptic()}>
              <button
                className="p-2 rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
                aria-label="Create post"
                title="Create a post"
              >
                <Plus size={18} />
              </button>
            </Link>


            <button
              className="p-2 rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors"
              aria-label="Notifications"
              title="Notifications — Coming Soon"
            >
              <Bell size={18} />
            </button>

            {/* Avatar dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => {
                  triggerHaptic();
                  setMenuOpen((o) => !o);
                }}
                className="flex items-center gap-1.5 rounded-full p-1 hover:bg-[var(--color-surface-hover)] transition-colors"
                aria-label="User menu"
              >
                <UserAvatar 
                  user={user} 
                  className="w-8 h-8 rounded-full" 
                  animate="always"
                />
                <ChevronDown size={14} className="text-[var(--color-text-tertiary)]" />
              </button>

              {menuOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                  />
                  {/* Menu — Medium Surface Rounded-2xl */}
                  <div className="absolute right-0 top-11 z-50 w-52 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] shadow-2xl overflow-hidden p-1.5">
                    <div className="px-3 py-2.5 border-b border-[var(--color-border)] mb-1">
                      <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate">
                        {user?.fullName}
                      </p>
                      <p className="text-xs text-[var(--color-text-tertiary)] truncate">
                        @{user?.username}
                      </p>
                    </div>
                    <nav className="space-y-0.5">
                      <Link
                        href={`/channel/${user?.username}`}
                        onClick={() => {
                          triggerHaptic();
                          setMenuOpen(false);
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors"
                      >
                        <UserIcon size={14} />
                        My Channel
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => {
                          triggerHaptic();
                          setMenuOpen(false);
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors"
                      >
                        <Settings size={14} />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </nav>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" onClick={() => triggerHaptic()}>
              <button className="flex items-center gap-1.5 h-9 px-4 text-xs sm:text-sm font-semibold rounded-full border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-2)] transition-colors">
                <LogIn size={14} className="text-[var(--color-text-secondary)]" />
                <span>Sign In</span>
              </button>
            </Link>
            <Link href="/register" onClick={() => triggerHaptic()}>
              <button className="h-9 px-4 text-xs sm:text-sm font-semibold rounded-full bg-[var(--color-accent)] text-[#09090B] hover:bg-[var(--color-accent-hover)] transition-colors shadow-sm">
                Get Started
              </button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
