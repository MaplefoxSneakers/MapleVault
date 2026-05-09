import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { IconLayoutGrid, IconLayoutList } from "@tabler/icons-react";

export const Route = createFileRoute("/_app")({
    component: LayoutComponent,
});

function LayoutComponent() {
    return (
        <>
            <Outlet />
            <div className="flex justify-center sticky bottom-6 left-0 right-0 z-50">
                <div className="w-fit p-1.25 flex bg-secondary rounded-full ring ring-border/75">
                    <Link to="/" activeProps={{ className: "text-primary" }} inactiveProps={{ className: "text-muted-foreground hover:text-secondary-foreground" }} className="py-1 pl-2.5 pr-3 flex items-center gap-2 hover:bg-muted/50 rounded-full transition-colors">
                        <IconLayoutGrid className="size-5" />
                        <span className="font-semibold">Library</span>
                    </Link>
                    <Link to="/collections" activeProps={{ className: "text-primary" }} inactiveProps={{ className: "text-muted-foreground hover:text-secondary-foreground" }} className="py-1 pl-2.5 pr-3 flex items-center gap-2 hover:bg-muted/50 rounded-full transition-colors">
                        <IconLayoutList className="size-5" />
                        <span className="font-semibold">Collections</span>
                    </Link>
                </div>
            </div>
        </>
    );
}
