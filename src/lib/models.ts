import { z } from "zod";
import type bridge from "@/data/bridge";
import type { Doc } from "@db/dataModel";

export type Sneaker = Awaited<ReturnType<typeof bridge.sneakers.get>>[number];
export type User = Awaited<ReturnType<typeof bridge.users.get>>[number];
export type Location = Awaited<ReturnType<typeof bridge.locations.get>>[number];
export type Brand = Awaited<ReturnType<typeof bridge.brands.get>>[number];
export type Collection = Awaited<ReturnType<typeof bridge.collections.get>>[number];

export const sneakerTypes = ["Sneakers", "Shoes", "Boots", "Flip-flops"] as const;

export interface Search {
    term: string;
    location?: Doc<"sneakers">["location"];
    brand?: Doc<"sneakers">["brand"];
    owner?: Doc<"sneakers">["owner"];
    type?: Doc<"sneakers">["type"];
    decommissioned?: Doc<"sneakers">["decommissioned"];
}

export const searchQuerySchema = z.object({
    term: z.string().optional(),
    location: z.string().optional(),
    brand: z.string().optional(),
    owner: z.string().optional(),
    type: z.enum(sneakerTypes).optional(),
    decommissioned: z.enum(["true", "false"]).optional(),
});
