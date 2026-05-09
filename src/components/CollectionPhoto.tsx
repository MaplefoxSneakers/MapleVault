import { cn } from "@/lib/utils";
import type { Collection } from "@/lib/models";

interface CollectionPhotoProps {
    collection?: Collection;
    className?: string;
}

export function CollectionPhoto({ collection, className }: CollectionPhotoProps) {
    return <div className={cn("size-20 md:size-22 bg-radial-[at_0%_10%] from-10% from-(--cover-start) to-90% to-(--cover-end) rounded-lg", className)} style={{ "--cover-start": collection?.cover[0], "--cover-end": collection?.cover[1] } as React.CSSProperties} />;
}
