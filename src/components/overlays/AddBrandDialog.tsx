import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { IconTrash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import bridge from "@/data/bridge";
import type { Brand } from "@/lib/models";

interface AddBrandDialogProps {
    open: boolean;
    setOpen: (open: boolean) => unknown;
    brand?: Brand;
}

export function AddBrandDialog(props: AddBrandDialogProps) {
    const { open, ...rest } = props;

    return (
        <Dialog open={open} onOpenChange={rest.setOpen}>
            <DialogContent showCloseButton={false}>{open && <AddBrandDialogContent {...rest} />}</DialogContent>
        </Dialog>
    );
}

function AddBrandDialogContent({ setOpen, brand }: Omit<AddBrandDialogProps, "open">) {
    const [name, setName] = useState(brand?.name ?? "");
    const [icon, setIcon] = useState<File | string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string>();
    const queryClient = useQueryClient();
    const brandPresets = ["Nike", "Jordan", "Adidas", "Yeezy", "Off-White", "Supreme", "Vans", "New Balance", "TheNorthFace", "Puma", "Salomon", "Converse", "Reebok", "Fila", "ASICS", "Hoka", "Veja", "Skechers", "Kickers", "Docs"] as const;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSaving(true);
        setError("");

        let iconId: string | null | undefined = null;
        if (icon) {
            let iconToPush: File;
            if (typeof icon === "string") {
                const blob = await (await fetch(icon)).blob();
                iconToPush = new File([blob], icon.split("/").pop() ?? "icon.svg", { type: blob.type });
            } else iconToPush = icon;

            const url = await bridge.storage.generate();
            const upload = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": iconToPush.type },
                body: iconToPush,
            });
            iconId = (await upload.json()).storageId;
        } else if (brand) iconId = undefined;

        if (!brand) {
            const result = await bridge.brands.add({
                data: {
                    name,
                    icon: iconId ?? undefined,
                },
            });
            if (!result.success) {
                setError(result.error);
                setIsSaving(false);
                return;
            }
        } else {
            const result = await bridge.brands.edit({
                data: {
                    _id: brand._id,
                    name,
                    icon: iconId,
                },
            });
            if (!result.success) {
                setError(result.error);
                setIsSaving(false);
                return;
            }
        }

        await queryClient.invalidateQueries({ queryKey: ["brands"] });

        setOpen(false);
        setIsSaving(false);
    }

    useEffect(() => {
        if (icon) {
            if (typeof icon === "string") setPreview(icon);
            else setPreview(URL.createObjectURL(icon));
        }
    }, [icon]);

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    return (
        <form className="contents" onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>{!brand ? "Add brand" : "Edit brand"}</DialogTitle>
            </DialogHeader>
            <FieldGroup>
                <Field>
                    <Label htmlFor="brandName">Name</Label>
                    <Input id="brandName" name="name" maxLength={35} placeholder={brand?.name ?? "Required"} disabled={isSaving} value={name} onChange={e => setName(e.target.value)} />
                </Field>
                <Field>
                    <Label htmlFor="brandIcon">Icon</Label>
                    <div className="flex gap-2">
                        <Input id="brandIcon" name="icon" type="file" disabled={isSaving} accept="image/*,.svg" onChange={e => setIcon(e.target.files?.[0] ?? null)} />
                        <div className="size-9 p-1.5 bg-accent rounded-md border border-input aspect-square">{preview && <img src={preview} alt={name} className="size-full object-contain" />}</div>
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={isSaving || icon === null}
                            onClick={() => {
                                setIcon(null);
                                setPreview(null);
                            }}
                        >
                            <IconTrash className="size-4" />
                        </Button>
                    </div>
                    <div className="mt-2 grid grid-cols-10 gap-2">
                        {brandPresets.map(b => {
                            const slug = b.replace(/\s+/g, "");

                            return (
                                <Button
                                    key={b}
                                    variant="outline"
                                    className="w-full h-auto p-1.25 aspect-square"
                                    size="icon"
                                    onClick={() => {
                                        setName(b);
                                        setIcon(`/brands/${slug}.svg`);
                                    }}
                                >
                                    <img src={`/brands/${slug}.svg`} alt={b} className="size-full object-contain" />
                                </Button>
                            );
                        })}
                    </div>
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
