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
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { toast } from "sonner";


const inviteFormSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>

interface InvitePageProps {
    params: {
        projectId: string
    }
}

export default function InvitePage({ params }: InvitePageProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    
    // server fucntion to sent project invite
    const inviteMember = api.project.inviteMember.useMutation({
        onSuccess: () => {
            toast.success("Invitation sent", {
                description: "An invitation has been sent to the email address.",
            });
            router.push(`/dashboard/projects/${params.projectId}/members`);
        },
        onError: (error) => {
            toast.error("Error", {
                description: error.message || "Failed to send invitation. Please try again.",
            });
            setIsLoading(false);
        },
    });


    // form state - only ask for invitee email
    const form = useForm<InviteFormValues>({
        resolver: zodResolver(inviteFormSchema),
        defaultValues: {
            email: "",
        },
    });


    // handl form submit
    const onSubmit = (data: InviteFormValues) => {
        setIsLoading(true)
        inviteMember.mutate({
            projectId: params.projectId,
            email: data.email,
        })
    }


    return (
        <DashboardShell>
            <DashboardHeader heading="Invite Team Member" text="Invite a new member to collaborate on this project." />
            <div className="grid gap-8">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="email@example.com" {...field} />
                                    </FormControl>
                                    <FormDescription>Enter the email address of the person you want to invite.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Sending Invitation..." : "Send Invitation"}
                        </Button>
                    </form>
                </Form>
            </div>
        </DashboardShell>
    )
}