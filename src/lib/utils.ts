import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Search, Sneaker } from "@/lib/models";
import type { Config } from "@/lib/useConfig";

export type OverrideProps<TBase, TOverride> = Omit<TBase, keyof TOverride> & TOverride;

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function hasSearched(search: Search, config: Config) {
    return search.term.length > 0 || search.location || search.brand || search.owner || search.type !== allToUndefined(config.defaultTypeFilter) || search.decommissioned !== decommissionTransformer(config.defaultShowDecommissioned);
}

export function allToUndefined<T>(value: T | "all"): T | undefined {
    return value === "all" ? undefined : value;
}

export function decommissionTransformer(value: boolean | undefined) {
    return value ? false : undefined;
}

export function getErrorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message.trim() : typeof error === "string" ? error.trim() : fallback;
}

export function filterBySearch(sneakers: Sneaker[], search: Search) {
    return sneakers.filter(
        sneaker =>
            (sneaker.name.toLowerCase().includes(search.term.toLowerCase()) || sneaker.color?.toLowerCase().includes(search.term.toLowerCase())) &&
            (!search.location || sneaker.location._id === search.location) &&
            (!search.brand || sneaker.brand._id === search.brand) &&
            (!search.owner || sneaker.owner._id === search.owner) &&
            (!search.type || sneaker.type === search.type) &&
            (search.decommissioned === undefined ? !sneaker.decommissioned : search.decommissioned ? sneaker.decommissioned : true),
    );
}

type DocWithDate = { date?: string; _creationTime: number };
export function creationSort(a: DocWithDate, b: DocWithDate) {
    const getTime = (obj: DocWithDate) => (obj.date ? Date.parse(obj.date) : obj._creationTime * 1000);
    return getTime(b) - getTime(a);
}
