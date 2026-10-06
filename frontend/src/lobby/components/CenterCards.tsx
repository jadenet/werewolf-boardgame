import { Player, Role } from "../../Interfaces";

const CENTER_CARD_IDS = ["center-0", "center-1", "center-2"];

export default function CenterCards(props: {
  validTargetIds?: Player["id"][];
  selectedTargetIds: Player["id"][];
  onSelect?: (cardId: Player["id"]) => void;
  revealedRoles: Role[] | null;
}) {
  return (
    <div aria-label="Center cards" className="flex max-w-full items-end justify-center gap-3 px-2 py-4">
      {CENTER_CARD_IDS.map((cardId, index) => {
        const isSelectable = Boolean(props.validTargetIds?.includes(cardId));
        const isSelected = props.selectedTargetIds.includes(cardId);
        const revealedRole = props.revealedRoles?.[index];

        return (
          <button
            type="button"
            key={cardId}
            onClick={() => isSelectable && props.onSelect?.(cardId)}
            disabled={!isSelectable}
            aria-label={revealedRole ? `Center card ${index + 1}: ${revealedRole.name}` : `Center card ${index + 1}, face down`}
            className={`relative flex aspect-[2/3] w-20 shrink-0 flex-col items-center overflow-hidden rounded-lg border text-center transition-transform duration-200 md:w-24 ${
              isSelected
                ? "border-secondary bg-secondary/10 ring-2 ring-secondary/40"
                : isSelectable
                  ? "border-accent bg-accent/10 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                  : "border-base-300 bg-base-200"
            }`}
          >
            {revealedRole ? (
              <>
                <img src={revealedRole.image} alt="" className="min-h-0 w-full flex-1 object-cover" />
                <span className="w-full truncate bg-base-100 px-1 py-1 text-xs font-semibold text-base-content">
                  {revealedRole.name}
                </span>
              </>
            ) : (
              <span className="flex flex-1 items-center justify-center text-3xl text-primary/70" aria-hidden="true">🂠</span>
            )}
            <span className="w-full border-t border-base-300/70 bg-base-100/80 py-1 text-[10px] uppercase text-base-content/50">
              Card {index + 1}
            </span>
          </button>
        );
      })}
    </div>
  );
}
