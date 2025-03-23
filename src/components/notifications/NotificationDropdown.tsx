"use client"

import { useState } from "react";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { api } from "@/trpc/react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { getNotificationIcon } from "@/lib/constants";

export function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);

    const { data: notifications, refetch: refetchNotifications } = api.notification.getMyNotifications.useQuery();
    const { data: unreadCount, refetch: refetchUnreadCount } = api.notification.getUnreadCount.useQuery();

    // method to mark one notification as read -> will take notificationId as argument
    const markAsRead = api.notification.markAsRead.useMutation({
        onSuccess: async () => {
            await refetchNotifications();
            await refetchUnreadCount();
        },
    });

    // method to mark all notifications as read
    const markAllAsRead = api.notification.markAllAsRead.useMutation({
        onSuccess: async () => {
            toast.success("Notifications marked as read", {
                description: "All notifications have been marked as read",
            });
            await refetchNotifications();
            await refetchUnreadCount();
            setIsOpen(false);
        },
    });

    const handleMarkAsRead = (notificationId: string) => {
        markAsRead.mutate({ notificationId });
    }

    const handleMarkAllAsRead = () => {
        markAllAsRead.mutate();
    }


    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild className="mt-1 mr-1">
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount && unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -right-1 -top-0.5 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between p-4">
                    <h3 className="font-medium">Notifications</h3>
                    {unreadCount && unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="text-xs">
                            Mark all as read
                        </Button>
                    )}
                </div>
                <Separator />
                <div className="max-h-96 overflow-y-auto">
                    {notifications && notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={`flex flex-col items-start p-4 ${!notification.isRead ? "bg-muted/50" : ""}`}
                                onClick={() => handleMarkAsRead(notification.id)}
                            >
                                <div className="flex w-full">
                                    <span className="mr-2 text-lg">{getNotificationIcon(notification.type)}</span>
                                    <div className="flex-1">
                                        <p className="text-sm">{notification.message}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        ))
                    ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
