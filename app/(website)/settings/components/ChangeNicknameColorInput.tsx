"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  useEditNicknameColor,
} from "@/lib/hooks/api/user/useUserMetadata";

const DEFAULT_COLOR = "#ffffff";
const COLOR_PALETTE = [
  "#ffffff",
  "#f87171",
  "#fb923c",
  "#facc15",
  "#4ade80",
  "#22d3ee",
  "#60a5fa",
  "#a78bfa",
  "#f472b6",
  "#94a3b8",
  "#0f172a",
  "#000000",
];

function normalizeColor(color: string) {
  return /^#(?:[0-9A-F]{3}|[0-9A-F]{6})$/i.test(color)
    ? color
    : DEFAULT_COLOR;
}

export default function ChangeNicknameColorInput({
  initialNicknameColor,
}: {
  initialNicknameColor?: string | null;
}) {
  const initialColor = normalizeColor(initialNicknameColor ?? DEFAULT_COLOR);

  const [color, setColor] = useState(initialColor);
  const { trigger, isMutating } = useEditNicknameColor();
  const { toast } = useToast();

  const onSave = () => {
    const payload = {
      nickname_color: color,
    };

    trigger(
      payload,
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

      <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
        {COLOR_PALETTE.map((paletteColor) => {
          const isSelected = color.toLowerCase() === paletteColor.toLowerCase();

          return (
            <button
              key={paletteColor}
              type="button"
              aria-label={`Choose color ${paletteColor}`}
              onClick={() => setColor(paletteColor)}
              className="size-8 rounded-full border-2 transition hover:scale-105"
              style={{
                backgroundColor: paletteColor,
                borderColor: isSelected ? "hsl(var(--primary))" : "hsl(var(--border))",
              }}
            />
          );
        })}
      </div>

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
