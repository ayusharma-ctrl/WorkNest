import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"

export const notificationRouter = createTRPCRouter({
    // get
    getMyNotifications: protectedProcedure
        .query(async ({ ctx }) => {
            return ctx.db.notification.findMany({
                where: {
                    userId: ctx.session.user.id,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
        }),

    // get
    getUnreadCount: protectedProcedure
        .query(async ({ ctx }) => {
            return ctx.db.notification.count({
                where: {
                    userId: ctx.session.user.id,
                    isRead: false,
                },
            });
        }),

    // update
    markAsRead: protectedProcedure
        .input(z.object({ notificationId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const notification = await ctx.db.notification.findUnique({
                where: {
                    id: input.notificationId,
                },
            });

            if (!notification) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Notification not found",
                });
            }

            if (notification.userId !== ctx.session.user.id) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You don't have permission to mark this notification as read",
                });
            }

            return ctx.db.notification.update({
                where: {
                    id: input.notificationId,
                },
                data: {
                    isRead: true,
                },
            });
        }),

    // update
    markAllAsRead: protectedProcedure
        .mutation(async ({ ctx }) => {
            return ctx.db.notification.updateMany({
                where: {
                    userId: ctx.session.user.id,
                    isRead: false,
                },
                data: {
                    isRead: true,
                },
            });
        }),
})
