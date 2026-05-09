import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import bridge from "@/data/bridge";
import { useLogout } from "@/lib/useLogout";
import type { User } from "@/lib/models";

interface AddUserDialogProps {
    open: boolean;
    setOpen: (open: boolean) => unknown;
    user?: User;
    isCurrentUser?: boolean;
    adminEdit?: boolean;
}

export function AddUserDialog(props: AddUserDialogProps) {
    const { open, ...rest } = props;

    return (
        <Dialog open={open} onOpenChange={rest.setOpen}>
            <DialogContent showCloseButton={false}>{open && <AddUserDialogContent {...rest} />}</DialogContent>
        </Dialog>
    );
}

function AddUserDialogContent({ setOpen, user, isCurrentUser = false, adminEdit = false }: Omit<AddUserDialogProps, "open">) {
    const [username, setUsername] = useState(user?.username ?? "");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<User["role"]>(user?.role ?? "guest");
    const [color, setColor] = useState(user?.color ?? "");
    const [isColorValid, setIsColorValid] = useState(false);
    const [active, setActive] = useState(user?.active ?? true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string>();
    const logout = useLogout();
    const queryClient = useQueryClient();

    function validateColor(color: string) {
        document.head.style.color = color;
        const isValid = document.head.style.color;
        document.head.removeAttribute("style");

        return !!isValid;
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSaving(true);
        setError("");

        if (!user) {
            const result = await bridge.users.add({
                data: {
                    username,
                    password,
                    role,
                    color,
                    active,
                },
            });
            if (!result.success) {
                setError(result.error);
                setIsSaving(false);
                return;
            }
        } else {
            const result = await bridge.users.edit({
                data: {
                    _id: user._id,
                    username,
                    password,
                    ...(adminEdit ? { role } : {}),
                    color,
                    ...(adminEdit ? { active } : {}),
                },
            });
            if (!result.success) {
                setError(result.error);
                setIsSaving(false);
                return;
            }
        }

        await queryClient.invalidateQueries({ queryKey: ["users"] });

        if (isCurrentUser) {
            logout();
            return;
        }

        setOpen(false);
        setIsSaving(false);
    }

    useEffect(() => {
        setIsColorValid(validateColor(color));
    }, [color]);

    return (
        <form className="contents" onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>{!user ? "Add user" : adminEdit ? "Edit user" : "Edit profile"}</DialogTitle>
            </DialogHeader>
            <FieldGroup>
                <Field>
                    <Label htmlFor="userUsername">Username</Label>
                    <Input id="userUsername" name="username" placeholder={user?.username ?? "Required"} disabled={isSaving} value={username} onChange={e => setUsername(e.target.value)} />
                </Field>
                <Field>
                    <Label htmlFor="userPassword">Password</Label>
                    <Input id="userPassword" name="password" type="password" placeholder={!user ? "Required" : "New password"} disabled={isSaving} value={password} onChange={e => setPassword(e.target.value)} />
                </Field>
                <div className="flex gap-2">
                    {adminEdit && (
                        <Field className="flex-2">
                            <Label htmlFor="userRole">Role</Label>
                            <Select value={role} disabled={isCurrentUser || isSaving} onValueChange={e => setRole(e ?? "guest")}>
                                <SelectTrigger className="w-full">{role[0].toUpperCase() + role.slice(1)}</SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="guest">Guest</SelectItem>
                                    <SelectItem value="member">Member</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                    )}
                    <Field className="flex-1">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="userColor">Color</Label>
                            {isColorValid && <div className="w-5 h-2.5 mr-0.5 rounded-md" style={{ backgroundColor: color }} />}
                        </div>
                        <Input id="userColor" name="color" placeholder="#ff566b" disabled={isSaving} value={color} onChange={e => setColor(e.target.value)} />
                    </Field>
                </div>
                {adminEdit && (
                    <Field orientation="horizontal" className="w-fit">
                        <Checkbox id="userActive" checked={active} disabled={isCurrentUser || isSaving} onCheckedChange={e => setActive(!!e)} />
                        <FieldLabel htmlFor="userActive">Active</FieldLabel>
                    </Field>
                )}
                {error && <p className="text-sm text-destructive">{error}</p>}
            </FieldGroup>
            <DialogFooter>
                <DialogClose disabled={isSaving} render={<Button variant="outline">Cancel</Button>} />
                <Button type="submit" className="sm:w-31" disabled={isSaving || !username || !color || !isColorValid || (!user && !password)}>
                    {!isSaving ? "Save changes" : <Spinner />}
                </Button>
            </DialogFooter>
        </form>
    );
}
