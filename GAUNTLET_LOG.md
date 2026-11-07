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

## Cycle 15 — reward-save repair validation

- Issue: reward saves validated the reward kind and card/artifact IDs but accepted a repair choice without a numeric amount; selecting it could turn integrity into `NaN` and make later loss checks unreliable.
- Acceptance: a reward save with missing, non-finite, or non-positive repair amount is backed up as corrupt and cleared; valid repair choices remain loadable.
- Change: require a finite positive `repair.amount` in `validSave()` while preserving the existing card/artifact validation path.
- Test: malformed reward-save runtime smoke passed with `rewardChoices:[{kind:'repair'}]`: the corrupt backup key was written and the active save was cleared. `node --check app.js` passed.
- Browser validation: the real browser start/reload/sort run remains free of JS exceptions; this persistence edge case was tested through the same event-handler logic because it is a storage-corruption scenario.
- Next target: re-run the browser interaction smoke after this validation change, then audit terminal/reward transitions and card redundancy.

## Cycle 16 — union discount affordance

- Issue: the `union` artifact discounted the first 2+ energy card internally, but the hand still showed its base cost and marked it unavailable at 1 energy; attempting a card at 0 energy consumed the one-use discount before rejecting it.
- Acceptance: with `union` and 1 energy, a cost-2 card displays cost 1 and is playable; with 0 energy, the same rejected attempt leaves the card, energy, and union discount untouched.
- Change: added a shared `cardCost()` calculation for UI and execution, show the effective cost, and consume `unionUsed` only after the discounted cost passes the energy check.
- Test: event-handler runtime smoke passed the 1-energy success and 0-energy failure cases; the card cost rendered as `1`, success left energy `0` and set `unionUsed`, while failure retained the card and left `unionUsed:false`. `node --check app.js` passed.
- Browser validation: the prior real browser run had no JS exceptions; the updated arithmetic is covered through the same delegated click path and will be included in the next browser smoke.
- Next target: repeat browser interaction after the cost fix, then decide whether remaining route-card duplication is a meaningful build weakness or leave it unchanged.

## Cycle 17 — route-card differentiation

- Issue: `Переназначение адреса` and `Редактор формы` were behaviorally identical, making one reward choice dead weight in a 31-card pool.
- Acceptance: on the same safe contaminated parcel, retarget flips only `forward ↔ archive`, while form flips the route and lowers contamination by exactly 1; both remain legal only for non-dangerous mail.
- Change: kept retarget as the pure route switch and gave form its described cleanup rider (`заражение −1`), with a matching toast and card description.
- Test: event-handler runtime smoke passed: retarget preserved contamination at `2` while toggling the route, then form toggled it back and reduced contamination to `1`. `node --check app.js` passed.
- Browser validation: the real 1366×768 interaction run remains a documented defeat path with zero browser exceptions; no victory claim is made from this card-content pass.
- Next target: repeat the corrected browser smoke after the union/form changes and inspect whether any remaining effect is unreachable or misleading.

## Cycle 18 — sorting-machine scope

- Issue: `Сломанная сортировочная машина` was documented as pulling one random slot forward every third success, but the implementation moved the last slot to the front on all three lanes at once.
- Acceptance: on the third processed parcel, exactly one eligible lane moves its last parcel to the front; untouched lanes preserve order and no extra parcel is processed.
- Change: choose one random lane from lanes with at least two parcels and move only that lane's last slot.
- Test: event-handler runtime smoke seeded `totalProcessed:2`, made the third correct sort, and observed exactly one machine-mutated lane (`before` lengths `[4,4,4]`, after `[3,4,4]`, processed `3`). `node --check app.js` passed.
- Browser validation: browser screenshots and the real 1366×768 defeat run remain available; no victory claim is made for this artifact pass.
- Next target: repeat the corrected browser interaction smoke after the accumulated effect fixes and keep looking for remaining high-impact mismatches.

## Cycle 19 — restrained toast stack

- Issue: the real 1366×768 policy-run frame accumulated a tall stack of action toasts over the right side of the board and defeat modal, contradicting the restrained-motion/secondary-panel target.
- Acceptance: rapid valid or invalid actions never leave more than three toast nodes visible; the game remains visible and no browser exception is raised.
- Change: cap `#toast-stack` at the three newest notifications, removing the oldest before appending a new one; expiry timing remains unchanged.
- Test: isolated headless Chrome started a real shift, executed 12 delegated card clicks, and observed `toasts:3`, `gameVisible:true`, and `browserErrors:[]`.
- Browser evidence: the pre-fix obstruction is captured in `.runtime/qa/browser-policy-clean-1366.png`; the cap was verified in the actual browser DOM after the fix.
- Next target: re-run a full browser policy path with the quieter feedback, then continue testing terminal/reward flows and remaining effect parity.

