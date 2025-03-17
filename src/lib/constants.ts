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