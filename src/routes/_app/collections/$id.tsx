import { useState } from "react";
import { createFileRoute, useNavigate, useRouter, useCanGoBack } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { IconChevronLeft, IconDots, IconPencil, IconTrash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { CollectionPhoto } from "@/components/CollectionPhoto";
import { Header } from "@/components/Header";
import { AddCollectionDialog } from "@/components/overlays/AddCollectionDialog";
import { DeleteCollectionDialog } from "@/components/overlays/DeleteCollectionDialog";
import { SneakerCard, SneakerCardSkeleton } from "@/components/SneakerCard";
import { checkAuth } from "@/data/auth";
import bridge from "@/data/bridge";
import { creationSort } from "@/lib/utils";

export const Route = createFileRoute("/_app/collections/$id")({
    component: CollectionDetails,
    beforeLoad: () => checkAuth(),
});

function CollectionDetails() {
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const canGoBack = useCanGoBack();
    const navigate = useNavigate();
    const { id } = Route.useParams();
    const { isPending: collectionsPending, data: collection } = useQuery({
        queryKey: ["collections"],
        queryFn: bridge.collections.get,
        select: items => items.find(i => i._id === id),
    });
    const { isPending: sneakersPending, data: sneakers } = useQuery({
        queryKey: ["sneakers"],
        queryFn: bridge.sneakers.get,
        select: items => items.filter(s => collection?.sneakers.includes(s._id)),
    });
    const router = useRouter();
    const { auth } = Route.useRouteContext();
    const isPending = collectionsPending || sneakersPending;

    function handleBack() {
        if (canGoBack) router.history.back();
        else navigate({ to: "/collections" });
    }

    if (!isPending && !collection) {
        navigate({ to: "/collections" });
        return null;
    }

    return (
        <div className="min-h-screen">
            <Header
                left={
                    <Button className="md:hidden" variant="outline" size="icon" onClick={handleBack}>
                        <IconChevronLeft className="size-5" />
                    </Button>
                }
                right={
                    <>
                        {collection && (
                            <>
                                <AddCollectionDialog open={editOpen} setOpen={setEditOpen} collection={collection} />
                                <DeleteCollectionDialog open={deleteOpen} setOpen={setDeleteOpen} _id={collection._id} />
                            </>
                        )}
                        <Button className="max-md:hidden" variant="outline" onClick={handleBack}>
                            <IconChevronLeft className="size-5" data-icon="inline-start" />
                            Back to collections
                        </Button>
                        {auth.role !== "guest" && (
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    render={
                                        <Button variant="outline" size="icon">
                                            <IconDots className="size-5" />
                                        </Button>
                                    }
                                />
                                <DropdownMenuContent className="w-42" align="end" sideOffset={8}>
                                    <DropdownMenuItem onClick={() => setEditOpen(true)}>
                                        <IconPencil className="size-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
                                        <IconTrash className="size-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </>
                }
            />
            <div className="max-w-7xl mx-auto pt-4 max-md:pb-44 max-md:pwa:pb-48 px-6 md:px-8 flex flex-col gap-6 sm:gap-8">
                <div className="w-full flex gap-5 sm:gap-6 md:gap-8">
                    {collection ? (
                        <>
                            <CollectionPhoto collection={collection} className="size-24 sm:size-28 md:size-32 rounded-xl ring ring-border shadow-2xl shadow-primary/25 animate-in fade-in zoom-in duration-500" />
                            <div className="flex flex-col justify-center gap-1 flex-1 animate-in fade-in duration-1000">
                                <h1 className="text-xl sm:text-3xl md:text-2xl lg:text-4xl text-transparent font-black bg-linear-to-b from-zinc-50 to-zinc-600 bg-clip-text tracking-tight">{collection.name}</h1>
                                <h2 className="sm:text-xl md:text-lg lg:text-2xl text-secondary-foreground font-bold">
                                    {collection.sneakers.length} {collection.sneakers.length === 1 ? "pair" : "pairs"}
                                </h2>
                            </div>
                        </>
                    ) : (
                        <>
                            <Skeleton className="size-24 sm:size-28 md:size-32 rounded-xl" />
                            <div className="flex flex-col justify-center gap-1 flex-1">
                                <Skeleton className="w-1/3 h-10" />
                                <Skeleton className="w-2/5 h-8" />
                            </div>
                        </>
                    )}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {isPending ? (
                        Array(15)
                            .fill(null)
                            .map((_, i) => <SneakerCardSkeleton key={i} />)
                    ) : (sneakers ?? []).length !== 0 ? (
                        (sneakers ?? []).sort(creationSort).map(s => <SneakerCard key={s._id} sneaker={s} />)
                    ) : (
                        <div className="py-20 flex flex-col items-center gap-4 col-span-full font-medium text-center text-muted-foreground">
                            <p>Your collection is empty. Start by adding some pairs!</p>
                            {auth.role !== "guest" && <Button onClick={() => navigate({ to: "/" })}>Browse sneakers</Button>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
