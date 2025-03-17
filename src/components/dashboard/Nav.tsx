"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { navItems } from "@/lib/constants";


export function DashboardNav() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col gap-2 p-0 md:px-4 lg:px-6">
            <div className="flex items-center justify-between py-2">
                <h2 className="text-lg font-semibold tracking-tight">Navigation</h2>
            </div>
            <div className="flex flex-col gap-1">
                {navItems.map((item, index) => (
                    <Button
                        key={index}
                        variant="ghost"
                        className={cn("justify-start", pathname === item.href && "bg-slate-200 font-medium")}
                        asChild
                    >
                        <Link href={item.href}>
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.title}
                        </Link>
                    </Button>
                ))}
            </div>
            {/* <div className="py-4">
                <Button className="w-full justify-start" asChild>
                    <Link href="/dashboard/projects/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Project
                    </Link>
                </Button>
            </div> */}
        </div>
    )
}