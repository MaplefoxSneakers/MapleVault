import { useEffect, useState } from "react";
import { useConfig } from "@/lib/useConfig";
import { useSneakerImageSrc } from "@/lib/sneakerImageCache";
import { cn } from "@/lib/utils";
import type { Sneaker } from "@/lib/models";

interface SneakerPhotoProps {
    sneaker?: Sneaker;
    className?: string;
    hideText?: boolean;
}

export function SneakerPhoto({ sneaker, className, hideText = false }: SneakerPhotoProps) {
    const [isAvailable, setIsAvailable] = useState(true);
    const { config } = useConfig();
    const photoSrc = useSneakerImageSrc(sneaker);

    useEffect(() => {
        setIsAvailable(true);
    }, [photoSrc, sneaker?._id]);

    return (
        <div className={cn("size-22 md:size-24 shrink-0", className)}>
            {isAvailable && sneaker && photoSrc ? (
                <img src={photoSrc} alt={`${sneaker.name} ${sneaker.color}`} className={cn("size-full bg-white/4 rounded-lg", config.coverFrame ? "object-cover" : "object-contain")} onError={() => setIsAvailable(false)} />
            ) : (
                <div className="size-full flex justify-center items-center text-foreground/50 bg-white/4 rounded-lg">{!hideText && <span className="text-xs uppercase font-bold">No Image</span>}</div>
            )}
        </div>
    );
}
