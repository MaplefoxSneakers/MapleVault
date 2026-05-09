import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { logout as authLogout } from "@/data/auth";

export function useLogout() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    function logout() {
        authLogout();
        queryClient.invalidateQueries({ queryKey: ["session"] });
        navigate({ to: "/login" });
    }

    return logout;
}
