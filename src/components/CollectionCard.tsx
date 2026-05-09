import { Link } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { CollectionPhoto } from "@/components/CollectionPhoto";
import type { Collection } from "@/lib/models";

interface CollectionCardProps {
    collection: Collection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
    return (
        <Link to="/collections/$id" params={{ id: collection._id }} className="w-full min-w-60 block relative p-2 bg-secondary rounded-2xl hover:shadow-2xl hover:shadow-primary/5 group ring ring-border/75 hover:border-white/20 overflow-hidden transition-shadow duration-300 z-0">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-primary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-fit h-full flex items-center gap-4 relative z-1">
                <CollectionPhoto collection={collection} />
                <div className="min-w-0 flex flex-col justify-center gap-y-1">
                    <h2 className="text-lg text-white group-hover:text-primary-200 font-bold tracking-tight truncate transition-colors">{collection.name}</h2>
                    <span className="text-sm text-zinc-300 group-hover:text-primary-100 font-medium truncate transition-colors">{collection.sneakers?.length || 0} pairs</span>
                </div>
            </div>
        </Link>
    );
}

export function CollectionCardSkeleton() {
    return (
        <div className="w-full p-2 flex items-center gap-4 relative bg-secondary rounded-2xl ring ring-border">
            <Skeleton className="size-18 shrink-0 rounded-lg" />
            <div className="flex flex-col justify-center flex-1">
                <Skeleton className="w-1/2 h-5.5 mb-2" />
                <Skeleton className="w-1/5 h-4.5" />
            </div>
        </div>
    );
}
