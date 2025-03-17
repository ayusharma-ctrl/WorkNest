"use client";
import { useEffect } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";
import { api } from "@/trpc/react";


export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    // Get user preferences from server action
    const userPreferences = api.user.getPreferences.useQuery() as { darkMode?: boolean } || {}

    // Set initial theme based on user preferences
    useEffect(() => {
        if (userPreferences.darkMode !== undefined) {
            document.documentElement.classList.toggle("dark", userPreferences.darkMode)
        }
    }, [userPreferences.darkMode]);

    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export { useTheme } from "next-themes";
