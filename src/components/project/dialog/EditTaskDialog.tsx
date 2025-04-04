"use client"

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { type EditTaskDialogProps } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


const taskFormSchema = z.object({
    taskId: z.string().optional(),
    title: z
        .string()
        .min(2, {
            message: "Task title must be at least 2 characters.",
        })
        .max(100, {
            message: "Task title must not be longer than 100 characters.",
        }),
    description: z
        .string()
        .max(500, {
            message: "Task description must not be longer than 500 characters.",
        })
        .optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
    status: z.enum(["TODO", "IN_PROGRESS", "DONE", "BACKLOG"]),
    deadline: z.date({
        required_error: "Please select a deadline date.",
    }),
    assignedToId: z.string().optional(),
    taggedUserIds: z.array(z.string()).optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

export function EditTaskDialog({ open, onOpenChange, task, members, onUpdate }: EditTaskDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    // method to update task data in db
    const updateTask = api.task.update.useMutation({
        onSuccess: (data) => {
            toast.success("Task updated", {
                description: "Your task has been updated successfully.",
            });
            if (data) onUpdate(data);
            onOpenChange(false);
            setIsLoading(false);
        },
        onError: (error) => {
            toast.error("Error", {
                description: error.message || "Failed to update task. Please try again.",
            });
            setIsLoading(false);
        },
    });

    // get current tagged users
    const currentTaggedUserIds = task?.tags ? task.tags.map((tag) => tag?.userId) : [];

    // edit task form state
    const form = useForm<TaskFormValues>({
        resolver: zodResolver(taskFormSchema),
        defaultValues: {
            title: task.title,
            description: task.description ?? "",
            priority: task.priority,
            status: task.status,
            deadline: new Date(task.deadline),
            assignedToId: task.assignedToId ?? "",
            taggedUserIds: currentTaggedUserIds,
        },
    });

    // update form when task changes
    useEffect(() => {
        if (task && open) {
            form.reset({
                title: task.title,
                description: task.description ?? "",
                priority: task.priority,
                status: task.status,
                deadline: new Date(task.deadline),
                assignedToId: task.assignedToId ?? "",
                taggedUserIds: currentTaggedUserIds,
            })
        }
    }, [task, form, open]);

    // call task update method on form submit
    const onSubmit = (data: TaskFormValues) => {
        setIsLoading(true);
        updateTask.mutate({
            taskId: task.id,
            title: data.title,
            description: data.description ?? "",
            priority: data.priority,
            status: data.status,
            deadline: data.deadline,
            assignedToId: data.assignedToId === "unassigned" ? undefined : data.assignedToId,
            taggedUserIds: data.taggedUserIds ?? [],
        });
    }


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] h-4/5 overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                    <DialogDescription>Update the task details below.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Task title" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Task description"
                                            className="resize-none"
                                            {...field}
                                            value={field.value ?? ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="LOW">Low</SelectItem>
                                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                                <SelectItem value="HIGH">High</SelectItem>
                                                <SelectItem value="URGENT">Urgent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="TODO">To Do</SelectItem>
                                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                                <SelectItem value="DONE">Done</SelectItem>
                                                <SelectItem value="BACKLOG">Backlog</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="deadline"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Deadline</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                    >
                                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="assignedToId"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Assign To</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select team member" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                                {members.map((member) => (
                                                    <SelectItem key={member.id} value={member.userId}>
                                                        {member.user.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>Leave empty to create an unassigned task.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="taggedUserIds"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Tag Team Members</FormLabel>
                                    <ScrollArea className="h-[200px] border rounded-md p-4">
                                        <div className="space-y-4">
                                            {members.filter(member => member.userId !== task.createdById && member.userId !== task.assignedToId).map((member) => (
                                                <FormField
                                                    key={member.id}
                                                    control={form.control}
                                                    name="taggedUserIds"
                                                    render={({ field }) => {
                                                        return (
                                                            <FormItem key={member.userId} className="flex flex-row items-start space-x-3 space-y-0">
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(member.userId)}
                                                                        onCheckedChange={(checked) => {
                                                                            const currentValue = field.value ?? []
                                                                            return checked
                                                                                ? field.onChange([...currentValue, member.userId])
                                                                                : field.onChange(currentValue.filter((value) => value !== member.userId))
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <div className="flex items-center space-x-2">
                                                                    <Avatar className="h-6 w-6">
                                                                        <AvatarImage src={member.user.image ?? ""} alt={member.user.name ?? "User"} />
                                                                        <AvatarFallback>{member.user.name?.charAt(0) ?? "U"}</AvatarFallback>
                                                                    </Avatar>
                                                                    <FormLabel className="font-normal cursor-pointer">{member.user.name}</FormLabel>
                                                                </div>
                                                            </FormItem>
                                                        )
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </ScrollArea>
                                    <FormDescription>Tagged members will be notified and can view the task.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Updating..." : "Update Task"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
