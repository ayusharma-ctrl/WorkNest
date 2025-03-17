"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProjectTabsProps {
    projectId: string
}

export function ProjectTabs({ projectId }: ProjectTabsProps) {
    const pathname = usePathname();

    const tabs = [
        {
            title: "Tasks",
            href: `/dashboard/projects/${projectId}`,
            isActive: pathname === `/dashboard/projects/${projectId}`,
        },
        {
            title: "Members",
            href: `/dashboard/projects/${projectId}/members`,
            isActive: pathname === `/dashboard/projects/${projectId}/members`,
        },
        {
            title: "Settings",
            href: `/dashboard/projects/${projectId}/settings`,
            isActive: pathname === `/dashboard/projects/${projectId}/settings`,
        },
    ]

    return (
        <Tabs defaultValue={tabs.find((tab) => tab.isActive)?.href ?? tabs[0]?.href} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                {tabs.map((tab) => (
                    <TabsTrigger
                        key={tab.href}
                        value={tab.href}
                        className={cn(
                            "data-[state=active]:bg-background",
                            tab.isActive && "data-[state=active]:border-b-2 data-[state=active]:border-primary",
                        )}
                        asChild
                    >
                        <Link href={tab.href}>{tab.title}</Link>
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    )
}
