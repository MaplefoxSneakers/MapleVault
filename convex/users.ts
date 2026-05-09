import { z } from "zod";
import { zid } from "convex-helpers/server/zod4";
import { adminMutation, adminQuery, guestMutation, guestQuery } from "./customFunctions";
import type { MutationCtx } from "@db/server";

export const UserInsert = z.object({
    username: z.string(),
    passwordHash: z.string(),
    role: z.union([z.literal("guest"), z.literal("member"), z.literal("admin")]),
    color: z.string(),
    active: z.boolean(),
});
export const UserUpdate = UserInsert.partial().extend({ _id: zid("users") });
export const UserUpdateSelf = UserUpdate.pick({ _id: true, username: true, passwordHash: true, color: true });
export const UserRemove = z.object({ _id: zid("users") });

async function assertUsernameAvailable(ctx: MutationCtx, username: string, ignoreId?: string) {
    if (!username) return false;

    const existing = await ctx.db
        .query("users")
        .withIndex("by_username", q => q.eq("username", username))
        .first();

    if (existing && existing._id !== ignoreId) return false;

    return true;
}

export const get = adminQuery({
    args: {},
    handler: async ctx => {
        return await ctx.db.query("users").collect();
    },
});

export const getOwners = guestQuery({
    args: {},
    handler: async ctx => {
        return await ctx.db
            .query("users")
            .filter(q => q.eq(q.field("role"), "member") || q.eq(q.field("role"), "admin"))
            .collect();
    },
});

export const getByUsername = guestQuery({
    args: { username: z.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .filter(q => q.and(q.eq(q.field("username"), args.username), q.eq(q.field("active"), true)))
            .first();
    },
});

export const insert = adminMutation({
    args: UserInsert,
    handler: async (ctx, args) => {
        if (!(await assertUsernameAvailable(ctx, args.username))) return { success: false, error: "Username is already taken" };

        await ctx.db.insert("users", args);
        return { success: true };
    },
});

export const update = adminMutation({
    args: UserUpdate,
    handler: performUpdateOperations,
});

export const updateSelf = guestMutation({
    args: UserUpdateSelf,
    handler: performUpdateOperations,
});

async function performUpdateOperations(ctx: MutationCtx, args: z.infer<typeof UserUpdateSelf>) {
    const { _id, ...rest } = args;
    if (rest.username && !(await assertUsernameAvailable(ctx, rest.username, _id))) return { success: false, error: "Username is already taken" };

    await ctx.db.patch(args._id, rest);
    return { success: true };
}

export const remove = adminMutation({
    args: { _id: zid("users") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args._id);
        return { success: true };
    },
});
