import { createRouter, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { getContext } from "@/integrations/query";
import { routeTree } from "@/routeTree.gen";

export const getRouter = () => {
    const router = createRouter({
        routeTree,
        context: getContext(),
        scrollRestoration: true,
        defaultPreload: "intent",
        defaultPreloadStaleTime: 0,
        defaultNotFoundComponent: () => {
            return (
                <div className="w-screen h-screen flex flex-col justify-center items-center gap-6">
                    <p className="text-xl sm:text-3xl md:text-2xl lg:text-4xl text-transparent font-black bg-linear-to-b from-zinc-50 to-zinc-600 bg-clip-text tracking-tight">Page not found!</p>
                    <Link to="/">
                        <Button>Go back home</Button>
                    </Link>
                </div>
            );
        },
    });

    return router;
};
