import React from "react";
import { cn } from "@/shared/lib/utils";
import { AuthService } from "@/shared/lib/auth-service";

type ProfileAvatarProps = {
  imageUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  alt?: string;
  className?: string;
  textClassName?: string;
};

function computeInitials(firstName?: string | null, lastName?: string | null, fullName?: string | null): string {
  const first = (firstName || "").trim();
  const last = (lastName || "").trim();
  if (first || last) {
    return `${first[0] || ""}${last[0] || ""}`.toUpperCase() || "U";
  }

  const name = (fullName || "").trim();
  if (!name) return "U";

  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return (parts[0].slice(0, 2) || "U").toUpperCase();
  return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase() || "U";
}

export default function ProfileAvatar({
  imageUrl,
  firstName,
  lastName,
  fullName,
  alt = "Profile",
  className,
  textClassName,
}: ProfileAvatarProps) {
  const resolved = AuthService.resolveAvatarUrl(imageUrl);
  const initials = computeInitials(firstName, lastName, fullName);

  return (
    <div className={cn("relative overflow-hidden rounded-full shrink-0", className)}>
      {resolved ? (
        <img src={resolved} alt={alt} className="h-full w-full rounded-full object-cover" />
      ) : (
        <div
          className={cn(
            "flex h-full w-full items-center justify-center rounded-full bg-slate-200 text-slate-600 font-semibold uppercase leading-none select-none text-center whitespace-nowrap antialiased",
            textClassName,
          )}
        >
          {initials}
        </div>
      )}
    </div>
  );
}
