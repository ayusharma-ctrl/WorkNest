"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Trash2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ProjectTabs } from "@/components/project/ProjectTabs";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
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

interface ProjectSettingsPageProps {
    params: Promise<{ projectId: string }>
}

export default function ProjectSettingsPage({ params }: ProjectSettingsPageProps) {
    const router = useRouter();
    const [projectId, setProjectId] = useState<string>("");

    useEffect(() => {
        const getId = async () => {
            try {
                const { projectId } = await params;
                if (!projectId) {
                    router.push('/dashboard/projects');
                    return;
                }
                setProjectId(projectId);
            } catch(e) {
                console.log(e);
            }
        }
        void getId();
    }, [params, router]);

    const [isLoading, setIsLoading] = useState(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);

    // Fetch project details
    const { data: project, isLoading: isProjectLoading } = api.project.getById.useQuery({
        projectId: projectId,
    });

    // Check if user is the owner
    const { data: session } = api.user.getSession.useQuery();
    const isOwner = session?.user?.id === project?.ownerId;

    // handle project update
    const updateProject = api.project.update.useMutation({
        onSuccess: () => {
            toast.success("Project updated", {
                description: "Your project has been updated successfully.",
            });
            setIsLoading(false);
            router.push(`/dashboard/projects/${projectId}`);
        },
        onError: (error) => {
            toast.error("Error", {
                description: error.message || "Failed to update project. Please try again.",
            });
            setIsLoading(false);
        },
    })

    // handle project delete
    const deleteProject = api.project.delete.useMutation({
        onSuccess: () => {
            toast.success("Project deleted", {
                description: "Your project has been deleted successfully.",
            });
            setIsDeleteLoading(false);
            router.push("/dashboard/projects");
        },
        onError: (error) => {
            toast.error("Error", {
                description: error.message || "Failed to delete project. Please try again.",
            });
            setIsDeleteLoading(false);
        },
    })

    // handle for state
    const form = useForm<ProjectFormValues>({
        resolver: zodResolver(projectFormSchema),
        defaultValues: {
            name: project?.name ?? "",
            description: project?.description ?? "",
        },
        values: {
            name: project?.name ?? "",
            description: project?.description ?? "",
        },
    });

    // handle form submit
    const onSubmit = (data: ProjectFormValues) => {
        if (!isOwner) {
            toast.warning("Permission denied", {
                description: "Only the project owner can update project details."
            });
            return
        }

        setIsLoading(true);
        updateProject.mutate({
            projectId: projectId,
            name: data.name,
            description: data.description ?? "",
        });
    }

    // handle project delete
    const handleDeleteProject = () => {
        if (!isOwner) {
            toast.warning("Permission denied", {
                description: "Only the project owner can delete the project.",
            });
            return
        }

        setIsDeleteLoading(true);
        deleteProject.mutate({
            projectId: projectId,
        });
    }

    if (isProjectLoading) {
        return (
            <DashboardShell>
                <DashboardHeader heading="Project Settings" text="Loading project details..." />
                <div className="flex items-center justify-center p-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
            </DashboardShell>
        )
    }

    if (!project) {
        return (
            <DashboardShell>
                <DashboardHeader heading="Project Settings" text="Project not found." />
            </DashboardShell>
        )
    }

    return (
        <DashboardShell>
            <DashboardHeader heading="Project Settings" text="Manage your project settings and details." />

            <ProjectTabs projectId={projectId} />

            <div className="grid gap-8 mt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="My Awesome Project" {...field} disabled={!isOwner} />
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
                                        <Textarea
                                            placeholder="Describe your project..."
                                            className="resize-none"
                                            {...field}
                                            value={field.value ?? ""}
                                            disabled={!isOwner}
                                        />
                                    </FormControl>
                                    <FormDescription>A brief description of your project.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {isOwner && (
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save changes"}
                            </Button>
                        )}
                        {!isOwner && (
                            <p className="text-sm text-muted-foreground">Only the project owner can edit project details.</p>
                        )}
                    </form>
                </Form>

                {isOwner && (
                    <>
                        <Separator className="my-6" />

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
                                <p className="text-sm text-muted-foreground">Permanently delete this project and all of its data.</p>
                            </div>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Project
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the project and all associated tasks,
                                            members, and invitations.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDeleteProject}
                                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                                            disabled={isDeleteLoading}
                                        >
                                            {isDeleteLoading ? "Deleting..." : "Delete Project"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </>
                )}
            </div>
        </DashboardShell>
    )
}
