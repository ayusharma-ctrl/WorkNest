import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ProjectTabs } from "@/components/project/ProjectTabs";
import { TaskBoard } from "@/components/project/TaskBoard";
import { Button } from "@/components/ui/button";
import { Settings, UserPlus } from "lucide-react";
import Link from "next/link";
import { type ProjectPageProps } from "@/lib/types";
import { caller } from "@/trpc/server";


export default async function ProjectPage({ params }: ProjectPageProps) {
    const session = await auth();
    const { projectId } = await params;

    if (!session || !projectId) {
        redirect("/");
    }

    // fetch the project details by projectId along with other related details
    const project = await caller.project.getById({
        projectId: projectId,
    });

    // in case project not found
    if (!project) {
        redirect("/");
    }

    // Check if user is a member or owner of the project
    const isOwner = project?.ownerId === session?.user?.id;
    const isMember = project?.members.some((member) => member?.userId === session?.user?.id);

    if (!isOwner && !isMember) {
        redirect("/dashboard");
    }

    // Get tasks for this project with other related details
    const tasks = await caller.task.getByProject({
        projectId: projectId
    });

    const isAdmin =
        isOwner || project.members.some((member) => member.userId === session.user.id && member.role === "ADMIN");


    return (
        <DashboardShell>
            <DashboardHeader heading={project.name} text={project.description ?? "No description provided."}>
                <div className="flex gap-2">
                    {isAdmin && (
                        <Button asChild>
                            <Link href={`/dashboard/projects/${projectId}/invite`}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Invite Member
                            </Link>
                        </Button>
                    )}
                    {isOwner && (
                        <Button variant="outline" asChild>
                            <Link href={`/dashboard/projects/${projectId}/settings`}>
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </Link>
                        </Button>
                    )}
                </div>
            </DashboardHeader>

            <ProjectTabs projectId={projectId} />

            <TaskBoard
                projectId={projectId}
                tasks={tasks}
                members={project.members}
                isAdmin={
                    isOwner || project.members.some((member) => member.userId === session.user.id && member.role === "ADMIN")
                }
            />
        </DashboardShell>
    )
}
