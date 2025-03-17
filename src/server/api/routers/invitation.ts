import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"

export const invitationRouter = createTRPCRouter({
    getPending: protectedProcedure.query(async ({ ctx }) => {
        return ctx.db.invitation.findMany({
            where: {
                email: ctx.session.user.email ?? "",
                status: "PENDING",
            },
            include: {
                project: true,
                inviter: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }),

    accept: protectedProcedure.input(z.object({ invitationId: z.string() })).mutation(async ({ ctx, input }) => {
        const invitation = await ctx.db.invitation.findUnique({
            where: {
                id: input.invitationId,
            },
            include: {
                project: true,
            },
        });

        if (!invitation) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Invitation not found",
            });
        }

        if (invitation.email !== ctx.session.user.email) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "This invitation is not for you",
            });
        }

        if (invitation.status !== "PENDING") {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "This invitation is no longer pending",
            });
        }

        // Update invitation status
        const updatedInvitation = await ctx.db.invitation.update({
            where: {
                id: input.invitationId,
            },
            data: {
                status: "ACCEPTED",
            },
        });

        // Add user to project members
        await ctx.db.projectMember.create({
            data: {
                projectId: invitation.projectId,
                userId: ctx.session.user.id,
                role: "MEMBER",
            },
        });

        return updatedInvitation
    }),

    decline: protectedProcedure.input(z.object({ invitationId: z.string() })).mutation(async ({ ctx, input }) => {
        const invitation = await ctx.db.invitation.findUnique({
            where: {
                id: input.invitationId,
            },
        });

        if (!invitation) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Invitation not found",
            });
        }

        if (invitation.email !== ctx.session.user.email) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "This invitation is not for you",
            });
        }

        if (invitation.status !== "PENDING") {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "This invitation is no longer pending",
            });
        }

        return ctx.db.invitation.update({
            where: {
                id: input.invitationId,
            },
            data: {
                status: "REVOKED",
            },
        })
    }),
});
