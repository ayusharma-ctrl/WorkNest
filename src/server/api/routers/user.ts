import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";

export const userRouter = createTRPCRouter({

    getUserInfo: protectedProcedure.query(async ({ ctx }) => {
        const userInfo = await ctx.db.user.findUnique({
            where: { id: ctx.session.user.id }
        });
        return userInfo;
    }),

    // create: protectedProcedure
    //   .input(z.object({ name: z.string().min(1) }))
    //   .mutation(async ({ ctx, input }) => {
    //     return ctx.db.post.create({
    //       data: {
    //         name: input.name,
    //         createdBy: { connect: { id: ctx.session.user.id } },
    //       },
    //     });
    //   }),

    // getLatest: protectedProcedure.query(async ({ ctx }) => {
    //   const post = await ctx.db.post.findFirst({
    //     orderBy: { createdAt: "desc" },
    //     where: { createdBy: { id: ctx.session.user.id } },
    //   });

    //   return post ?? null;
    // }),
});
