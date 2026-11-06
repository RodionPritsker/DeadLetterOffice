# Gauntlet evidence

## Cycle 1 — desk hierarchy and viewport fit

- Issue: the original build permanently showed three sidebars, making the sorting board compete with logs/rules/artifacts; the lower hand could be clipped by 1366×768 viewport height.
- Baseline: `styles.css` used a three-column desk with persistent `.left-rail` and `.right-rail`, plus a tall board/inspector/action/hand stack.
- Change: made the board the only permanent main surface, moved rules/artifacts/log to contextual controls, added compact height-aware layout rules, enlarged the primary parcel/card treatment, and added one-click artifact/log modals.
- Test: `node --check app.js` passed; repo-wide references for new context controls, render updates, and modal handlers are present; no external asset/font dependency was introduced.
- Browser validation: menu was observed rendering in Chrome via Windows accessibility. Clicking the game window could not be completed because Computer Use lost reliable browser-window geometry and stopped; no gameplay screenshot or interaction result is claimed for this cycle.
- Next target: perform real start/tutorial/sort/end-turn/reward/save/reload/win/loss interaction verification when browser control is available; meanwhile audit state transitions and card effects for dead or mismatched behavior.

## Cycle 2 — start transition and viewport grid

- Critic finding: `beginRun()` created a valid save but never called `render()`, leaving the menu visible; the compact CSS pass also shrank critical copy to 7–8px instead of budgeting viewport height.
- Acceptance: a new-run click renders HUD `01 / 08` and non-empty conveyors; runtime smoke covers start → sort → end turn → reload → reward → next shift; layout uses a viewport-height grid with critical copy ≥9px.
- Change: fixed the missing render call; converted the desk to height-budgeted grid rows, kept the board as the only permanent main surface, and removed redundant parcel IDs/position text at short heights.
- Test: inline runtime smoke against the actual `app.js` passed `start renders`, `sort`, `end-turn`, `reload`, `reward`, and `nextShift=2`; `node --check app.js` passed. Chrome showed the menu DOM, but native click/screenshot control stopped on browser-window geometry, so no browser interaction is claimed.
- Next target: implement critic findings for effect lifetime reset, invalid card targets, overexposed hidden routes, and missing artifacts/shift-6 mechanics.

## Cycle 3 — fairness and effect integrity

- Issue: hidden safe routes were visible in the inspector and quick-sort DOM; target-dependent cards could spend energy with no legal neighbor/slot; per-shift effects could leak; shift 6 tracked destination counts but never enforced them.
- Change: hide unresolved safe routes until inspection, suppress quick-sort until a route is known, validate card targets before spending energy, reset per-shift combo/bonus/shield flags, apply overtime's reduced next hand, implement one-use rewind artifact behavior, and enforce shift-6 mixed routing (2 forward + 2 archive + 2 contain minimum).
- Test: inline runtime smoke passed start render, hidden-route redaction, invalid-card preservation, inspect reveal, sort, end turn, reload, reward, and per-shift reset. A second smoke passed shift-6 block/release with the required destination mix. `node --check app.js` passed.
- Browser validation: still blocked at reliable Chrome click geometry; the log does not claim browser interaction or screenshots.
- Next target: tighten save validation and remove remaining dead/duplicated effects; then run another visual/interaction verification pass.

## Cycle 4 — save recovery

- Issue: shallow save checks accepted malformed or partial state, while the Continue button could remain visible for an unusable save.
- Change: added validation for phase, shift bounds, lane shape, known cards/artifacts, destination mix counters, numeric state, and parcel shape; invalid saves are copied to a `:corrupt` backup key and cleared before returning to a clean menu.
- Test: inline runtime smoke passed `corrupt save hidden`, `corrupt save backed up`, and `corrupt save cleared`; prior full interaction smoke remains green for valid save/reload/reward flow.
- Next target: give credits a real between-shift use and keep auditing redundant card effects and reward pacing.

## Cycle 5 — economy loop

