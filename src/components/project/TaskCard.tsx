"use client"

import { useState } from "react";
import { formatDistanceToNow, formatRelative } from "date-fns";
import { MoreHorizontal, Calendar, User2, Trash2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EditTaskDialog } from "@/components/project/dialog/EditTaskDialog";
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
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { type TaskCardProps } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TaskActivityFeed } from "./TaskActivityFeed";


export function TaskCard({ task, projectId, members, isAdmin, onDelete, onUpdate }: TaskCardProps) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
    const [isActivityOpen, setIsActivityOpen] = useState<boolean>(false);

    // method to delete a task
    const deleteTask = api.task.delete.useMutation({
        onSuccess: () => {
            toast.success("Task deleted", {
                description: "Task has been deleted successfully.",
            });
            onDelete(task.id);
        },
        onError: (error) => {
            toast.error("Error", {
                description: error.message || "Failed to delete task. Please try again.",
            });
        },
    });

    // method to call server method to delete a task
    const handleDelete = () => {
        deleteTask.mutate({ taskId: task.id });
    }

    // helper function to pick css based on task priority
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "LOW":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            case "MEDIUM":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
            case "HIGH":
                return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
            case "URGENT":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
        }
    }

    // either an admin or assignee can edit or delete a task
    const canEdit = isAdmin || task.createdById === task.assignedToId;


    return (
        <>
            <Card className="shadow-sm hover:shadow transition-shadow">
                <CardHeader className="p-3 pb-0">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-base font-medium">{task.title}</CardTitle>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setIsActivityOpen(true)}>View Activity</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>Edit Task</DropdownMenuItem>
                                {canEdit && (
                                    <DropdownMenuItem
                                        className="text-red-600 focus:text-red-600"
                                        onClick={() => setIsDeleteDialogOpen(true)}
                                    >
                                        Delete Task
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>

                <CardContent className="p-3">
                    <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                            {task.priority}
                        </Badge>
                    </div>
                    {task?.createdBy && (
                        <div className="flex items-center text-xs">
                            <span>By: {task.createdBy.name?.split(' ')[0]}, {formatRelative(task.createdAt, new Date())}</span>
                        </div>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2">{task.description ?? "No description provided."}</p>
                </CardContent>

                <CardFooter className="flex flex-col-reverse p-0 mb-2 gap-2">

                    <div className="p-2 pt-0 flex justify-between text-xs text-muted-foreground w-full">
                        <div className="flex items-center">
                            <Calendar className="mr-1 h-3.5 w-3.5" />
                            <span>{formatDistanceToNow(new Date(task.deadline), { addSuffix: true })}</span>
                        </div>
                        {task?.assignedTo && (
                            <div className="flex items-center">
                                <User2 className="mr-1 h-3.5 w-3.5" />
                                <span>{task.assignedTo.name}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end items-center gap-1 w-full px-2">
                        {task.tags && task.tags.length > 0 && task.tags.slice(0, 3).map((tag) => (
                            <TooltipProvider key={tag.id}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Avatar className="h-5 w-5">
                                            <AvatarImage src={tag.user.image ?? ""} alt={tag.user.name ?? "User"} />
                                            <AvatarFallback className="text-[10px]">{tag.user.name?.charAt(0) ?? "U"}</AvatarFallback>
                                        </Avatar>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Tagged: {tag.user.name}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ))}

                        {task.tags && task.tags.length > 3 && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Badge variant="outline" className="h-5 w-5 p-0 flex items-center justify-center rounded-full">
                                            +{task.tags.length - 3}
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{task.tags.length - 3} more tagged users</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>

                </CardFooter>
            </Card>

            <EditTaskDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                task={task}
                projectId={projectId}
                members={members}
                onUpdate={onUpdate}
            />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the task.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={isActivityOpen} onOpenChange={setIsActivityOpen}>
                <AlertDialogContent className="max-w-3xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Task Activity</AlertDialogTitle>
                        <AlertDialogDescription>View the activity history for this task.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto">
                        <TaskActivityFeed taskId={task.id} />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}