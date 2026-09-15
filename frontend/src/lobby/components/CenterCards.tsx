import { Player, Role } from "../../Interfaces";

const CENTER_CARD_IDS = ["center-0", "center-1", "center-2"];

export default function CenterCards(props: {
  validTargetIds?: Player["id"][];
  selectedTargetIds: Player["id"][];
  onSelect?: (cardId: Player["id"]) => void;
  revealedRoles: Role[] | null;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-base-300 bg-base-200/40 p-4 shadow-inner">
      {CENTER_CARD_IDS.map((cardId, index) => {
        const isSelectable = Boolean(props.validTargetIds?.includes(cardId));
        const isSelected = props.selectedTargetIds.includes(cardId);
        const revealedRole = props.revealedRoles?.[index];

        return (
          <div
            key={cardId}
            onClick={() => isSelectable && props.onSelect?.(cardId)}
            className={`flex flex-col items-center justify-center w-16 h-24 rounded-xl border-2 text-center transition-all duration-200 ${
              isSelected
                ? "border-secondary bg-secondary/10 shadow-lg shadow-secondary/20 cursor-pointer"
                : isSelectable
                  ? "border-accent bg-accent/10 shadow-lg shadow-accent/20 cursor-pointer hover:scale-105"
                  : "border-base-300 bg-base-100"
            }`}
          >
            {revealedRole ? (
              <span className="px-1 text-xs font-medium text-base-content">{revealedRole.name}</span>
            ) : (
              <span className="text-2xl">🂠</span>
            )}
            <span className="mt-1 text-[10px] uppercase tracking-wide text-base-content/50">
              Card {index + 1}
            </span>
          </div>
        );
      })}
    </div>
  );
}
