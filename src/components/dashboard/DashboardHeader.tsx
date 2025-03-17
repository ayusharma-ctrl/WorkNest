import { type DashboardHeaderProps } from "@/lib/types";

export function DashboardHeader({ heading, text, children }: DashboardHeaderProps) {
    return (
        <div className="flex items-center justify-between px-2 pb-4">
            <div className="grid gap-1">
                <h1 className="text-2xl font-bold tracking-wide md:text-3xl">{heading}</h1>
                {text && <p className="text-muted-foreground">{text}</p>}
            </div>
            {children}
        </div>
    )
}
