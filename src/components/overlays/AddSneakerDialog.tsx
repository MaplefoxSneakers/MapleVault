import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { IconChevronDown, IconTrash } from "@tabler/icons-react";
import { format, setDate as setDayOfMonth, setMonth, setYear } from "date-fns";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroupAddon } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import bridge from "@/data/bridge";
import { formatPartialDate, getDatePrecision, type DatePrecision } from "@/lib/utils";
import type { Sneaker, User } from "@/lib/models";

interface AddSneakerDialogProps {
    open: boolean;
    setOpen: (open: boolean) => unknown;
    sneaker?: Sneaker;
}

export function AddSneakerDialog(props: AddSneakerDialogProps) {
    const { open, ...rest } = props;

    return (
        <Dialog open={open} onOpenChange={rest.setOpen}>
            <DialogContent showCloseButton={false}>{open && <AddSneakerDialogContent {...rest} />}</DialogContent>
        </Dialog>
    );
}

function AddSneakerDialogContent({ setOpen, sneaker }: Omit<AddSneakerDialogProps, "open">) {
    const [name, setName] = useState(sneaker?.name ?? "");
    const [color, setColor] = useState(sneaker?.color ?? "");
    const [size, setSize] = useState(sneaker?.size?.toString() ?? "");
    const [brand, setBrand] = useState(sneaker?.brand._id ?? "");
    const [photo, setPhoto] = useState<File | null>();
    const [description, setDescription] = useState(sneaker?.description ?? "");
    const [location, setLocation] = useState(sneaker?.location._id ?? "");
    const [owner, setOwner] = useState(sneaker?.owner._id ?? "");
    const [date, setDate] = useState(sneaker?.date ?? "");
    const [precision, setPrecision] = useState<DatePrecision>(getDatePrecision(sneaker?.date));
    const [style, setStyle] = useState(sneaker?.style ?? "");
    const [type, setType] = useState<Sneaker["type"]>(sneaker?.type ?? "Sneakers");
    const [originalOwnerType, setOriginalOwnerType] = useState<"local" | "outside">(sneaker?.originalOwner._id ? "local" : sneaker?.originalOwner.username ? "outside" : "local");
    const [originalOwnerId, setOriginalOwnerId] = useState(sneaker?.originalOwner._id ?? "");
    const [originalOwnerName, setOriginalOwnerName] = useState(sneaker?.originalOwner.username ?? "");
    const [condition, setCondition] = useState(sneaker?.condition);
    const [isConditionValid, setIsConditionValid] = useState(true);
    const [decommissioned, setDecommissioned] = useState(sneaker?.decommissioned ?? false);
    const [stockxUrl, setStockxUrl] = useState(sneaker?.stockxUrl ?? "");
    const [goatUrl, setGoatUrl] = useState(sneaker?.goatUrl ?? "");
    const [authenticityTag, setAuthenticityTag] = useState(sneaker?.authenticityTag ?? "");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string>();
    const originalOwnerCombobox = useRef<HTMLDivElement>(null);
    const { data: brands } = useQuery({
        queryKey: ["brands"],
        queryFn: bridge.brands.get,
    });
    const { data: locations } = useQuery({
        queryKey: ["locations"],
        queryFn: bridge.locations.get,
    });
    const { data: owners } = useQuery({
        queryKey: ["owners"],
        queryFn: bridge.users.getOwners,
    });
    const queryClient = useQueryClient();

    const fractions: Record<string, string> = { "1/2": "½", "1/3": "⅓", "2/3": "⅔" };
    const isValidStockxUrl = (url: string) => /^https:\/\/(www\.)?stockx\.com\/[a-zA-Z0-9-]+$/g.test(url);
    const isValidGoatUrl = (url: string) => /^https:\/\/(www\.)?goat\.com\/sneakers\/[a-zA-Z0-9-]+$/g.test(url);

    function parseSize(size: string) {
        if (!/^[\d./½⅓⅔]*$/.test(size)) return;

        if (/\d\/\d/g.test(size)) {
            for (const frac of size.matchAll(/(\d)\/(\d)/g)) {
                const char = fractions[`${frac[1]}/${frac[2]}`];
                if (char) size = size.replace(frac[0], char);
            }
        }

        setSize(size);
    }

    function onSelect(val: string) {
        setOriginalOwnerType("local");
        setOriginalOwnerId(val);
        setOriginalOwnerName(owners?.find(o => o._id === val)?.username ?? "");
    }

    function onCustomSelect(val: string) {
        setOriginalOwnerType("outside");
        setOriginalOwnerId("");
        setOriginalOwnerName(val);
    }

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSaving(true);
        setError("");

        let photoId: string | null | undefined;
        if (photo) {
            const url = await bridge.storage.generate();
            const upload = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": photo.type },
                body: photo,
            });
            photoId = (await upload.json()).storageId;
        } else photoId = photo;

        if (!sneaker) {
            const result = await bridge.sneakers.add({
                data: {
                    name,
                    color,
                    size: size || undefined,
                    brand: brand || undefined,
                    photo: photoId ?? undefined,
                    description: description || undefined,
                    location: location || undefined,
                    owner: owner || undefined,
                    date: date || undefined,
                    style: style || undefined,
                    type,
                    originalOwner: !originalOwnerId && !originalOwnerName ? undefined : originalOwnerType === "local" ? { type: "local", id: originalOwnerId } : { type: "outside", name: originalOwnerName },
                    condition: condition || undefined,
                    decommissioned,
                    stockxUrl: stockxUrl || undefined,
                    goatUrl: goatUrl || undefined,
                    authenticityTag: authenticityTag || undefined,
                },
            });
            if (!result.success) {
                setError(result.error);
                setIsSaving(false);
                return;
            }
        } else {
            const result = await bridge.sneakers.edit({
                data: {
                    _id: sneaker._id,
                    name,
                    color,
                    size: size || undefined,
                    brand: brand || undefined,
                    photo: photoId,
                    description: description || undefined,
                    location: location || undefined,
                    owner: owner || undefined,
                    date: date || undefined,
                    style: style || undefined,
                    type,
                    originalOwner: !originalOwnerId && !originalOwnerName ? undefined : originalOwnerType === "local" ? { type: "local", id: originalOwnerId } : { type: "outside", name: originalOwnerName },
                    condition: condition || undefined,
                    decommissioned,
                    stockxUrl: stockxUrl || undefined,
                    goatUrl: goatUrl || undefined,
                    authenticityTag: authenticityTag || undefined,
                },
            });
            if (!result.success) {
                setError(result.error);
                setIsSaving(false);
                return;
            }
        }

        await queryClient.invalidateQueries({ queryKey: ["sneakers"] });

        setOpen(false);
        setIsSaving(false);
    }

    const selBrand = brands?.find(b => b._id === brand);
    const selLocation = locations?.find(l => l._id === location) ?? "Outside";
    const selOwner = owners?.find(o => o._id === owner);
    const years = Array.from({ length: new Date().getFullYear() - 1990 + 1 }, (_, i) => 1990 + i).reverse();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const getDate = () => new Date(date || Date.now());

    function getNormalizedDate({ year, month }: { year?: number; month?: number } = {}) {
        const now = new Date();

        let nextYear = now.getFullYear();
        let nextMonth = now.getMonth() + 1;
        let nextDay = now.getDate();

        if (date) {
            const parts = date.split("-").map(Number);

            if (parts[0]) nextYear = parts[0];
            if (parts[1]) nextMonth = parts[1];
            if (parts[2]) nextDay = parts[2];
        }

        if (year != null) nextYear = year;
        if (month != null) nextMonth = month;

        let next = now;
        next = setYear(next, nextYear);
        next = setMonth(next, nextMonth - 1);
        next = setDayOfMonth(next, nextDay);

        return next;
    }

    function setDateWithPrecision({ year, month }: { year?: number; month?: number } = {}) {
        const next = getNormalizedDate({ year, month });

        switch (precision) {
            case "year":
                setDate(format(next, "yyyy"));
                break;
            case "month":
                setDate(format(next, "yyyy-MM"));
                break;
            case "day":
                setDate(format(next, "yyyy-MM-dd"));
                break;
        }
    }

    useEffect(() => {
        if (!sneaker?.originalOwner._id) return;

        const match = owners?.find(o => o._id === sneaker.originalOwner._id);
        if (match) setOriginalOwnerName(match.username);
    }, [owners, sneaker]);

    useEffect(() => {
        if (!date) return;
        setDateWithPrecision();
    }, [precision]);

    return (
        <form className="contents" onSubmit={handleSubmit}>
            <Tabs defaultValue="basic" className="gap-6">
                <DialogHeader>
                    <DialogTitle>{!sneaker ? "Add sneaker" : "Edit sneaker"}</DialogTitle>
                    <TabsList variant="line">
                        <TabsTrigger value="basic">Basic</TabsTrigger>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="extra">Extra</TabsTrigger>
                    </TabsList>
                </DialogHeader>
                <TabsContent value="basic">
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="sneakerName">Name</Label>
                            <Input id="sneakerName" name="name" maxLength={40} placeholder="Nike Air Max Plus" disabled={isSaving} value={name} onChange={e => setName(e.target.value)} />
                        </Field>
                        <div className="flex gap-2">
                            <Field className="flex-4">
                                <Label htmlFor="sneakerColor">Color</Label>
                                <Input id="sneakerColor" name="color" maxLength={60} placeholder="Triple Black" disabled={isSaving} value={color} onChange={e => setColor(e.target.value)} />
                            </Field>
                            <Field className="flex-1">
                                <Label htmlFor="sneakerSize">Size</Label>
                                <Input id="sneakerSize" name="size" maxLength={6} placeholder="10" disabled={isSaving} value={size} onChange={e => parseSize(e.target.value)} />
                            </Field>
                        </div>
                        <Field>
                            <Label htmlFor="sneakerDescription">Description</Label>
                            <Textarea id="sneakerDescription" name="description" className="h-25 resize-none" placeholder="Bought in London during summer vacation..." disabled={isSaving} value={description} onChange={e => setDescription(e.target.value)} />
                        </Field>
                    </FieldGroup>
                </TabsContent>
                <TabsContent value="details">
                    <FieldGroup>
                        <div className="flex gap-2">
                            <Field>
                                <Label htmlFor="sneakerBrand">Brand</Label>
                                <Select value={brand} disabled={isSaving} onValueChange={e => setBrand(e ?? "")}>
                                    <SelectTrigger className="w-full">
                                        {!selBrand ? (
                                            "Select a brand"
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                {selBrand.iconUrl && <img src={selBrand.iconUrl} alt={selBrand.name} className="size-4 object-contain" />}
                                                {selBrand.name}
                                            </div>
                                        )}
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(brands ?? []).map(b => (
                                            <SelectItem value={b._id} key={b._id}>
                                                {b.iconUrl && <img src={b.iconUrl} alt={b.name} className="size-4 object-contain" />}
                                                {b.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field>
                                <Label htmlFor="sneakerLocation">Location</Label>
                                <Select value={location} disabled={isSaving} onValueChange={e => setLocation(e ?? "outside")}>
                                    <SelectTrigger className="w-full">{!selLocation ? "Select a location" : typeof selLocation === "object" ? selLocation.name : "Outside"}</SelectTrigger>
                                    <SelectContent>
                                        {(locations ?? []).map(l => (
                                            <SelectItem value={l._id} key={l._id}>
                                                {l.name}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="outside">Outside</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                        </div>
                        <Field>
                            <Label htmlFor="sneakerPhoto">Photo</Label>
                            <div className="flex gap-2">
                                <div className="w-full relative">
                                    <Input id="sneakerPhoto" name="photo" type="file" className={photo ? "text-transparent!" : ""} disabled={isSaving} accept="image/*" onChange={e => setPhoto(e.target.files?.[0] ?? null)} />
                                    {photo && <span className="flex items-center absolute top-0 bottom-0 right-px left-25 text-muted-foreground overflow-hidden whitespace-nowrap z-1">{photo.name}</span>}
                                </div>
                                {sneaker?.photo && (
                                    <Button variant="outline" size="icon" disabled={isSaving || photo === null} onClick={() => setPhoto(null)}>
                                        <IconTrash className="size-4" />
                                    </Button>
                                )}
                            </div>
                        </Field>
                        <div className="flex gap-2">
                            <Field>
                                <Label htmlFor="sneakerType">Type</Label>
                                <Select value={type} disabled={isSaving} onValueChange={e => setType(e ?? "Sneakers")}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Sneakers">Sneakers</SelectItem>
                                        <SelectItem value="Shoes">Shoes</SelectItem>
                                        <SelectItem value="Boots">Boots</SelectItem>
                                        <SelectItem value="Flip-flops">Flip-flops</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field>
                                <Label htmlFor="sneakerDate">Acquisition Date</Label>
                                <Popover>
                                    <PopoverTrigger
                                        disabled={isSaving}
                                        render={
                                            <Button variant={"outline"} data-empty={!date} className="pl-2.5 justify-between font-normal data-[empty=true]:text-muted-foreground">
                                                {formatPartialDate(date ?? "", { year: "yyyy", month: "MMMM yyyy", day: "PPP" }) ?? "Pick a date"}
                                                <IconChevronDown data-icon="inline-end" />
                                            </Button>
                                        }
                                    />
                                    <PopoverContent className="w-74 p-3 flex flex-col gap-4 rounded-xl" align="start">
                                        <ButtonGroup className="w-full">
                                            <Button variant={precision === "day" ? "default" : "outline"} className="h-8 flex-1 text-xs" onClick={() => setPrecision("day")}>
                                                Day
                                            </Button>
                                            <Button variant={precision === "month" ? "default" : "outline"} className="h-8 flex-1 text-xs" onClick={() => setPrecision("month")}>
                                                Month
                                            </Button>
                                            <Button variant={precision === "year" ? "default" : "outline"} className="h-8 flex-1 text-xs" onClick={() => setPrecision("year")}>
                                                Year
                                            </Button>
                                        </ButtonGroup>
                                        {precision === "day" ? (
                                            <Calendar mode="single" captionLayout="dropdown" required selected={getDate()} defaultMonth={getNormalizedDate()} className="w-full p-0" onSelect={d => setDate(format(d, "yyyy-MM-dd"))} />
                                        ) : (
                                            <div className="flex gap-2">
                                                {precision === "month" && (
                                                    <Select value={getDate().getMonth().toString()} onValueChange={v => setDateWithPrecision({ month: v ? +v : undefined })}>
                                                        <SelectTrigger className="flex-2">{months[getDate().getMonth()]}</SelectTrigger>
                                                        <SelectContent>
                                                            {months.map((m, i) => (
                                                                <SelectItem key={m} value={i.toString()}>
                                                                    {m}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                                <Select value={getDate().getFullYear().toString()} onValueChange={v => setDateWithPrecision({ year: v ? +v : undefined })}>
                                                    <SelectTrigger className="flex-1">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {years.map(y => (
                                                            <SelectItem key={y} value={y.toString()}>
                                                                {y}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </PopoverContent>
                                </Popover>
                            </Field>
                        </div>
                        <div className="flex gap-2">
                            <Field>
                                <Label htmlFor="sneakerOwner">Owner</Label>
                                <Select value={owner} disabled={isSaving} onValueChange={e => setOwner(e ?? "")}>
                                    <SelectTrigger className="w-full">
                                        <div className="flex items-center gap-2">
                                            <div className="size-2.5 rounded-full" style={{ backgroundColor: selOwner?.color || "var(--color-muted-foreground)" }} />
                                            {!selOwner ? "Select an owner" : selOwner.username}
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(owners ?? []).map(o => (
                                            <SelectItem value={o._id} key={o._id}>
                                                <div className="size-2.5 rounded-full" style={{ backgroundColor: o.color }} />
                                                {o.username}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field>
                                <Label htmlFor="sneakerOriginalOwner">Original owner</Label>
                                <Combobox items={owners ?? []} value={originalOwnerId} disabled={isSaving} onValueChange={e => e && (e === "unknown" ? onCustomSelect("Unknown") : onSelect(e))}>
                                    <ComboboxInput placeholder="Select an owner" value={originalOwnerName} ref={originalOwnerCombobox} disabled={isSaving} onChange={e => onCustomSelect(e.target.value)}>
                                        <InputGroupAddon className="pl-2.5 pr-0.5">
                                            <div
                                                className="size-2.5 rounded-full"
                                                style={{
                                                    backgroundColor: owners?.find(o => o._id === originalOwnerId)?.color || "var(--color-muted-foreground)",
                                                }}
                                            />
                                        </InputGroupAddon>
                                    </ComboboxInput>
                                    <ComboboxContent anchor={originalOwnerCombobox}>
                                        <ComboboxEmpty>
                                            Create "{originalOwnerName.slice(0, 12)}
                                            {originalOwnerName.length > 12 && "..."}"
                                        </ComboboxEmpty>
                                        <ComboboxList className="pb-0">
                                            {(owner: User) => (
                                                <ComboboxItem key={owner._id} value={owner._id}>
                                                    <div className="size-2.5 rounded-full" style={{ backgroundColor: owner.color }} />
                                                    {owner.username}
                                                </ComboboxItem>
                                            )}
                                        </ComboboxList>
                                        {!originalOwnerName && (
                                            <ComboboxList className="pt-0">
                                                <ComboboxItem value="unknown">
                                                    <div className="size-2.5 bg-muted-foreground rounded-full" />
                                                    Unknown
                                                </ComboboxItem>
                                            </ComboboxList>
                                        )}
                                    </ComboboxContent>
                                </Combobox>
                            </Field>
                        </div>
                    </FieldGroup>
                </TabsContent>
                <TabsContent value="extra">
                    <FieldGroup>
                        <div className="flex gap-2">
                            <Field className="flex-4 xs:flex-7">
                                <Label htmlFor="sneakerStyle">Style code</Label>
                                <Input id="sneakerStyle" name="style" placeholder="604133-050" disabled={isSaving} value={style} onChange={e => setStyle(e.target.value)} />
                            </Field>
                            <Field className="flex-2">
                                <Label htmlFor="sneakerCondition">Condition</Label>
                                <ConditionInput disabled={isSaving} value={condition} onChange={e => setCondition(e)} onValidityChange={setIsConditionValid} />
                            </Field>
                        </div>
                        <div className="flex gap-2">
                            <Field className="flex-2" data-invalid={stockxUrl.length !== 0 && !isValidStockxUrl(stockxUrl)}>
                                <Label htmlFor="sneakerStockX">StockX Url</Label>
                                <Input id="sneakerStockX" name="stockx" inputMode="url" placeholder="https://stockx.com/nike-air-max-plus-triple-black" disabled={isSaving} value={stockxUrl} onChange={e => setStockxUrl(e.target.value)} />
                            </Field>
                            <Field className="flex-2 xs:flex-1">
                                <Label htmlFor="sneakerTag">Authenticity Tag</Label>
                                <Input id="sneakerTag" name="tag" placeholder="58070046JUN" disabled={isSaving} value={authenticityTag} onChange={e => setAuthenticityTag(e.target.value)} />
                            </Field>
                        </div>
                        <Field data-invalid={goatUrl.length !== 0 && !isValidGoatUrl(goatUrl)}>
                            <Label htmlFor="sneakerGoat">Goat Url</Label>
                            <Input id="sneakerGoat" name="goat" inputMode="url" placeholder="https://www.goat.com/sneakers/air-max-plus-triple-black-604133-050" disabled={isSaving} value={goatUrl} onChange={e => setGoatUrl(e.target.value)} />
                        </Field>
                        <Field orientation="horizontal" className="w-fit">
                            <Checkbox id="sneakerDecommissioned" disabled={isSaving} checked={decommissioned} onCheckedChange={e => setDecommissioned(!!e)} />
                            <FieldLabel htmlFor="sneakerDecommissioned">Decommissioned</FieldLabel>
                        </Field>
                    </FieldGroup>
                </TabsContent>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <DialogFooter>
                    <DialogClose disabled={isSaving} render={<Button variant="outline">Cancel</Button>} />
                    <Button type="submit" className="sm:w-31" disabled={isSaving || !name || !isConditionValid || (stockxUrl.length !== 0 && !isValidStockxUrl(stockxUrl)) || (goatUrl.length !== 0 && !isValidGoatUrl(goatUrl))}>
                        {!isSaving ? "Save changes" : <Spinner />}
                    </Button>
                </DialogFooter>
            </Tabs>
        </form>
    );
}

function ConditionInput({ disabled, value, onChange, onValidityChange }: { disabled: boolean; value: number | undefined; onChange: (value: number | undefined) => unknown; onValidityChange: (valid: boolean) => unknown }) {
    const [valueDisplay, setValueDisplay] = useState(value?.toString() ?? "");

    const isValid = (display: string) => display === "" || /^(?:\.5|[0-9]|10|[0-9]\.?|[0-9]\.5)$/.test(display);
    const commit = (display: string) => {
        if (display === "" || display.endsWith(".")) return;
        onChange(display.startsWith(".") ? Number(`0${display}`) : Number(display));
    };

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const nextValue = e.target.value;
        if (!isValid(nextValue)) return;

        setValueDisplay(nextValue);
        onValidityChange(!nextValue.endsWith(".") && nextValue !== ".");
        if (nextValue === "") onChange(undefined);
        else if (!nextValue.endsWith(".") && !nextValue.startsWith(".")) commit(nextValue);
    }

    useEffect(() => {
        const nextValue = value?.toString() ?? "";
        setValueDisplay(nextValue);
        onValidityChange(isValid(nextValue));
    }, [value]);

    return (
        <ButtonGroup>
            <Input id="sneakerCondition" name="condition" placeholder="7.5" disabled={disabled} value={valueDisplay} onChange={handleChange} onBlur={() => commit(valueDisplay)} />
            <Button className="pl-2.5 pr-2 max-sm:text-base text-muted-foreground font-semibold pointer-events-none" variant="outline">
                / 10
            </Button>
        </ButtonGroup>
    );
}
