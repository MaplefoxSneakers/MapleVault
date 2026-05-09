import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { IconClock, IconExternalLink, IconX } from "@tabler/icons-react";
import { addDays, compareAsc, isBefore, parseISO, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { SneakerPhoto } from "@/components/SneakerPhoto";
import bridge from "@/data/bridge";
import { useConfig } from "@/lib/useConfig";
import { hasSearched } from "@/lib/utils";
import type { Search, Sneaker } from "@/lib/models";

interface LeastUsedBlockProps {
    search: Search;
}

export function LeastUsedBlock({ search }: LeastUsedBlockProps) {
    const { data: sneakers } = useQuery({
        queryKey: ["sneakers"],
        queryFn: bridge.sneakers.get,
    });
    const { config } = useConfig();
    const queryClient = useQueryClient();

    const getUsageDate = (s: Sneaker) => (s.usageControl ? parseISO(s.usageControl) : new Date(0));

    async function delaySneaker(sneaker: Sneaker) {
        const result = await bridge.sneakers.edit({
            data: {
                _id: sneaker._id,
                usageControl: addDays(new Date(), config.leastUsedDelayDuration).toISOString(),
            },
        });
        if (result.success) await queryClient.invalidateQueries({ queryKey: ["sneakers"] });
    }

    if (!sneakers?.length || hasSearched(search, config)) return null;

    return (
        <div className="flex flex-col gap-4">
            <div className="px-6 md:px-8 flex items-center gap-2">
                <IconClock className="size-6 text-primary" />
                <h2 className="text-xl font-bold text-white">Least Used Pairs</h2>
            </div>
            <div className="px-6 md:px-8 pt-px pb-4 flex gap-4 overflow-x-auto scrollbar-hidden">
                {(sneakers ?? [])
                    .sort((a, b) => compareAsc(getUsageDate(a), getUsageDate(b)))
                    .filter(s => isBefore(getUsageDate(s), subDays(new Date(), config.leastUsedDuration)))
                    .slice(0, 10)
                    .map(s => (
                        <div className="p-2 shrink-0 relative bg-secondary rounded-2xl group inset-shadow-sneakpick inset-shadow-primary/20 ring ring-border/75 inset-ring inset-ring-primary/15 overflow-hidden" key={s._id} tabIndex={-1}>
                            <SneakerPhoto sneaker={s} />
                            <div className="p-1 flex justify-center gap-1 absolute left-0 right-0 -bottom-12 pointer-coarse:group-focus-within:bottom-0 group-hover:bottom-0 bg-secondary rounded-t-lg ring ring-border/75 shadow-sneakpick shadow-primary/30 transition-[bottom] duration-300">
                                <Link to="/sneakers/$id" params={{ id: s._id }} className="contents">
                                    <Button variant="outline" className="px-0 flex-1 rounded-bl-xl">
                                        <IconExternalLink className="size-5" />
                                    </Button>
                                </Link>
                                <Button variant="outline" className="px-0 flex-1 rounded-br-xl" onClick={() => delaySneaker(s)}>
                                    <IconX className="size-5" />
                                </Button>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
}
