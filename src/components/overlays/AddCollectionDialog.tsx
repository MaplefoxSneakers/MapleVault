import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import colors from "tailwindcss/colors";
import { IconTrash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { SneakerPhoto } from "@/components/SneakerPhoto";
import bridge from "@/data/bridge";
import { cn } from "@/lib/utils";
import type { Collection } from "@/lib/models";

interface AddCollectionDialogProps {
    open: boolean;
    setOpen: (open: boolean) => unknown;
    collection?: Collection;
}

export function AddCollectionDialog(props: AddCollectionDialogProps) {
    const { open, ...rest } = props;

    return (
        <Dialog open={open} onOpenChange={rest.setOpen}>
            <DialogContent showCloseButton={false}>{open && <AddCollectionDialogContent {...rest} />}</DialogContent>
        </Dialog>
    );
}

function AddCollectionDialogContent({ setOpen, collection }: Omit<AddCollectionDialogProps, "open">) {
    const [name, setName] = useState(collection?.name ?? "");
    const [cover, setCover] = useState(collection?.cover ?? []);
    const [sneakers, setSneakers] = useState(collection?.sneakers ?? []);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string>();
    const { data: sneakerData } = useQuery({
        queryKey: ["sneakers"],
        queryFn: bridge.sneakers.get,
        select: items => items.filter(s => sneakers.includes(s._id)),
    });
    const queryClient = useQueryClient();

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSaving(true);
        setError("");

        if (!collection) {
            const result = await bridge.collections.add({
                data: { name, cover, sneakers: [] },
            });
            if (!result.success) {
                setError(result.error);
                setIsSaving(false);
                return;
            }
        } else {
            const result = await bridge.collections.edit({
                data: {
                    _id: collection._id,
                    name,
                    cover,
                    sneakers,
                },
            });
            if (!result.success) {
                setError(result.error);
                setIsSaving(false);
                return;
            }
        }

        await queryClient.invalidateQueries({ queryKey: ["collections"] });

        setOpen(false);
        setIsSaving(false);
    }

    return (
        <form className="contents" onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>{!collection ? "Add collection" : "Edit collection"}</DialogTitle>
            </DialogHeader>
            <FieldGroup>
                <Field>
                    <Label htmlFor="collectionName">Name</Label>
                    <Input id="collectionName" name="name" maxLength={40} placeholder="Paris Trip" disabled={isSaving} value={name} onChange={e => setName(e.target.value)} />
                </Field>
                <Field>
                    <Label htmlFor="collectionCover">Cover</Label>
                    <div className="flex gap-2">
                        <Button
                            className={cn("h-5 p-0 flex-1 bg-linear-to-r from-red-400 to-rose-700 border-2 border-red-400 rounded-sm inset-ring-2 inset-ring-transparent cursor-pointer", cover[0] === colors.red[400] && "inset-ring-background")}
                            onClick={() => setCover([colors.red[400], colors.rose[700]])}
                        />
                        <Button
                            className={cn("h-5 p-0 flex-1 bg-linear-to-r from-orange-400 to-orange-700 border-2 border-orange-400 rounded-sm inset-ring-2 inset-ring-transparent cursor-pointer", cover[0] === colors.orange[400] && "inset-ring-background")}
                            onClick={() => setCover([colors.orange[400], colors.orange[700]])}
                        />
                        <Button
                            className={cn("h-5 p-0 flex-1 bg-linear-to-r from-amber-400 to-orange-500 border-2 border-amber-400 rounded-sm inset-ring-2 inset-ring-transparent cursor-pointer", cover[0] === colors.amber[400] && "inset-ring-background")}
                            onClick={() => setCover([colors.amber[400], colors.orange[500]])}
                        />
                        <Button
                            className={cn("h-5 p-0 flex-1 bg-linear-to-r from-lime-400 to-green-700 border-2 border-lime-400 rounded-sm inset-ring-2 inset-ring-transparent cursor-pointer", cover[0] === colors.lime[400] && "inset-ring-background")}
                            onClick={() => setCover([colors.lime[400], colors.green[700]])}
                        />
                        <Button
                            className={cn("h-5 p-0 flex-1 bg-linear-to-r from-emerald-400 to-teal-700 border-2 border-emerald-400 rounded-sm inset-ring-2 inset-ring-transparent cursor-pointer", cover[0] === colors.emerald[400] && "inset-ring-background")}
                            onClick={() => setCover([colors.emerald[400], colors.teal[700]])}
                        />
                        <Button
                            className={cn("h-5 p-0 flex-1 bg-linear-to-r from-sky-400 to-blue-700 border-2 border-sky-400 rounded-sm inset-ring-2 inset-ring-transparent cursor-pointer", cover[0] === colors.sky[400] && "inset-ring-background")}
                            onClick={() => setCover([colors.sky[400], colors.blue[700]])}
                        />
                        <Button
                            className={cn("h-5 p-0 flex-1 bg-linear-to-r from-indigo-500 to-indigo-800 border-2 border-indigo-400 rounded-sm inset-ring-2 inset-ring-transparent cursor-pointer", cover[0] === colors.indigo[500] && "inset-ring-background")}
                            onClick={() => setCover([colors.indigo[500], colors.indigo[800]])}
                        />
                        <Button
                            className={cn("h-5 p-0 flex-1 bg-linear-to-r from-purple-500 to-violet-800 border-2 border-purple-400 rounded-sm inset-ring-2 inset-ring-transparent cursor-pointer", cover[0] === colors.purple[500] && "inset-ring-background")}
                            onClick={() => setCover([colors.purple[500], colors.violet[800]])}
                        />
                        <Button
                            className={cn("h-5 p-0 flex-1 bg-linear-to-r from-rose-400 to-pink-700 border-2 border-rose-400 rounded-sm inset-ring-2 inset-ring-transparent cursor-pointer", cover[0] === colors.rose[400] && "inset-ring-background")}
                            onClick={() => setCover([colors.rose[400], colors.pink[700]])}
                        />
                    </div>
                </Field>
                {sneakerData && sneakerData.length !== 0 && (
                    <Field>
                        <Label>Pairs in collection</Label>
                        <div className="w-full max-h-52 flex flex-col bg-secondary rounded-xl ring ring-border/75 divide-y divide-border/75 overflow-y-auto">
                            {sneakerData.map(s => (
                                <div key={s._id} className="p-2 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <SneakerPhoto sneaker={s} className="size-10 *:rounded-sm!" hideText />
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm font-semibold">{s.name}</span>
                                            <span className="text-xs text-muted-foreground">{s.color}</span>
                                        </div>
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" className="group" onClick={() => setSneakers(prev => prev.filter(id => id !== s._id))}>
                                        <IconTrash className="size-4 text-muted-foreground group-hover:text-destructive transition-colors" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Field>
                )}
                {error && <p className="text-sm text-destructive">{error}</p>}
            </FieldGroup>
            <DialogFooter>
                <DialogClose disabled={isSaving} render={<Button variant="outline">Cancel</Button>} />
                <Button type="submit" className="sm:w-31" disabled={isSaving || !name || !cover.length}>
                    {!isSaving ? "Save changes" : <Spinner />}
                </Button>
            </DialogFooter>
        </form>
    );
}
