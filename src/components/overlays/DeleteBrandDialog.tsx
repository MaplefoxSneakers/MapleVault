import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import bridge from "@/data/bridge";
import type { Id } from "@db/dataModel";

interface DeleteBrandDialogProps {
    open: boolean;
    setOpen: (open: boolean) => unknown;
    _id: Id<"brands">;
}

export function DeleteBrandDialog({ open, setOpen, _id }: DeleteBrandDialogProps) {
    const [isSaving, setIsSaving] = useState(false);
    const queryClient = useQueryClient();

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSaving(true);

        const result = await bridge.brands.remove({ data: { _id } });
        if (result.success) await queryClient.invalidateQueries({ queryKey: ["brands"] });

        setOpen(false);
        setIsSaving(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent showCloseButton={false}>
                <form className="contents" onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Delete brand</DialogTitle>
                        <DialogDescription className="text-foreground font-medium">Are you sure you want to delete this brand? Make sure no sneakers are stored with this brand before deleting it!</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose disabled={isSaving} render={<Button variant="outline">No</Button>} />
                        <Button type="submit" className="sm:w-14" disabled={isSaving}>
                            {!isSaving ? "Yes" : <Spinner />}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
