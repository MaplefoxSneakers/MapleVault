import { useEffect, useState } from "react";
import type { Sneaker } from "@/lib/models";

const CACHE_NAME = "sneakrvault-sneaker-images-v1";
const CACHE_KEY_PREFIX = "/__sneakr_cache__/sneaker-images/";
const objectUrlCache = new Map<string, string>();
const inflightLoads = new Map<string, Promise<string | null>>();

function getCacheKey(photoId: string) {
    return `${CACHE_KEY_PREFIX}${photoId}`;
}

function canUseCacheApi() {
    return typeof window !== "undefined" && "caches" in window;
}

async function readCachedImage(photoId: string) {
    const cachedObjectUrl = objectUrlCache.get(photoId);
    if (cachedObjectUrl) return cachedObjectUrl;

    const inflight = inflightLoads.get(photoId);
    if (inflight) return await inflight;

    const load = (async () => {
        if (!canUseCacheApi()) return null;

        const cache = await caches.open(CACHE_NAME);
        const response = await cache.match(getCacheKey(photoId));
        if (!response) return null;

        const objectUrl = URL.createObjectURL(await response.blob());
        objectUrlCache.set(photoId, objectUrl);
        return objectUrl;
    })();

    inflightLoads.set(photoId, load);

    try {
        return await load;
    } finally {
        inflightLoads.delete(photoId);
    }
}

async function storeCachedImage(photoId: string, photoUrl: string) {
    const inflight = inflightLoads.get(photoId);
    if (inflight) return await inflight;

    const load = (async () => {
        if (!canUseCacheApi()) return photoUrl;

        const response = await fetch(photoUrl);
        if (!response.ok) return photoUrl;

        const cache = await caches.open(CACHE_NAME);
        await cache.put(getCacheKey(photoId), response.clone());

        const objectUrl = URL.createObjectURL(await response.blob());
        const previousObjectUrl = objectUrlCache.get(photoId);
        if (previousObjectUrl) URL.revokeObjectURL(previousObjectUrl);
        objectUrlCache.set(photoId, objectUrl);
        return objectUrl;
    })();

    inflightLoads.set(photoId, load);

    try {
        return await load;
    } finally {
        inflightLoads.delete(photoId);
    }
}

export function useSneakerImageSrc(sneaker?: Pick<Sneaker, "photo" | "photoUrl">) {
    const [src, setSrc] = useState<string | null>(sneaker?.photoUrl ?? null);

    useEffect(() => {
        let cancelled = false;

        async function loadImage() {
            if (!sneaker?.photo || !sneaker.photoUrl) {
                if (!cancelled) setSrc(null);
                return;
            }

            const cachedSrc = await readCachedImage(sneaker.photo);
            if (cachedSrc) {
                if (!cancelled) setSrc(cachedSrc);
                return;
            }

            const storedSrc = await storeCachedImage(sneaker.photo, sneaker.photoUrl);
            if (!cancelled) setSrc(storedSrc);
        }

        loadImage();

        return () => {
            cancelled = true;
        };
    }, [sneaker?.photo, sneaker?.photoUrl]);

    return src;
}

export function usePruneSneakerImageCache(sneakers?: Pick<Sneaker, "photo">[]) {
    useEffect(() => {
        if (!sneakers || !canUseCacheApi()) return;

        pruneSneakerImageCache(sneakers);
    }, [sneakers]);
}

async function pruneSneakerImageCache(sneakers: Pick<Sneaker, "photo">[]) {
    const activePhotoIds = new Set<string>(sneakers.flatMap(sneaker => (sneaker.photo ? [sneaker.photo] : [])));
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();

    await Promise.all(
        keys.map(async key => {
            if (!key.url.includes(CACHE_KEY_PREFIX)) return;

            const photoId = key.url.slice(key.url.lastIndexOf(CACHE_KEY_PREFIX) + CACHE_KEY_PREFIX.length);
            if (activePhotoIds.has(photoId)) return;

            await cache.delete(key);

            const objectUrl = objectUrlCache.get(photoId);
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
                objectUrlCache.delete(photoId);
            }
        }),
    );
}
