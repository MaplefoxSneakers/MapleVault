import { useEffect } from "react";

export function useOutsideClick(ref: React.RefObject<HTMLElement | null>, callback: () => unknown) {
    useEffect(() => {
        function handleClick(event: MouseEvent) {
            const portal = document.querySelector("div[data-base-ui-portal]");
            if (!ref.current?.contains(event.target as Node) && !portal?.contains(event.target as Node)) callback();
        }

        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [ref, callback]);
}
