"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useEditUserMetadata } from "@/lib/hooks/api/user/useUserMetadata";

const DEFAULT_COLOR = "#ffffff";

type MetadataWithNicknameColor = {
  nickname_color?: string | null;
};

function normalizeColor(color: string) {
  return /^#(?:[0-9A-F]{3}|[0-9A-F]{6})$/i.test(color)
    ? color
    : DEFAULT_COLOR;
}

export default function ChangeNicknameColorInput({
  metadata,
}: {
  metadata: MetadataWithNicknameColor;
}) {
  const initialColor = normalizeColor(metadata.nickname_color ?? DEFAULT_COLOR);

  const [color, setColor] = useState(initialColor);
  const { trigger, isMutating } = useEditUserMetadata();
  const { toast } = useToast();

  const onSave = () => {
    trigger(
      {
        nickname_color: color,
      } as any,
      {
        onSuccess: () => {
          toast({
            title: "Nickname color updated",
            variant: "success",
          });
        },
        onError: (err) => {
          toast({
            title: "Failed to update nickname color",
            description: err.message,
            variant: "destructive",
          });
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-3 lg:w-1/2">
      <label className="text-sm text-muted-foreground">
        Nickname color (Supporter only)
      </label>
      <div className="flex items-center gap-3">
        <Input
          type="color"
          value={color}
          onChange={e => setColor(normalizeColor(e.target.value))}
          className="h-10 w-20 cursor-pointer p-1"
        />
        <span className="font-mono text-sm">{color.toUpperCase()}</span>
      </div>

      <div>
        <Button onClick={onSave} disabled={isMutating}>
          Save nickname color
        </Button>
      </div>
    </div>
  );
}
