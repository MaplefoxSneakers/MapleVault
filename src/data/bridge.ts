import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { BrandInsert, BrandRemove, BrandUpdate } from "convex/brands";
import { LocationInsert, LocationRemove, LocationUpdate } from "convex/locations";
import { UserInsert, UserRemove, UserUpdate } from "convex/users";
import { SneakerInsert, SneakerRemove, SneakerUpdate } from "convex/sneakers";
import { CollectionInsert, CollectionRemove, CollectionUpdate } from "convex/collections";
import { ConfigUpdate } from "convex/configs";
import { generateAuthPayload, getClient } from "@/data/auth";
import { getAppSessionConfig } from "@/data/session";
import { getErrorMessage } from "@/lib/utils";
import { api } from "@db/api";

type SuccessResult = { success: true; error?: string };
type ErrorResult = { success: false; error: string };
export type Result = SuccessResult | ErrorResult;

async function encryptPassword(password: string) {
    const { randomBytes, scryptSync } = await import("node:crypto");

    const salt = randomBytes(16);
    const hash = scryptSync(password, salt, 64);
    return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

async function handleQuery<T>(queryFn: () => Promise<T>, errorMessage: string): Promise<T> {
    try {
        return await queryFn();
    } catch (error) {
        throw new Error(getErrorMessage(error, errorMessage));
    }
}

async function handleMutation(mutationFn: () => Promise<unknown>, errorMessage: string): Promise<Result> {
    try {
        const result = await mutationFn();
        if (isErrorResult(result)) return result;

        return { success: true };
    } catch (error) {
        return { success: false, error: getErrorMessage(error, errorMessage) };
    }
}

function isErrorResult(result: unknown): result is ErrorResult {
    return typeof result === "object" && result !== null && "success" in result && (result as { success?: unknown }).success === false && typeof (result as { error?: unknown }).error === "string";
}

const getSneakers = createServerFn({ method: "GET" }).handler(() => handleQuery(async () => getClient().query(api.sneakers.get, await generateAuthPayload({ data: {} })), "Failed to get sneakers"));

const getPickedSneakers = createServerFn({ method: "GET" }).handler(() => handleQuery(async () => getClient().query(api.sneakers.getPickedSneakers, await generateAuthPayload({ data: {} })), "Failed to get picked sneakers"));

const addSneaker = createServerFn({ method: "POST" })
    .inputValidator(SneakerInsert)
    .handler(({ data }) =>
        handleMutation(
            async () =>
                getClient().mutation(api.sneakers.insert, {
                    ...data,
                    ...(await generateAuthPayload({ data: {} })),
                }),
            "Failed to add sneaker",
        ),
    );

const editSneaker = createServerFn({ method: "POST" })
    .inputValidator(SneakerUpdate)
    .handler(({ data }) =>
        handleMutation(
            async () =>
                getClient().mutation(api.sneakers.update, {
                    ...data,
                    ...(await generateAuthPayload({ data: {} })),
                }),
            "Failed to edit sneaker",
        ),
    );

const deleteSneaker = createServerFn({ method: "POST" })
    .inputValidator(SneakerRemove)
    .handler(({ data }) =>
        handleMutation(
            async () =>
                getClient().mutation(api.sneakers.remove, {
                    ...data,
                    ...(await generateAuthPayload({ data: {} })),
                }),
            "Failed to delete sneaker",
        ),
    );

const getBrands = createServerFn({ method: "GET" }).handler(() => handleQuery(async () => getClient().query(api.brands.get, await generateAuthPayload({ data: {} })), "Failed to get brands"));

const generateUploadUrl = createServerFn({ method: "GET" }).handler(() => handleQuery(async () => getClient().mutation(api.storage.generateUploadUrl, await generateAuthPayload({ data: {} })), "Failed to generate upload url"));

const addBrand = createServerFn({ method: "POST" })
    .inputValidator(BrandInsert)
    .handler(({ data }) =>
        handleMutation(
            async () =>
                getClient().mutation(api.brands.insert, {
                    ...data,
                    ...(await generateAuthPayload({ data: {} })),
                }),
            "Failed to add brand",
        ),
    );

const editBrand = createServerFn({ method: "POST" })
    .inputValidator(BrandUpdate)
    .handler(({ data }) =>
        handleMutation(
            async () =>
                getClient().mutation(api.brands.update, {
                    ...data,
                    ...(await generateAuthPayload({ data: {} })),
                }),
            "Failed to edit brand",
        ),
    );

const deleteBrand = createServerFn({ method: "POST" })
    .inputValidator(BrandRemove)
    .handler(({ data }) =>
        handleMutation(
            async () =>
                getClient().mutation(api.brands.remove, {
                    ...data,
                    ...(await generateAuthPayload({ data: {} })),
                }),
            "Failed to delete brand",
        ),
    );

const getLocations = createServerFn({ method: "GET" }).handler(() => handleQuery(async () => getClient().query(api.locations.get, await generateAuthPayload({ data: {} })), "Failed to get locations"));

const addLocation = createServerFn({ method: "POST" })
    .inputValidator(LocationInsert)
    .handler(({ data }) =>
        handleMutation(
            async () =>
                getClient().mutation(api.locations.insert, {
                    ...data,
                    ...(await generateAuthPayload({ data: {} })),
                }),
            "Failed to add location",
        ),
    );

const editLocation = createServerFn({ method: "POST" })
    .inputValidator(LocationUpdate)
    .handler(({ data }) =>
        handleMutation(
            async () =>
                getClient().mutation(api.locations.update, {
                    ...data,
                    ...(await generateAuthPayload({ data: {} })),
                }),
            "Failed to edit location",
        ),
    );

const deleteLocation = createServerFn({ method: "POST" })
    .inputValidator(LocationRemove)
    .handler(({ data }) =>
        handleMutation(
            async () =>
                getClient().mutation(api.locations.remove, {
                    ...data,
                    ...(await generateAuthPayload({ data: {} })),
                }),
            "Failed to delete location",
        ),
    );

const getUsers = createServerFn({ method: "GET" }).handler(() => handleQuery(async () => getClient().query(api.users.get, await generateAuthPayload({ data: {} })), "Failed to get users"));

const getUserByUsername = createServerFn({ method: "GET" })
    .inputValidator((data: { username: string }) => data)
    .handler(async ({ data }) => handleQuery(async () => getClient().query(api.users.getByUsername, { username: data.username, ...(await generateAuthPayload({ data: {} })) }), "Failed to get user by username"));

const getOwners = createServerFn({ method: "GET" }).handler(() => handleQuery(async () => getClient().query(api.users.getOwners, await generateAuthPayload({ data: {} })), "Failed to get owners"));

const addUser = createServerFn({ method: "POST" })
    .inputValidator(UserInsert.omit({ passwordHash: true }).extend({ password: z.string() }))
    .handler(async ({ data }) => {
        const { password, ...rest } = data;
        return handleMutation(
            async () =>
                getClient().mutation(api.users.insert, {
                    ...rest,
                    passwordHash: await encryptPassword(password),
                    ...(await generateAuthPayload({ data: {} })),
                }),
            "Failed to add user",
        );
    });

const editUser = createServerFn({ method: "POST" })
    .inputValidator(UserUpdate.omit({ passwordHash: true }).extend({ password: z.string().optional() }))
    .handler(async ({ data }) => {
        const { getSession } = await import("@tanstack/react-start/server");
        const session = await getSession(getAppSessionConfig());
        const { password, ...rest } = data;
        const passwordHash = password ? await encryptPassword(password) : undefined;

        if (session.data.isAuthenticated && session.data._id === data._id && session.data.role !== "admin") {
            return handleMutation(
                async () =>
                    getClient().mutation(api.users.updateSelf, {
                        _id: data._id,
                        username: rest.username,
                        ...(passwordHash ? { passwordHash } : {}),
                        color: rest.color,
                        ...(await generateAuthPayload({ data: {} })),
                    }),
                "Failed to edit user",
            );
        } else {
            return handleMutation(
                async () =>
                    getClient().mutation(api.users.update, {
                        ...rest,
                        ...(passwordHash ? { passwordHash } : {}),
                        ...(await generateAuthPayload({ data: {} })),
                    }),
                "Failed to edit user",
            );
        }
    });

const deleteUser = createServerFn({ method: "POST" })
    .inputValidator(UserRemove)
    .handler(({ data }) =>
        handleMutation(
            async () =>
                getClient().mutation(api.users.remove, {
                    ...data,
                    ...(await generateAuthPayload({ data: {} })),
                }),
            "Failed to delete user",
        ),
    );

const getCollections = createServerFn({ method: "GET" }).handler(() => handleQuery(async () => getClient().query(api.collections.get, await generateAuthPayload({ data: {} })), "Failed to get collections"));

const addCollection = createServerFn({ method: "POST" })
    .inputValidator(CollectionInsert)
    .handler(({ data }) =>
        handleMutation(
            async () =>
                getClient().mutation(api.collections.insert, {
                    ...data,
                    ...(await generateAuthPayload({ data: {} })),
                }),
            "Failed to add collection",
        ),
    );

const editCollection = createServerFn({ method: "POST" })
    .inputValidator(CollectionUpdate)
    .handler(({ data }) =>
        handleMutation(
            async () =>
                getClient().mutation(api.collections.update, {
                    ...data,
                    ...(await generateAuthPayload({ data: {} })),
                }),
            "Failed to edit collection",
        ),
    );

const deleteCollection = createServerFn({ method: "POST" })
    .inputValidator(CollectionRemove)
    .handler(({ data }) =>
        handleMutation(
            async () =>
                getClient().mutation(api.collections.remove, {
                    ...data,
                    ...(await generateAuthPayload({ data: {} })),
                }),
            "Failed to delete collection",
        ),
    );

const getConfigs = createServerFn({ method: "GET" }).handler(() => handleQuery(async () => getClient().query(api.configs.get), "Failed to get configs"));

const editConfig = createServerFn({ method: "POST" })
    .inputValidator(ConfigUpdate)
    .handler(({ data }) =>
        handleMutation(
            async () =>
                getClient().mutation(api.configs.update, {
                    ...data,
                    ...(await generateAuthPayload({ data: {} })),
                }),
            "Failed to edit config",
        ),
    );

export default {
    sneakers: {
        get: getSneakers,
        getPicked: getPickedSneakers,
        add: addSneaker,
        edit: editSneaker,
        remove: deleteSneaker,
    },
    brands: {
        get: getBrands,
        add: addBrand,
        edit: editBrand,
        remove: deleteBrand,
    },
    locations: {
        get: getLocations,
        add: addLocation,
        edit: editLocation,
        remove: deleteLocation,
    },
    users: {
        get: getUsers,
        getOwners: getOwners,
        getByUsername: getUserByUsername,
        add: addUser,
        edit: editUser,
        remove: deleteUser,
    },
    storage: {
        generate: generateUploadUrl,
    },
    collections: {
        get: getCollections,
        add: addCollection,
        edit: editCollection,
        remove: deleteCollection,
    },
    configs: {
        get: getConfigs,
        edit: editConfig,
    },
};
