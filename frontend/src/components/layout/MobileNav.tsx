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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-[var(--color-surface)]/85 backdrop-blur-xl saturate-150 border-t border-white/[0.08] flex items-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
      {navItems.map(({ href, label, icon: Icon, isActive }) => (
        <Link
          key={href}
          href={href}
          className={clsx(
            "flex-1 flex flex-col items-center justify-center gap-1 h-full text-xs font-medium transition-all duration-150 active:scale-90",
            isActive
              ? "text-[var(--color-accent)] font-semibold"
              : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
          )}
        >
          <Icon size={19} className="transition-transform duration-150" />
          <span className="text-[10px] tracking-tight">{label}</span>
        </Link>
      ))}

      {/* You / Profile Tab */}
      <Link
        href={youHref}
        className={clsx(
          "flex-1 flex flex-col items-center justify-center gap-1 h-full text-xs font-medium transition-all duration-150 active:scale-90",
          isYouActive
            ? "text-[var(--color-accent)] font-semibold"
            : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
        )}
      >
        {isAuthenticated && user ? (
          <div className={clsx("rounded-full p-0.5", isYouActive ? "ring-2 ring-[var(--color-accent)]" : "")}>
            <UserAvatar
              user={user}
              className="size-5 rounded-full"
            />
          </div>
        ) : (
          <UserIcon size={19} className="transition-transform duration-150" />
        )}
        <span className="text-[10px] tracking-tight">You</span>
      </Link>
    </nav>
  );
}
