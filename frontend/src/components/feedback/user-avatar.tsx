import { AVATARS, type User } from "@/data";

export default function UserAvatar({
  user,
  className = "",
}: {
  user: User;
  className?: string;
}) {
  return (
    <img
      src={AVATARS[user.avatar].src}
      alt=""
      width={40}
      height={40}
      className={`size-10 shrink-0 rounded-full ${className}`}
    />
  );
}
