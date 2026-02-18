import { HeartHandshake } from "lucide-react";
import { twMerge } from "tailwind-merge";

type Props = {
  className?: string;
};

export default function SupporterIcon({ className }: Props) {
  return (
    <HeartHandshake
      aria-label="Supporter"
      className={twMerge("size-4 text-pink-400", className)}
    />
  );
}
