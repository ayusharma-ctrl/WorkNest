import { type Task, type ProjectMember, type User, type Invitation, type Project } from "@prisma/client"

export interface ProjectPageProps {
    params: Promise<{ projectId: string }>;
}

interface Members extends ProjectMember {
    user: User
}

interface TaskWithUser extends Task {
    assignedTo?: User | null;
    createdBy?: User | null;
}

export interface TaskBoardProps {
    projectId: string;
    tasks: TaskWithUser[];
    members: Members[];
    isAdmin: boolean;
}

export interface AddTaskDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    projectId: string
    members: Members[]
    onTaskCreated: (task: Task) => void
}

export interface EditTaskDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    task: Task
    projectId: string
    members: Members[]
    onUpdate: (task: Task) => void
}

export interface TaskCardProps {
    task: TaskWithUser
    projectId: string
    members: Members[]
    isAdmin: boolean
    onDelete: (taskId: string) => void
    onUpdate: (task: Task) => void
}

export interface ProjectCardProps {
    project: {
        id: string
        name: string
        description: string | null
        updatedAt: Date
        owner: {
            name: string | null
            image: string | null
        }
    }
    taskCount: number
    memberCount: number
}

interface IInvitationList extends Invitation {
    project: Project;
    inviter: User;
}

export interface InvitationsListProps {
    invitations: IInvitationList[]
}

export interface DashboardHeaderProps {
    heading: string
    text?: string
    children?: React.ReactNode
}