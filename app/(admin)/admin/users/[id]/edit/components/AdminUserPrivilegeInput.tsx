"use client";

import { Shield } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { useToast } from "@/hooks/use-toast";
import { useAdminEditPrivilege } from "@/lib/hooks/api/user/useAdminUserEdit";
import type { UserSensitiveResponse } from "@/lib/types/api";
import { UserPrivilege } from "@/lib/types/api";

type ElevatedPrivilege = Exclude<UserPrivilege, UserPrivilege.USER>;

function toElevatedPrivilege(value: UserPrivilege): value is ElevatedPrivilege {
  return value !== UserPrivilege.USER;
}

export const PRIVILEGE_OPTIONS = Object.values(UserPrivilege)
  .filter(toElevatedPrivilege)
  .map((value) => {
    if (value === UserPrivilege.BAT) {
      return {
        label: "Moderator",
        value,
      };
    }

    return {
      label: value.replaceAll(/([a-z])([A-Z])/g, "$1 $2"),
      value,
    };
  });

function normalizePrivilege(privilege: string): UserPrivilege | null {
  const normalizedPrivilege = privilege.trim().toLowerCase();

  if (normalizedPrivilege === "moderator")
    return UserPrivilege.BAT;

  return Object.values(UserPrivilege).find(
    value => value.toLowerCase() === normalizedPrivilege,
  ) ?? null;
}

function normalizeElevatedPrivileges(privileges: string[]): ElevatedPrivilege[] {
  return Array.from(new Set(privileges
    .map(normalizePrivilege)
    .filter((value): value is ElevatedPrivilege => value != null && value !== UserPrivilege.USER)));
}

export default function AdminUserPrivilegeInput({
  user,
}: {
  user: UserSensitiveResponse;
}) {
  const [selectedPrivileges, setSelectedPrivileges] = useState<ElevatedPrivilege[]>(
    () => normalizeElevatedPrivileges(user.privilege),
  );
  const [error, setError] = useState<string | null>(null);

  const { trigger: editPrivilege, isMutating: isUpdatingPrivilege }
    = useAdminEditPrivilege(user.user_id);
  const { toast } = useToast();

  useEffect(() => {
    setSelectedPrivileges(normalizeElevatedPrivileges(user.privilege));
  }, [user.privilege]);

  const currentPrivileges = useMemo(
    () => normalizeElevatedPrivileges(user.privilege),
    [user.privilege],
  );

  const handleSave = async () => {
    setError(null);

    const privileges: UserPrivilege[] = [
      UserPrivilege.USER,
      ...selectedPrivileges,
    ];

    try {
      await editPrivilege({ privilege: Array.from(new Set(privileges)) });

      toast({
        title: "Privileges updated successfully!",
        description: `Updated privileges for ${user.username}.`,
        variant: "success",
      });
    }
    catch (err: any) {
      const errorMessage = err.message ?? "Unknown error.";
      setError(errorMessage);
      toast({
        title: "Failed to update privileges",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const hasChanges
    = selectedPrivileges.length !== currentPrivileges.length
      || !selectedPrivileges.every(p => currentPrivileges.includes(p));

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Shield className="size-4" />
        Privileges
      </Label>
      <div className="flex items-start gap-2">
        <MultiSelect
          options={PRIVILEGE_OPTIONS}
          onValueChange={(values: string[]) =>
            setSelectedPrivileges(normalizeElevatedPrivileges(values))}
          defaultValue={currentPrivileges}
          placeholder="Select privileges..."
          className="flex-1"
        />
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isUpdatingPrivilege}
          variant="accent"
        >
          Save
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {selectedPrivileges.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Selected
          {" "}
          {selectedPrivileges.length}
          {" "}
          {selectedPrivileges.length === 1 ? "privilege" : "privileges"}
        </p>
      )}
    </div>
  );
}
