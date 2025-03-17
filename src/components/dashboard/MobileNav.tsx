"use client"

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DashboardNav } from "@/components/dashboard/Nav";

export function MobileNav() {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
                <SheetHeader>
                    <SheetTitle className="text-left text-lg font-bold">
                        <Link href="/" className="flex items-center cursor-pointer" onClick={() => setOpen(false)}>
                            WorkNest
                        </Link>
                    </SheetTitle>
                </SheetHeader>
                <DashboardNav />
            </SheetContent>
        </Sheet>
    )
}