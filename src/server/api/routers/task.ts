import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"

export const taskRouter = createTRPCRouter({
    create: protectedProcedure
        .input(
            z.object({
                projectId: z.string(),
                title: z.string().min(2).max(100),
                description: z.string().max(500).optional(),
                priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
                status: z.enum(["TODO", "IN_PROGRESS", "DONE", "BACKLOG"]),
                deadline: z.date(),
                assignedToId: z.string().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            // Check if the project exists and user has access
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

            // Check if user is a member or owner of the project
            const isOwner = project.ownerId === ctx.session.user.id
            const isMember = project.members.some((member) => member.userId === ctx.session.user.id)

            if (!isOwner && !isMember) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You don't have access to this project",
                })
            }

            // If assignedToId is provided, check if the user is a member of the project
            if (input.assignedToId) {
                const isAssigneeValid =
                    input.assignedToId === project.ownerId ||
                    project.members.some((member) => member.userId === input.assignedToId)

                if (!isAssigneeValid) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Assigned user is not a member of this project",
                    })
                }
            }

            return ctx.db.task.create({
                data: {
                    title: input.title,
                    description: input.description,
                    priority: input.priority,
                    status: input.status,
                    deadline: input.deadline,
                    projectId: input.projectId,
                    createdById: ctx.session.user.id,
                    assignedToId: input.assignedToId ?? null,
                },
                include: {
                    assignedTo: true,
                    createdBy: true,
                },
            })
        }),

    getByProject: protectedProcedure
        .input(z.object({ projectId: z.string() }))
        .query(async ({ ctx, input }) => {
            // Check if the project exists and user has access
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

            // Check if user is a member or owner of the project
            const isOwner = project.ownerId === ctx.session.user.id
            const isMember = project.members.some((member) => member.userId === ctx.session.user.id)
            const isAdmin = project.members.some((member) => member.userId === ctx.session.user.id && member.role === 'ADMIN');

            if (!isOwner && !isMember && !isAdmin) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You don't have access to this project",
                })
            }

            if (isAdmin || isOwner) {
                return await ctx.db.task.findMany({
                    where: {
                        projectId: input.projectId,
                    },
                    include: {
                        assignedTo: true,
                        createdBy: true,
                        tags: {
                            include: {
                                user: true,
                            },
                        },
                    },
                    orderBy: {
                        updatedAt: "desc",
                    },
                });
            } else {
                return await ctx.db.task.findMany({
                    where: {
                        projectId: input.projectId,
                        OR: [
                            {
                                assignedToId: ctx.session.user.id,
                            },
                            {
                                createdById: ctx.session.user.id,
                            }
                        ]
                    },
                    include: {
                        assignedTo: true,
                        createdBy: true,
                        tags: {
                            include: {
                                user: true,
                            },
                        },
                    },
                    orderBy: {
                        updatedAt: "desc",
                    },
                });
            }
        }),

    update: protectedProcedure
        .input(
            z.object({
                taskId: z.string(),
                title: z.string().min(2).max(100),
                description: z.string().max(500).optional(),
                priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
                status: z.enum(["TODO", "IN_PROGRESS", "DONE", "BACKLOG"]),
                deadline: z.date(),
                assignedToId: z.string().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const task = await ctx.db.task.findUnique({
                where: {
                    id: input.taskId,
                },
                include: {
                    project: {
                        include: {
                            members: true,
                        },
                    },
                },
            })

            if (!task) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Task not found",
                })
            }

            // Check if user is a member or owner of the project
            const isOwner = task.project.ownerId === ctx.session.user.id
            const isMember = task.project.members.some((member) => member.userId === ctx.session.user.id)
            const isCreator = task.createdById === ctx.session.user.id
            const isAssignee = task.assignedToId === ctx.session.user.id

            if (!isOwner && !isMember) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You don't have access to this project",
                })
            }

            // Only admin, owner, creator, or assignee can update the task
            const isAdmin = task.project.members.some(
                (member) => member.userId === ctx.session.user.id && member.role === "ADMIN",
            )

            if (!isOwner && !isAdmin && !isCreator && !isAssignee) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You don't have permission to update this task",
                })
            }

            // If assignedToId is provided, check if the user is a member of the project
            if (input.assignedToId) {
                const isAssigneeValid =
                    input.assignedToId === task.project.ownerId ||
                    task.project.members.some((member) => member.userId === input.assignedToId)

                if (!isAssigneeValid) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Assigned user is not a member of this project",
                    })
                }
            }

            return ctx.db.task.update({
                where: {
                    id: input.taskId,
                },
                data: {
                    title: input.title,
                    description: input.description,
                    priority: input.priority,
                    status: input.status,
                    deadline: input.deadline,
                    assignedToId: input.assignedToId ?? null,
                },
                include: {
                    assignedTo: true,
                    createdBy: true,
                },
            })
        }),

    updateStatus: protectedProcedure
        .input(
            z.object({
                taskId: z.string(),
                status: z.enum(["TODO", "IN_PROGRESS", "DONE", "BACKLOG"]),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const task = await ctx.db.task.findUnique({
                where: {
                    id: input.taskId,
                },
                include: {
                    project: {
                        include: {
                            members: true,
                        },
                    },
                },
            })

            if (!task) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Task not found",
                })
            }

            // Check if user is a member or owner of the project
            const isOwner = task.project.ownerId === ctx.session.user.id
            const isMember = task.project.members.some((member) => member.userId === ctx.session.user.id)

            if (!isOwner && !isMember) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You don't have access to this project",
                })
            }

            return ctx.db.task.update({
                where: {
                    id: input.taskId,
                },
                data: {
                    status: input.status,
                },
            })
        }),

    delete: protectedProcedure.input(z.object({ taskId: z.string() })).mutation(async ({ ctx, input }) => {
        const task = await ctx.db.task.findUnique({
            where: {
                id: input.taskId,
            },
            include: {
                project: {
                    include: {
                        members: true,
                    },
                },
            },
        })

        if (!task) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Task not found",
            })
        }

        // Check permissions
        const isOwner = task.project.ownerId === ctx.session.user.id
        const isAdmin = task.project.members.some(
            (member) => member.userId === ctx.session.user.id && member.role === "ADMIN",
        )
        const isCreator = task.createdById === ctx.session.user.id

        if (!isOwner && !isAdmin && !isCreator) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "You don't have permission to delete this task",
            })
        }

        return ctx.db.task.delete({
            where: {
                id: input.taskId,
            },
        })
    }),
})
