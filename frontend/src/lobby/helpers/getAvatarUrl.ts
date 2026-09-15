import { createAvatar } from "@dicebear/core";
import { avataaars } from "@dicebear/collection";

export default function getAvatarUrl(seed: string) {
  const avatar = createAvatar(avataaars, {
    seed: seed || "player",
    size: 128,
  });

  return avatar.toDataUri();
}
