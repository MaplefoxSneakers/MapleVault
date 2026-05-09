import { v } from "convex/values";
import { zCustomMutation, zCustomQuery } from "convex-helpers/server/zod4";
import { mutation, query } from "@db/server";
import type { Doc } from "@db/dataModel";

type AuthRole = Doc<"users">["role"];

const AUTH_ARGS = {
    signature: v.string(),
    timestamp: v.number(),
    authRole: v.union(v.literal("guest"), v.literal("member"), v.literal("admin")),
};
const ROLE_PRIORITY: Record<AuthRole, number> = {
    guest: 0,
    member: 1,
    admin: 2,
};

async function validateAuthInput(args: { signature: string; timestamp: number; authRole: AuthRole }, minimumRole: AuthRole) {
    const now = Date.now();
    if (Math.abs(now - args.timestamp) > 60_000) throw new Error("Unauthorized: Request expired");

    const encoder = new TextEncoder();
    const data = encoder.encode(`${process.env.CONVEX_SERVER_SECRET}:${args.timestamp}:${args.authRole}`);

    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const expectedSignature = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

    if (args.signature !== expectedSignature) throw new Error("Unauthorized: Invalid signature");

    if (ROLE_PRIORITY[args.authRole] < ROLE_PRIORITY[minimumRole]) throw new Error("Forbidden: Insufficient role");
}

export const guestQuery = zCustomQuery(query, {
    args: AUTH_ARGS,
    input: async (ctx, args) => {
        if (!(await ctx.db.query("configs").first())?.publicPage) await validateAuthInput(args, "guest");

        return { ctx, args: {} };
    },
});

export const memberQuery = zCustomQuery(query, {
    args: AUTH_ARGS,
    input: async (ctx, args) => {
        await validateAuthInput(args, "member");
        return { ctx, args: {} };
    },
});

export const adminQuery = zCustomQuery(query, {
    args: AUTH_ARGS,
    input: async (ctx, args) => {
        await validateAuthInput(args, "admin");
        return { ctx, args: {} };
    },
});

export const guestMutation = zCustomMutation(mutation, {
    args: AUTH_ARGS,
    input: async (ctx, args) => {
        if (!(await ctx.db.query("configs").first())?.publicPage) await validateAuthInput(args, "guest");

        return { ctx, args: {} };
    },
});

export const memberMutation = zCustomMutation(mutation, {
    args: AUTH_ARGS,
    input: async (ctx, args) => {
        await validateAuthInput(args, "member");
        return { ctx, args: {} };
    },
});

export const adminMutation = zCustomMutation(mutation, {
    args: AUTH_ARGS,
    input: async (ctx, args) => {
        await validateAuthInput(args, "admin");
        return { ctx, args: {} };
    },
});
