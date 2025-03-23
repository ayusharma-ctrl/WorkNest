import type React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { DashboardNav } from "@/components/dashboard/Nav";
import { UserDropdown } from "@/components/dashboard/UserDropdown";
import { MobileNav } from "@/components/dashboard/MobileNav";
import Link from "next/link";
import { type Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard",
    description: "Manage all your projects and tasks here",
    icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (!session) {
        redirect("/");
    }

    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-40 border-b bg-background px-6 lg:px-12">
                <div className="flex h-16 items-center justify-between py-4">
                    <div className="flex items-center gap-2 md:hidden">
                        <MobileNav />
                    </div>
                    <div className="hidden md:flex">
                        <Link href={'/'} className="text-xl font-bold">WorkNest</Link>
                    </div>
                    <div className="flex items-center gap-2">
                        <UserDropdown user={session.user} />
                    </div>
                </div>
            </header>
            <div className="flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr]">
                <aside className="fixed top-20 z-30 -ml-2 hidden h-[85vh] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
                    <DashboardNav />
                </aside>
                <main className="flex w-full flex-col overflow-hidden px-4 md:pr-8 md:py-8">{children}</main>
            </div>
        </div>
    )
}