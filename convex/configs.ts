import { z } from "zod";
import { query } from "@db/server";
import { adminMutation } from "./customFunctions";

export const ConfigUpdate = z.object({
    cardSecondaryInfo: z.union([z.literal("nothing"), z.literal("location"), z.literal("brand"), z.literal("size"), z.literal("owner")]).optional(),
    cardShowOwnerColor: z.boolean().optional(),
    defaultTypeFilter: z.union([z.literal("all"), z.literal("Sneakers"), z.literal("Shoes"), z.literal("Boots"), z.literal("Flip-flops")]).optional(),
    defaultShowDecommissioned: z.boolean().optional(),
    sneakPickEnabled: z.boolean().optional(),
    homepageSections: z.array(z.string()).optional(),
    coverFrame: z.boolean().optional(),
    showCountOnSearch: z.boolean().optional(),
    leastUsedDuration: z.number().optional(),
    leastUsedDelayDuration: z.number().optional(),
    publicPage: z.boolean().optional(),
    locationVisibility: z.union([z.literal("public"), z.literal("guests"), z.literal("protected")]).optional(),
    descriptionVisibility: z.union([z.literal("public"), z.literal("guests"), z.literal("protected")]).optional(),
    originalOwnerVisibility: z.union([z.literal("public"), z.literal("guests"), z.literal("protected")]).optional(),
});

export const get = query({
    args: {},
    handler: async ctx => {
        return await ctx.db.query("configs").first();
    },
});

export const update = adminMutation({
    args: ConfigUpdate,
    handler: async (ctx, args) => {
        const config = await ctx.db.query("configs").first();

        if (!config) await ctx.db.insert("configs", args);
        else await ctx.db.patch(config._id, args);

        return { success: true };
    },
});
