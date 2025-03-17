"use client"

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "react-beautiful-dnd";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/project/TaskCard";
import { AddTaskDialog } from "@/components/project/dialog/AddTaskDialog";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { ProjectStatus, type Task } from "@prisma/client";
import { type TaskBoardProps } from "@/lib/types";
import { statuses } from "@/lib/constants";


export function TaskBoard({ projectId, tasks: initialTasks, members, isAdmin }: TaskBoardProps) {
    const [tasks, setTasks] = useState(initialTasks);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // method to update task in database
    const updateTaskStatus = api.task.updateStatus.useMutation({
        onSuccess: () => {
            toast.success("Task updated", {
                description: "Task status has been updated successfully.",
            });
        },
        onError: (error) => {
            toast.error("Error", {
                description: error.message ?? "Failed to update task status. Please try again.",
            });
            // Revert the task status change
            setTasks(initialTasks);
        },
    });

    // method to filter tasks by status
    const getTasksByStatus = (status: ProjectStatus) => {
        return tasks.filter((task) => task.status === status);
    };

    // method to update task status when user drags and drop a task card
    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        // if no valid drop destination, exit early
        if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
            return;
        }

        const task = tasks.find((t) => t.id === draggableId);
        if (!task) return;

        // validate -> destination.droppableId is a valid ProjectStatus
        if (!Object.keys(ProjectStatus).includes(destination.droppableId)) return;

        // create a new array with the updated task status
        const updatedTasks = tasks.map((t) =>
            t.id === draggableId ? { ...t, status: destination.droppableId as ProjectStatus } : t
        );

        // update component state
        setTasks(updatedTasks);

        // update the database by calling method
        updateTaskStatus.mutate({ taskId: draggableId, status: destination.droppableId as ProjectStatus });
    };

    // handle newly added task and show it on UI
    const handleTaskCreated = (newTask: Task) => {
        setTasks([newTask, ...tasks]);
    }

    // handle deleted task and remove it from existing ones
    const handleTaskDeleted = (taskId: string) => {
        setTasks(tasks.filter((task) => task.id !== taskId));
    }

    // handle task update and show changes on UI by pdating componnet state
    const handleTaskUpdated = (updatedTask: Task) => {
        setTasks(tasks.map((task) => task.id === updatedTask.id ? updatedTask : task));
    }

    return (
        <div className="mt-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Tasks</h2>
                <Button onClick={() => setIsDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Task
                </Button>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statuses.map((status) => (
                        <div key={status.id} className="flex flex-col">
                            <div className="bg-muted p-3 rounded-t-md">
                                <h3 className="font-medium text-sm">{status.name}</h3>
                                <div className="text-xs text-muted-foreground mt-1">{getTasksByStatus(status.id).length} tasks</div>
                            </div>
                            <Droppable droppableId={status.id.toString()} direction="vertical" isDropDisabled={false} isCombineEnabled={true} ignoreContainerClipping={true} >
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="bg-muted/50 p-2 rounded-b-md min-h-[300px] flex-1"
                                    >
                                        {getTasksByStatus(status.id).map((task, index) => (
                                            <Draggable key={task.id} draggableId={task.id} index={index}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="mb-2"
                                                    >
                                                        <TaskCard
                                                            task={task}
                                                            projectId={projectId}
                                                            members={members}
                                                            isAdmin={isAdmin}
                                                            onDelete={handleTaskDeleted}
                                                            onUpdate={handleTaskUpdated}
                                                        />
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>

            <AddTaskDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                projectId={projectId}
                members={members}
                onTaskCreated={handleTaskCreated}
            />
        </div>
    )
}
