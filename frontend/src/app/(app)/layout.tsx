import type { Metadata } from "next";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import MobileNav from "@/components/layout/MobileNav";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "Community",
  description: "Personalized dashboard, discovery, and social feed for your private network.",
};


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main id="main-content" className="flex flex-1 flex-col w-full pb-28 md:pb-6">
          {children}
        </main>
      </SidebarInset>
      <MobileNav />
    </SidebarProvider>
  );
}
