"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  Users,
  Library,
  MessageSquare,
  History,
  ListVideo,
  Video,
  LogIn,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Tooltip } from "@/components/ui";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import clsx from "clsx";

const primaryNav = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/subscriptions", label: "Subscriptions", icon: Users },
  { href: "/library", label: "Library", icon: Library },
  { href: "/community", label: "Community", icon: MessageSquare },
];

const secondaryNav = [
  { href: "/history", label: "History", icon: History },
  { href: "/playlists", label: "Playlists", icon: ListVideo },
  { href: "/your-videos", label: "Your Videos", icon: Video },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const NavItem = ({
    href,
    label,
    icon: Icon,
  }: {
    href: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }) => {
    const isActive =
      href === "/" ? pathname === "/" : pathname.startsWith(href);

    const inner = (
      <Link
        href={href}
        className={clsx(
          "flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-all duration-150 group",
          isActive
            ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-semibold"
            : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]"
        )}
      >
        <Icon
          size={18}
          className={clsx(
            "shrink-0 transition-colors",
            isActive
              ? "text-[var(--color-accent)]"
              : "text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-primary)]"
          )}
        />
        {!collapsed && <span>{label}</span>}
      </Link>
    );

    if (collapsed) {
      return <Tooltip content={label} placement="right">{inner}</Tooltip>;
    }

    return inner;
  };

  return (
    <aside
      className={clsx(
        "hidden md:flex flex-col h-screen sticky top-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-200",
        collapsed ? "w-[68px]" : "w-[224px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-[var(--color-border)]">
        {!collapsed && (
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg text-[var(--color-text-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span className="text-[var(--color-accent)]">▶</span>
            <span>VideoTube</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={clsx(
            "p-2 rounded-full text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors",
            collapsed && "mx-auto"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="overflow-y-auto py-4 px-2 space-y-1">
        {primaryNav.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}

        {isAuthenticated ? (
          <>
            <div className="my-3 border-t border-[var(--color-border)]" />
            {secondaryNav.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </>
        ) : (
          <>
            <div className="my-3 border-t border-[var(--color-border)]" />
            {!collapsed ? (
              <div className="px-3.5 py-3.5 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] space-y-3">
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  Sign in to like videos, comment, and subscribe.
                </p>
                <Link href="/login" className="block">
                  <button className="w-full flex items-center justify-center gap-1.5 h-9 px-4 text-xs font-semibold rounded-full border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-hover)] transition-colors">
                    <LogIn size={14} className="text-[var(--color-text-secondary)]" />
                    <span>Sign In</span>
                  </button>
                </Link>
              </div>
            ) : (
              <div className="flex justify-center pt-1">
                <Tooltip content="Sign In" placement="right">
                  <Link
                    href="/login"
                    className="flex items-center justify-center p-2.5 rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors"
                    aria-label="Sign In"
                  >
                    <LogIn size={16} />
                  </Link>
                </Tooltip>
              </div>
            )}
          </>
        )}
      </nav>

      {/* Flexible spacer */}
      <div className="flex-1" />

      {/* Footer (for authenticated user profile) */}
      {isAuthenticated && (
        <div className="p-3 border-t border-[var(--color-border)]">
          <Link
            href={`/channel/${user?.username}`}
            className={clsx(
              "flex items-center gap-3 px-2.5 py-2 rounded-2xl hover:bg-[var(--color-surface-hover)] transition-colors",
              collapsed && "justify-center"
            )}
          >
            <UserAvatar
              user={user}
              size="sm"
              className="shrink-0"
            />
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                  {user?.fullName}
                </p>
                <p className="text-xs text-[var(--color-text-tertiary)] truncate">
                  @{user?.username}
                </p>
              </div>
            )}
          </Link>
        </div>
      )}
    </aside>
  );
}
