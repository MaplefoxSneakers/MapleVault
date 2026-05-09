import { IconCake, IconClock, IconHexagon, IconLayoutGrid, IconNumber123 } from "@tabler/icons-react";
import { BirthdayBlock } from "@/components/blocks/BirthdayBlock";
import { CountBlock } from "@/components/blocks/CountBlock";
import { GridBlock } from "@/components/blocks/GridBlock";
import { LeastUsedBlock } from "@/components/blocks/LeastUsedBlock";
import { SneakPickBlock } from "@/components/blocks/SneakPickBlock";
import { useConfig } from "@/lib/useConfig";
import type { Search } from "@/lib/models";

export type Block = (typeof availableBlocks)[number];

export const availableBlocks = ["Birthday", "Count", "Grid", "LeastUsed", "SneakPick"] as const;

export const blockIcons: Record<Block, React.ComponentType<{ className?: string }>> = {
    Birthday: IconCake,
    Count: IconNumber123,
    Grid: IconLayoutGrid,
    LeastUsed: IconClock,
    SneakPick: IconHexagon,
};

export function BlockManager({ search, onAdd }: { search: Search; onAdd: () => unknown }) {
    const { config } = useConfig();

    return config.homepageSections.map((section, idx) => {
        if (section === "Birthday") return <BirthdayBlock key={idx} search={search} />;
        else if (section === "Count") return <CountBlock key={idx} search={search} />;
        else if (section === "Grid") return <GridBlock key={idx} search={search} onAdd={onAdd} />;
        else if (section === "LeastUsed") return <LeastUsedBlock key={idx} search={search} />;
        else if (section === "SneakPick") return config.sneakPickEnabled && <SneakPickBlock key={idx} search={search} />;
        else return null;
    });
}
