import { cn, initials } from "@/lib/utils";

export function UserAvatar({
  name,
  photo,
  size = 40,
  className,
}: {
  name: string;
  photo?: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn("avatar overflow-hidden", className)}
      style={{ width: size, height: size }}
      title={name}
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt={`Foto profil ${name}`}
          className="h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <span aria-hidden="true">{initials(name)}</span>
      )}
    </span>
  );
}
