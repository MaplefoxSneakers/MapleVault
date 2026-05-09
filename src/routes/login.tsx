import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { login } from "@/data/auth";
import { cn, getErrorMessage } from "@/lib/utils";

export const Route = createFileRoute("/login")({
    component: LoginComponent,
});

function LoginComponent() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await login({
                data: {
                    username,
                    password,
                },
            });

            if (result.success) {
                await router.invalidate();
                await router.navigate({ to: "/" });
            } else setError(result.error || "Invalid credentials");
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, "Something went wrong"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen flex flex-col justify-center items-center">
            <div className="h-6" />
            <form className="w-full max-w-md p-6" onSubmit={handleSubmit}>
                <FieldGroup>
                    <FieldSet>
                        <FieldLegend className="flex items-center gap-3">
                            <img src="/logo.svg" alt="" className="size-8" />
                            <h1 className="text-3xl text-primary font-extrabold tracking-tight drop-shadow-lg drop-shadow-primary/30">SneakrVault</h1>
                        </FieldLegend>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="username">Username</FieldLabel>
                                <Input
                                    id="username"
                                    type="text"
                                    value={username}
                                    placeholder="Required"
                                    required
                                    autoComplete="username"
                                    aria-invalid={!!error}
                                    onChange={e => {
                                        setUsername(e.target.value);
                                        setError("");
                                    }}
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="password">Password</FieldLabel>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    placeholder="Required"
                                    required
                                    autoComplete="current-password"
                                    aria-invalid={!!error}
                                    onChange={e => {
                                        setPassword(e.target.value);
                                        setError("");
                                    }}
                                />
                            </Field>
                        </FieldGroup>
                    </FieldSet>
                    <Button type="submit" disabled={!username || !password || loading}>
                        {loading ? <Spinner /> : "Login"}
                    </Button>
                </FieldGroup>
            </form>
            <p className={cn("h-6 text-muted-foreground font-semibold transition-opacity duration-200", !error ? "opacity-0" : "opacity-100")}>{error}</p>
        </div>
    );
}
