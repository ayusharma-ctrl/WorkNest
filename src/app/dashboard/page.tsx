import { auth } from "@/server/auth"
import { redirect } from "next/navigation"
import { db } from "@/server/db"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { ProjectCard } from "@/components/dashboard/ProjectCard"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { EmptyPlaceholder } from "@/components/dashboard/DashEmptyPlaceholder"

export default async function DashboardPage() {
    const session = await auth();

    if (!session) {
        redirect("/");
    }

    const projects = await db.project.findMany({
        where: {
            OR: [
                { ownerId: session.user.id },
                {
                    members: {
                        some: {
                            userId: session.user.id,
                        },
                    },
                },
            ],
        },
        include: {
            owner: true,
            _count: {
                select: {
                    tasks: true,
                    members: true,
                },
            },
        },
        orderBy: {
            updatedAt: "desc",
        },
        // take: 6,
    });

    const pendingInvitations = await db.invitation.count({
        where: {
            email: session.user?.email ?? "",
            status: "PENDING",
        },
    });

    return (
        <DashboardShell>
            <DashboardHeader heading="Dashboard" text="Welcome back! Here's an overview of your projects.">
                <Button asChild>
                    <Link href="/dashboard/projects/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Project
                    </Link>
                </Button>
            </DashboardHeader>

            {pendingInvitations > 0 && (
                <div className="mb-8 rounded-lg border bg-amber-50 p-4 text-amber-900 dark:bg-amber-900/20 dark:text-amber-50">
                    <p>
                        You have {pendingInvitations} pending invitation{pendingInvitations > 1 ? "s" : ""}.{" "}
                        <Link href="/dashboard/invitations" className="font-medium underline underline-offset-4">
                            View invitations
                        </Link>
                    </p>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.length > 0 ? (
                    projects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            taskCount={project._count.tasks}
                            memberCount={project._count.members}
                        />
                    ))
                ) : (
                    <EmptyPlaceholder className="col-span-full">
                        <EmptyPlaceholder.Icon name="layout" />
                        <EmptyPlaceholder.Title>No projects created</EmptyPlaceholder.Title>
                        <EmptyPlaceholder.Description>
                            You don&apos;t have any projects yet. Start creating one.
                        </EmptyPlaceholder.Description>
                        <Button asChild>
                            <Link href="/dashboard/projects/new">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                New Project
                            </Link>
                        </Button>
                    </EmptyPlaceholder>
                )}
            </div>

            {projects.length > 0 && (
                <div className="mt-6 flex justify-center">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/projects">View all projects</Link>
                    </Button>
                </div>
            )}
        </DashboardShell>
    )
}