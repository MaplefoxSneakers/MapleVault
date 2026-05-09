import { z } from "zod";
import { zid } from "convex-helpers/server/zod4";
import { guestQuery, memberMutation } from "./customFunctions";

export const CollectionInsert = z.object({
    name: z.string(),
    cover: z.array(z.string()).optional(),
    sneakers: z.array(zid("sneakers")).optional(),
});
export const CollectionUpdate = CollectionInsert.partial().extend({ _id: zid("collections") });
export const CollectionRemove = z.object({ _id: zid("collections") });

export const get = guestQuery({
    args: {},
    handler: async ctx => {
        return await ctx.db.query("collections").collect();
    },
});

export const insert = memberMutation({
    args: CollectionInsert,
    handler: async (ctx, args) => {
        await ctx.db.insert("collections", {
            name: args.name,
            cover: args.cover || [],
            sneakers: args.sneakers || [],
        });
        return { success: true };
    },
});

export const update = memberMutation({
    args: CollectionUpdate,
    handler: async (ctx, args) => {
        const { _id, ...patch } = args;
        await ctx.db.patch(_id, patch);
        return { success: true };
    },
});

export const remove = memberMutation({
    args: CollectionRemove,
    handler: async (ctx, args) => {
        await ctx.db.delete(args._id);
        return { success: true };
    },
});
