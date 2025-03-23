import { CheckCircle, Clock, Users, BarChart4, Calendar, Tag, LayoutDashboard, ListTodo, Settings, Inbox } from "lucide-react";
import { type ProjectStatus } from "@prisma/client";

export const features = [
    {
        icon: CheckCircle,
        title: "Task Management",
        description:
            "Create, assign, and track tasks with ease. Set priorities and deadlines to keep your team on track.",
    },
    {
        icon: Users,
        title: "Team Collaboration",
        description: "Invite team members, assign roles, and collaborate seamlessly on projects.",
    },
    {
        icon: BarChart4,
        title: "Visual Dashboard",
        description: "Get a comprehensive overview of your projects with visual summaries and progress tracking.",
    },
    {
        icon: Clock,
        title: "Deadline Tracking",
        description: "Never miss a deadline with our intuitive deadline tracking and reminder system.",
    },
    {
        icon: Calendar,
        title: "Project Timeline",
        description: "Visualize your project timeline and track progress against milestones.",
    },
    {
        icon: Tag,
        title: "Custom Tags",
        description: "Organize tasks with custom tags and filters to find what you need quickly.",
    },
];

export const testimonials = [
    {
        quote: "WorkNest has transformed how our team collaborates. We've reduced project delivery time by 30%.",
        author: "Sarah Johnson",
        role: "Product Manager, TechCorp",
        avatar: "/placeholder.svg?height=40&width=40",
    },
    {
        quote: "The intuitive interface and powerful features make project management a breeze. Highly recommended!",
        author: "Michael Chen",
        role: "CTO, StartupX",
        avatar: "/placeholder.svg?height=40&width=40",
    },
    {
        quote:
            "We've tried many project management tools, but WorkNest is by far the most user-friendly.",
        author: "Emily Rodriguez",
        role: "Team Lead, DesignHub",
        avatar: "/placeholder.svg?height=40&width=40",
    },
];

export const navItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Projects",
        href: "/dashboard/projects",
        icon: ListTodo,
    },
    {
        title: "Invitations",
        href: "/dashboard/invitations",
        icon: Inbox,
    },
    // {
    //     title: "Team",
    //     href: "/dashboard/team",
    //     icon: Users,
    // },
    {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
    },
];

export const statuses: { id: ProjectStatus; name: string }[] = [
    { id: "BACKLOG", name: "Backlog" },
    { id: "TODO", name: "To Do" },
    { id: "IN_PROGRESS", name: "In Progress" },
    { id: "DONE", name: "Done" },
];

// helper function to pick css based on task priority
export const getPriorityColor = (priority: string) => {
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

// helper function to get activity type icon based on type
export const getActivityIcon = (type: string) => {
    switch (type) {
        case "TASK_CREATED":
            return "🆕"
        case "TASK_UPDATED":
            return "✏️"
        case "TASK_DELETED":
            return "🗑️"
        case "TASK_STATUS_CHANGED":
            return "🔄"
        case "TASK_ASSIGNED":
            return "👤"
        case "TASK_TAGGED":
            return "🏷️"
        default:
            return "📝"
    }
}

// helper function to get notification type icon based on type
export const getNotificationIcon = (type: string) => {
    switch (type) {
        case "TASK_ASSIGNED":
            return "🎯"
        case "TASK_TAGGED":
            return "🏷️"
        case "INVITATION_RECEIVED":
            return "✉️"
        case "INVITATION_ACCEPTED":
            return "✅"
        case "TASK_DUE_SOON":
            return "⏰"
        default:
            return "📢"
    }
}
