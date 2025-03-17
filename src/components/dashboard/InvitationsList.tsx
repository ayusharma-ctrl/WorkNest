"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { type InvitationsListProps } from "@/lib/types";


export function InvitationsList({ invitations: initialInvitations }: InvitationsListProps) {
    const [invitations, setInvitations] = useState(initialInvitations);
    const router = useRouter();

    // server method to accept the project join request
    const acceptInvitation = api.invitation.accept.useMutation({
        onSuccess: (data) => {
            toast.success("Invitation accepted", { description: "You have joined the project." })
            setInvitations(invitations.filter((inv) => inv.id !== data.id))
            router.push('/dashboard');
        },
        onError: (error) => {
            toast.error("Error", {
                description: error.message ?? "Failed to accept invitation. Please try again.",
            });
        },
    });

    // server method to decline the project join request
    const declineInvitation = api.invitation.decline.useMutation({
        onSuccess: (data) => {
            toast.success("Invitation declined", {
                description: "The invitation has been declined.",
            });
            setInvitations(invitations.filter((inv) => inv.id !== data.id));
        },
        onError: (error) => {
            toast.error("Error", {
                description: error.message || "Failed to decline invitation. Please try again.",
            });
        },
    });

    // onclick method to call server method
    const handleAccept = (invitationId: string) => {
        acceptInvitation.mutate({ invitationId });
    };

    // onclick method to call server method
    const handleDecline = (invitationId: string) => {
        declineInvitation.mutate({ invitationId });
    };

    return (
        <div className="grid gap-4">
            {invitations.map((invitation) => (
                <Card key={invitation.id}>
                    <CardHeader>
                        <CardTitle>{invitation.project.name}</CardTitle>
                        <CardDescription>
                            Invited by {invitation.inviter.name} ({invitation.inviter.email})
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            {invitation.project.description ?? "No description provided."}
                        </p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <div className="text-sm text-muted-foreground">
                            Invited {formatDistanceToNow(new Date(invitation.createdAt), { addSuffix: true })}
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                onClick={() => handleDecline(invitation.id)}
                            >
                                <X className="mr-2 h-4 w-4" />
                                Decline
                            </Button>
                            <Button size="sm" onClick={() => handleAccept(invitation.id)}>
                                <Check className="mr-2 h-4 w-4" />
                                Accept
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
