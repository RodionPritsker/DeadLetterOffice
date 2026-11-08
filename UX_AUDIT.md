# UX audit — Telegraph Nocturne Phase 2

## Scope

This pass targets only the Docket Registry / Реестр дел mode. The legacy three-conveyor sorter remains outside the redesign scope.

## New interaction model

```text
incoming signal → inspect → attach evidence → read case state
                                         ↓
                              choose receiving terminal
                                         ↓
                              file case / end turn
```

## Acceptance checks

- The current objective is visible without opening the rulebook.
- Incoming parcels are visually subordinate to the active dossier.
- The active dossier shows 0–3 evidence slots, case state, properties, synergies, reward estimate, and energy cost.
- Every filing terminal previews compatibility and risk before commitment.
- `ОФОРМИТЬ ДЕЛО` and `ЗАВЕРШИТЬ ХОД` are visibly different actions.
- Cards are identifiable by art, category rail, cost, and disabled/targeting state.
- Adding evidence, finding a synergy, filing, and ending a turn each have distinct feedback.
- Important decision text is readable without relying on tiny monospaced labels.
- At 820px and below, the order becomes dossier → incoming evidence → terminals → actions → cards, with page scrolling available.
- Keyboard focus remains visible and reduced motion removes only decorative movement.

## First-pass risks to review

1. The central dossier may still be too dense when three evidence slots are filled.
2. The relay illustration may compete with the evidence objects if the machine window is too tall.
3. The terminal descriptions need to remain scannable at 820×700.
4. Card art is reused from the existing asset sprite; a later pass may need bespoke illustrations for the strongest card categories.

## Manual review status

The Impeccable engine was unavailable, so no automated detector or overlay was run. The vertical slice should be manually opened from `index.html` in a browser and checked at 1920×1080, 1366×768, and 820×700 before further visual iteration.
