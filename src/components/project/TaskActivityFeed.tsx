"use client";
import { api } from "@/trpc/react";
import { formatDistanceToNow } from "date-fns";
import { Activity } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getActivityIcon } from "@/lib/constants";


interface TaskActivityFeedProps {
    taskId: string
}

export function TaskActivityFeed({ taskId }: TaskActivityFeedProps) {
    const { data: activities, isLoading } = api.task.getTaskActivities.useQuery({ taskId });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
        )
    }

    if (!activities || activities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <Activity className="h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No activity recorded yet</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Activity Feed</h3>
            <div className="space-y-4">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 text-lg">{getActivityIcon(activity.type)}</div>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center">
                                <Avatar className="h-6 w-6 mr-2">
                                    <AvatarImage src={activity.user.image ?? ""} alt={activity.user.name ?? "User"} />
                                    <AvatarFallback>{activity.user.name?.charAt(0) ?? "U"}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">{activity.user.name}</span>
                            </div>
                            <p className="text-sm">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
