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
import { usePwa } from "@/app/pwa-provider"
import { triggerHaptic } from "@/lib/haptics"

export function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { isInstallable, isInstalled, installPwa } = usePwa()
  const [searchQuery, setSearchQuery] = React.useState("")


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/community?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const getBreadcrumbs = () => {
    if (pathname === "/") {
      return { parent: "Platform", parentHref: "/", current: "Home" }
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
    <header className="sticky top-2 z-20 mx-3 mt-2 flex h-14 shrink-0 items-center justify-between gap-2 rounded-[1.2rem] bg-background/82 px-3 sm:top-3 sm:mt-3 sm:h-16 sm:px-6 sm:mx-5 lg:mx-7 lg:px-8 backdrop-blur-xl transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 shadow-[0_18px_45px_-38px_rgba(54,36,18,0.7)]">
      <Link href="/" onClick={() => triggerHaptic()} className="sm:hidden min-w-0 leading-none">
        <span className="block font-[var(--font-display)] text-xl font-bold tracking-[-0.04em] text-[var(--color-text-primary)]">Samaj</span>
        <span className="mt-1 block text-[9px] font-medium tracking-[0.08em] text-[var(--color-text-tertiary)]">PRIVATE NETWORK</span>
      </Link>

      <div className="hidden sm:flex items-center gap-2">
        <SidebarTrigger className="-ml-1" onClick={() => triggerHaptic()} />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href={parentHref} onClick={() => triggerHaptic()}>
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
        <form onSubmit={handleSearch} className="relative hidden w-44 sm:block sm:w-64 md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search people, posts, communities..."
            className="h-9 w-full rounded-lg bg-muted/55 border border-input pl-9 pr-4 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/25 focus:border-ring focus:bg-background transition-all"
          />
        </form>

        <ThemeToggle className="hidden sm:inline-flex" />

        {isInstallable && !isInstalled && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic()
              installPwa()
            }}
            className="h-8 px-3 rounded-md bg-[var(--color-accent)]/15 hover:bg-[var(--color-accent)] text-[var(--color-accent)] hover:text-[var(--color-accent-foreground)] border border-[var(--color-accent)]/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0"
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
              onClick={() => triggerHaptic()}
              className="hidden sm:flex items-center justify-center size-9 rounded-lg bg-primary text-primary-foreground hover:opacity-85 active:scale-95 transition-all shrink-0"
              title="Create a post"
            >
              <Plus className="size-4" />
            </Link>

            <Link
              href={`/channel/${user.username}`}
              onClick={() => triggerHaptic()}
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
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <Link
              href="/login"
              onClick={() => triggerHaptic()}
              className="h-9 px-3.5 inline-flex items-center justify-center text-xs font-semibold rounded-md border border-border hover:bg-muted text-foreground active:scale-95 transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              onClick={() => triggerHaptic()}
              className="h-9 px-3.5 inline-flex items-center justify-center text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:opacity-85 active:scale-95 transition-all"
            >
              Join
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
