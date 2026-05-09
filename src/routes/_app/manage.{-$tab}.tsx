import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { IconArrowDown, IconArrowUp, IconCheck, IconExternalLink, IconForbid2, IconMapPin, IconPencil, IconPlus, IconRosetteDiscountCheck, IconRuler2, IconTrash, IconUser } from "@tabler/icons-react";
import { availableBlocks, blockIcons, type Block } from "@/components/blocks/BlockManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AddBrandDialog } from "@/components/overlays/AddBrandDialog";
import { AddLocationDialog } from "@/components/overlays/AddLocationDialog";
import { AddUserDialog } from "@/components/overlays/AddUserDialog";
import { DeleteBrandDialog } from "@/components/overlays/DeleteBrandDialog";
import { DeleteLocationDialog } from "@/components/overlays/DeleteLocationDialog";
import { DeleteUserDialog } from "@/components/overlays/DeleteUserDialog";
import { Header } from "@/components/Header";
import { UserMenu } from "@/components/UserMenu";
import { checkAuth } from "@/data/auth";
import bridge from "@/data/bridge";
import { defaultConfig, useConfig, type Config } from "@/lib/useConfig";
import { useLogout } from "@/lib/useLogout";
import { cn, type OverrideProps } from "@/lib/utils";
import packageJson from "@/../package.json";

export const Route = createFileRoute("/_app/manage/{-$tab}")({
    component: ManagePage,
    beforeLoad: () => checkAuth(),
});

