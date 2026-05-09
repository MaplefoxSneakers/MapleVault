import { useEffect, useState } from "react";
import { createFileRoute, useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { IconChevronLeft, IconDots, IconMapPin, IconPencil, IconTrash, IconFolderPlus, IconInfoHexagon, IconMenu3 } from "@tabler/icons-react";
import { addDays, differenceInCalendarDays, differenceInYears, endOfDay, format, getYear, isBefore, isWithinInterval, parseISO, setYear, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/Header";
import { SneakerPhoto } from "@/components/SneakerPhoto";
import { SneakPickSelector } from "@/components/blocks/SneakPickBlock";
import { AddSneakerDialog } from "@/components/overlays/AddSneakerDialog";
import { AddToCollectionDialog } from "@/components/overlays/AddToCollectionDialog";
import { DeleteSneakerDialog } from "@/components/overlays/DeleteSneakerDialog";
import { checkAuth } from "@/data/auth";
import bridge from "@/data/bridge";
import { useConfig } from "@/lib/useConfig";
import { cn, formatPartialDate, getDatePrecision } from "@/lib/utils";

export const Route = createFileRoute("/sneakers/$id")({
    component: SneakerDetails,
    beforeLoad: () => checkAuth(),
});

function SneakerDetails() {
    const [editOpen, setEditOpen] = useState(false);
    const [addToCollectionOpen, setAddToCollectionOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [acqDate, setAcqDate] = useState(new Date());
    const [bdayStats, setBdayStats] = useState<{ years: number; daysUntil: number } | null>(null);
    const canGoBack = useCanGoBack();
    const { config } = useConfig();
    const navigate = useNavigate();
    const { id } = Route.useParams();
    const { isPending, data: sneaker } = useQuery({
        queryKey: ["sneakers"],
        queryFn: bridge.sneakers.get,
        select: items => items.find(i => i._id === id),
    });
    const router = useRouter();
    const { auth } = Route.useRouteContext();
    const hasPick = sneaker?.pickFor && sneaker.pickUntil && new Date(sneaker.pickUntil).getTime() > Date.now();
    const showLocation = !config.publicPage || config.locationVisibility === "public" || (config.locationVisibility === "guests" && auth.isAuthenticated) || (config.locationVisibility === "protected" && auth.isAuthenticated && auth.role !== "guest");
    const showDescription = !config.publicPage || config.descriptionVisibility === "public" || (config.descriptionVisibility === "guests" && auth.isAuthenticated) || (config.descriptionVisibility === "protected" && auth.isAuthenticated && auth.role !== "guest");
    const showOriginalOwner = !config.publicPage || config.originalOwnerVisibility === "public" || (config.originalOwnerVisibility === "guests" && auth.isAuthenticated) || (config.originalOwnerVisibility === "protected" && auth.isAuthenticated && auth.role !== "guest");

    function handleBack() {
        if (canGoBack) router.history.back();
        else navigate({ to: "/" });
    }

    function conditionToColor(condition: number) {
        if (condition < 2) return "text-red-400 bg-red-500/10";
        else if (condition < 4) return "text-orange-400 bg-orange-500/10";
        else if (condition < 6) return "text-yellow-400 bg-yellow-500/10";
        else if (condition < 8) return "text-lime-400 bg-lime-500/10";
        else return "text-green-400 bg-green-500/10";
    }

    useEffect(() => {
        if (!isPending) {
            if (!sneaker) navigate({ to: "/" });
            else {
                setAcqDate(sneaker.date ? parseISO(sneaker.date) : new Date());

                const today = startOfDay(new Date());
                const nextWeek = endOfDay(addDays(today, 7));

                if (sneaker.date && getDatePrecision(sneaker.date) === "day") {
                    const birthdayDate = parseISO(sneaker.date);
                    let currentYearBirthday = startOfDay(setYear(birthdayDate, getYear(today)));

                    if (isBefore(currentYearBirthday, today)) currentYearBirthday = startOfDay(setYear(birthdayDate, getYear(today) + 1));

                    if (isWithinInterval(currentYearBirthday, { start: today, end: nextWeek }))
                        setBdayStats({
                            years: differenceInYears(currentYearBirthday, birthdayDate),
                            daysUntil: differenceInCalendarDays(currentYearBirthday, today),
                        });
                }
            }
        }
    }, [isPending, sneaker]);

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
                        {sneaker && (
                            <>
                                <AddSneakerDialog open={editOpen} setOpen={setEditOpen} sneaker={sneaker} />
                                <AddToCollectionDialog open={addToCollectionOpen} setOpen={setAddToCollectionOpen} sneakerId={sneaker._id} />
                                <DeleteSneakerDialog open={deleteOpen} setOpen={setDeleteOpen} _id={sneaker._id} />
                            </>
                        )}
                        <Button className="max-md:hidden" variant="outline" onClick={handleBack}>
                            <IconChevronLeft className="size-5" data-icon="inline-start" />
                            Back to library
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
                                    <DropdownMenuItem onClick={() => setAddToCollectionOpen(true)}>
                                        <IconFolderPlus className="size-4" />
                                        Add to collection
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
            <div className="max-w-7xl mx-auto pt-4 max-md:pb-40 max-md:pwa:pb-44 px-6 md:px-8 flex flex-col gap-6">
                <div className="w-full flex gap-5 sm:gap-6 md:gap-8">
                    {sneaker ? (
                        <>
                            <SneakerPhoto sneaker={sneaker} className="size-22 xs:size-24 sm:size-28 md:size-32 rounded-xl ring ring-border shadow-2xl shadow-primary/25 animate-in fade-in zoom-in duration-500" />
                            <div className="flex flex-col justify-center gap-1 flex-1 animate-in fade-in duration-1000">
                                <h1 className="text-xl sm:text-3xl md:text-2xl lg:text-4xl text-transparent font-black bg-linear-to-b from-zinc-50 to-zinc-600 bg-clip-text tracking-tight">{sneaker.name}</h1>
                                <h2 className="sm:text-xl md:text-lg lg:text-2xl text-secondary-foreground font-bold">{sneaker.color}</h2>
                            </div>
                        </>
                    ) : (
                        <>
                            <Skeleton className="size-22 xs:size-24 sm:size-28 md:size-32 rounded-xl" />
                            <div className="flex flex-col justify-center gap-1 flex-1">
                                <Skeleton className="w-1/3 h-10" />
                                <Skeleton className="w-2/5 h-8" />
                            </div>
                        </>
                    )}
                </div>
                <div className="flex flex-col gap-4">
                    {sneaker ? (
                        (sneaker.size || sneaker.brand._id || (showLocation && sneaker.location._id) || sneaker.decommissioned || hasPick) && (
                            <div className="flex -m-1 p-1 gap-3 flex-1 overflow-x-auto scrollbar-hidden">
                                {sneaker.size && <p className="w-fit px-3 py-1.5 flex items-center shrink-0 text-sm font-semibold bg-accent rounded-md ring ring-border">{sneaker.size}</p>}
                                {sneaker.brand._id && (
                                    <div className="w-fit px-3 py-1.5 flex items-center gap-2.5 shrink-0 bg-accent rounded-md ring ring-border">
                                        {sneaker.brand.iconUrl && <img src={sneaker.brand.iconUrl} alt={sneaker.brand.name} className="size-4 object-contain" />}
                                        <p className="text-sm font-semibold">{sneaker.brand.name}</p>
                                    </div>
                                )}
                                {showLocation && sneaker.location._id && (
                                    <div className="w-fit px-3 py-1.5 flex items-center gap-2.5 shrink-0 bg-accent rounded-md ring ring-border">
                                        <IconMapPin className="size-4 shrink-0 text-muted-foreground" />
                                        <p className="text-sm font-semibold">{sneaker.location.name}</p>
                                    </div>
                                )}
                                {sneaker.decommissioned && <p className="w-fit px-3 py-1.5 flex items-center shrink-0 text-primary text-sm font-semibold bg-primary/15 rounded-md">Decommissioned</p>}
                                {hasPick && (
                                    <div className="w-fit px-3 py-1.5 flex items-center gap-2.5 shrink-0 bg-accent rounded-md ring ring-border">
                                        <div
                                            className="size-2.5 bg-(--user-color) rounded-full before:size-2.5 before:block before:bg-(--user-color) before:rounded-full before:animate-ping"
                                            style={{ "--user-color": sneaker.pickFor.color || "var(--color-muted-foreground)" } as React.CSSProperties}
                                        />
                                        <p className="text-muted-foreground text-sm font-medium">
                                            In use by <span className="text-foreground font-bold">{sneaker.pickFor.username}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        )
                    ) : (
                        <Skeleton className="w-3/7 h-8 rounded-md" />
                    )}
                    <div className="flex max-md:flex-col gap-4 md:gap-6">
                        {showDescription &&
                            (sneaker ? (
                                <div className="h-fit min-h-40 flex-1 p-4 bg-accent rounded-xl ring ring-border space-y-2">
                                    <div className="flex items-center gap-2">
                                        <IconMenu3 className="size-4 text-primary" />
                                        <h3 className="font-bold">Description</h3>
                                    </div>
                                    {sneaker.description ? <p className="max-md:text-sm font-medium text-muted-foreground whitespace-pre-line">{sneaker.description}</p> : <p className="max-md:text-sm italic text-muted-foreground">No description</p>}
                                </div>
                            ) : (
                                <Skeleton className="h-40 flex-1 rounded-xl" />
                            ))}
                        <div className={cn("md:w-86 flex flex-col gap-4 md:gap-6", showDescription ? "max-md:flex-1" : "flex-1")}>
                            {config.sneakPickEnabled && <SneakPickSelector sneaker={sneaker} />}
                            {sneaker ? (
                                <div className="w-full p-4 bg-accent rounded-xl ring ring-border space-y-4">
                                    <div className="flex items-center gap-2">
                                        <IconInfoHexagon className="size-4 text-primary" />
                                        <h3 className="font-bold">Information</h3>
                                    </div>
                                    {sneaker?.date && (
                                        <InfoBox title="Acquisition Date">
                                            <div className="flex items-center gap-2">
                                                <div className="w-fit px-3 py-1.5 flex items-center text-sm font-semibold bg-muted rounded-md">
                                                    {getDatePrecision(sneaker.date) === "day" ? (
                                                        <>
                                                            {format(acqDate, "dd")}
                                                            <span className="px-1.5 text-muted-foreground">/</span>
                                                            {format(acqDate, "MM")}
                                                            <span className="px-1.5 text-muted-foreground">/</span>
                                                            {format(acqDate, "yyyy")}
                                                        </>
                                                    ) : (
                                                        formatPartialDate(sneaker.date)
                                                    )}
                                                </div>
                                                {bdayStats && (
                                                    <div className="w-fit px-3 py-1.5 flex items-center gap-1.5 text-primary text-sm font-semibold bg-primary/10 rounded-md">
                                                        {bdayStats.years} {bdayStats.years === 1 ? "year" : "years"}
                                                        <span className="opacity-50">{bdayStats.daysUntil === 0 ? "today!" : `in ${bdayStats.daysUntil} ${bdayStats.daysUntil === 1 ? "day" : "days"}`}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </InfoBox>
                                    )}
                                    {(sneaker?.owner._id || sneaker?.originalOwner.type) && (
                                        <div className="flex gap-x-5 gap-y-4">
                                            {sneaker?.owner._id && (
                                                <InfoBox title="Owner">
                                                    <div className="w-fit px-3 py-1.5 flex items-center gap-2.5 text-sm font-semibold bg-muted rounded-md">
                                                        <div className="size-2.5 rounded-full" style={{ backgroundColor: sneaker.owner.color || "var(--color-muted-foreground)" }} />
                                                        {sneaker.owner.username}
                                                    </div>
                                                </InfoBox>
                                            )}
                                            {showOriginalOwner && sneaker?.originalOwner.type && (
                                                <InfoBox title="Original Owner">
                                                    <div className="w-fit px-3 py-1.5 flex items-center gap-2.5 text-sm font-semibold bg-muted rounded-md">
                                                        <div className="size-2.5 rounded-full" style={{ backgroundColor: sneaker.originalOwner.color || "var(--color-muted-foreground)" }} />
                                                        {sneaker.originalOwner.username}
                                                    </div>
                                                </InfoBox>
                                            )}
                                        </div>
                                    )}
                                    {(sneaker?.type || sneaker?.condition) && (
                                        <div className="flex gap-x-5 gap-y-4">
                                            {sneaker?.type && (
                                                <InfoBox title="Type">
                                                    <p className="w-fit px-3 py-1.5 flex items-center text-sm font-semibold bg-muted rounded-md">{sneaker.type}</p>
                                                </InfoBox>
                                            )}
                                            {sneaker?.condition && (
                                                <InfoBox title="Condition">
                                                    <p className={cn("w-fit px-3 py-1.5 flex items-center text-sm font-semibold bg-muted rounded-md", conditionToColor(sneaker.condition))}>
                                                        {sneaker.condition}
                                                        <span className="whitespace-pre opacity-50"> / 10</span>
                                                    </p>
                                                </InfoBox>
                                            )}
                                        </div>
                                    )}
                                    {(sneaker?.style || sneaker?.authenticityTag) && (
                                        <div className="flex gap-x-5 gap-y-4">
                                            {sneaker?.style && (
                                                <InfoBox title="Style Code">
                                                    <p className="w-fit px-3 py-1.5 flex items-center text-sm font-semibold bg-muted rounded-md">{sneaker.style}</p>
                                                </InfoBox>
                                            )}
                                            {sneaker?.authenticityTag && (
                                                <InfoBox title="Authenticity Tag">
                                                    <p className="w-fit px-3 py-1.5 flex items-center text-sm font-semibold bg-muted rounded-md">{sneaker.authenticityTag}</p>
                                                </InfoBox>
                                            )}
                                        </div>
                                    )}
                                    {(sneaker?.stockxUrl || sneaker?.goatUrl) && (
                                        <InfoBox title="Links">
                                            <div className="flex gap-2">
                                                {sneaker?.stockxUrl && (
                                                    <a href={sneaker.stockxUrl} target="_blank" rel="noreferrer">
                                                        <Button variant="outline" className="gap-2.5">
                                                            <img src="/StockX.svg" alt="StockX" className="size-3.5" />
                                                            StockX
                                                        </Button>
                                                    </a>
                                                )}
                                                {sneaker?.goatUrl && (
                                                    <a href={sneaker.goatUrl} target="_blank" rel="noreferrer">
                                                        <Button variant="outline" className="gap-2.5">
                                                            <div className="size-3.5 bg-foreground" />
                                                            GOAT
                                                        </Button>
                                                    </a>
                                                )}
                                            </div>
                                        </InfoBox>
                                    )}
                                </div>
                            ) : (
                                <Skeleton className="w-full h-60 rounded-xl" />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoBox({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h3 className="mb-2 text-2xs text-muted-foreground font-semibold tracking-wider uppercase">{title}</h3>
            {children}
        </div>
    );
}
