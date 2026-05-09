import { Link } from "@tanstack/react-router";
import { IconCake, IconCalendarEvent, IconMapPin, IconRosetteDiscountCheck, IconRuler2 } from "@tabler/icons-react";
import { format, getDate, getMonth, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { SneakerPhoto } from "@/components/SneakerPhoto";
import { useConfig } from "@/lib/useConfig";
import { cn, getDatePrecision } from "@/lib/utils";
import { Route } from "@/routes/__root";
import type { Sneaker } from "@/lib/models";

interface SneakerCardProps {
    sneaker: Sneaker;
    birthday?: boolean;
}

export function SneakerCard({ sneaker, birthday }: SneakerCardProps) {
    const { config } = useConfig();
    const { auth } = Route.useRouteContext();
    const canShowLocation = !config.publicPage || config.locationVisibility === "public" || (config.locationVisibility === "guests" && auth.isAuthenticated) || (config.locationVisibility === "protected" && auth.isAuthenticated && ["member", "admin"].includes(auth.role ?? ""));

    const today = new Date();
    const precision = getDatePrecision(sneaker.date);
    const birthdayDate = sneaker.date ? parseISO(sneaker.date) : null;
    const isBirthdayToday = birthdayDate && precision === "day" ? getDate(birthdayDate) === getDate(today) && getMonth(birthdayDate) === getMonth(today) : false;
    const birthdayLabel = birthdayDate ? (isBirthdayToday ? "Today" : format(birthdayDate, "d MMM")) : "";

    return (
        <Link
            to="/sneakers/$id"
            params={{ id: sneaker._id }}
            className={cn("min-w-68 block relative p-2 pr-4 bg-secondary rounded-2xl hover:shadow-2xl hover:shadow-primary/5 group ring ring-border/75 hover:border-white/20 overflow-hidden transition-shadow duration-300 z-0", !birthday ? "w-full" : "max-w-[82vw] shrink-0")}
        >
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-primary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="h-full flex items-center gap-4 relative z-1">
                <SneakerPhoto sneaker={sneaker} />
                <div className="min-w-0 flex flex-col justify-center gap-y-2 flex-1">
                    <div>
                        <h3 className="text-base md:text-lg text-foreground font-bold tracking-tight truncate transition-colors">{sneaker.name}</h3>
                        <h4 className="text-sm text-secondary-foreground font-medium truncate transition-colors">{sneaker.color}</h4>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-400 transition-colors *:[svg]:size-4 *:[svg]:shrink-0 *:[svg]:text-primary">
                        {!birthday ? (
                            canShowLocation && config.cardSecondaryInfo === "location" ? (
                                <SecondaryInfo value={sneaker.location.name}>
                                    <IconMapPin />
                                </SecondaryInfo>
                            ) : config.cardSecondaryInfo === "brand" ? (
                                <SecondaryInfo value={sneaker.brand.name}>{!sneaker.brand.iconUrl ? <IconRosetteDiscountCheck /> : <img src={sneaker.brand.iconUrl} alt={sneaker.brand.name} className="size-4 object-contain" />}</SecondaryInfo>
                            ) : config.cardSecondaryInfo === "size" ? (
                                <SecondaryInfo value={sneaker.size?.toString()}>
                                    <IconRuler2 />
                                </SecondaryInfo>
                            ) : config.cardSecondaryInfo === "owner" ? (
                                <SecondaryInfo value={sneaker.owner.username}>
                                    <div className="size-2.5 mr-0.5 rounded-full" style={{ backgroundColor: sneaker.owner.color || "var(--color-muted-foreground)" }} />
                                </SecondaryInfo>
                            ) : null
                        ) : (
                            <>
                                {!isBirthdayToday ? <IconCalendarEvent /> : <IconCake />}
                                <span
                                    className={cn(
                                        "text-transparent text-sm font-semibold bg-linear-to-r from-zinc-400 via-zinc-400 to-zinc-400 bg-clip-text bg-size-[200%_100%] opacity-75 group-hover:opacity-100 truncate transition duration-300",
                                        isBirthdayToday && "via-white animate-text-glow-sweep",
                                    )}
                                >
                                    {birthdayLabel}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>
            {!birthday && config.cardShowOwnerColor && <div className="h-32 size-48 absolute -bottom-16 -right-24 bg-radial from-(--owner-color)/15 to-75% -z-1" style={{ "--owner-color": sneaker.owner.color } as React.CSSProperties} />}
        </Link>
    );
}

export function SneakerCardSkeleton() {
    return (
        <div className="w-full p-2 flex items-center gap-4 relative bg-secondary rounded-2xl ring ring-border">
            <Skeleton className="size-24 shrink-0 rounded-lg" />
            <div className="flex flex-col justify-center flex-1">
                <Skeleton className="w-1/2 h-5.5 mb-1" />
                <Skeleton className="w-1/3 h-4.5 mb-2" />
                <div className="flex items-center gap-1.5">
                    <IconMapPin className="size-4 shrink-0 text-muted animate-pulse" />
                    <Skeleton className="w-1/5 h-4" />
                </div>
            </div>
        </div>
    );
}

function SecondaryInfo({ value, children }: { value?: string; children: React.ReactNode }) {
    return (
        <>
            {children}
            <span className="text-sm text-muted-foreground font-semibold opacity-75 group-hover:opacity-100 truncate transition duration-300">{value ?? "Unknown"}</span>
        </>
    );
}
