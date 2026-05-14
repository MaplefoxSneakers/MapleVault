import { createRootRouteWithContext, HeadContent, redirect, Scripts } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { TanStackQueryProvider } from "@/integrations/query";
import { checkAuth } from "@/data/auth";
import bridge from "@/data/bridge";
import appCss from "../styles.css?url";
import type { QueryClient } from "@tanstack/react-query";

function getViewportContentForUserAgent(userAgent: string) {
    const isIosOnSafari = /iPhone|iPad|iPod/i.test(userAgent) && /Safari/i.test(userAgent);

    if (isIosOnSafari) {
        return "width=device-width, initial-scale=1, maximum-scale=1";
    }

    return "width=device-width, initial-scale=1";
}

const getViewportContent = createIsomorphicFn()
    .server(() => getViewportContentForUserAgent(getRequestHeader("user-agent") ?? ""))
    .client(() => getViewportContentForUserAgent(navigator.userAgent));

export const Route = createRootRouteWithContext<{
    queryClient: QueryClient;
}>()({
    beforeLoad: async ({ location }) => {
        const auth = await checkAuth();
        const configs = await bridge.configs.get();
        const returnAuth = () => ({ auth: { ...auth, role: auth.isAuthenticated ? auth.role : "guest" } });

        if (location.pathname.startsWith("/login")) {
            if (auth.isAuthenticated) throw redirect({ to: "/" });

            return returnAuth();
        }

        if (!auth.isAuthenticated && !configs?.publicPage) throw redirect({ to: "/login" });

        if (auth.role !== "admin" && location.pathname.startsWith("/manage")) throw redirect({ to: "/" });

        return returnAuth();
    },
    head: () => ({
        meta: [
            {
                charSet: "utf-8",
            },
            {
                name: "viewport",
                content: getViewportContent(),
            },
            {
                title: "SneakrVault",
            },
        ],
        links: [
            {
                rel: "stylesheet",
                href: appCss,
            },
            {
                rel: "apple-touch-icon",
                href: "/logo192.png",
            },
            {
                rel: "manifest",
                href: "/manifest.json",
            },
        ],
    }),
    shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <HeadContent />
            </head>
            <body>
                <TanStackQueryProvider>
                    {children}
                    <TanStackDevtools
                        config={{
                            position: "bottom-right",
                        }}
                        plugins={[
                            {
                                name: "Tanstack Router",
                                render: <TanStackRouterDevtoolsPanel />,
                            },
                            {
                                name: "Tanstack Query",
                                render: <ReactQueryDevtoolsPanel />,
                            },
                        ]}
                    />
                </TanStackQueryProvider>
                <Scripts />
            </body>
        </html>
    );
}
