import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { ActivityType, NotificationType } from "@prisma/client"

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

            // create a task
            const task = await ctx.db.task.create({
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
            });

            // create activity
            await ctx.db.activity.create({
                data: {
                    type: ActivityType.TASK_CREATED,
                    description: `Task "${task.title}" was created by ${ctx.session.user.name}`,
                    userId: ctx.session.user.id,
                    projectId: input.projectId,
                    taskId: task.id,
                },
            });

            // create notification for assigned user
            if (input.assignedToId) {

                // create notification for assigned user
                await ctx.db.notification.create({
                    data: {
                        type: NotificationType.TASK_ASSIGNED,
                        message: `You were assigned to task "${task.title}"`,
                        userId: input.assignedToId,
                        metadata: {
                            taskId: task.id,
                            projectId: input.projectId,
                        },
                    },
                });

                // find assigned user name by Id
                const user = await ctx.db.user.findUnique({ where: { id: input.assignedToId } });

                // create activity for task assigned to user
                await ctx.db.activity.create({
                    data: {
                        type: ActivityType.TASK_ASSIGNED,
                        description: `${ctx.session.user.name} assigned this task to ${user?.name}`,
                        userId: ctx.session.user.id,
                        projectId: input.projectId,
                        taskId: task.id,
                    }
                });
            };

            return task;
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

            // Note: if signedIn user is either project owner or admin ->  return all the tasks associated to project
            // else if signedIn user is 'Member' -> return only following tasks:
            // created by this user, or tasks assigned to this user or tagged tasks 

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
                            },
                            {
                                tags: {
                                    some: {
                                        userId: ctx.session.user.id,
                                    }
                                },
                            },
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
                taggedUserIds: z.array(z.string()).optional(),
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
                    tags: true,
                },
            })

            if (!task) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Task not found",
                })
            }

            // Check if user is a member or owner of the project
            // Note: here we are just checking if user is a project member or not, role (like Admin, Member) both are part of project
            const isOwner = task.project.ownerId === ctx.session.user.id
            const isMember = task.project.members.some((member) => member.userId === ctx.session.user.id)
            const isCreator = task.createdById === ctx.session.user.id
            const isAssignee = task.assignedToId === ctx.session.user.id

            if (!isOwner && !isMember) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You don't have access to this project",
                });
            }

            // Only admin, owner, creator, or assignee can update the task
            const isAdmin = task.project.members.some(
                (member) => member.userId === ctx.session.user.id && member.role === "ADMIN",
            )

            if (!isOwner && !isAdmin && !isCreator && !isAssignee) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You don't have permission to update this task",
                });
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

            // track changes for activity log
            const changes = [];

            if (task.title !== input.title) {
                changes.push(`title from "${task.title}" to "${input.title}"`);
            }
            if (task.description !== input?.description) {
                changes.push("description");
            }
            if (task.priority !== input.priority) {
                changes.push(`priority from "${task.priority}" to "${input.priority}"`);
            }
            if (task.status !== input.status) {
                changes.push(`status from "${task.status}" to "${input.status}"`);
            }
            if (task.deadline.toISOString() !== input.deadline.toISOString()) {
                changes.push(`deadline from "${task.deadline.toISOString()}" to "${input.deadline.toISOString()}"`);
            }
            if (task.assignedToId !== input?.assignedToId) {
                changes.push(`assignee`);
            }

            const updatedTask = await ctx.db.task.update({
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
            });

            // create activity for task update -> keeping track of all the updated information
            if (changes.length > 0) {
                await ctx.db.activity.create({
                    data: {
                        type: ActivityType.TASK_UPDATED,
                        description: `Task "${updatedTask.title}" was updated: ${changes.join(", ")}`,
                        userId: ctx.session.user.id,
                        projectId: task.projectId,
                        taskId: task.id,
                        metadata: {
                            changes,
                        },
                    },
                });
            }

            // create notification for newly assigned user
            if (input.assignedToId && input.assignedToId !== task.assignedToId) {
                await ctx.db.notification.create({
                    data: {
                        type: NotificationType.TASK_ASSIGNED,
                        message: `You were assigned to task "${updatedTask.title}"`,
                        userId: input.assignedToId,
                        metadata: {
                            taskId: task.id,
                            projectId: task.projectId,
                        },
                    },
                });

                // find assigned user name by Id
                const user = await ctx.db.user.findUnique({ where: { id: input.assignedToId } });

                // create activity for task assigned to user
                await ctx.db.activity.create({
                    data: {
                        type: ActivityType.TASK_ASSIGNED,
                        description: `${ctx.session.user.name} assigned this task to ${user?.name}`,
                        userId: ctx.session.user.id,
                        projectId: task.projectId,
                        taskId: task.id,
                    }
                });
            }
            
            // handle tagged users
            if (input.taggedUserIds && input.taggedUserIds.length > 0) {

                // get current tags
                const currentTaggedUserIds = task.tags.map((tag) => tag.userId);

                // find new users to tag
                const newTaggedUserIds = input.taggedUserIds.filter((userId) => !currentTaggedUserIds.includes(userId));

                // find users to untag
                const userIdsToRemove = currentTaggedUserIds.filter((userId) => !input?.taggedUserIds?.includes(userId));

                // validate that all new tagged users are members of the project
                const validNewTaggedUserIds = newTaggedUserIds.filter(
                    (userId) =>
                        userId === task.project.ownerId || task.project.members.some((member) => member.userId === userId),
                )

                // remove tags for users no longer tagged
                if (userIdsToRemove.length > 0) {
                    // to delete multiple users either user Promise.all or deleteMany
                    await ctx.db.taskTag.deleteMany({
                        where: {
                            taskId: task.id,
                            userId: {
                                in: userIdsToRemove,
                            },
                        },
                    });
                }

                // add new tags
                await Promise.all(
                    validNewTaggedUserIds.map(async (userId) => {

                        // do not tag the creator or assignee again

                        if (userId !== task.createdById && userId !== input.assignedToId) {

                            // entry in tasktag table
                            await ctx.db.taskTag.create({
                                data: {
                                    taskId: task.id,
                                    userId,
                                },
                            });

                            // create notification for tagged user
                            await ctx.db.notification.create({
                                data: {
                                    type: NotificationType.TASK_TAGGED,
                                    message: `You were tagged in task "${updatedTask.title}"`,
                                    userId,
                                    metadata: {
                                        taskId: task.id,
                                        projectId: task.projectId,
                                    },
                                },
                            });

                            const userInfo = await ctx.db.user.findUnique({
                                where: { id: userId }
                            });

                            // create activity for tagging
                            await ctx.db.activity.create({
                                data: {
                                    type: ActivityType.TASK_TAGGED,
                                    description: `${ctx.session.user.name} tagged ${userInfo?.name}`,
                                    userId: ctx.session.user.id,
                                    projectId: task.projectId,
                                    taskId: task.id,
                                    metadata: {
                                        taggedUserId: userId,
                                    },
                                },
                            });
                        }
                    }),
                );
            };

            return await ctx.db.task.findUnique({
                where: {
                    id: task.id,
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
            });

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

            // update the task status
            const updatedTask = ctx.db.task.update({
                where: {
                    id: input.taskId,
                },
                data: {
                    status: input.status,
                },
            });

            // create activity
            await ctx.db.activity.create({
                data: {
                    type: ActivityType.TASK_STATUS_CHANGED,
                    description: `Task "${task.title}" status changed from "${task.status}" to "${input.status}" by ${ctx.session.user.name}`,
                    userId: ctx.session.user.id,
                    projectId: task.projectId,
                    taskId: task.id,
                    metadata: {
                        oldStatus: task.status,
                        newStatus: input.status,
                    },
                },
            });

            return updatedTask;
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

        // create activity
        await ctx.db.activity.create({
            data: {
                type: ActivityType.TASK_DELETED,
                description: `Task "${task.title}" was deleted`,
                userId: ctx.session.user.id,
                projectId: task.projectId,
                metadata: {
                    taskId: task.id,
                    taskTitle: task.title,
                },
            },
        });

        // delete task
        return ctx.db.task.delete({
            where: {
                id: input.taskId,
            },
        });
    }),

    getTaskActivities: protectedProcedure.input(z.object({ taskId: z.string() })).query(async ({ ctx, input }) => {
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
        });

        if (!task) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Task not found",
            });
        }

        // check if user is a member or owner of the project
        const isOwner = task.project.ownerId === ctx.session.user.id;
        const isMember = task.project.members.some((member) => member.userId === ctx.session.user.id);

        if (!isOwner && !isMember) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "You don't have access to this task",
            });
        }

        return ctx.db.activity.findMany({
            where: {
                taskId: input.taskId,
            },
            include: {
                user: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }),

})
