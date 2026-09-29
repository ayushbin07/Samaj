"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Compass,
  Users,
  Library,
  MessageSquare,
  Upload,
  Tv,
  Settings2,
  LifeBuoy,
  Send,
  Play,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user } = useAuth()

  const data = {
    user: user
      ? {
          name: user.fullName || user.username,
          email: user.email,
          avatar: user.avatar || "",
          username: user.username,
        }
      : null,
    navMain: [
      {
        title: "Home",
        url: "/",
        icon: Home,
        isActive: pathname === "/",
      },
      {
        title: "Communities",
        url: "/community",
        icon: MessageSquare,
        isActive: pathname.startsWith("/community"),
      },
      {
        title: "Explore",
        url: "/explore",
        icon: Compass,
        isActive: pathname.startsWith("/explore"),
      },
      {
        title: "Subscriptions",
        url: "/subscriptions",
        icon: Users,
        isActive: pathname.startsWith("/subscriptions"),
      },
      {
        title: "Library",
        url: "/library",
        icon: Library,
        isActive: pathname.startsWith("/library"),
      },
    ],
    navSecondary: [
      {
        title: "Support",
        url: "#",
        icon: LifeBuoy,
      },
      {
        title: "Feedback",
        url: "#",
        icon: Send,
      },
    ],
    projects: [
      {
        name: "Create Post",
        url: "/community",
        icon: MessageSquare,
      },
      {
        name: user ? "Your Profile" : "Profile",
        url: user ? `/channel/${user.username}` : "/login",
        icon: Tv,
      },
      {
        name: "Settings",
        url: "/settings",
        icon: Settings2,
      },
    ],
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[var(--color-accent)] text-[#09090B] font-black">
                  <Users className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold tracking-tight">Community</span>
                  <span className="truncate text-xs text-muted-foreground">Private Network</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
