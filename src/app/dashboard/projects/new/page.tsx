"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { toast } from "sonner";


const projectFormSchema = z.object({
    name: z
        .string()
        .min(2, {
            message: "Project name must be at least 2 characters.",
        })
        .max(50, {
            message: "Project name must not be longer than 50 characters.",
        }),
    description: z
        .string()
        .max(500, {
            message: "Project description must not be longer than 500 characters.",
        })
        .optional(),
})

type ProjectFormValues = z.infer<typeof projectFormSchema>

export default function NewProjectPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    // server action to create a new project
    const createProject = api.project.create.useMutation({
        onSuccess: (data) => {
            toast.success("Project created", {
                description: "Your project has been created successfully.",
            });
            router.push(`/dashboard/projects/${data.id}`);
        },
        onError: (error) => {
            toast.error("Error", {
                description: error.message || "Failed to create project. Please try again.",
            });
            setIsLoading(false);
        },
    });

    // form state
    const form = useForm<ProjectFormValues>({
        resolver: zodResolver(projectFormSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    });

    // handle form submit
    const onSubmit = (data: ProjectFormValues) => {
        setIsLoading(true);
        createProject.mutate({
            name: data.name,
            description: data.description ?? "",
        });
    }

    return (
        <DashboardShell>
            <DashboardHeader heading="Create Project" text="Add a new project to your dashboard." />
            <div className="grid gap-8">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="My Awesome Project" {...field} />
                                    </FormControl>
                                    <FormDescription>This is the name of your project.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Describe your project..." className="resize-none" {...field} />
                                    </FormControl>
                                    <FormDescription>A brief description of your project.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Creating..." : "Create Project"}
                        </Button>
                    </form>
                </Form>
            </div>
        </DashboardShell>
    )
}
