import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({

    getSession: protectedProcedure.query(({ ctx }) => {
        return ctx.session
    }),

    getUserInfo: protectedProcedure.query(async ({ ctx }) => {
        const userInfo = await ctx.db.user.findUnique({
            where: { id: ctx.session.user.id }
        });
        return userInfo;
    }),

    getPreferences: protectedProcedure.query(async ({ ctx }) => {
        const user = await ctx.db.user.findUnique({
            where: {
                id: ctx.session.user.id,
            },
            select: {
                preferences: true,
            },
        });

        if (!user) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Task not found",
            });
        }

        return (user?.preferences as { darkMode?: boolean }) || {};
    }),

    updatePreferences: protectedProcedure
        .input(
            z.object({
                preferences: z
                    .object({
                        darkMode: z.boolean().optional(),
                    })
                    .optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const user = await ctx.db.user.findUnique({
                where: {
                    id: ctx.session.user.id,
                },
                select: {
                    preferences: true,
                },
            })

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                })
            }

            // Merge existing preferences with new ones
            const currentPreferences = (user.preferences as Record<string, unknown>) || {}
            const updatedPreferences = {
                ...currentPreferences,
                ...input.preferences,
            }

            return ctx.db.user.update({
                where: {
                    id: ctx.session.user.id,
                },
                data: {
                    preferences: updatedPreferences,
                },
            })
        }),

});