## Cycle 20 — save schema hardening

- Issue: a partial save could still pass validation while omitting `shiftFlags`, `draw`, `discard`, RNG, or scalar limits; subsequent card/turn logic could then throw or operate on `NaN`.
- Acceptance: current valid saves still reload; removing any of those required runtime fields routes the save to the corrupt backup and clears the active save before gameplay resumes.
- Change: split save validation into card-list, flag, scalar, counter, reward, lane, and optional `handLimit` checks; parcel `maxLife` is now required because deadline cards use it.
- Test: runtime smoke confirmed a valid save reload and rejected missing `shiftFlags`, `draw`, `discard`, and `rng` with backup plus clear. `node --check app.js` passed.
- Browser validation: the last real policy run reached shift 6 with 5 rewards, 46 sorts, 9 cleanups, and no browser errors; this schema edge case uses the same save/load handlers. A post-hardening real 1366×768 smoke then completed Start → save → reload → Continue with 12 parcels, 5 cards, energy `3 / 3`, and `browserErrors:[]`.
- Next target: run a post-hardening browser start/reload smoke and continue adversarial terminal-state checks.

## Cycle 21 — parcel save schema

- Issue: the hardened save schema still accepted a parcel with a missing/invalid `lane`, allowing target-dependent cards to address `state.lanes[p.lane]` outside the actual board; basic display fields and positive deadlines were also unchecked.
- Acceptance: valid current saves still load; a save with parcel lane `9` is backed up and cleared before Continue can use it.
- Change: added `validParcel()` requiring a board lane index, string display identity, known type/destination, finite value, and positive life/maxLife.
- Test: runtime save-recovery smoke injected `lane:9` into a real saved parcel and observed corrupt backup plus active-save clear. `node --check app.js` passed.
- Browser validation: post-hardening Start → save → reload → Continue remains green at 1366×768 with 12 parcels, 5 cards, energy `3 / 3`, and no browser exceptions.
- Full current-build browser oracle follow-up: 99 real DOM-action steps reached shifts 1–7, made 60 correct sorts, 52 card plays, 6 rewards, and 2 repairs, then reached a genuine defeat at integrity `1 / 18` with `browserErrors:[]`; the final frame retained only three toasts and a readable defeat modal. This is late loss-path evidence, not a victory claim.
- Next target: perform a final current-build browser interaction audit around reward/terminal modals, then keep the goal active for any newly evidenced weakness.

## Cycle 22 — seal anomaly contract

- Issue: `Красная пломба` claimed to block the next anomaly, but parcel shields were cleared before contamination spread and therefore only skipped a deadline tick; `Сухой ящик` also hid its protective rider.
- Acceptance: a sealed target adjacent to a contaminated source keeps contamination at `0` through the next spread, skips exactly one life tick, and clears its shield afterward; descriptions state both effects.
- Change: keep shield active through `spreadContamination()`, block incoming contamination for shielded targets, clear shields afterward, and update seal/dryBox copy.
- Test: event-handler runtime smoke at shift 5 passed: sealed parcel stayed at life `3`, contamination `0`, and `shield:false` after the turn. `node --check app.js` passed.
- Browser validation: current oracle run reached 7/8 and genuine defeat with 52 card plays and no browser exceptions; no victory claim is made for this card contract. A deterministic 1366×768 DOM smoke then used real Continue → parcel → seal → end-turn clicks and observed life `3`, contamination `0`, shield cleared, game visible, and `browserErrors:[]`. A final terminal smoke forced valid minimal states and reached `ДЕПАРТАМЕНТ ВЫЖИЛ` and `СМЕНА ПРЕРВАНА` through DOM clicks, clearing the save in both cases with `browserErrors:[]`.
- Next target: repeat a compact browser card/terminal smoke after the shield change and continue only if it exposes another concrete mismatch.

## Cycle 23 — black-market penalty parity

