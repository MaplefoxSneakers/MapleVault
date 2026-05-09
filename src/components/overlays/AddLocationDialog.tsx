import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import bridge from "@/data/bridge";
import type { Location } from "@/lib/models";

interface AddLocationDialogProps {
    open: boolean;
    setOpen: (open: boolean) => unknown;
    location?: Location;
}

export function AddLocationDialog(props: AddLocationDialogProps) {
    const { open, ...rest } = props;

    return (
        <Dialog open={open} onOpenChange={rest.setOpen}>
            <DialogContent showCloseButton={false}>{open && <AddLocationDialogContent {...rest} />}</DialogContent>
        </Dialog>
    );
}

function AddLocationDialogContent({ setOpen, location }: Omit<AddLocationDialogProps, "open">) {
    const [name, setName] = useState(location?.name ?? "");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string>();
    const queryClient = useQueryClient();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSaving(true);
        setError("");

        if (!location) {
            const result = await bridge.locations.add({
                data: {
                    name,
                },
            });
            if (!result.success) {
                setError(result.error);
                setIsSaving(false);
                return;
            }
        } else {
            const result = await bridge.locations.edit({
                data: {
                    _id: location._id,
                    name,
                },
            });
            if (!result.success) {
                setError(result.error);
                setIsSaving(false);
                return;
            }
        }

        await queryClient.invalidateQueries({ queryKey: ["locations"] });

        setOpen(false);
        setIsSaving(false);
    }

    return (
        <form className="contents" onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>{!location ? "Add location" : "Edit location"}</DialogTitle>
            </DialogHeader>
            <FieldGroup>
                <Field>
                    <Label htmlFor="locationName">Name</Label>
                    <Input id="locationName" name="name" maxLength={30} placeholder={location?.name ?? "Required"} disabled={isSaving} value={name} onChange={e => setName(e.target.value)} />
                </Field>
                {error && <p className="text-sm text-destructive">{error}</p>}
            </FieldGroup>
            <DialogFooter>
                <DialogClose disabled={isSaving} render={<Button variant="outline">Cancel</Button>} />
                <Button type="submit" className="sm:w-31" disabled={isSaving || !name}>
                    {!isSaving ? "Save changes" : <Spinner />}
                </Button>
            </DialogFooter>
        </form>
    );
}
