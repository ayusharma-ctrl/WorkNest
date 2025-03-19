"use client"
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { api } from "@/trpc/react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner";


const settingsFormSchema = z.object({
    darkMode: z.boolean().default(false),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>

export default function SettingsPage() {
    const { setTheme } = useTheme();
    const [isLoading, setIsLoading] = useState(false);

    // Get user preferences from server action
    const { data: userPreferences } = api.user.getPreferences.useQuery();

    // server action to update user preferences
    const updatePreferences = api.user.updatePreferences.useMutation({
        onSuccess: () => {
            toast.success("Settings updated", {
                description: "Your settings have been updated successfully.",
            });
            setIsLoading(false);
        },
        onError: (error) => {
            toast.error("Error", {
                description: error.message || "Failed to update settings. Please try again.",
            });
            setIsLoading(false);
        },
    });

    // form state
    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsFormSchema),
        defaultValues: {
            darkMode: false,
        },
    });


    // Update form when session/theme changes
    useEffect(() => {
        if (userPreferences?.darkMode !== undefined) {
            form.reset({
                darkMode: userPreferences.darkMode, // either true or false
            });
        }
    }, [form, userPreferences?.darkMode]);


    // handle form submit to update prefereneces
    function onSubmit(data: SettingsFormValues) {
        setIsLoading(true);
        setTheme(data.darkMode ? "dark" : "light"); // Update theme

        // Save preferences to database
        updatePreferences.mutate({
            preferences: {
                darkMode: data.darkMode,
            },
        });
    }


    return (
        <DashboardShell>
            <DashboardHeader heading="Settings" text="Manage your account settings and preferences." />
            <div className="grid gap-8">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium">Appearance</h3>
                                <p className="text-sm text-muted-foreground">Customize how the application looks on your device.</p>
                            </div>
                            <FormField
                                control={form.control}
                                name="darkMode"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Dark Mode</FormLabel>
                                            <FormDescription>Switch between light and dark mode.</FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save changes"}
                        </Button>
                    </form>
                </Form>
            </div>
        </DashboardShell>
    )
}
