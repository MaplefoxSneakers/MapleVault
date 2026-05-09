import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import bridge from "@/data/bridge";
import type { Block } from "@/components/blocks/BlockManager";
import type { DataModel } from "@db/dataModel";

export type Config = Required<Omit<DataModel["configs"]["document"], "_id" | "_creationTime">>;

export function useConfig() {
    const [config, setConfig] = useState<Config>(defaultConfig);
    const { isPending, data } = useQuery({
        queryKey: ["configs"],
        queryFn: bridge.configs.get,
    });
    const queryClient = useQueryClient();
    const updateConfig = useMutation({
        mutationFn: (config: Config) => {
            setConfig(config);
            return bridge.configs.edit({ data: config });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["configs"] }),
    });

    useEffect(() => {
        if (data) setConfig({ ...defaultConfig, ...data });
    }, [data]);

    return { isPending, config, updateConfig };
}

export const defaultConfig = {
    cardSecondaryInfo: "location",
    cardShowOwnerColor: true,
    defaultTypeFilter: "all",
    defaultShowDecommissioned: false,
    sneakPickEnabled: true,
    homepageSections: ["SneakPick", "Birthday", "Grid", "Count"] satisfies Block[],
    coverFrame: true,
    showCountOnSearch: true,
    leastUsedDuration: 7,
    leastUsedDelayDuration: 10,
    publicPage: false,
    locationVisibility: "protected",
    descriptionVisibility: "protected",
    originalOwnerVisibility: "protected",
} satisfies Config;
