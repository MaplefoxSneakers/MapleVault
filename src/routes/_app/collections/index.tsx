import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { IconLayoutList, IconPlus, IconSearch, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { CollectionCard, CollectionCardSkeleton } from "@/components/CollectionCard";
import { Header } from "@/components/Header";
import { UserMenu } from "@/components/UserMenu";
import { AddCollectionDialog } from "@/components/overlays/AddCollectionDialog";
import { checkAuth } from "@/data/auth";
import bridge from "@/data/bridge";
import { useLogout } from "@/lib/useLogout";
import { cn, creationSort } from "@/lib/utils";

export const Route = createFileRoute("/_app/collections/")({
    component: CollectionsList,
    beforeLoad: () => checkAuth(),
});

function CollectionsList() {
    const [addCollectionOpen, setAddCollectionOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [scrolling, setScrolling] = useState(false);
    const logout = useLogout();
    const { isPending, data: collections } = useQuery({
        queryKey: ["collections"],
        queryFn: bridge.collections.get,
    });
    const { auth } = Route.useRouteContext();
    const filtered = (collections ?? []).filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

    function addCollection() {
        setAddCollectionOpen(true);
    }

    return (
        <div className="min-h-screen">
            <Header
                left={
                    auth.role !== "guest" && (
                        <Button className="md:hidden" variant="outline" size="icon" onClick={addCollection}>
                            <IconPlus className="size-5" />
                        </Button>
                    )
                }
                right={
                    <>
                        <AddCollectionDialog open={addCollectionOpen} setOpen={setAddCollectionOpen} />
                        <Button className="md:hidden" variant="outline" size="icon" onClick={() => setSearchOpen(true)}>
                            <IconSearch className="size-5" />
                        </Button>
                        {auth.role !== "guest" && (
                            <Button className="max-md:hidden" variant="outline" size="icon" onClick={addCollection}>
                                <IconPlus className="size-5" />
                            </Button>
                        )}
                        <div
                            className={cn(
                                "flex gap-2 max-md:fixed max-md:left-0 max-md:right-0 max-md:p-6 max-md:ring max-md:transition-all max-md:duration-300",
                                !searchOpen ? "max-md:-top-22 max-md:ring-transparent" : "max-md:top-0 max-md:ring-border ",
                                !scrolling ? "max-md:bg-background" : "max-md:bg-accent",
                            )}
                        >
                            <InputGroup className="w-full md:w-88 bg-secondary">
                                <InputGroupAddon>
                                    <IconSearch className="size-4 text-muted-foreground" />
                                </InputGroupAddon>
                                <InputGroupInput value={search} placeholder="Search collections..." onChange={e => setSearch(e.target.value)} />
                            </InputGroup>
                            <Button className="md:hidden" variant="outline" size="icon" onClick={() => setSearchOpen(false)}>
                                <IconX className="size-5" />
                            </Button>
                        </div>
                        <UserMenu logout={logout} />
                    </>
                }
                outScrolling={setScrolling}
            />
            <div className="max-w-7xl mx-auto pt-4 pb-20 flex flex-col gap-8">
                <div className="px-6 md:px-8 flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        {!search ? <IconLayoutList className="size-6 text-primary" /> : <IconSearch className="size-6 text-primary" />}
                        <h2 className="text-xl font-bold text-white">{!search ? "All Collections" : "Search Results"}</h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {isPending ? (
                            Array(15)
                                .fill(null)
                                .map((_, i) => <CollectionCardSkeleton key={i} />)
                        ) : filtered.length !== 0 ? (
                            filtered.sort(creationSort).map(c => <CollectionCard key={c._id} collection={c} />)
                        ) : (
                            <div className="py-20 flex flex-col items-center gap-4 col-span-full font-medium text-center text-muted-foreground">
                                {!search ? (
                                    <>
                                        <p>You don't have any collections. Start by creating a new one!</p>
                                        {auth.role !== "guest" && <Button onClick={addCollection}>Add collection</Button>}
                                    </>
                                ) : (
                                    <p>No collections found matching "{search}"</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
