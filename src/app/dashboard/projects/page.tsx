import Link from "next/link";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { EmptyPlaceholder } from "@/components/dashboard/DashEmptyPlaceholder";


export default async function ProjectsPage() {
    const session = await auth();

    if (!session) {
        redirect("/");
    }

    // fetch list of projects associated with signed in user
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
    });
    

    return (
        <DashboardShell>
            <DashboardHeader heading="Projects" text="Create and manage your projects.">
                <Button asChild>
                    <Link href="/dashboard/projects/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Project
                    </Link>
                </Button>
            </DashboardHeader>

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
        </DashboardShell>
    )
}
