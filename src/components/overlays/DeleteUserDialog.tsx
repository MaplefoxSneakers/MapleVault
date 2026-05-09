import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import bridge from "@/data/bridge";
import type { Id } from "@db/dataModel";

interface DeleteUserDialogProps {
    open: boolean;
    setOpen: (open: boolean) => unknown;
    _id: Id<"users">;
}

export function DeleteUserDialog({ open, setOpen, _id }: DeleteUserDialogProps) {
    const [isSaving, setIsSaving] = useState(false);
    const queryClient = useQueryClient();

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSaving(true);

        const result = await bridge.users.remove({ data: { _id } });
        if (result.success) await queryClient.invalidateQueries({ queryKey: ["users"] });

        setOpen(false);
        setIsSaving(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent showCloseButton={false}>
                <form className="contents" onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Delete user</DialogTitle>
                        <DialogDescription className="text-foreground font-medium">Are you sure you want to delete this user? You cannot recover it after deletion!</DialogDescription>
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
