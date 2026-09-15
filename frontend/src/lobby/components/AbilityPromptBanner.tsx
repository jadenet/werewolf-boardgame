import { AbilityPrompt, Player } from "../../Interfaces";

export default function AbilityPromptBanner(props: {
  activeAbilityPrompt: AbilityPrompt;
  selectedAbilityTargets: Player["id"][];
}) {
  const abilityPromptProgress = `${props.selectedAbilityTargets.length}/${props.activeAbilityPrompt.requiredSelections}`;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4">
      <div className="w-full max-w-xl rounded-2xl border border-accent/50 bg-base-100/95 shadow-2xl backdrop-blur-sm">
        <div className="flex items-start justify-between gap-4 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Ability Ready</p>
            <h4 className="mt-1 text-lg font-semibold">{props.activeAbilityPrompt.abilityName}</h4>
            <p className="mt-1 text-sm text-base-content/80">{props.activeAbilityPrompt.message}</p>
          </div>
          <div className="rounded-xl border border-accent/30 bg-base-200/80 px-3 py-2 text-right shrink-0">
            <div className="text-xs uppercase tracking-wide text-base-content/60">Selected</div>
            <div className="font-mono text-lg font-semibold text-accent">{abilityPromptProgress}</div>
          </div>
        </div>
      </div>
    </div>
  );
}