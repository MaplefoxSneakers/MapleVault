import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import bridge from "@/data/bridge";
import type { Id } from "@db/dataModel";

interface DeleteSneakerDialogProps {
    open: boolean;
    setOpen: (open: boolean) => unknown;
    _id: Id<"sneakers">;
}

export function DeleteSneakerDialog({ open, setOpen, _id }: DeleteSneakerDialogProps) {
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSaving(true);

        const result = await bridge.sneakers.remove({ data: { _id } });
        if (result.success) {
            queryClient.invalidateQueries({ queryKey: ["sneakers"] });
            navigate({ to: "/" });
        } else setOpen(false);

        setIsSaving(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent showCloseButton={false}>
                <form className="contents" onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Delete sneaker</DialogTitle>
                        <DialogDescription className="text-foreground font-medium">Are you sure you want to delete this pair? You cannot recover its data after deletion!</DialogDescription>
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
