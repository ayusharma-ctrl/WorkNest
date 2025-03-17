"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { MoreHorizontal, Shield, User2, UserX } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { api } from "@/trpc/react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { type User, type ProjectMember} from "@prisma/client"


interface Members extends ProjectMember {
    user?: User
}

interface MembersListProps {
    projectId: string
    members: Members[]
    owner: User
    currentUserId: string
    isAdmin: boolean
}

export function MembersList({ projectId, members: initialMembers, owner, currentUserId, isAdmin }: MembersListProps) {
    const [members, setMembers] = useState(initialMembers);
    const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

    const updateMemberRole = api.project.updateMemberRole.useMutation({
        onSuccess: (data) => {
            toast.success("Role updated", {
                description: "Member role has been updated successfully.",
            });

            // Update the members list
            setMembers(members.map((member) => (member.userId === data.userId ? data : member)));
        },
        onError: (error) => {
            toast.error("Error", {
                description: error.message ?? "Failed to update member role. Please try again.",
            });
        },
    });

    const removeMember = api.project.removeMember.useMutation({
        onSuccess: () => {
            toast("Member removed", {
                description: "Member has been removed from the project.",
            });

            // Update the members list
            setMembers(members.filter((member) => member.userId !== memberToRemove));
            setMemberToRemove(null);
        },
        onError: (error) => {
            toast("Error", {
                description: error.message || "Failed to remove member. Please try again.",
            });
            setMemberToRemove(null);
        },
    });

    const handleRoleChange = (userId: string, newRole: "ADMIN" | "MEMBER") => {
        updateMemberRole.mutate({
            projectId,
            userId,
            role: newRole,
        });
    }

    const handleRemoveMember = () => {
        if (memberToRemove) {
            removeMember.mutate({
                projectId,
                userId: memberToRemove,
            });
        }
    }

    return (
        <>
            <div className="mt-6 space-y-8">
                <div>
                    <h3 className="text-lg font-medium mb-4">Project Owner</h3>
                    <div className="flex items-center p-4 rounded-lg border">
                        <Avatar className="h-10 w-10 mr-4">
                            <AvatarImage src={owner.image ?? ""} alt={owner.name ?? "User"} />
                            <AvatarFallback>{owner.name?.charAt(0) ?? "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="font-medium">{owner.name}</div>
                            <div className="text-sm text-muted-foreground">{owner.email}</div>
                        </div>
                        <Badge className="bg-amber-600 hover:bg-amber-700">Owner</Badge>
                    </div>
                </div>

                {members.length > 0 && (
                    <div>
                        <h3 className="text-lg font-medium mb-4">Team Members</h3>
                        <div className="space-y-4">
                            {members.map((member) => (
                                <div key={member.id} className="flex items-center p-4 rounded-lg border">
                                    <Avatar className="h-10 w-10 mr-4">
                                        <AvatarImage src={member?.user?.image ?? ""} alt={member?.user?.name ?? "User"} />
                                        <AvatarFallback>{member?.user?.name?.charAt(0) ?? "U"}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="font-medium">{member?.user?.name}</div>
                                        <div className="text-sm text-muted-foreground">{member?.user?.email}</div>
                                        <div className="text-xs text-muted-foreground">
                                            Joined {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
                                        </div>
                                    </div>
                                    <Badge className={member.role === "ADMIN" ? "bg-blue-600 hover:bg-blue-700" : ""}>
                                        {member.role}
                                    </Badge>

                                    {isAdmin && member.userId !== currentUserId && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 ml-2">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {member.role === "MEMBER" ? (
                                                    <DropdownMenuItem onClick={() => handleRoleChange(member.userId, "ADMIN")}>
                                                        <Shield className="mr-2 h-4 w-4" />
                                                        Make Admin
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem onClick={() => handleRoleChange(member.userId, "MEMBER")}>
                                                        <User2 className="mr-2 h-4 w-4" />
                                                        Make Member
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600"
                                                    onClick={() => setMemberToRemove(member.userId)}
                                                >
                                                    <UserX className="mr-2 h-4 w-4" />
                                                    Remove Member
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <AlertDialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove the member from the project. They will no longer have access to this project.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRemoveMember} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
                            <UserX className="mr-2 h-4 w-4" />
                            Remove Member
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}