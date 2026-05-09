import { z } from "zod";
import { zid } from "convex-helpers/server/zod4";
import { guestQuery, memberMutation } from "./customFunctions";
import type { Doc } from "@db/dataModel";
import type { QueryCtx } from "@db/server";

export const SneakerInsert = z.object({
    name: z.string(),
    color: z.string().optional(),
    size: z.string().optional(),
    brand: zid("brands").optional(),
    photo: zid("_storage").optional(),
    description: z.string().optional(),
    location: z.union([zid("locations"), z.literal("outside")]).optional(),
    owner: zid("users").optional(),
    date: z.string().optional(),
    style: z.string().optional(),
    type: z.union([z.literal("Sneakers"), z.literal("Shoes"), z.literal("Boots"), z.literal("Flip-flops")]),
    originalOwner: z
        .union([
            z.object({
                type: z.literal("local"),
                id: zid("users"),
            }),
            z.object({
                type: z.literal("outside"),
                name: z.string(),
            }),
        ])
        .optional(),
    condition: z.number().optional(),
    decommissioned: z.boolean(),
    stockxUrl: z.string().optional(),
    goatUrl: z.string().optional(),
    authenticityTag: z.string().optional(),
    pickFor: zid("users").optional(),
    pickUntil: z.string().optional(),
    usageControl: z.string().optional(),
});
export const SneakerUpdate = SneakerInsert.partial().extend({ _id: zid("sneakers"), photo: zid("_storage").nullish() });
export const SneakerRemove = z.object({ _id: zid("sneakers") });

export const get = guestQuery({
    args: {},
    handler: async ctx => {
        const sneakers = await ctx.db.query("sneakers").collect();

        return Promise.all(sneakers.map(s => transformSneaker(ctx, s)));
    },
});

export const getPickedSneakers = guestQuery({
    args: {},
    handler: async ctx => {
        const now = new Date().toISOString();
        const sneakers = await ctx.db
            .query("sneakers")
            .filter(q => q.and(q.neq(q.field("pickFor"), undefined), q.neq(q.field("pickUntil"), undefined), q.lt(now, q.field("pickUntil"))))
            .collect();

        return Promise.all(sneakers.map(s => transformSneaker(ctx, s)));
    },
});

export const insert = memberMutation({
    args: SneakerInsert,
    handler: async (ctx, args) => {
        await ctx.db.insert("sneakers", args);
        return { success: true };
    },
});

export const update = memberMutation({
    args: SneakerUpdate,
    handler: async (ctx, args) => {
        const { _id, photo, ...rest } = args;

        if (rest.pickFor && rest.pickUntil) {
            const oldPicks = await ctx.db
                .query("sneakers")
                .withIndex("by_pickFor", q => q.eq("pickFor", rest.pickFor))
                .collect();
            await Promise.all(oldPicks.map(p => ctx.db.patch(p._id, { pickFor: undefined, pickUntil: undefined })));
        }

        const sneaker = await ctx.db
            .query("sneakers")
            .filter(q => q.eq(q.field("_id"), _id))
            .first();
        const patch = { ...rest } as z.infer<typeof SneakerInsert>;

        if (photo !== undefined) {
            patch.photo = photo === null ? undefined : photo;
            if (sneaker?.photo) await ctx.storage.delete(sneaker.photo);
        }

        await ctx.db.patch(args._id, patch);
        return { success: true };
    },
});

export const remove = memberMutation({
    args: { _id: zid("sneakers") },
    handler: async (ctx, args) => {
        const sneaker = await ctx.db
            .query("sneakers")
            .filter(q => q.eq(q.field("_id"), args._id))
            .first();
        if (sneaker?.photo) await ctx.storage.delete(sneaker.photo);

        await ctx.db.delete(args._id);
        return { success: true };
    },
});

async function transformSneaker(ctx: QueryCtx, sneaker: Doc<"sneakers">) {
    let brand = { _id: "", name: "Unknown", iconUrl: "" };
    if (sneaker.brand) {
        const doc = await ctx.db.get(sneaker.brand);
        brand = { _id: doc?._id ?? "", name: doc?.name ?? "Unknown", iconUrl: (doc?.icon && (await ctx.storage.getUrl(doc.icon))) ?? "" };
    }

    let location = { _id: "", name: "Unknown" };
    if (sneaker.location) {
        if (sneaker.location === "outside") location = { _id: "outside", name: "Outside" };
        else {
            const doc = await ctx.db.get(sneaker.location);
            location = { _id: doc?._id ?? "", name: doc?.name ?? "Unknown" };
        }
    }

    let owner = { _id: "", username: "", color: "" };
    if (sneaker.owner) {
        const doc = await ctx.db.get(sneaker.owner);
        owner = { _id: doc?._id ?? "", username: doc?.username ?? "", color: doc?.color ?? "" };
    }

    let originalOwner = { _id: "", type: "", username: "", color: "" };
    if (sneaker.originalOwner) {
        if (sneaker.originalOwner.type === "local") {
            const doc = await ctx.db.get(sneaker.originalOwner.id);
            originalOwner = { _id: doc?._id ?? "", type: "local", username: doc?.username ?? "", color: doc?.color ?? "" };
        } else originalOwner = { _id: "", type: "outside", username: sneaker.originalOwner.name, color: "" };
    }

    let pickFor = { _id: "", username: "", color: "" };
    if (sneaker.pickFor) {
        const doc = await ctx.db.get(sneaker.pickFor);
        pickFor = { _id: doc?._id ?? "", username: doc?.username ?? "", color: doc?.color ?? "" };
    }

    return {
        ...sneaker,
        brand,
        photoUrl: sneaker.photo && (await ctx.storage.getUrl(sneaker.photo)),
        location,
        owner,
        originalOwner,
        pickFor,
    };
}
