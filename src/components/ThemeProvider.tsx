"use client";
import { useEffect } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";
import { api } from "@/trpc/react";


export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    // check for user session
    const { data: session } = api.user.getSession.useQuery(undefined, {
        retry: 0,
        refetchOnWindowFocus: false
    });

    // method to get userpreferences only when session exists
    const { data: userPreferences } = api.user.getPreferences.useQuery(undefined, {
        enabled: !!session,
    });

    // update the theme after successful sign in as per the saved preference
    useEffect(() => {
        if (session && userPreferences?.darkMode !== undefined) {
            document.documentElement.classList.toggle("dark", userPreferences.darkMode);
        }
    }, [session, userPreferences]);

    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export { useTheme } from "next-themes";
