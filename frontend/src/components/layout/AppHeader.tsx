"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Search, Plus, Download } from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserAvatar } from "@/components/ui/user-avatar"
import { usePwa } from "@/components/pwa/PwaProvider"

export function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { isInstallable, isInstalled, installPwa } = usePwa()
  const [searchQuery, setSearchQuery] = React.useState("")


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const getBreadcrumbs = () => {
    if (pathname === "/") {
      return { parent: "Platform", parentHref: "/", current: "Home" }
    }
    if (pathname.startsWith("/explore")) {
      return { parent: "Discover", parentHref: "/explore", current: "Explore" }
    }
    if (pathname.startsWith("/subscriptions")) {
      return { parent: "Feed", parentHref: "/subscriptions", current: "Subscriptions" }
    }
    if (pathname.startsWith("/library")) {
      return { parent: "Library", parentHref: "/library", current: "Saved Content" }
    }
    if (pathname.startsWith("/community")) {
      return { parent: "Platform", parentHref: "/community", current: "Communities" }
    }
    if (pathname.startsWith("/settings")) {
      return { parent: "Preferences", parentHref: "/settings", current: "Settings" }
    }
    if (pathname.startsWith("/channel")) {
      return { parent: "Profile", parentHref: pathname, current: "User" }
    }
    return { parent: "Community", parentHref: "/", current: "Overview" }
  }

  const { parent, parentHref, current } = getBreadcrumbs()

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border/40 bg-background/80 backdrop-blur-xl saturate-150 px-4 sm:px-6 lg:px-8 md:rounded-t-xl transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href={parentHref}>
                {parent}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{current}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <form onSubmit={handleSearch} className="relative w-44 sm:w-64 md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search people, posts, communities..."
            className="h-9 w-full rounded-full bg-muted/40 border border-input pl-9 pr-4 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:bg-background transition-all"
          />
        </form>

        <ThemeToggle />

        {isInstallable && !isInstalled && (
          <button
            type="button"
            onClick={installPwa}
            className="h-8 px-3 rounded-full bg-[var(--color-accent)]/15 hover:bg-[var(--color-accent)] text-[var(--color-accent)] hover:text-[#09090B] border border-[var(--color-accent)]/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
            title="Install Community App"
          >
            <Download size={13} className="stroke-[2.5]" />
            <span className="hidden sm:inline">Install</span>
          </button>
        )}

        {isAuthenticated && user ? (

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/community"
              className="flex items-center justify-center size-9 rounded-full bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all shadow-sm shrink-0"
              title="Create a post"
            >
              <Plus className="size-4" />
            </Link>

            <Link
              href={`/channel/${user.username}`}
              className="flex items-center rounded-full hover:ring-2 hover:ring-[var(--color-accent)] transition-all shrink-0 p-0.5"
              title={`${user.fullName || user.username} (@${user.username})`}
            >
              <UserAvatar
                user={user}
                className="size-8 rounded-full border border-border"
              />
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/login"
              className="h-9 px-3.5 inline-flex items-center justify-center text-xs font-semibold rounded-full border border-border hover:bg-muted text-foreground active:scale-95 transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="h-9 px-3.5 inline-flex items-center justify-center text-xs font-semibold rounded-full bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              Join
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
