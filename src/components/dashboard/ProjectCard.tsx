import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Users, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { type ProjectCardProps } from "@/lib/types";


export function ProjectCard({ project, taskCount, memberCount }: ProjectCardProps) {
    return (
        <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold">
                    <Link href={`/dashboard/projects/${project.id}`} className="hover:underline hover:underline-offset-4">
                        {project.name}
                    </Link>
                </CardTitle>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/projects/${project.id}`}>View Project</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/projects/${project.id}/settings`}>Edit Project</Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description ?? "No description provided."}
                </p>
            </CardContent>
            <CardFooter className="flex justify-between text-xs text-muted-foreground">
                <div className="flex space-x-4">
                    <div className="flex items-center">
                        <CheckSquare className="mr-1 h-3.5 w-3.5" />
                        <span>{taskCount} tasks</span>
                    </div>
                    <div className="flex items-center">
                        <Users className="mr-1 h-3.5 w-3.5" />
                        <span>{memberCount} members</span>
                    </div>
                </div>
                <div>Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}</div>
            </CardFooter>
        </Card>
    )
}