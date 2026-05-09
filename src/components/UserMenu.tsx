import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { IconDots, IconLogin, IconLogout, IconSettings, IconUserEdit } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { AddUserDialog } from "@/components/overlays/AddUserDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import bridge from "@/data/bridge";
import { Route } from "@/routes/__root";

interface UserMenuProps {
    logout: () => void;
}

export function UserMenu({ logout }: UserMenuProps) {
    const navigate = useNavigate();
    const [editOpen, setEditOpen] = useState(false);
    const { auth } = Route.useRouteContext();
    const { data: currentUser } = useQuery({
        queryKey: ["current-user"],
        queryFn: () => bridge.users.getByUsername({ data: { username: auth.username ?? "" } }),
        enabled: auth.isAuthenticated,
    });

    if (!auth.isAuthenticated)
        return (
            <Button variant="outline" size="icon" onClick={() => navigate({ to: "/login" })}>
                <IconLogin className="size-5" />
            </Button>
        );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="icon" />}>
                <IconDots className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8}>
                {auth.role === "admin" ? (
                    <DropdownMenuItem onClick={() => navigate({ to: "/manage/{-$tab}" })}>
                        <IconSettings className="size-4" />
                        Settings
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem onClick={() => setEditOpen(true)}>
                        <IconUserEdit className="size-4" />
                        Edit profile
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem variant="destructive" onClick={logout}>
                    <IconLogout className="size-4" />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
            <AddUserDialog open={editOpen} setOpen={setEditOpen} user={currentUser ?? undefined} isCurrentUser />
        </DropdownMenu>
    );
}
