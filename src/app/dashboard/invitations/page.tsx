import { auth } from "@/server/auth"
import { redirect } from "next/navigation"
import { db } from "@/server/db"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { InvitationsList } from "@/components/dashboard/InvitationsList"
import { EmptyPlaceholder } from "@/components/dashboard/DashEmptyPlaceholder"


export default async function InvitationsPage() {
    const session = await auth();

    // redirect if session not found
    if (!session) {
        redirect("/");
    }

    // method to fetch list of all the pending invites for this user
    const invitations = await db.invitation.findMany({
        where: {
            email: session.user.email ?? "",
            status: "PENDING",
        },
        include: {
            project: true,
            inviter: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    
    return (
        <DashboardShell>
            <DashboardHeader heading="Invitations" text="Manage your project invitations." />

            {invitations.length > 0 ? (
                <InvitationsList invitations={invitations} />
            ) : (
                <EmptyPlaceholder>
                    <EmptyPlaceholder.Icon name="mail" />
                    <EmptyPlaceholder.Title>No pending invitations</EmptyPlaceholder.Title>
                    <EmptyPlaceholder.Description>
                        You don&apos;t have any pending project invitations.
                    </EmptyPlaceholder.Description>
                </EmptyPlaceholder>
            )}
        </DashboardShell>
    )
}
