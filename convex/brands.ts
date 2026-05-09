import { z } from "zod";
import { zid } from "convex-helpers/server/zod4";
import { adminMutation, guestQuery } from "./customFunctions";

export const BrandInsert = z.object({
    name: z.string(),
    icon: zid("_storage").optional(),
});
export const BrandUpdate = BrandInsert.partial().extend({ _id: zid("brands"), icon: zid("_storage").nullish() });
export const BrandRemove = z.object({ _id: zid("brands") });

export const get = guestQuery({
    args: {},
    handler: async ctx => {
        const brands = await ctx.db.query("brands").collect();

        return Promise.all(brands.map(async b => ({ ...b, iconUrl: b.icon && (await ctx.storage.getUrl(b.icon)) })));
    },
});

export const insert = adminMutation({
    args: BrandInsert,
    handler: async (ctx, args) => {
        await ctx.db.insert("brands", args);
        return { success: true };
    },
});

export const update = adminMutation({
    args: BrandUpdate,
    handler: async (ctx, args) => {
        const { _id, icon, ...rest } = args;
        const brand = await ctx.db
            .query("brands")
            .filter(q => q.eq(q.field("_id"), _id))
            .first();

        const patch = { ...rest } as z.infer<typeof BrandInsert>;

        if (icon !== undefined) {
            patch.icon = icon === null ? undefined : icon;
            if (brand?.icon) await ctx.storage.delete(brand.icon);
        }

        await ctx.db.patch(args._id, patch);
        return { success: true };
    },
});

export const remove = adminMutation({
    args: BrandRemove,
    handler: async (ctx, args) => {
        const brand = await ctx.db
            .query("brands")
            .filter(q => q.eq(q.field("_id"), args._id))
            .first();
        if (brand?.icon) await ctx.storage.delete(brand.icon);

        await ctx.db.delete(args._id);
        return { success: true };
    },
});
