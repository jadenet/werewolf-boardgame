import { useEffect, useState } from "react";
import { Role } from "../../../Interfaces";
import { buildServerUrl } from "../../../app/config/server";

export default function LobbyRolesTab(props: {
  roleCatalog: Role[];
  selectedRoleIds: Role["id"][];
  playerCount: number;
}) {
  const [recommendedRoleIds, setRecommendedRoleIds] = useState<Role["id"][]>([]);

  useEffect(() => {
    if (props.selectedRoleIds.length > 0) {
      setRecommendedRoleIds([]);
      return;
    }

    let cancelled = false;
    fetch(buildServerUrl(`/roles/default/${props.playerCount}`))
      .then((response) => response.ok ? response.json() : [])
      .then((roleIds: Role["id"][]) => {
        if (!cancelled) {
          setRecommendedRoleIds(roleIds);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRecommendedRoleIds([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [props.playerCount, props.selectedRoleIds]);

  const roleCounts = new Map<Role["id"], number>();
  const roleIds = props.selectedRoleIds.length > 0
    ? props.selectedRoleIds
    : recommendedRoleIds;

  roleIds.forEach((roleId) => {
    roleCounts.set(roleId, (roleCounts.get(roleId) ?? 0) + 1);
  });

  const roles = Array.from(roleCounts, ([roleId, count]) => ({
    role: props.roleCatalog.find((item) => item.id === roleId),
    count,
  })).filter((entry): entry is { role: Role; count: number } => Boolean(entry.role));
  const hasCustomSelection = props.selectedRoleIds.length > 0;

  return (
    <div className="mx-2 my-4 flex min-h-0 flex-col gap-3 pb-4">
      <header className="border-b border-base-300 px-2 pb-3">
        <h2 className="text-sm font-semibold text-base-content">
          {hasCustomSelection ? "Selected for this lobby" : `Recommended roles for ${props.playerCount} players`}
        </h2>
        {!hasCustomSelection && (
          <p className="mt-1 text-xs text-base-content/60">
            This role pool is dealt when a round starts.
          </p>
        )}
      </header>

      <ul className="min-h-0 space-y-2 overflow-y-auto" aria-label="Possible roles in this game">
        {roles.map(({ role, count }) => (
          <li key={role.id} className="flex min-w-0 items-center gap-3 border-b border-base-300/70 px-2 py-2">
            <img src={role.image} alt="" className="h-10 w-10 shrink-0 rounded-md object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-base-content">{role.name}</p>
              <p className="text-xs text-base-content/60">{role.team}</p>
            </div>
            {count > 1 && <span className="text-xs font-medium text-base-content/70">×{count}</span>}
          </li>
        ))}
      </ul>
      {!hasCustomSelection && recommendedRoleIds.length === 0 && (
        <p role="status" className="px-2 text-sm text-base-content/60">Loading roles...</p>
      )}
    </div>
  );
}