import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { IconHexagon } from "@tabler/icons-react";
import { addDays, addHours, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { SneakerPhoto } from "@/components/SneakerPhoto";
import bridge from "@/data/bridge";
import { useConfig } from "@/lib/useConfig";
import { useOutsideClick } from "@/lib/useOutsideClick";
import { cn, hasSearched } from "@/lib/utils";
import { Route } from "@/routes/__root";
import type { Search, Sneaker } from "@/lib/models";

interface SneakPickBlockProps {
    search: Search;
}

export function SneakPickBlock({ search }: SneakPickBlockProps) {
    const { data: sneakers } = useQuery({
        queryKey: ["sneakers", "picked"],
        queryFn: bridge.sneakers.getPicked,
    });
    const { config } = useConfig();

    if (!sneakers?.length || hasSearched(search, config)) return null;

    return (
        <div className="px-6 md:px-8 py-px flex gap-4 overflow-x-auto">
            {(sneakers ?? []).map(s => (
                <Link
                    to="/sneakers/$id"
                    params={{ id: s._id }}
                    className="p-2 shrink-0 relative bg-secondary rounded-2xl group inset-shadow-sneakpick inset-shadow-(color:--user-color)/5 ring ring-border/75 inset-ring inset-ring-(--user-color)/15 overflow-hidden"
                    key={s._id}
                    style={{ "--user-color": s.pickFor.color ?? "var(--color-muted-foreground)" } as React.CSSProperties}
                >
                    <SneakerPhoto sneaker={s} />
                    <p className="px-3 py-1 absolute left-0 right-0 bottom-0 text-center text-xs font-semibold bg-secondary rounded-t-lg ring ring-border/75 shadow-sneakpick shadow-(color:--user-color)/50">{s.pickFor.username}</p>
                </Link>
            ))}
        </div>
    );
}

interface SneakPickSelectorProps {
    sneaker: Sneaker | undefined;
}

export function SneakPickSelector({ sneaker }: SneakPickSelectorProps) {
    const { auth } = Route.useRouteContext();

    if (!auth?.isAuthenticated || !auth.role || !["member", "admin"].includes(auth.role)) return null;

    if (!sneaker) return <Skeleton className="w-full h-36 max-md:hidden rounded-xl" />;

    return (
        <div className="p-4 pwa:pb-10 max-md:fixed max-md:bottom-0 max-md:left-px max-md:right-px bg-accent rounded-xl max-md:rounded-b-none ring ring-border space-y-4">
            <div className="flex items-center gap-2">
                <IconHexagon className="size-4 text-primary" />
                <h3 className="font-bold">Pick this sneaker</h3>
            </div>
            <div className="space-y-2">
                <PickTimeSelect sneaker={sneaker} self />
                <PickTimeSelect sneaker={sneaker} />
            </div>
        </div>
    );
}

interface PickTimeSelectProps {
    sneaker: Sneaker | undefined;
    self?: boolean;
}

function PickTimeSelect({ sneaker, self = false }: PickTimeSelectProps) {
    const [open, setOpen] = useState(false);
    const [pickFor, setPickFor] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const { data: users } = useQuery({
        queryKey: ["owners"],
        queryFn: bridge.users.getOwners,
        enabled: !self,
        select: users => users.filter(u => u.active && u._id !== auth?._id),
    });
    const queryClient = useQueryClient();
    const ref = useRef<HTMLDivElement>(null);
    const { auth } = Route.useRouteContext();

    async function pickSneaker(until: Date) {
        if (!sneaker || (self && !auth.isAuthenticated) || (!self && !pickFor)) return;

        setIsSaving(true);
        setOpen(false);

        const result = await bridge.sneakers.edit({
            data: {
                _id: sneaker._id,
                pickFor: self ? auth?._id : (pickFor ?? undefined),
                pickUntil: until.toISOString(),
                usageControl: new Date().toISOString(),
            },
        });
        if (result.success) await queryClient.invalidateQueries({ queryKey: ["sneakers"] });

        setIsSaving(false);
    }

    useEffect(() => {
        if (!pickFor && users?.length) setPickFor(users[0]._id);
    }, [pickFor, users]);

    useOutsideClick(ref, () => setOpen(false));

    const selUser = users?.find(o => o._id === pickFor);

    if (!self && users?.length === 1) return null;

    return (
        <div ref={ref} className="min-h-9 relative">
            <Button className="w-full relative z-2" variant={self ? "default" : "outline"} disabled={isSaving} onClick={() => setOpen(!open)}>
                {!isSaving ? self ? "Pick for me" : "Pick for someone else" : <Spinner />}
            </Button>
            <div className="h-5 absolute top-4 -left-px -right-px bg-accent rounded-b-md z-1" />
            <div className={cn("mx-px -mt-4 mb-px px-1 relative rounded-md ring ring-border overflow-hidden space-y-0.5 transition-all duration-300", !open ? "h-0 ease-in-out" : `${self ? "h-43.5" : "h-53"} pt-5 pb-1 ease-out`)}>
                {!self && (
                    <Select value={pickFor} onValueChange={e => setPickFor(e)}>
                        <SelectTrigger className="w-full">
                            {!selUser ? (
                                "Select a user"
                            ) : (
                                <div className="flex items-center gap-2">
                                    <div className="size-2.5 rounded-full" style={{ backgroundColor: selUser?.color }} />
                                    {selUser.username}
                                </div>
                            )}
                        </SelectTrigger>
                        <SelectContent>
                            {(users ?? []).map(u => (
                                <SelectItem value={u._id} key={u._id}>
                                    <div className="size-2.5 rounded-full" style={{ backgroundColor: u.color }} />
                                    {u.username}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
                <Button className="w-full px-2 flex justify-start" variant="ghost" disabled={!self && !users?.length} onClick={() => pickSneaker(addHours(new Date(), 1))}>
                    For 1 hour
                </Button>
                <Button className="w-full px-2 flex justify-start" variant="ghost" disabled={!self && !users?.length} onClick={() => pickSneaker(addHours(new Date(), 3))}>
                    For 3 hour
                </Button>
                <Button className="w-full px-2 flex justify-start" variant="ghost" disabled={!self && !users?.length} onClick={() => pickSneaker(addHours(new Date(), 8))}>
                    For 8 hour
                </Button>
                <Button className="w-full px-2 flex justify-start" variant="ghost" disabled={!self && !users?.length} onClick={() => pickSneaker(startOfDay(addDays(new Date(), 1)))}>
                    Until tomorrow
                </Button>
            </div>
        </div>
    );
}
