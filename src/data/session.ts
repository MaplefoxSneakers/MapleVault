import type { SessionConfig } from "@tanstack/react-start/server";
import type { Doc, Id } from "@db/dataModel";

export type SessionState = {
    isAuthenticated: boolean;
    _id: Id<"users">;
    username: Doc<"users">["username"];
    role: Doc<"users">["role"];
};

const SESSION_COOKIE_NAME = "sneakrvault_auth";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const MIN_SECRET_LENGTH = 32;

function getSessionSecret() {
    const secret = process.env.SESSION_SECRET ?? process.env.VITE_SESSION_SECRET;

    if (!secret || secret.length < MIN_SECRET_LENGTH) throw new Error(`Missing SESSION_SECRET. Set a secret with at least ${MIN_SECRET_LENGTH} characters.`);

    return secret;
}

export function getAppSessionConfig(): SessionConfig {
    return {
        name: SESSION_COOKIE_NAME,
        password: getSessionSecret(),
        cookie: {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            sameSite: "lax",
            maxAge: SESSION_MAX_AGE_SECONDS,
            path: "/",
        },
    };
}
