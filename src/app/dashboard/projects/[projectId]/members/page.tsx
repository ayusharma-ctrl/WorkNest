import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ProjectTabs } from "@/components/project/ProjectTabs";
import { MembersList } from "@/components/project/MembersList";


interface MembersPageProps {
    params: {
        projectId: string
    }
}

export default async function MembersPage({ params }: MembersPageProps) {
    const session = await auth();
    const { projectId } = params;

    if (!session || !projectId) {
        redirect("/");
    }

    // method to find a list of members associated with project id
    const project = await db.project.findUnique({
        where: {
            id: projectId,
        },
        include: {
            owner: true,
            members: {
                include: {
                    user: true,
                },
            },
        },
    });

    if (!project) {
        redirect("/");
    }

    // Check if user is a member or owner of the project
    const isOwner = project.ownerId === session.user.id
    const isMember = project.members.some((member) => member.userId === session.user.id)

    if (!isOwner && !isMember) {
        redirect("/dashboard");
    }

    // basically only admins or project owners are allowed to invite others and manage other details here
    const isAdmin =
        isOwner || project.members.some((member) => member.userId === session.user.id && member.role === "ADMIN")

    return (
        <DashboardShell>
            <DashboardHeader heading={project.name} text="Manage project members and roles.">
                {isAdmin && (
                    <Button asChild>
                        <Link href={`/dashboard/projects/${projectId}/invite`}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Invite Member
                        </Link>
                    </Button>
                )}
            </DashboardHeader>

            <ProjectTabs projectId={projectId} />

            <MembersList
                projectId={projectId}
                members={project?.members}
                owner={project?.owner}
                currentUserId={session?.user?.id}
                isAdmin={isAdmin}
            />
        </DashboardShell>
    )
}