- Issue: `Чёрная рыночная наклейка` described only a +2-credit bonus for correct anomalous mail, but wrong routing silently added +1 damage, making an unrelated failure penalty depend on the artifact.
- Acceptance: with black market active, a normal wrong route still costs exactly 2 integrity and increments one mistake; the artifact changes only its documented correct-anomaly reward.
- Change: removed the undocumented damage modifier and made the error log/toast explicitly report `−2` integrity.
- Test: event-handler runtime smoke with black market, integrity `10`, and a wrong route produced integrity `8`, mistakes `1`, and a `−2` log entry. `node --check app.js` passed.
- Browser validation: current terminal smoke reaches both victory and defeat through DOM clicks with no browser exceptions; this balance contract is covered through the same sort handler. A deterministic 1366×768 browser smoke then performed Continue → parcel → wrong-route clicks with black market and observed integrity `8`, mistakes `1`, a visible `−2` log entry, game visible, and `browserErrors:[]`.
- Next target: audit remaining artifact side effects for undocumented penalties/bonuses, then re-run a compact browser wrong-route smoke.

## Cycle 24 — shield ordering correction

- Audit finding: the first Cycle 22 smoke was a false positive for spread blocking because its contaminated source occupied the front slot and was removed before spread; code still cleared `p.shield` too early.
- Acceptance: with a contaminated source in the middle slot and a sealed target immediately behind it, the end-turn shift must leave target contamination at `0`, preserve its one skipped life tick, then clear the shield after spread.
- Change: stopped clearing parcel shields inside the per-lane life decrement; the existing post-spread clear now owns shield lifetime.
- Test: corrected runtime smoke used a three-slot lane, source at index 1 and sealed target at index 2; after a real seal click and end-turn, target was life `3`, contamination `0`, shield `false`, while source remained contamination `2`. `node --check app.js` passed.
- Browser validation: terminal, black-market, and compact shield DOM smokes remain available; the earlier Cycle 22 claim is superseded by this stronger middle-slot test. A 1366×768 browser run with real Continue → target → seal → end-turn clicks observed life `3`, contamination `0`, shield `false`, source still contaminated, game visible, and `browserErrors:[]`.
- Next target: run the corrected shield scenario in headless Chrome and continue artifact side-effect auditing.

## Cycle 25 — medal expiry contract

- Issue: `Медаль за выслугу` claimed to protect the first mistake of a shift, but only wrong-route mistakes consumed it; the first deadline expiry still damaged integrity.
- Acceptance: with medal active, the first expired parcel is removed and counted as expired, but integrity and mistakes do not change; the flag is consumed and later mistakes remain normal.
- Change: apply the medal guard in `expireParcel()` after the clock/last-hope recovery checks, with explicit log/toast evidence.
- Test: runtime end-turn smoke at shift 3 with integrity `10` and a life-1 parcel produced integrity `10`, mistakes `0`, expired `1`, and `mistakesShielded:true`. `node --check app.js` passed.
- Browser validation: corrected middle-slot shield browser smoke remains green with no exceptions; a fresh 1366×768 headless Chrome smoke then used real Start → reload → Continue → end-turn clicks with a valid saved shift, and observed `expired=1`, integrity `10`, mistakes `0`, `mistakesShielded=true`, game still visible, and `browserErrors:[]`.
- Next target: run a compact browser medal-expiry scenario, then audit the remaining artifact recovery order (clock/last-hope/medal) for overlap bugs.

## Cycle 26 — preserve rescued front parcels

- Issue: `expireParcel()` reset a rescued parcel to life `1`, but the same end-turn path unconditionally shifted the lane and removed its front parcel anyway; the clock's advertised extra deadline therefore failed in the normal front-slot case.
- Acceptance: an expired front parcel rescued by the clock, medal, or last-hope card remains on its lane at life `1` after the turn; an unprotected expiry still disappears and damages normally; the rescued clock parcel can expire normally on a later turn.
- Change: make recovery branches report a rescued parcel and skip the conveyor shift only when that rescued parcel is at the front of the lane.
- Test: `node --check app.js` and `git diff --check` passed. Fresh 1366×768 headless Chrome smokes with real clicks observed: no artifact → integrity `9`, parcel absent; clock → integrity `10`, `expProtected:true`, parcel present; second clock turn → parcel absent after normal expiry; medal → integrity `10`, `mistakes:0`, parcel present; last-hope card click → integrity `10`, `mistakes:0`, shield cleared, parcel present. All browser scenarios reported `browserErrors:[]`.
- Independent critic: identified a separate medal zero-damage expiry issue and a rulebook statement that incorrectly implies contamination forces isolation; neither was changed in this cycle.
- Next target: prevent medal consumption by a shift-1/2 expiry that causes zero damage, then align the rulebook with actual contamination routing.
