import { useQuery } from "@tanstack/react-query";
import { addDays, compareAsc, endOfDay, getYear, isBefore, isWithinInterval, parseISO, setYear, startOfDay } from "date-fns";
import { IconCake } from "@tabler/icons-react";
import { SneakerCard } from "@/components/SneakerCard";
import bridge from "@/data/bridge";
import { useConfig } from "@/lib/useConfig";
import { getDatePrecision, hasSearched } from "@/lib/utils";
import type { Search } from "@/lib/models";

interface BirthdayBlockProps {
    search: Search;
}

export function BirthdayBlock({ search }: BirthdayBlockProps) {
    const { data: sneakers } = useQuery({
        queryKey: ["sneakers"],
        queryFn: bridge.sneakers.get,
    });
    const { config } = useConfig();

    const today = startOfDay(new Date());
    const nextWeek = endOfDay(addDays(today, 7));
    const upcomingBirthdays = (sneakers ?? [])
        .filter(s => {
            if (!s.date || getDatePrecision(s.date) !== "day") return false;

            const birthdayDate = parseISO(s.date);
            let currentYearBirthday = startOfDay(setYear(birthdayDate, getYear(today)));

            if (isBefore(currentYearBirthday, today)) currentYearBirthday = startOfDay(setYear(birthdayDate, getYear(today) + 1));

            return isWithinInterval(currentYearBirthday, { start: today, end: nextWeek });
        })
        .sort((a, b) => {
            if (!a.date || !b.date) return 0;

            const bdayA = parseISO(a.date);
            let currentA = startOfDay(setYear(bdayA, getYear(today)));
            if (isBefore(currentA, today)) currentA = startOfDay(setYear(bdayA, getYear(today) + 1));

            const bdayB = parseISO(b.date);
            let currentB = startOfDay(setYear(bdayB, getYear(today)));
            if (isBefore(currentB, today)) currentB = startOfDay(setYear(bdayB, getYear(today) + 1));

            return compareAsc(currentA, currentB);
        });

    if (!hasSearched(search, config) && upcomingBirthdays.length !== 0) {
        return (
            <div className="flex flex-col gap-4">
                <div className="px-6 md:px-8 flex items-center gap-2">
                    <IconCake className="size-6 text-primary" />
                    <h2 className="text-xl font-bold text-white">Upcoming Birthdays</h2>
                </div>
                <div className="px-6 md:px-8 pt-px pb-4 flex gap-4 overflow-x-auto scrollbar-hidden">
                    {upcomingBirthdays.map(s => (
                        <SneakerCard key={s._id} sneaker={s} birthday />
                    ))}
                </div>
            </div>
        );
    }
}
