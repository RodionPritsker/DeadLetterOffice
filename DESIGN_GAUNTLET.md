# Telegraph Nocturne — bounded design gauntlet

Start: 2026-11-08 19:14:50 +07:00
Budget: maximum 6 iterations / 120 minutes
Branch: `codex/telegraph-nocturne-gauntlet`
Baseline checkpoint: `a3565b7`

## Champion 0 — incumbent Telegraph Nocturne Docket

Source: `7481067` plus the baseline checkpoint above.

Preserved strengths: incoming signal → central relay dossier → filing terminals; dark industrial atmosphere; shared game state and handlers; Docket-specific responsive overflow.

Known weaknesses: dashboard density, many nested rectangles, small operational text, reused parcel/card art, relay not yet visually dominant, weak tactile state feedback.

### Campaign log

#### Iteration 1 — accepted / promoted

Scope: relay-first Docket work surface in Telegraph Nocturne.

- Removed the nested dashboard treatment from the Docket shell; incoming signal and terminals now read as open work surfaces around a larger central relay.
- Increased relay and case readability, enlarged operational copy, and preserved responsive stacking for narrow screens.
- Kept parcel/card artwork and game mechanics unchanged; those remain the next refinement frontier.
- Found and fixed the interaction regression: the delegated click handler matched `body[data-visual-mode]` as if it were a visual prototype button, so every dynamic gameplay click returned before reaching parcel, card, terminal, filing, pause, and turn actions.
- Browser smoke checks on localhost: Telegraph Docket selection, add/remove, card, terminal, end-turn button, pause open/close; Telegraph legacy selection, inspect, card, archive sorting, end-turn button, pause open/close. The Space path remains code-reviewed but was not isolated from Chrome address-bar focus in this pass.
- Static checks: `node --check app.js`, `git diff --check`.

Champion 1: current working tree, promoted after the interaction fix. Remaining risk: post-patch validation at the requested 1920×1080, 1366×768, and 820×700 viewports is still a human-review checkpoint; the available browser was zoomed to 67%.
