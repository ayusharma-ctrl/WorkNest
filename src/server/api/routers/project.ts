import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"

export const projectRouter = createTRPCRouter({
    create: protectedProcedure
        .input(
            z.object({
                name: z.string().min(2).max(50),
                description: z.string().max(500).optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const project = await ctx.db.project.create({
                data: {
                    name: input.name,
                    description: input.description,
                    ownerId: ctx.session.user.id,
                },
            });

            await ctx.db.projectMember.create({
                data: {
                    projectId: project.id,
                    userId: ctx.session.user.id,
                    role: "ADMIN"
                }
            });

            return project;
        }),

    getAll: protectedProcedure.query(async ({ ctx }) => {
        return ctx.db.project.findMany({
            where: {
                OR: [
                    { ownerId: ctx.session.user.id },
                    {
                        members: {
                            some: {
                                userId: ctx.session.user.id,
                            },
                        },
                    },
                ],
            },
            include: {
                owner: true,
                members: {
                    include: {
                        user: true,
                    },
                },
                _count: {
                    select: {
                        tasks: true,
                        members: true,
                    },
                },
            },
            orderBy: {
                updatedAt: "desc",
            },
        })
    }),

    getById: protectedProcedure.input(z.object({ projectId: z.string() })).query(async ({ ctx, input }) => {
        const project = await ctx.db.project.findUnique({
            where: {
                id: input.projectId,
            },
            include: {
                owner: true,
                members: {
                    include: {
                        user: true,
                    },
                },
            },
        })

        if (!project) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Project not found",
            })
        }

        // Check if user is a member or owner of the project
        const isOwner = project.ownerId === ctx.session.user.id
        const isMember = project.members.some((member) => member.userId === ctx.session.user.id)

        if (!isOwner && !isMember) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "You don't have access to this project",
            })
        }

        return project
    }),

    update: protectedProcedure
        .input(
            z.object({
                projectId: z.string(),
                name: z.string().min(2).max(50),
                description: z.string().max(500).optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const project = await ctx.db.project.findUnique({
                where: {
                    id: input.projectId,
                },
                include: {
                    members: true,
                },
            })

            if (!project) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Project not found",
                })
            }

            // Check if user is an admin or owner
            const isOwner = project.ownerId === ctx.session.user.id
            const isAdmin = project.members.some((member) => member.userId === ctx.session.user.id && member.role === "ADMIN")

            if (!isOwner && !isAdmin) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You don't have permission to update this project",
                })
            }

            return ctx.db.project.update({
                where: {
                    id: input.projectId,
                },
                data: {
                    name: input.name,
                    description: input.description,
                },
            })
        }),

    delete: protectedProcedure.input(z.object({ projectId: z.string() })).mutation(async ({ ctx, input }) => {
        const project = await ctx.db.project.findUnique({
            where: {
                id: input.projectId,
            },
        })

        if (!project) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Project not found",
            })
        }

        // Only the owner can delete a project
        if (project.ownerId !== ctx.session.user.id) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "Only the project owner can delete the project",
            })
        }

        return ctx.db.project.delete({
            where: {
                id: input.projectId,
            },
        })
    }),

    inviteMember: protectedProcedure
        .input(
            z.object({
                projectId: z.string(),
                email: z.string().email(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const project = await ctx.db.project.findUnique({
                where: {
                    id: input.projectId,
                },
                include: {
                    members: true,
                },
            })

            if (!project) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Project not found",
                })
            }

            // Check if user is an admin or owner
            const isOwner = project.ownerId === ctx.session.user.id
            const isAdmin = project.members.some((member) => member.userId === ctx.session.user.id && member.role === "ADMIN")

            if (!isOwner && !isAdmin) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You don't have permission to invite members",
                })
            }

            // Check if the email is already a member
            const user = await ctx.db.user.findUnique({
                where: {
                    email: input.email,
                },
            })

            if (user) {
                const isMember = project.members.some((member) => member.userId === user.id)

                if (isMember) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "This user is already a member of the project",
                    })
                }

                if (project.ownerId === user.id) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "This user is the owner of the project",
                    })
                }
            }

            // Check if there's already a pending invitation
            const existingInvitation = await ctx.db.invitation.findUnique({
                where: {
                    projectId_email: {
                        projectId: input.projectId,
                        email: input.email,
                    },
                },
            })

            if (existingInvitation && existingInvitation.status === "PENDING") {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "An invitation has already been sent to this email",
                })
            }

            // Create or update the invitation
            return ctx.db.invitation.upsert({
                where: {
                    projectId_email: {
                        projectId: input.projectId,
                        email: input.email,
                    },
                },
                update: {
                    status: "PENDING",
                    inviterId: ctx.session.user.id,
                },
                create: {
                    projectId: input.projectId,
                    email: input.email,
                    inviterId: ctx.session.user.id,
                },
            })
        }),

    updateMemberRole: protectedProcedure
        .input(
            z.object({
                projectId: z.string(),
                userId: z.string(),
                role: z.enum(["ADMIN", "MEMBER"]),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const project = await ctx.db.project.findUnique({
                where: {
                    id: input.projectId,
                },
                include: {
                    members: true,
                },
            })

            if (!project) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Project not found",
                });
            }

            // Check if user is an admin or owner
            const isOwner = project.ownerId === ctx.session.user.id
            const isAdmin = project.members.some((member) => member.userId === ctx.session.user.id && member.role === "ADMIN")

            if (!isOwner && !isAdmin) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You don't have permission to update member roles",
                });
            }

            // Check if the member exists
            const memberExists = project.members.some((member) => member.userId === input.userId);

            if (!memberExists) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Member not found in this project",
                });
            }

            return ctx.db.projectMember.update({
                where: {
                    projectId_userId: {
                        projectId: input.projectId,
                        userId: input.userId,
                    },
                },
                data: {
                    role: input.role,
                },
            });
        }),

    removeMember: protectedProcedure
        .input(
            z.object({
                projectId: z.string(),
                userId: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const project = await ctx.db.project.findUnique({
                where: {
                    id: input.projectId,
                },
                include: {
                    members: true,
                },
            })

            if (!project) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Project not found",
                })
            }

            // Check if user is an admin or owner
            const isOwner = project.ownerId === ctx.session.user.id
            const isAdmin = project.members.some((member) => member.userId === ctx.session.user.id && member.role === "ADMIN")

            if (!isOwner && !isAdmin) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You don't have permission to remove members",
                })
            }

            // Cannot remove the owner
            if (input.userId === project.ownerId) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Cannot remove the project owner",
                })
            }

            return ctx.db.projectMember.delete({
                where: {
                    projectId_userId: {
                        projectId: input.projectId,
                        userId: input.userId,
                    },
                },
            })
        }),
})
