import { memberMutation } from "./customFunctions";

export const generateUploadUrl = memberMutation({
    args: {},
    handler: async ctx => {
        return await ctx.storage.generateUploadUrl();
    },
});