function ManagePage() {
    const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
    const [addLocationDialogOpen, setAddLocationDialogOpen] = useState(false);
    const [addBrandDialogOpen, setAddBrandDialogOpen] = useState(false);
    const { isPending: cip, config, updateConfig } = useConfig();
    const { isPending: uip, data: users } = useQuery({
        queryKey: ["users"],
        queryFn: bridge.users.get,
    });
    const { isPending: lip, data: locations } = useQuery({
        queryKey: ["locations"],
        queryFn: bridge.locations.get,
    });
    const { isPending: bip, data: brands } = useQuery({
        queryKey: ["brands"],
        queryFn: bridge.brands.get,
    });
    const { tab } = Route.useParams();
    const navigate = useNavigate();
    const logout = useLogout();
    const tabs = ["configurations", "users", "locations", "brands"] as const;
    const activeTab = tabs.includes(tab as (typeof tabs)[number]) ? tab : tabs[0];

    function changePageSecurity(publicPage: boolean) {
        const patch = { ...config, publicPage };
        const derivateKeys = ["locationVisibility", "descriptionVisibility", "originalOwnerVisibility"] as const;

        derivateKeys.forEach(key => {
            if (patch[key] === "public" && !publicPage) patch[key] = "protected";
        });

        updateConfig.mutate(patch);
    }

    return (
        <div className="min-h-screen">
            <Header right={<UserMenu logout={logout} />} />
            <div className="max-w-7xl mx-auto px-6 md:px-8 pt-4 pb-20">
                <Tabs className="gap-4" value={activeTab} onValueChange={value => navigate({ to: "/manage/{-$tab}", params: { tab: value } })}>
                    <div className="w-full flex justify-between">
                        <TabsList variant="line" className="pr-4 justify-start overflow-x-auto overflow-y-hidden scrollbar-hidden">
                            <TabsTrigger value={tabs[0]}>Configurations</TabsTrigger>
                            <TabsTrigger value={tabs[1]}>Users</TabsTrigger>
                            <TabsTrigger value={tabs[2]}>Locations</TabsTrigger>
                            <TabsTrigger value={tabs[3]}>Brands</TabsTrigger>
                        </TabsList>
                        <div className="flex gap-2">
                            {(cip || uip || lip || bip) && (
                                <div className="size-9 flex justify-center items-center rounded-md ring-1 ring-input">
                                    <Spinner />
                                </div>
                            )}
                            <TabsContent value={tabs[1]}>
                                <Button className="max-sm:hidden" onClick={() => setAddUserDialogOpen(true)}>
                                    <IconPlus className="size-4" data-icon="inline-start" />
                                    Add user
                                </Button>
                                <Button className="sm:hidden" size="icon" onClick={() => setAddUserDialogOpen(true)}>
                                    <IconPlus className="size-4" />
                                </Button>
                                <AddUserDialog open={addUserDialogOpen} setOpen={setAddUserDialogOpen} />
                            </TabsContent>
                            <TabsContent value={tabs[2]}>
                                <Button className="max-sm:hidden" onClick={() => setAddLocationDialogOpen(true)}>
                                    <IconPlus className="size-4" data-icon="inline-start" />
                                    Add location
                                </Button>
                                <Button className="sm:hidden" size="icon" onClick={() => setAddLocationDialogOpen(true)}>
                                    <IconPlus className="size-4" />
                                </Button>
                                <AddLocationDialog open={addLocationDialogOpen} setOpen={setAddLocationDialogOpen} />
                            </TabsContent>
                            <TabsContent value={tabs[3]}>
                                <Button className="max-sm:hidden" onClick={() => setAddBrandDialogOpen(true)}>
                                    <IconPlus className="size-4" data-icon="inline-start" />
                                    Add brand
                                </Button>
                                <Button className="sm:hidden" size="icon" onClick={() => setAddBrandDialogOpen(true)}>
                                    <IconPlus className="size-4" />
                                </Button>
                                <AddBrandDialog open={addBrandDialogOpen} setOpen={setAddBrandDialogOpen} />
                            </TabsContent>
                        </div>
                    </div>
                    <TabsContent value={tabs[0]} className="pt-4 divide-y divide-border *:pt-8 *:pb-8 *:first:pt-0 *:last:pb-0">
                        {!cip && (
                            <>
                                <ConfigSection title="Personalization">
                                    <ConfigItem title="Card secondary info" description="Choose which info should additionally be displayed on the sneaker cards." wrap="mobile">
                                        <InfoSelect value={config.cardSecondaryInfo} onChange={v => updateConfig.mutate({ ...config, cardSecondaryInfo: v })} />
                                    </ConfigItem>
                                    <ConfigItem title="Show owner color on card" description="Whether the accent color of the user who owns the pair should be displayed at the bottom right of the sneaker card.">
                                        <Switch checked={config.cardShowOwnerColor} onCheckedChange={v => updateConfig.mutate({ ...config, cardShowOwnerColor: v })} />
                                    </ConfigItem>
                                    <ConfigItem title="Default type filter" description="Choose the default type of pairs to show on the library." wrap="mobile">
                                        <PairTypeSelect value={config.defaultTypeFilter} onChange={v => updateConfig.mutate({ ...config, defaultTypeFilter: v })} />
                                    </ConfigItem>
                                    <ConfigItem title="Show decommissioned pairs" description="Whether decommissioned pairs should be displayed in the library by default, with no need to enable them on the filters.">
                                        <Switch checked={config.defaultShowDecommissioned} onCheckedChange={v => updateConfig.mutate({ ...config, defaultShowDecommissioned: v })} />
                                    </ConfigItem>
                                    <ConfigItem title="SneakPick" description="Enables/Disabled the sneak pick feature. This allows users to select pairs to them to wear or pick for other users.">
                                        <Switch checked={config.sneakPickEnabled} onCheckedChange={v => updateConfig.mutate({ ...config, sneakPickEnabled: v })} />
                                    </ConfigItem>
                                    <ConfigItem
                                        title="Homepage sections"
                                        description="Customize the order of the sections that appear on the home page"
                                        wrap="always"
                                        sideContent={
                                            <Button variant="link" size="sm" onClick={() => updateConfig.mutate({ ...config, homepageSections: defaultConfig.homepageSections })}>
                                                Reset
                                            </Button>
                                        }
                                    >
                                        <HomepageSections />
                                    </ConfigItem>
                                    <ConfigItem title="Cover frame" description="Whether the photos of pairs should cover the square they're displayed in.">
                                        <Switch checked={config.coverFrame} onCheckedChange={v => updateConfig.mutate({ ...config, coverFrame: v })} />
                                    </ConfigItem>
                                    <ConfigItem title="Display count when searching" description="Whether to display the count when searching pairs.">
                                        <Switch checked={config.showCountOnSearch} onCheckedChange={v => updateConfig.mutate({ ...config, showCountOnSearch: v })} />
                                    </ConfigItem>
                                    <ConfigItem title="Least used pairs filter" description={'How long should take for a pair to be considered "least used" (in days).'} wrap="mobile">
                                        <InputNumber value={config.leastUsedDuration} placeholder={defaultConfig.leastUsedDuration.toString()} min={1} max={365} onChange={v => updateConfig.mutate({ ...config, leastUsedDuration: v })} />
                                    </ConfigItem>
                                    <ConfigItem title="Least used delay duration" description={'How long should a pair be delayed until it is considered "least used" again (in days).'} wrap="mobile">
                                        <InputNumber value={config.leastUsedDelayDuration} placeholder={defaultConfig.leastUsedDelayDuration.toString()} min={1} max={365} onChange={v => updateConfig.mutate({ ...config, leastUsedDelayDuration: v })} />
                                    </ConfigItem>
                                </ConfigSection>
                                <ConfigSection title="Security">
                                    <ConfigItem title="Public page" description="Allow anyone to view your sneaker collection without the need to log in. This will also allow them to see information about the pairs!">
                                        <Switch checked={config.publicPage} onCheckedChange={changePageSecurity} />
                                    </ConfigItem>
                                    <ConfigItem title="Location visibility" description="Choose who can view the location of your pairs." caution wrap="mobile">
                                        <VisibilitySelect value={config.locationVisibility} onChange={v => updateConfig.mutate({ ...config, locationVisibility: v })} />
                                    </ConfigItem>
                                    <ConfigItem title="Description visibility" description="Choose who can view the descriptions of your pairs." wrap="mobile">
                                        <VisibilitySelect value={config.descriptionVisibility} onChange={v => updateConfig.mutate({ ...config, descriptionVisibility: v })} />
                                    </ConfigItem>
                                    <ConfigItem title="Original Owner visibility" description="Choose who can view the original owner of your pairs." wrap="mobile">
                                        <VisibilitySelect value={config.originalOwnerVisibility} onChange={v => updateConfig.mutate({ ...config, originalOwnerVisibility: v })} />
                                    </ConfigItem>
                                </ConfigSection>
                            </>
                        )}
                        <ConfigSection>
                            <ConfigItem title="SneakrVault" description={`Version v${packageJson.version}`}>
                                <a href={packageJson.repository.url.replace(/git\+|\.git/g, "")} target="_blank" rel="noreferrer">
                                    <Button variant="outline">
                                        <IconExternalLink className="size-4" data-icon="inline-start" />
                                        View source
                                    </Button>
                                </a>
                            </ConfigItem>
                        </ConfigSection>
                    </TabsContent>
                    <TabsContent value={tabs[1]}>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Username</TableHead>
                                    <TableHead className="lg:w-36">Role</TableHead>
                                    <TableHead className="lg:w-56">Color</TableHead>
                                    <TableHead className="lg:w-24">Active</TableHead>
                                    <TableHead className="lg:w-20" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(users ?? []).map(u => (
                                    <UserTableRow key={u._id} user={u} />
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                    <TabsContent value={tabs[2]}>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="lg:w-20" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(locations ?? []).map(l => (
                                    <LocationTableRow key={l._id} location={l} />
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                    <TabsContent value={tabs[3]}>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-9" />
                                    <TableHead>Name</TableHead>
                                    <TableHead className="lg:w-20" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(brands ?? []).map(b => (
                                    <BrandTableRow key={b._id} brand={b} />
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

function ConfigSection({ title, children }: { title?: string; children?: React.ReactNode }) {
    return (
        <div className="space-y-4">
            {title && <h2 className="pl-5 text-2xl md:text-3xl text-transparent font-black bg-linear-to-b from-zinc-50 to-zinc-600 bg-clip-text tracking-tight">{title}</h2>}
            <div className="px-5 py-4 bg-accent rounded-2xl ring ring-border divide-y divide-border *:pt-4 *:pb-4 *:first:pt-0 *:last:pb-0">{children}</div>
        </div>
    );
}

function ConfigItem({ title, description, children, sideContent, caution = false, wrap = "never" }: { title: string; description?: string; children?: React.ReactNode; sideContent?: React.ReactNode; caution?: boolean; wrap?: "never" | "mobile" | "always" }) {
    return (
        <div className={cn("flex gap-x-4 sm:gap-x-5 md:gap-x-6 gap-y-4", wrap === "mobile" && "max-sm:flex-col gap-y-3", wrap === "always" && "flex-col gap-y-3")}>
            <div className="flex items-end gap-x-4 sm:gap-x-5 md:gap-x-6 flex-1">
                <div className="flex-1 space-y-1">
                    <h3 className="text-sm sm:text-base text-secondary-foreground font-bold">{title}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                        {description}
                        {caution && <span className="text-secondary-foreground font-semibold"> Proceed with caution!</span>}
                    </p>
                </div>
                {sideContent}
            </div>
            <div className={cn("flex items-center", wrap === "never" && "h-10 sm:h-11 md:h-12", wrap === "mobile" && "sm:h-11 md:h-12")}>{children}</div>
        </div>
    );
}

function InfoSelect({ value, onChange }: { value: Config["cardSecondaryInfo"]; onChange: (value: Config["cardSecondaryInfo"]) => unknown }) {
    const secondaryInfoMap = {
        nothing: { icon: IconForbid2, label: "Nothing" },
        location: { icon: IconMapPin, label: "Location" },
        brand: { icon: IconRosetteDiscountCheck, label: "Brand" },
        size: { icon: IconRuler2, label: "Size" },
        owner: { icon: IconUser, label: "Owner" },
    };
    const selectedItem = secondaryInfoMap[value];

    return (
        <Select value={value} onValueChange={v => onChange(v as keyof typeof secondaryInfoMap)}>
            <SelectTrigger className="w-full sm:w-52">
                <div className="size-full flex items-center gap-2">
                    <selectedItem.icon />
                    {selectedItem.label}
                </div>
            </SelectTrigger>
            <SelectContent>
                {Object.keys(secondaryInfoMap).map(k => {
                    const item = secondaryInfoMap[k as keyof typeof secondaryInfoMap];

                    return (
                        <SelectItem value={k} key={k}>
                            <item.icon />
                            {item.label}
                        </SelectItem>
                    );
                })}
            </SelectContent>
        </Select>
    );
}

function PairTypeSelect({ value, onChange }: { value: Config["defaultTypeFilter"]; onChange: (value: Config["defaultTypeFilter"]) => unknown }) {
    const pairTypeMap = {
        all: "All types",
        Sneakers: "Sneakers",
        Shoes: "Shoes",
        Boots: "Boots",
        "Flip-flops": "Flip-flops",
    };

    return (
        <Select value={value} onValueChange={v => onChange(v as keyof typeof pairTypeMap)}>
            <SelectTrigger className="w-full sm:w-52">{pairTypeMap[value]}</SelectTrigger>
            <SelectContent>
                {Object.keys(pairTypeMap).map(k => (
                    <SelectItem value={k} key={k}>
                        {pairTypeMap[k as keyof typeof pairTypeMap]}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

function HomepageSections() {
    const { config, updateConfig } = useConfig();
    const validConfigSections = (config.homepageSections as Block[]).filter(s => availableBlocks.includes(s));
    const missingSections = availableBlocks.filter(s => !validConfigSections.includes(s));

    function saveSections(homepageSections: Config["homepageSections"]) {
        updateConfig.mutate({ ...config, homepageSections });
    }

    function moveSection(index: number, direction: -1 | 1) {
        const targetIndex = index + direction;

        if (targetIndex < 0 || targetIndex >= validConfigSections.length) return;

        const nextSections = [...validConfigSections];
        const [section] = nextSections.splice(index, 1);

        if (!section) return;

        nextSections.splice(targetIndex, 0, section);
        saveSections(nextSections);
    }

    function removeSection(index: number) {
        saveSections(validConfigSections.filter((_, currentIndex) => currentIndex !== index));
    }

    function addSection(section: Block) {
        saveSections([...validConfigSections, section]);
    }

    return (
        <div className="size-full space-y-2">
            {validConfigSections.map((section, index) => {
                const SectionIcon = blockIcons[section];

                return (
                    <div key={section} className="pl-4 pr-3 py-3 flex items-center gap-2 bg-accent rounded-lg ring ring-border">
                        <div className="flex items-center gap-2 flex-1">
                            <SectionIcon className="size-4 shrink-0 text-primary" />
                            <p className="font-semibold">{section}</p>
                            {section === "SneakPick" && !config.sneakPickEnabled && <p className="ml-4 text-xs text-muted-foreground font-semibold opacity-50 tracking-wide uppercase">Disabled</p>}
                        </div>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon-sm" disabled={index === 0} onClick={() => moveSection(index, -1)}>
                                <IconArrowUp className="size-4" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" disabled={index === validConfigSections.length - 1} onClick={() => moveSection(index, 1)}>
                                <IconArrowDown className="size-4" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" disabled={section === "Grid"} onClick={() => removeSection(index)}>
                                <IconTrash className="size-4" />
                            </Button>
                        </div>
                    </div>
                );
            })}
            {!!missingSections.length && (
                <div className="mt-6 space-y-3">
                    <p className="text-xs text-muted-foreground font-semibold tracking-wide uppercase">Add blocks</p>
                    <div className="flex flex-wrap gap-2">
                        {missingSections.map(section => (
                            <Button key={section} variant="outline" size="sm" onClick={() => addSection(section)}>
                                <IconPlus className="size-4" data-icon="inline-start" />
                                Add {section}
                            </Button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function VisibilitySelect({ value, onChange }: { value: Config["locationVisibility"]; onChange: (value: Config["locationVisibility"]) => unknown }) {
    const { config } = useConfig();

    const visibilityMap = {
        protected: "Only for members",
        guests: "Guests and members",
        public: "Public",
    };

    return (
        <Select value={value} onValueChange={v => onChange(v as keyof typeof visibilityMap)}>
            <SelectTrigger className="w-full sm:w-52">{visibilityMap[value]}</SelectTrigger>
            <SelectContent>
                {Object.keys(visibilityMap).map(k => {
                    if (k !== "public" || config.publicPage)
                        return (
                            <SelectItem value={k} key={k}>
                                {visibilityMap[k as keyof typeof visibilityMap]}
                            </SelectItem>
                        );
                    else return null;
                })}
            </SelectContent>
        </Select>
    );
}

function InputNumber({ value, onChange, ...props }: OverrideProps<React.ComponentProps<"input">, { value: number; onChange: (value: number) => unknown }>) {
    const [displayValue, setDisplayValue] = useState(value.toString());

    function processChange(event: React.ChangeEvent<HTMLInputElement>) {
        const nextValue = event.currentTarget.value;
        const min = event.currentTarget.min ? Number(event.currentTarget.min) : -Infinity;
        const max = event.currentTarget.max ? Number(event.currentTarget.max) : Infinity;

        if (nextValue === "") {
            setDisplayValue("");
            return;
        }

        if (!/^\d+$/.test(nextValue)) return;

        const numericValue = Number(nextValue);
        if (numericValue < min || numericValue > max) return;

        setDisplayValue(nextValue);
        onChange(numericValue);
    }

    useEffect(() => {
        setDisplayValue(value.toString());
    }, [value]);

    return <Input {...props} type="text" inputMode="numeric" min={1} max={365} value={displayValue} onChange={processChange} />;
}

function UserTableRow({ user }: { user: Awaited<ReturnType<typeof bridge.users.get>>[number] }) {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const { data: session } = useQuery({
        queryKey: ["session"],
        queryFn: checkAuth,
    });

    const isCurrentUser = session?._id === user._id;

    return (
        <TableRow className="h-10">
            <TableCell>{user.username}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>{user.color}</TableCell>
            <TableCell>{user.active && <IconCheck size={20} />}</TableCell>
            <TableCell className="p-0 text-right">
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground" onClick={() => setEditDialogOpen(true)}>
                    <IconPencil />
                </Button>
                {!isCurrentUser && (
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground" onClick={() => setDeleteDialogOpen(true)}>
                        <IconTrash />
                    </Button>
                )}
                <AddUserDialog open={editDialogOpen} setOpen={setEditDialogOpen} user={user} isCurrentUser={isCurrentUser} adminEdit />
                <DeleteUserDialog open={deleteDialogOpen} setOpen={setDeleteDialogOpen} _id={user._id} />
            </TableCell>
        </TableRow>
    );
}

function LocationTableRow({ location }: { location: Awaited<ReturnType<typeof bridge.locations.get>>[number] }) {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    return (
        <TableRow className="h-10">
            <TableCell>{location.name}</TableCell>
            <TableCell className="p-0 text-right">
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground" onClick={() => setEditDialogOpen(true)}>
                    <IconPencil />
                </Button>
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground" onClick={() => setDeleteDialogOpen(true)}>
                    <IconTrash />
                </Button>
                <AddLocationDialog open={editDialogOpen} setOpen={setEditDialogOpen} location={location} />
                <DeleteLocationDialog open={deleteDialogOpen} setOpen={setDeleteDialogOpen} _id={location._id} />
            </TableCell>
        </TableRow>
    );
}

function BrandTableRow({ brand }: { brand: Awaited<ReturnType<typeof bridge.brands.get>>[number] }) {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    return (
        <TableRow className="h-10">
            <TableCell className="p-0">{brand.iconUrl && <img src={brand.iconUrl} alt={brand.name} className="size-5 object-contain" />}</TableCell>
            <TableCell>{brand.name}</TableCell>
            <TableCell className="p-0 text-right">
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground" onClick={() => setEditDialogOpen(true)}>
                    <IconPencil />
                </Button>
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground" onClick={() => setDeleteDialogOpen(true)}>
                    <IconTrash />
                </Button>
                <AddBrandDialog open={editDialogOpen} setOpen={setEditDialogOpen} brand={brand} />
                <DeleteBrandDialog open={deleteDialogOpen} setOpen={setDeleteDialogOpen} _id={brand._id} />
            </TableCell>
        </TableRow>
    );
}
