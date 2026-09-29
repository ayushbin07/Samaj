"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Users, MessageSquare, User as UserIcon } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/contexts/AuthContext";
import { UserAvatar } from "@/components/ui/user-avatar";

export default function MobileNav() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  const youHref = isAuthenticated && user ? `/channel/${user.username}` : "/login";
  const isYouActive = pathname.startsWith("/channel") || pathname === "/login" || pathname === "/settings";

  const navItems = [
    { href: "/", label: "Home", icon: Home, isActive: pathname === "/" },
    { href: "/explore", label: "Explore", icon: Compass, isActive: pathname.startsWith("/explore") },
    { href: "/subscriptions", label: "Subs", icon: Users, isActive: pathname.startsWith("/subscriptions") },
    { href: "/community", label: "Communities", icon: MessageSquare, isActive: pathname.startsWith("/community") },
  ];

  return (
    <nav
      aria-label="Primary navigation"
      className="md:hidden fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 right-3 z-30 flex h-[4.5rem] items-center rounded-[1.6rem] bg-[var(--color-surface)]/95 px-1.5 shadow-[0_18px_38px_-26px_rgba(55,37,17,0.55),inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-xl"
    >
      {navItems.map(({ href, label, icon: Icon, isActive }) => (
        <Link
          key={href}
          href={href}
          aria-current={isActive ? "page" : undefined}
          className={clsx(
            "flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[1.15rem] text-xs font-medium transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.96]",
            isActive
              ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-semibold"
              : "text-[var(--color-text-tertiary)]"
          )}
        >
          <Icon size={18} strokeWidth={1.65} className="transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]" />
          <span className="max-w-full truncate text-[10px] tracking-tight">{label}</span>
        </Link>
      ))}

      {/* You / Profile Tab */}
      <Link
        href={youHref}
        aria-current={isYouActive ? "page" : undefined}
        className={clsx(
          "flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[1.15rem] text-xs font-medium transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.96]",
          isYouActive
            ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-semibold"
            : "text-[var(--color-text-tertiary)]"
        )}
      >
        {isAuthenticated && user ? (
          <div className={clsx("rounded-full p-0.5", isYouActive ? "ring-1 ring-[var(--color-accent)]" : "")}>
            <UserAvatar
              user={user}
              className="size-5 rounded-full"
            />
          </div>
        ) : (
          <UserIcon size={18} strokeWidth={1.65} className="transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]" />
        )}
        <span className="text-[10px] tracking-tight">You</span>
      </Link>
    </nav>
  );
}
