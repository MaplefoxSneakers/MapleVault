import { useQuery } from "@tanstack/react-query";
import { IconLayoutGrid, IconSearch } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { SneakerCard, SneakerCardSkeleton } from "@/components/SneakerCard";
import bridge from "@/data/bridge";
import { useConfig } from "@/lib/useConfig";
import { creationSort, filterBySearch, hasSearched } from "@/lib/utils";
import { Route } from "@/routes/__root";
import type { Search } from "@/lib/models";

interface GridBlockProps {
    search: Search;
    onAdd: () => unknown;
}

export function GridBlock({ search, onAdd }: GridBlockProps) {
    const { isPending, data: sneakers } = useQuery({
        queryKey: ["sneakers"],
        queryFn: bridge.sneakers.get,
    });
    const { config } = useConfig();
    const { auth } = Route.useRouteContext();
    const searched = hasSearched(search, config);
    const filtered = filterBySearch(sneakers ?? [], search);

    return (
        <div className="px-6 md:px-8 flex flex-col gap-4">
            <div className="flex items-center gap-2">
                {!searched ? <IconLayoutGrid className="size-6 text-primary" /> : <IconSearch className="size-6 text-primary" />}
                <h2 className="text-xl font-bold text-white">{!searched ? "All Sneakers" : "Search Results"}</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {isPending ? (
                    Array(15)
                        .fill(null)
                        .map((_, i) => <SneakerCardSkeleton key={i} />)
                ) : filtered.length !== 0 ? (
                    filtered.sort(creationSort).map(s => <SneakerCard key={s._id} sneaker={s} />)
                ) : (
                    <div className="py-20 flex flex-col items-center gap-4 col-span-full font-medium text-center text-muted-foreground">
                        {!searched ? (
                            <>
                                <p>Your library is empty. Start by adding pairs to your collection!</p>
                                {auth.role !== "guest" && <Button onClick={onAdd}>Add sneaker</Button>}
                            </>
                        ) : (
                            <p>No sneakers found matching {search.term ? `"${search.term}"` : "these filters"}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
