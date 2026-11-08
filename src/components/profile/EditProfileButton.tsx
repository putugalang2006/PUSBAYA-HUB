"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfileEditModal } from "@/components/profile/ProfileEditModal";

export function EditProfileButton({
  className,
  label = "Edit Profil",
  variant = "outline",
  compact = false,
}: {
  className?: string;
  label?: string;
  variant?: "gold" | "outline" | "ghost";
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "btn",
          compact && "btn-sm",
          variant === "gold" && "btn-gold",
          variant === "outline" && "btn-outline",
          variant === "ghost" && "btn-ghost",
          className,
        )}
      >
        <Pencil className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
        {label}
      </button>
      <ProfileEditModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
