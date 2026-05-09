import { useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { IconCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import bridge from "@/data/bridge";
import { CollectionPhoto } from "../CollectionPhoto";
import type { Id } from "@db/dataModel";

interface AddToCollectionDialogProps {
    open: boolean;
    setOpen: (open: boolean) => unknown;
    sneakerId: string;
}

export function AddToCollectionDialog(props: AddToCollectionDialogProps) {
    const { open, ...rest } = props;

    return (
        <Dialog open={open} onOpenChange={rest.setOpen}>
            <DialogContent showCloseButton={false}>{open && <AddToCollectionDialogContent {...rest} />}</DialogContent>
        </Dialog>
    );
}

function AddToCollectionDialogContent({ sneakerId }: Omit<AddToCollectionDialogProps, "open">) {
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string>();
    const { isPending, data: collections } = useQuery({
        queryKey: ["collections"],
        queryFn: bridge.collections.get,
    });
    const queryClient = useQueryClient();

    async function toggleCollection(collectionId: string, currentSneakers: string[]) {
        setIsSaving(true);
        setError("");

        const hasSneaker = currentSneakers.includes(sneakerId);
        const newSneakers = hasSneaker ? currentSneakers.filter(id => id !== sneakerId) : [...currentSneakers, sneakerId];

        const result = await bridge.collections.edit({
            data: { _id: collectionId, sneakers: newSneakers },
        });
        if (!result.success) {
            setError(result.error);
            setIsSaving(false);
            return;
        }

        await queryClient.invalidateQueries({ queryKey: ["collections"] });
        setIsSaving(false);
    }

    return (
        <>
            <DialogHeader>
                <DialogTitle>Add to collection</DialogTitle>
            </DialogHeader>
            <div className="w-full max-h-52 flex flex-col bg-secondary rounded-xl ring ring-border/75 divide-y divide-border/75 overflow-y-auto">
                {isPending ? (
                    <div className="h-14 flex justify-center items-center">
                        <Spinner className="size-5 text-muted-foreground" />
                    </div>
                ) : (collections ?? []).length !== 0 ? (
                    (collections ?? []).map(c => (
                        <button key={c._id} type="button" className="p-2 flex justify-between items-center" disabled={isSaving} onClick={() => toggleCollection(c._id, c.sneakers || [])}>
                            <div className="flex items-center gap-3 flex-1">
                                <CollectionPhoto collection={c} className="size-10 rounded-sm" />
                                <div className="flex flex-col gap-0.5">
                                    <span className="w-fit text-sm font-semibold">{c.name}</span>
                                    <span className="w-fit text-xs text-muted-foreground">
                                        {c.sneakers.length} {c.sneakers.length === 1 ? "pair" : "pairs"}
                                    </span>
                                </div>
                            </div>
                            <div className="px-2">{c.sneakers.includes(sneakerId as Id<"sneakers">) && <IconCheck className="size-5 text-muted-foreground" />}</div>
                        </button>
                    ))
                ) : (
                    <div className="h-14 flex justify-center items-center">
                        <p className="text-sm text-muted-foreground">No collections yet</p>
                    </div>
                )}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
                <DialogClose disabled={isSaving} className="sm:w-18" render={<Button>{!isSaving ? "Done" : <Spinner />}</Button>} />
            </DialogFooter>
        </>
    );
}