- Issue: credits only accumulated; reward screens had no paid deckbuilding or recovery decision.
- Change: added a contextual between-shift market: spend 6 credits to remove one card from the future deck, or 8 credits to repair 2 integrity. Both actions persist before the reward is chosen; the reward choices themselves remain stable.
- Test: inline runtime path reached reward, opened revision, removed `inspect`, persisted a 10→9 deck reduction and the 6-credit spend (after parcel reward: 7 credits remained), then continued to the next shift.
- Note: the first test assertion incorrectly expected zero credits; the corrected observation confirmed the intended arithmetic and no code defect.
- Next target: audit content parity/card redundancy and improve browser-grade verification once reliable Chrome interaction is available.

## Cycle 6 — card identity

- Issue: `Резиновый штамп` duplicated the archive-credit setup of `Канцелярская копирка`, weakening build discovery.
- Change: converted it into a contamination combo card: the next correct sort cleans the neighboring parcel. Reset its per-shift flag with the other temporary effects.
- Test: `node --check app.js` passed; inline runtime smoke confirmed the neighbor's contamination is cleared after playing the rubber stamp and making a correct sort.
- Next target: continue adversarially checking card/artifact parity and the visual viewport with the best available browser path.

## Cycle 7 — full-run pacing

- Issue: a correct-routing oracle with no card use died in shift 2; a card-aware run still died in shift 7, showing dangerous mail could expire before reaching the front and recovery was too weak.
- Change: cap live early anomalies at three, give dangerous parcels +2 deadline, reduce dangerous expiry damage to 1, lower the final quota to 12, and increase the between-shift repair choice from +3 to +5 integrity.
- Test: the real event handlers completed a full 8-shift driver run in 91 steps with 7 reward screens, 54 card plays, 5 repair choices, and terminal `victory`; a separate incorrect-route smoke already proves `defeat` remains reachable. This run uses saved parcel truth as an oracle and is evidence of state-transition reachability, not human discoverability.
- Browser validation: Chrome menu DOM was observed, but reliable native clicks and screenshots remain blocked by the environment's browser-window geometry guard.
- Next target: inspect final visual density and interaction affordances with the best non-blocked path; then continue balance/content audits instead of treating the full run as sufficient.

## Cycle 8 — dangerous-mail fairness

- Issue: the full-run driver still lost before the finale because dangerous parcels could expire while waiting several belt slots back; recovery was still too weak for the intended eight-shift arc.
- Change: dangerous parcels now receive two extra deadline turns, dangerous expiry costs 1 integrity, early live anomalies are capped at three, and the repair reward restores 5 integrity. Final quota is 12 so the finale tests the build without becoming a raw endurance wall.
- Test: card-aware full-run driver reached shifts 1–8 and terminal victory in 91 steps with 7 rewards, 54 card uses, and 5 repair choices. `node --check app.js` passed. Wrong-route defeat remains covered by the earlier runtime smoke.
- Readability polish: parcel names wrap inside their paper cards instead of being ellipsized.
- Next target: keep the browser-validation limitation visible; continue auditing actual player affordances and content parity rather than declaring visual completion from CSS alone.

## Cycle 9 — reward-save integrity

- Issue: a malformed save with `phase:"reward"` could pass shallow validation and crash when the reward modal assumed `rewardChoices` existed.
- Change: reward saves now validate choice shape and known card/artifact IDs; malformed reward saves follow the same backup-and-clear recovery path as other corrupt saves.
- Test: `node --check app.js` passed; inline runtime smoke passed `corrupt reward backed up` and `corrupt reward cleared`.
- Next target: continue with user-facing affordances and actual browser verification when the environment permits it; do not treat this runtime-only evidence as a screenshot pass.

## Cycle 10 — counter validation

- Issue: a partial save could still omit quota/turn/credit counters while passing structural checks, leading to `NaN` pacing after reload.
- Change: save validation now requires all core numeric counters in addition to the lane/deck/reward schema.
- Test: `node --check app.js` passed; inline runtime smoke passed `partial counter save backed up` and `partial counter save cleared`.
- Next target: keep the goal active for further visual/browser validation and adversarial content review; no claim of a completed screenshot pass is made.

## Cycle 11 — action feedback and suppressed-danger route

