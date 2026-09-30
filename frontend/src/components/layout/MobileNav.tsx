"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MessageSquare,
  Users,
  Bookmark,
  User as UserIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { UserAvatar } from "@/components/ui/user-avatar";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";

export default function MobileNav() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  const youHref = isAuthenticated && user ? `/channel/${user.username}` : "/login";
  const isYouActive =
    pathname.startsWith("/channel") ||
    pathname === "/login" ||
    pathname === "/settings";

  const navItems = [
    {
      id: "home",
      href: "/",
      label: "Home",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      id: "community",
      href: "/community",
      label: "Community",
      icon: MessageSquare,
      isActive: pathname.startsWith("/community"),
    },
    {
      id: "subscriptions",
      href: "/subscriptions",
      label: "Subs",
      icon: Users,
      isActive: pathname.startsWith("/subscriptions"),
    },
    {
      id: "library",
      href: "/library",
      label: "Library",
      icon: Bookmark,
      isActive: pathname.startsWith("/library"),
    },
    {
      id: "you",
      href: youHref,
      label: "You",
      icon: UserIcon,
      isActive: isYouActive,
      isAvatar: true,
    },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 right-3 max-w-[420px] mx-auto z-40 flex h-14 items-center justify-between rounded-full bg-[var(--color-surface)]/80 dark:bg-[#13110f]/85 p-1.5 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.12)] border border-[var(--color-border)]/80 dark:border-white/[0.08] backdrop-blur-2xl backdrop-saturate-150 overflow-hidden"
    >
      {/* Tactile grain/noise texture overlay to maintain global consistency */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full opacity-[0.038] dark:opacity-[0.06] mix-blend-overlay -z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.isActive;

        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={() => haptics.selection()}
            aria-current={isActive ? "page" : undefined}
            aria-label={item.label}
            className={cn(
              "relative flex h-11 items-center justify-center rounded-full transition-colors select-none touch-manipulation focus:outline-none",
              isActive ? "px-3.5" : "w-11"
            )}
          >
            {/* Sliding Active Pill Capsule with brand accent tint and subtle warm glow */}
            {isActive && (
              <motion.div
                layoutId="mobile-nav-pill"
                className="absolute inset-0 rounded-full bg-[var(--color-surface-2)]/90 dark:bg-[#23201b]/95 border border-[var(--color-accent)]/30 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.4),0_0_16px_rgba(222,169,107,0.12),inset_0_1px_0_rgba(255,255,255,0.1)] -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}

            {/* Active vs Inactive Item Display */}
            {isActive ? (
              <motion.div
                layout
                className="flex items-center gap-1.5"
                whileTap={{ scale: 0.94 }}
              >
                {item.isAvatar && isAuthenticated && user ? (
                  <div className="size-6 rounded-full overflow-hidden ring-1.5 ring-[var(--color-accent)] shadow-[0_0_8px_rgba(222,169,107,0.35)] shrink-0">
                    <UserAvatar user={user} className="size-full" />
                  </div>
                ) : (
                  <div className="size-6 rounded-full bg-[var(--color-accent)] text-[var(--color-accent-foreground)] flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(222,169,107,0.35)]">
                    <Icon size={13} strokeWidth={2.5} />
                  </div>
                )}
                <AnimatePresence initial={false}>
                  <motion.span
                    initial={{ opacity: 0, width: 0, scale: 0.92 }}
                    animate={{ opacity: 1, width: "auto", scale: 1 }}
                    exit={{ opacity: 0, width: 0, scale: 0.92 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden whitespace-nowrap text-xs font-semibold text-[var(--color-text-primary)] tracking-tight pl-0.5"
                  >
                    {item.label}
                  </motion.span>
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                whileTap={{ scale: 0.88 }}
                className="flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] transition-colors"
              >
                {item.isAvatar && isAuthenticated && user ? (
                  <UserAvatar
                    user={user}
                    className="size-5 rounded-full opacity-65 hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <Icon size={19} strokeWidth={1.8} />
                )}
              </motion.div>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
