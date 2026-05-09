import { z } from "zod";
import { zid } from "convex-helpers/server/zod4";
import { adminMutation, guestQuery } from "./customFunctions";

export const LocationInsert = z.object({
    name: z.string(),
});
export const LocationUpdate = LocationInsert.partial().extend({ _id: zid("locations") });
export const LocationRemove = z.object({ _id: zid("locations") });

export const get = guestQuery({
    args: {},
    handler: async ctx => {
        return await ctx.db.query("locations").collect();
    },
});

export const insert = adminMutation({
    args: LocationInsert,
    handler: async (ctx, args) => {
        await ctx.db.insert("locations", args);
        return { success: true };
    },
});

export const update = adminMutation({
    args: LocationUpdate,
    handler: async (ctx, args) => {
        const { _id, ...rest } = args;
        await ctx.db.patch(args._id, rest);
        return { success: true };
    },
});

export const remove = adminMutation({
    args: LocationRemove,
    handler: async (ctx, args) => {
        await ctx.db.delete(args._id);
        return { success: true };
    },
});