- Critic findings: the energy HUD stayed at `3 / 3` after a card spent energy; the overtime card's promised four-card next hand refilled to five after any subsequent card; and `nullStamp` suppressed dangerous parcels while the sorter rejected their only valid `contain` route.
- Acceptance: after a card action and reload, the HUD equals persisted `state.energy`; overtime keeps the next hand at most four through later draws, then returns to five normally; a front dangerous parcel can be suppressed and then isolated, incrementing both shift and total processing.
- Change: render current energy, persist a per-turn `handLimit` with backward-compatible save recovery, apply that limit to all automatic draws, and remove the contradictory suppression guard from `sortSelected()`.
- Test: `node --check app.js` and an event-handler runtime smoke passed. The smoke verified `nullStamp → contain` processed the dangerous parcel, overtime produced a four-card next hand even after playing another card, energy changed to `2 / 3`, and reset to `3 / 3` after ending the turn.
- Browser validation: reliable Chrome click geometry and screenshots remain unavailable in this environment; no screenshot claim is made.
- Next target: make parcels/cards keyboard and assistive-technology operable, then continue adversarial effect and responsive-layout review.

## Cycle 12 — keyboard-operable desk

- Issue: parcels and cards were mouse-only `<div>` elements; focused Space could also trigger the global end-turn shortcut instead of activating the focused control.
- Acceptance: generated non-empty parcels and cards are native focusable buttons with accessible names/state; empty slots stay non-focusable; Space on a focused card/parcel does not end the turn, while Space on the desk still does.
- Change: rendered parcels/cards as labeled native buttons with selected/disabled semantics, added visible focus treatment and live energy feedback, and guarded the global Space shortcut from interactive targets.
- Test: `node --check app.js` passed; runtime smoke found 12 parcel buttons and 5 card buttons with ARIA labels, confirmed focused-card Space preserved turn 1, and confirmed desk Space advanced to turn 2.
- Browser validation: reliable Chrome click geometry and screenshots remain unavailable; no screenshot claim is made.
- Next target: inspect remaining card descriptions/effects and responsive button sizing at both requested viewport heights.

## Cycle 13 — browser viewport verification

- Issue: the first real in-game browser frames exposed a duplicated energy suffix (`3 / 3 / 3`) left over from the pre-dynamic HUD markup.
- Acceptance: after a real Start Shift click, both 1920×1080 and 1366×768 show one energy value (`3 / 3`), the menu is hidden, 12 parcels and 5 cards render, and the full board/action/hand stack fits without page scrolling or clipping.
- Change: moved the maximum-energy suffix into the live `energy-value` element and removed the stale static suffix.
- Test: isolated headless Chrome + DevTools loaded `index.html`, executed the real `new-run-btn.click()`, and captured/inspected both target viewports. Runtime results were `menuHidden:true`, `gameHidden:false`, `energy:"3 / 3"`, `parcels:12`, `cards:5` at both sizes. Visual inspection found the hand and controls fully visible with no vertical scroll.
- Artifacts: `.runtime/qa/game-final-1920.png` and `.runtime/qa/game-final-1366.png` are local ignored QA captures on `D:`.
- Next target: use the same real browser session to exercise selection, card play, end-turn, save/reload, reward, and terminal paths; then continue card/effect parity review.

## Cycle 14 — card effect contracts

- Issue: `Дезактивация` promised to clean the selected and neighboring parcel but only reduced neighbor contamination by one; `Приказ №0` incremented `shiftStats.emergency` from `undefined`, producing `NaN` and a corrupt extra counter.
- Acceptance: cleaning sets contamination to zero on the selected parcel and both adjacent slots; emergency processing increments quota/total exactly once without adding non-finite or unknown route counters.
- Change: make `clean` fully clear both neighbors and count route statistics only for declared `forward/archive/contain` destinations.
- Test: event-handler runtime smoke passed: selected and adjacent contamination became `0`, emergency processed exactly one parcel, and `shiftStats` remained `{forward:0, archive:0, contain:0}` with no `emergency` key or non-finite value. `node --check app.js` passed. The corrected real browser run before this patch reached 5/8, 4 rewards, 36 sorts, and a genuine defeat with zero browser exceptions; earlier seeded state-transition coverage still reaches victory.
- Browser validation: the 1366×768 browser run and the 1920×1080/1366×768 screenshots are real; no claim is made that a human browser run has won all eight shifts.
- Next target: continue adversarially auditing card/artifact contracts and make the browser path more discoverable without weakening the loss condition.
