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

## Cycle 27 — preserve medal for real mistakes

- Issue: on shifts 1–2, an ordinary expired parcel causes zero integrity damage, but the medal guard ran before damage calculation and consumed the medal anyway; a later wrong route then paid the full penalty.
- Acceptance: a zero-damage expiry leaves `mistakesShielded:false`; the next wrong route consumes the medal with integrity/mistakes unchanged. A dangerous or otherwise damaging expiry still consumes the medal and prevents its damage.
- Change: calculate expiry damage before the medal guard and consume the medal only when `damage > 0`; clock and last-hope remain first-expiry protections.
- Test: `node --check app.js` passed. Fresh 1366×768 headless Chrome: shift-1 ordinary expiry produced integrity `10`, mistakes `0`, expired `1`, medal unused; a real parcel click plus wrong archive click then produced integrity `10`, mistakes `0`, `mistakesShielded:true`; a shift-3 dangerous expiry also produced integrity `10`, mistakes `0`, `mistakesShielded:true`. All browser scenarios reported `browserErrors:[]`.
- Next target: align the rulebook's contamination wording with actual routing, then test contaminated parcels through the real sort controls.

## Cycle 28 — clarify contamination routing

- Issue: the modal rulebook said “опасное или заражённое → изоляция”, but sorting validates the parcel's destination; a contaminated ordinary parcel is correctly forwarded, while contamination affects spread and some rewards rather than changing its route. The empty-inspector hint also implied every red fact required isolation.
- Acceptance: the rulebook and inspector explain that danger determines isolation, contamination is a separate spread/reward risk, and a contaminated ordinary parcel can be forwarded without an error.
- Change: corrected the rulebook priority text and the inspector hint; no routing mechanic was changed.
- Test: fresh 1366×768 headless Chrome opened the actual rules modal and found the corrected contamination sentence, then performed real Continue → parcel → forward clicks on a contaminated ordinary parcel. It recorded `shiftProcessed:1`, integrity `10`, mistakes `0`, `+3` credits, and the matching forward log; `browserErrors:[]`.
- Next target: resolve or explicitly document precedence when multiple recovery effects overlap on the same turn (last-hope, clock, medal), then verify the chosen policy with multi-expiry browser cases.

## Cycle 29 — document recovery precedence

- Issue: overlapping recovery effects were ordered only by hidden condition order, while descriptions said “first” without explaining that one event should not consume all protections.
- Acceptance: the policy is visible and falsifiable: active last-hope consumes the first event; on expiry, clock handles the next unprotected expiry, then medal handles the next damaging expiry. A three-expiry turn with all three active leaves all three parcels rescued and consumes each reservation exactly once.
- Change: clarified card/artifact descriptions and added the precedence sentence to the in-game pressure rules; mechanics remain intentionally ordered last-hope → clock → medal.
- Test: `node --check app.js` passed. Fresh 1366×768 headless Chrome opened the actual rules modal and confirmed the precedence text, clicked the actual last-hope card, then ended a turn with three life-1 parcels. Result: `expired:3`, integrity `10`, mistakes `0`, shield cleared, `expProtected:true`, medal consumed, all three rescued parcels still present, game visible, and `browserErrors:[]`.
- Next target: continue adversarial balance testing around rewards and multi-card interactions; prioritize any effect whose visible contract still diverges from its execution.

## Cycle 30 — keep six-card hands readable

- Issue: the `Терминология` card can raise the hand from five to six, but the fixed five-column grid created a second row inside a fixed-height hand; cards collapsed to about `37px` high and their text became unusable.
- Acceptance: after a real draw-card click at 1366×768, all six cards remain in one row at full hand-card height, no document or game vertical scroll appears, and no card is clipped; the normal five-card layout remains unchanged.
- Change: render a desktop hand-column count of 5–6 and apply it to the hand grid; retain the mobile two-column override.
- Test: fresh 1366×768 headless Chrome seeded a valid hand, performed a real Continue → `Терминология` click, and measured six cards all at `y=668`, height `82`, bottom `750`, within the hand wrap at `758`; document/game scroll height equaled the 768px viewport and `browserErrors:[]`. The resulting screenshot was visually inspected at `D:/DeadLetterOffice/.runtime/qa/hand-6-1366.png`.
- Next target: finish the independent card/reward audit and test any concrete contract mismatch it identifies.

## Cycle 31 — prevent false final victories

- Issue: `Приказ №0` deducted its 2 integrity before processing the final quota parcel; `processParcel()` could record victory and increment profile wins, after which the card handler changed the visible phase to defeat. The run was lost but counted as a win.
- Acceptance: on shift 8 with one quota item left and integrity `2`, an emergency card must show defeat, clear the save, and leave profile wins unchanged; with integrity `10`, the same final normal sort must show victory and increment wins once.
- Change: make zero integrity win-blocking inside `processParcel()` and guard the emergency handler from re-entering defeat after a terminal phase.
- Test: `node --check app.js` passed. Fresh headless Chrome real-click pair: emergency final → defeat modal, save absent, `wins:0`, `bestShift:8`; normal final forward sort → victory modal, save absent, `wins:1`, `bestShift:8`; `browserErrors:[]`.
- Independent critic also found a second P0: pending premium/copy/clip/rubber/overtime effects are cleared at reward boundaries. Next target: define whether these effects persist into the next shift and fix the silent loss with a falsifiable reward-boundary test.

## Cycle 32 — carry pending effects across rewards

- Issue: `startShift()` reset `nextBonus`, `nextDouble`, `nextClip`, `nextRubber`, `nextStamp`, and the overtime draw penalty before they could resolve; a final quota sort could silently erase a card's remaining promise at the reward modal.
- Acceptance: pending effects survive the reward transition; a premium charge remains for the next shift, and overtime reduces the next shift's opening hand to four cards. Effects still reset/consume normally when their next valid action resolves.
- Change: snapshot pending effect flags before shift initialization, restore them for the new shift, and use a carried draw penalty to set `handLimit:4` for the next opening hand.
- Test: `node --check app.js` passed. Fresh headless Chrome real-click reward-boundary scenarios: premium final sort left `nextBonus:1` after choosing a reward; overtime final sort produced `handLimit:4` and `hand:4` on shift 2. Both retained game state with `browserErrors:[]`.
- Next target: audit the emergency card's interaction with success bonuses and verify that non-sorting emergency work cannot consume or amplify premium/copy effects.

## Cycle 33 — keep emergency outside sorting bonuses

- Issue: `Приказ №0` went through `processParcel()` with `emergency:true`, but premium/copy/clip/rubber hooks did not exclude that path. An emergency could consume or amplify effects whose descriptions promise the next successful sorting.
- Acceptance: with premium and copy armed, an emergency awards only its base `+1` credit, leaves both pending effects armed, and does not modify a neighboring parcel; the next normal sort consumes the applicable effects.
- Change: gated next-bonus, next-double, next-rubber, and next-clip resolution on `!emergency`; emergency behavior remains its documented −2 integrity bypass.
- Test: `node --check app.js` passed. Fresh headless Chrome real clicks armed premium and copy, then used the emergency card. Result: credits `17` from a `16` baseline plus `1`, `nextBonus:2`, `nextDouble:true`, neighbor unchanged, integrity `8`, mistakes `0`, game visible, and `browserErrors:[]`.
- Next target: audit duplicate/parasite contracts and card copy, especially hidden contamination/value mutations and whether the artifact adds a distinct effect.

## Cycle 34 — differentiate duplicate and parasite

- Issue: duplicate's implementation already added one contamination, so the parasite artifact's promised contamination rider was indistinguishable from a normal copy; the card also hid its value, shield, and linkage mutations.
- Acceptance: a clean duplicate has contamination `1`, value reduced by `2`, life `2`, no copied shield/link; with parasite active, the first copy of the turn has contamination `2` and gives `+1` credit. The card's accessible description names the mutations.
- Change: made parasite add one additional contamination on its first copy each turn, capped at `3`, and expanded duplicate copy to document value, contamination, shield, and link behavior.
- Test: fresh headless Chrome real Continue → select parcel → duplicate clicks: without parasite, credits `16`, energy `1`, copy contamination `1`, value `4`; with parasite, credits `17`, energy `1`, copy contamination `2`, value `4`; original shield/link remained unchanged and copy had neither. `browserErrors:[]`.
- Next target: audit remaining card edge cases, especially `clip`/`rubber` being consumed without a neighbor and duplicate/reward capacity boundaries.

## Cycle 35 — retain neighbor-dependent effects

- Issue: `clip` and `rubber` cleared their armed flags before confirming that the successful sort had a neighboring parcel, so a valid one-item lane silently consumed the card effect.
- Acceptance: with no neighbor, the effect remains armed for a future valid sort; with a neighbor, clip is consumed and extends its life, while rubber is consumed and clears its contamination.
- Change: only consume `nextClip`/`nextRubber` after a neighbor is found; emergency remains excluded from both hooks.
- Test: fresh headless Chrome real card + sort clicks covered four cases with no exceptions: clip/no-neighbor → `nextClip:true`; clip/neighbor → `nextClip:false`, neighbor life `3`; rubber/no-neighbor → `nextRubber:true`; rubber/neighbor → `nextRubber:false`, neighbor contamination `0`. `browserErrors:[]`.
- Next target: audit reward generation for duplicate artifact choices and verify reward state remains distinct and valid at the third-shift boundary.

## Cycle 36 — keep reward choices distinct

- Issue: third-shift rewards selected the second artifact from the unchanged pool, so the same artifact could appear in two slots and waste a strategic choice.
- Acceptance: every generated reward modal has distinct artifact IDs; with at least two artifacts available on shift 3 it shows two different artifacts plus a card, while a one-artifact pool falls back to a repair rather than duplicating it.
- Change: remove the first artifact from the candidate pool before selecting the third-shift artifact and only replace repair when a second candidate exists.
- Test: 24 fresh headless Chrome third-shift flows performed real Continue → parcel → forward clicks and reached reward modals with exactly 3 DOM choices; all had `phase:reward`, unique artifact IDs, and `duplicates:0`, with `browserErrors:[]`. A one-artifact-pool real-click case produced card + the remaining `medal` + repair, with no duplicate.
- Next target: continue the card audit at capacity boundaries and verify duplicate/reward interactions do not create invalid saves or softlocks.

## Cycle 37 — make energy reserve legible

- Issue: energy-boosting cards could produce `energy:5` with `maxEnergy:3`, rendering the contradictory HUD value `5 / 3`.
- Acceptance: overtime, ledger, and draw must keep the displayed numerator within the displayed capacity during the effect, while the normal end-turn reset returns the HUD to `3 / 3`.
- Change: added a shared `gainEnergy()` helper that raises `maxEnergy` to the temporary reserve without changing the five-energy cap; overtime, ledger, and draw now use it.
- Test: fresh headless Chrome real clicks produced overtime `5 / 5`, ledger `3 / 3`, and draw `4 / 4`, all with valid saves and `browserErrors:[]`; `node --check app.js` passed.
- Next target: add persistent visibility for armed effects after their toast expires, then verify the indicators do not crowd the 1366×768 board.

## Cycle 38 — persist armed-effect visibility

- Issue: premium/copy/clip/rubber/stamp/overtime/last-hope state was only communicated by transient toasts; after the toast expired the player could not tell whether a charge remained armed.
- Acceptance: the board exposes a compact persistent status, updates immediately after card play, remains readable after toast expiry, and does not introduce viewport scrolling or overlap at 1366×768.
- Change: added an `aria-live` context-strip indicator listing active charges (`ПРЕМИЯ ×2`, `УДВОЕНИЕ`, `СКРЕПКА`, `РЕЗИНА`, `АРХИВ +4`, `РУКА −1`, `ПЕЧАТЬ`) with a muted empty state and tooltip.
- Test: fresh 1366×768 headless Chrome real Continue → premium click showed `АКТИВНО: ПРЕМИЯ ×2`; after 4.3 seconds the toast stack had faded but the indicator remained, document scroll height stayed `768`, and `browserErrors:[]`. A second real-click smoke confirmed the same text after reload and `АКТИВНО: ПРЕМИЯ ×1` after final sort → reward selection → shift 2. A current-build 96-step real DOM policy-run reached a genuine defeat at shift `6 / 8` with `wins:0`, `runs:1`, and `browserErrors:[]`, confirming no softlock after the UI/card changes. Screenshot visually inspected at `D:/DeadLetterOffice/.runtime/qa/armed-effects-1366.png`.
- Next target: continue adversarial card/reward testing for capacity and save-schema edge cases; ensure the new status survives reload and reward transitions.

## Cycle 39 — keep toasts off the card hand

- Issue: the bottom-right toast stack overlapped the hand at 1366×768, obscuring card descriptions and potentially intercepting card clicks.
- Acceptance: with six cards visible and a live toast, toast bounds do not intersect any card; hit-testing the center of every card resolves to that card; no viewport or game scrolling appears.
- Change: moved toasts above the desk feedback row, disabled pointer interception for notification-only elements, and added a compact mobile position override.
- Test: fresh 1366×768 headless Chrome performed a real `Терминология` click to create six cards and a toast. All six cards stayed `82px` high at `y=668`, every center hit its expected card, toast bounds were `y=82..118` with no intersections, scroll heights stayed `768`, and `browserErrors:[]`. A 1920×1080 run repeated the card hit-test with all five cards resolving correctly and no hand intersections or scrolling. Screenshots visually inspected at `D:/DeadLetterOffice/.runtime/qa/toast-safe-1366.png` and `D:/DeadLetterOffice/.runtime/qa/toast-safe-1920.png`.
- Next target: verify the toast placement at 1920×1080 and inspect any remaining overlap with primary controls before the next gameplay-balance pass.

## Cycle 40 — normalize legacy profiles

- Issue: `loadProfile()` trusted incomplete saved JSON; a profile without `runs` made `profile.runs += 1` become `NaN`, which serialized as `null`, and out-of-range `bestShift` values were displayed/preserved.
- Acceptance: starting from `{wins:3,bestShift:99,runs:null}`, a real Start click must create a valid profile with `runs:1`, `wins:3`, `bestShift:8`, and a boolean tutorial flag while still creating a usable game save.
- Change: normalize profile counters to nonnegative finite values, clamp best shift to the eight-shift maximum, and default missing tutorial state.
- Test: fresh headless Chrome real Start click produced profile `{runs:1,wins:3,bestShift:8,firstTutorial:false}`, a valid save, visible game/tutorial modal, and `browserErrors:[]`.
- Next target: verify current terminal, reload, and reset paths after profile normalization, then continue balance auditing.

## Cycle 41 — migrate legacy energy saves

- Issue: an older valid save could contain `energy:5,maxEnergy:3`; load-time normalization fixed the HUD only in memory, leaving the invalid pair in localStorage for every future reload.
- Acceptance: Continue must display `5 / 5` and persist `maxEnergy:5`; a second reload/Continue must read the same normalized pair without errors.
- Change: normalize energy to `0..5`, set max energy to `3..5` including the current reserve, and write the migrated state back during `loadSave()`.
- Test: fresh headless Chrome injected a valid legacy save, performed two real reload → Continue cycles, and observed `energy:5,maxEnergy:5,hud:"5 / 5"` both times, game visible, and `browserErrors:[]`.
- Next target: run the terminal victory/defeat and reset flows against the normalized profile/save path, then continue seeking a meaningful balance or UX weakness.

## Cycle 42 — recheck terminal and reset gates

- Issue: profile/save normalization changed Continue behavior, so terminal cleanup and reset needed a current-build regression pass.
- Acceptance: a real defeat clears the active save without incrementing wins; “Попробовать снова” creates a new save and increments runs once; a real final normal sort clears the save and increments wins once.
- Change: no gameplay change; verification of the normalized profile/save path after Cycle 41.
- Test: fresh headless Chrome real defeat at shift `3 / 8` → save absent, wins `0`, runs `1`; real reset click → save present, wins `0`, runs `2`; real final forward sort → victory modal, save absent, wins `1`, runs `2`; `browserErrors:[]`.
- Next target: continue balance review of emergency bypass and high-cost card incentives; do not change it unless a concrete unfair or undocumented outcome is demonstrated.

## Cycle 43 — clarify deactivation scope

- Issue: `Дезактивация` already cleared the selected parcel and both adjacent slots, but its card text only promised the selected and one neighboring parcel. The generated accessible label also added a redundant second period to every card description.
- Acceptance: a middle-slot deactivation clears three contiguous contaminated parcels and its visible/ARIA copy explicitly says “выбранное и оба соседних отправления”; the label has normal punctuation.
- Change: updated the card contract to name both neighbors and made `renderHand()` avoid adding a second period when a description already ends with one.
- Test: fresh headless Chrome real Continue → middle parcel → clean clicks produced contamination `[0,0,0]`, energy `2` after the Union discount, game visible, and `browserErrors:[]`; the live label was exactly `Дезактивация. Очищает выбранное и оба соседних отправления. Стоимость 1 энергии.`
- Next target: continue current-build audit of high-cost card incentives and any remaining copy/mechanics mismatches.

## Cycle 44 — preserve shielded front parcels

- Issue: seal, dryBox, and quarantine skipped the protected parcel's deadline decrement, but `endTurn()` still unconditionally shifted the lane's front slot; using a protection card on the most urgent parcel silently discarded it.
- Acceptance: a shielded front parcel remains present with its life unchanged after one end turn, then its shield clears; dryBox still clears contamination, and quarantine still shields dangerous/contaminated parcels.
- Change: skip the conveyor shift when the post-expiry front parcel is still shielded; ordinary unprotected fronts retain the existing shift behavior.
- Test: fresh headless Chrome real card/end-turn clicks covered seal, dryBox, and quarantine. Each protected front remained present at life `1` with `shield:false` and game visible; dryBox left contamination `0`, quarantine preserved its contamination while removing the shield; `browserErrors:[]`.
- Next target: continue high-cost card incentive audit and test the later-turn expiry of a front parcel rescued by a protection card.

## Cycle 45 — keep the full hand usable on mobile

- Issue: the mobile media query hid `.hand .card:last-child`, so the hand counter could report five or six cards while one valid card was neither visible nor focusable.
- Acceptance: at 375×812, five- and six-card hands keep every card visible and focusable, with no horizontal overflow or clipped card; the last card must accept a real click.
- Change: removed the last-card hide rule and let the mobile game layout grow naturally; the hand wraps into two columns and the fixed desktop height/overflow constraints are disabled only below 680px.
- Test: fresh headless Chrome emulated 375×812, performed real Continue, measured six `display:flex` cards at `175.5×135px` across three rows, `scrollWidth:375` and `clientWidth:375`, then real-clicked the sixth `memo` card; `lastCard:"memo"`, five cards remained, and `browserErrors:[]`. Screenshots inspected at `D:/DeadLetterOffice/.runtime/qa/mobile-hand-375.png` and `D:/DeadLetterOffice/.runtime/qa/mobile-hand-375-bottom.png`. Desktop regression at 1366×768 kept five cards at `y:668..750`, document/game scroll heights at `768`, widths at `1366`, and `browserErrors:[]`; screenshot inspected at `D:/DeadLetterOffice/.runtime/qa/desktop-after-mobile-1366.png`.
- Next target: continue the independent audit for remaining core-control, responsive, or card/effect contract regressions.

## Cycle 46 — keep armed effects legible on mobile

- Issue: the persistent armed-effect status was hidden below 680px, so a saved premium or last-hope effect became invisible after its toast expired or after reload.
- Acceptance: at 375×812, armed effects remain visible and accessible after real card clicks and Continue/reload, while the context strip keeps `scrollWidth === clientWidth`; desktop remains fixed-height and readable.
- Change: keep `#armed-effects` in the mobile context strip as a flexible, compact text region instead of `display:none`; the surrounding mobile layout and hand behavior are unchanged.
- Test: fresh headless Chrome emulated 375×812, real-clicked `premium` and `lastHope`, observed `АКТИВНО: ПРЕМИЯ ×2 · ПЕЧАТЬ` with `display:block`, then reloaded and Continue-resumed the same state; both runs kept `scrollWidth:375`, `clientWidth:375`, and `browserErrors:[]`. Desktop 1366×768 regression kept the same text visible, document dimensions `1366×768`, and `browserErrors:[]`. Screenshots inspected at `D:/DeadLetterOffice/.runtime/qa/mobile-armed-effects-375.png` and `D:/DeadLetterOffice/.runtime/qa/desktop-armed-effects-1366.png`.
- Next target: continue the independent audit for another concrete card/effect or progression weakness; do not add work without a falsifiable failure.

## Cycle 53 — persist pause state across reload

- Issue: pause was rendered only in memory; reloading immediately after Pause restored active play even though the save schema already allowed `phase:"pause"`.
- Acceptance: Pause writes `phase:"pause"`; reload → Continue restores the pause modal with the game still blocked; Resume writes `phase:"shift"` and closes the modal.
- Change: save state in `togglePause()` and in the Resume handler after changing phase.
- Test: fresh headless Chrome real Pause click produced stored `pause` and visible pause modal; real reload → Continue restored stored `pause` and the same modal; real Resume produced stored `shift`, hidden modal, visible game, and `browserErrors:[]`.
- Next target: continue the independent audit for another concrete card/effect, save, or progression weakness; do not add work without a falsifiable failure.

## Cycle 61 — persist cleared journal state

- Issue: the visible journal clear control emptied only in-memory state; cleared entries returned after reload because the handler omitted autosave.
- Acceptance: after clearing, storage contains `log:[]`; reload → Continue keeps the journal empty without changing phase or gameplay state.
- Change: save immediately after clearing the event log.
- Test: fresh headless Chrome real Continue started with one journal entry (`DOM:1`, stored `1`); real clear click produced `DOM:0`, stored `0`; real reload → Continue kept `DOM:0`, stored `0`, game visible, and `browserErrors:[]`.
- Next target: continue the independent audit for another concrete card/effect, save, or progression weakness; do not add work without a falsifiable failure.

## Cycle 60 — expose quick-sort only at the front

- Issue: the inspector exposed `быстрая сортировка` for any revealed or dangerous parcel, but sorting correctly rejects non-front slots; the UI advertised an action that could only fail.
- Acceptance: non-front selections have no quick-sort control; a legal front selection exposes it and still processes normally.
- Change: require `getPosition(p).index === 0` before rendering the quick-sort button; normal route legality remains enforced by `sortSelected()`.
- Test: fresh headless Chrome real non-front selection produced `quick:false`; real front selection produced `quick:true` with route `forward`; real quick-sort click processed one parcel and removed it, phase remained `shift`, game visible, and `browserErrors:[]`.
- Next target: continue the independent audit for another concrete card/effect, save, or progression weakness; do not add work without a falsifiable failure.

## Cycle 59 — expose invalid card targets in the hand

- Issue: target guards rejected cards such as `Боковой лоток` on illegal selections, but `renderHand()` still showed them enabled and announced them as available.
- Acceptance: whenever `canPlayCard(id)` is false for the current selection, the card renders disabled with `aria-disabled:"true"` and an unavailable explanation; legal selection re-enables it and preserves the effect.
- Change: include `canPlayCard(id)` in hand disabled-state calculation while retaining the handler guard for state neutrality.
- Test: fresh headless Chrome real front-parcel selection produced SideTray `disabled:true`, `aria-disabled:"true"`, and the “Сейчас недоступна” label; real second-parcel selection re-enabled it, and a real click moved that parcel to the front with energy `2`, game visible, and `browserErrors:[]`.
- Next target: continue the independent audit for another concrete card/effect, save, or progression weakness; do not add work without a falsifiable failure.

## Cycle 58 — target null stamp at anomalies

- Issue: `Гашение печати` accepted ordinary non-anomalous parcels, consuming energy/card while only adding an invisible no-op suppression flag.
- Acceptance: non-anomalous targets reject the card without state changes; anomalous targets retain the existing suppression behavior and remain playable.
- Change: group `nullStamp` with `seal` in the anomaly-only target predicate.
- Test: fresh headless Chrome real ordinary click → null-stamp preserved hand, energy `3`, anomaly `false`, suppression `false`, and showed the invalid-target toast. Real anomalous click → energy `2`, anomaly `false`, suppression `true`, game visible, and `browserErrors:[]`.
- Next target: continue the independent audit for another concrete card/effect, save, or progression weakness; do not add work without a falsifiable failure.

## Cycle 57 — target dry-box cards at risk

- Issue: `Сухой ящик` accepted clean non-anomalous parcels and granted them an undocumented deadline hold, despite promising contamination removal and anomaly protection.
- Acceptance: clean safe targets reject the card without consuming card/energy or adding a shield; anomalous or contaminated targets remain valid and retain the one-tick protection contract.
- Change: reject `dryBox` when both `anomaly === false` and `contamination <= 0`; no valid protection mechanics changed.
- Test: fresh headless Chrome real clean-safe click → dryBox preserved hand, energy `3`, no shield, and showed the invalid-target toast. Real anomalous click → dryBox left energy `1` after Union discount, shield `true`, contamination `0`; real End Turn kept the parcel at life `1`, cleared shield, kept integrity `18` and phase `shift`, with `browserErrors:[]`.
- Next target: continue the independent audit for another concrete card/effect, save, or progression weakness; do not add work without a falsifiable failure.

## Cycle 56 — keep Black Market out of emergency work

- Issue: `Чёрная рыночная наклейка` promised `+2` only for anomalous correctly routed mail, but `processParcel()` also applied it to the route-less emergency path.
- Acceptance: an emergency on an anomalous parcel gives exactly its documented `+1` base reward while still costing 2 integrity; the artifact bonus remains gated to ordinary sorting.
- Change: guard the Black Market reward with `!emergency`; no other emergency or pending-effect behavior changed.
- Test: fresh headless Chrome real Continue → anomalous parcel → `Приказ №0` with Black Market produced credits `16 → 17`, integrity `10 → 8`, shift processed `1`, target removed, phase `shift`, game visible, and `browserErrors:[]`. A separate ordinary-sort setup was not counted as evidence because the seeded DOM target was not selected reliably.
- Next target: continue the independent audit for another concrete card/effect, save, or progression weakness; do not add work without a falsifiable failure.

## Cycle 55 — persist parcel inspection

- Issue: selecting a parcel and clicking `осмотреть` changed only in-memory state; reload could lose both the selected parcel and its revealed route, undermining a later sorting decision.
- Acceptance: selection and `revealed:true` are persisted immediately; reload → Continue restores the same selected parcel with its route visible and the shift playable.
- Change: save after parcel selection and after the inspector reveals the parcel.
- Test: fresh headless Chrome real Continue → parcel click → inspector click stored `selected:"p-19"`, `revealed:true`, route `forward`; real reload → Continue restored the same selection (`selectedClass:true`) and visible route `ПЕРЕСЛАТЬ`, game visible, and `browserErrors:[]`.
- Next target: continue the independent audit for another concrete card/effect, save, or progression weakness; do not add work without a falsifiable failure.

## Cycle 54 — target the red seal at anomalies

- Issue: `Красная пломба` promised to block the next anomaly but accepted ordinary safe mail, consuming a card opportunity without producing its advertised protection.
- Acceptance: safe targets reject the card without consuming energy/card or changing state; anomalous targets retain the one-tick shield behavior and remain playable after End Turn.
- Change: reject `seal` targets with `anomaly === false` in `canPlayCard()`; no change to anomaly protection mechanics.
- Test: fresh headless Chrome real safe-parcel click → seal produced preserved hand, energy `3`, no shield, explanatory toast, and game visible. Real anomaly click → seal produced energy `2`, shield `true`, life `1`; real End Turn left the parcel present at life `1`, cleared shield, kept integrity `18` and phase `shift`, with `browserErrors:[]`.
- Next target: continue the independent audit for another concrete card/effect, save, or progression weakness; do not add work without a falsifiable failure.

## Cycle 52 — expose every armed effect

- Issue: the persistent effect indicator was a clipped single line; with premium, double, clip, rubber, stamp, overtime hand penalty, and last-hope active, later statuses disappeared behind ellipsis.
- Acceptance: all seven active effect names/counts remain discoverable at 375×812 and 1366×768 without horizontal overflow; mobile may wrap, desktop should stay compact.
- Change: made the indicator flexible and non-clipping; mobile context strips grow naturally for wrapped status text while desktop receives the available inline width.
- Test: fresh headless Chrome seeded all seven flags and real Continue-tested both viewports. At 375×812 the full text was visible in a `25.5px` status region and at 1366×768 in a `10px` single line; both had `scrollWidth === clientWidth` and `browserErrors:[]`. Screenshots inspected at `D:/DeadLetterOffice/.runtime/qa/armed-effects-all-375.png` and `D:/DeadLetterOffice/.runtime/qa/armed-effects-all-1366.png`.
- Next target: continue the independent audit for another concrete card/effect or progression weakness; do not add work without a falsifiable failure.

## Cycle 51 — keep UV focused on anomalies

- Issue: `Ультрафиолетовая печать` promised to reveal anomalies on the selected lane but marked every parcel revealed, leaking ordinary parcels’ routes and weakening the inspection decision.
- Acceptance: after UV, anomalous parcels on the selected lane are revealed while ordinary parcels remain hidden; the card still spends its cost and leaves the shift playable.
- Change: restrict the UV reveal loop to parcels with `anomaly === true`; card copy and toast already describe that scope.
- Test: fresh headless Chrome real Continue → selected ordinary parcel on a lane containing one anomaly → UV click produced anomaly `revealed:true`/route `АРХИВ`, ordinary `revealed:false`/`ОСМОТР НЕ ПРОВЕДЁН`, energy `2`, game visible, and `browserErrors:[]`.
- Next target: continue the independent audit for another concrete card/effect or progression weakness; do not add work without a falsifiable failure.

## Cycle 50 — document quarantine’s contamination scope

- Issue: `Комната карантина` already shielded dangerous or contaminated parcels, but its card text and generated ARIA label only promised dangerous parcels.
- Acceptance: the visible and accessible contract must name both target classes; a contaminated ordinary front remains protected for one end turn, then its shield clears without changing contamination or creating errors.
- Change: clarified the card description to “опасные или заражённые отправления”; mechanics remain unchanged.
- Test: fresh headless Chrome real Continue → contaminated ordinary parcel → quarantine click produced the exact expanded ARIA label, `shield:true`, `life:1`, contamination `1`, and energy `2`; real End Turn left the parcel present at `life:1`, cleared the shield, kept integrity `18` and phase `shift`, with `browserErrors:[]`.
- Next target: continue the independent audit for another concrete card/effect or progression weakness; do not add work without a falsifiable failure.

## Cycle 49 — preserve overtime’s reduced hand limit

- Issue: after the six-card capacity fix, `Терминология` and the mug trigger used the global six-card cap and could refill an overtime-penalized hand above its promised next-turn limit of four.
- Acceptance: during an overtime-penalized turn, every draw effect respects `state.handLimit === 4`; undrawn cards remain in `draw`, and the following normal turn restores the five-card limit.
- Change: make `takeCardsIntoHand()` cap against the smaller of `MAX_HAND` and the current `handLimit`; ordinary hands still support the six-card mug capacity.
- Test: fresh headless Chrome real overtime click → End Turn produced `handLimit:4`; real Continue with `Терминология` on the penalized turn produced `handCount:4`, `drawCount:1`, and no overflow; a real following End Turn restored `handLimit:5` and five cards. `browserErrors:[]`.
- Next target: continue the independent audit for another concrete card/effect or progression weakness; do not add work without a falsifiable failure.

## Cycle 48 — cap compound card draws without losing cards

- Issue: `Кружка дежурного` could add two cards after `Терминология` had already added two, producing 7–8 cards while the desktop hand renderer and fixed viewport supported six; the tail of the hand became inaccessible.
- Acceptance: with mug + a third-card draw, every generated card remains usable in both desktop targets, the hand never exceeds six rendered cards, overflow remains in `draw`, and an old saved hand over six cards is normalized without loss.
- Change: introduced `MAX_HAND = 6`, routed draw/mug additions through a capacity-aware helper, and moved legacy hand overflow back to `draw` during `loadSave()`.
- Test: fresh headless Chrome real third-card draw with mug at 1366×768 produced `hand.length:6`, `draw:["ledger"]`, `discard:["draw"]`, six focusable `display:flex` cards at `y:668..750`, document dimensions `1366×768`, and `browserErrors:[]`; the same state at 1920×1080 produced six cards at `y:933..1058`, dimensions `1920×1080`, and no errors. Screenshots inspected at `D:/DeadLetterOffice/.runtime/qa/mug-hand-1366.png` and `D:/DeadLetterOffice/.runtime/qa/mug-hand-1920.png`. A real Continue from a seeded eight-card legacy hand normalized to six DOM/state cards plus two cards in `draw`, with no scrolling or errors.
- Next target: continue the independent audit for another concrete card/effect or progression weakness; do not add work without a falsifiable failure.

## Cycle 47 — keep dangerous mail out of the archive shortcut

- Issue: `Запрос в архив` rewrote any selected parcel to `archive`, so dangerous mail could bypass the central `опасное → изоляция` rule; the other route-changing cards already rejected dangerous targets.
- Acceptance: with a dangerous parcel selected, the card must not consume energy or the card, must not change its destination or quota, and must leave the shift playable; safe mail must retain the existing archive-request behavior.
- Change: reject dangerous targets in `canPlayCard('archiveRequest')` and state the safe-target restriction in the card description.
- Test: fresh headless Chrome real Continue → dangerous parcel → archive-request click produced `hand:["archiveRequest"]`, energy `3`, destination `contain`, quota `0`, explanatory toast, game visible, and `browserErrors:[]`. A second real-click scenario with an ordinary safe parcel changed its destination to `archive`, revealed it, spent one energy, and kept the game visible with no browser errors.
- Next target: continue the independent audit for another concrete card/effect or progression weakness; do not add work without a falsifiable failure.

## Cycle 62 — normalize saves missing a journal

- Issue: `validSave()` accepted a save without `log`, but `renderLog()` then called `.map()` on the missing value and could crash Continue.
- Acceptance: a valid otherwise-complete save with missing or non-array `log` must Continue cleanly, normalize the stored log to `[]`, and preserve the playable shift; normal logs remain unchanged.
- Change: normalize `state.log` to an array during `loadSave()` before rendering and rewrite the migrated save.
- Test: fresh headless Chrome created a valid run, removed `log` from localStorage, performed real reload → Continue, and observed visible game/menu transition, stored `log:[]`, zero journal DOM rows, and `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, or responsive weakness; do not add work without a falsifiable failure.

## Cycle 63 — filter malformed journal entries

- Issue: Cycle 62 normalized missing/non-array `log`, but an array containing `null` or malformed entries still passed validation and could crash `renderLog()` during Continue.
- Acceptance: malformed entries are filtered or normalized; valid `{message,bad}` entries survive unchanged; Continue never throws and the playable shift remains available.
- Change: normalize the journal to object entries with string messages and boolean `bad` flags during `loadSave()`.
- Test: fresh headless Chrome seeded `log:[null,{message:"Сохранись",bad:false},{bad:true},"bad"]`, then real reload → Continue produced a visible game, stored/rendered only the valid entry (`log.length:1`, `DOM rows:1`), and `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, or responsive weakness; do not add work without a falsifiable failure.

## Cycle 74 — bound route statistics to real processing

- Issue: a shift-6 save with `shiftProcessed:11` and `shiftStats:{forward:999,archive:999,contain:999}` passed finite-number validation; one real sort could then satisfy the mixed-route audit using impossible stored counts.
- Acceptance: accepted route counters are nonnegative integers whose sum is no greater than `shiftProcessed`; inflated or fractional counters must not expose Continue.
- Change: added route-stat integer, nonnegative, and total-progress validation to `validSave()` and retained the existing audit exception only for genuinely processed quota state.
- Test: fresh headless Chrome created a run, seeded the inflated shift-6 save, reloaded, and observed `continueVisible:false`, menu visible, game hidden. A control save with `{forward:3,archive:4,contain:4}` was accepted; a real Continue click opened shift 6. `browserErrors:[]` in both paths.
- Next target: continue the independent audit for another concrete save, card/effect, progression, or responsive weakness; do not add work without a falsifiable failure.

## Cycle 64 — reject duplicate parcel IDs

- Issue: save validation accepted duplicate parcel IDs; after reload both DOM parcels could appear selected while `selectedParcel()` resolved the first matching object, directing actions at the wrong lane.
- Acceptance: a save with duplicate parcel IDs must not expose Continue or enter gameplay; normal unique-ID saves must remain valid.
- Change: require uniqueness across all lane parcel IDs in `validSave()`; the malformed save is rejected without touching gameplay state.
- Test: fresh headless Chrome created a valid run, duplicated `lanes[1][0].id` to match `lanes[0][0].id`, then real reload observed `continueVisible:false`, menu visible, game hidden, no uncaught browser errors. (The rejected save remains until a new run replaces it; no corrupt-backup behavior was claimed.)
- Next target: continue the independent audit for another concrete save, card/effect, progression, or responsive weakness; do not add work without a falsifiable failure.

## Cycle 65 — reject lane ownership mismatches

- Issue: save validation accepted a parcel whose `lane` field disagreed with the lane array containing it; `getPosition()` then returned `index:-1`, allowing a clicked sort to be consumed without processing.
- Acceptance: Continue must reject saves unless every parcel’s `lane` equals its containing lane index; valid saves continue normally.
- Change: require per-lane ownership consistency in `validSave()` alongside existing parcel and unique-ID checks.
- Test: fresh headless Chrome created a run, changed a lane-B parcel to `lane:0`, then real reload observed `continueVisible:false`, menu visible, game hidden, save left untouched for replacement, and `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, or responsive weakness; do not add work without a falsifiable failure.

## Cycle 66 — reject non-positive quotas

- Issue: a save with `quota:0` passed numeric validation, rendered `0 / 0` with `NaN%`, and let End Turn satisfy `shiftReady()` without processing mail.
- Acceptance: Continue must reject or migrate non-positive quota saves; malformed quota must never enter gameplay or reward flow.
- Change: require `quota > 0` in save counter validation; normal configured shifts remain unchanged.
- Test: fresh headless Chrome created a run, changed only quota to `0`, and real reload observed `continueVisible:false`, menu visible, game hidden, save untouched for replacement, no NaN UI, and `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, or responsive weakness; do not add work without a falsifiable failure.

## Cycle 67 — reject completed shift saves

- Issue: a `phase:"shift"` save with `shiftProcessed === quota` entered gameplay and let End Turn open rewards without processing the final parcel.
- Acceptance: completed-quota shift saves are rejected, while shift 6 may legally remain at quota only when its mixed-route audit still lacks at least one required route.
- Change: add quota-progress validation: ordinary shift saves must be below quota; the explicit shift-6 audit exception remains valid.
- Test: fresh headless Chrome real malformed save with shift 1 `8 / 8` produced `Continue:false`, menu visible, game hidden, and no errors. A second real save with shift 6 `12 / 12`, stats `forward:1, archive:2, contain:2` kept Continue available as the intended audit exception; `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, or responsive weakness; do not add work without a falsifiable failure.

## Cycle 68 — reject fractional shift progress

- Issue: a save with `shiftProcessed:7.5` and quota `8` passed finite-number validation; one real sort could move it to `8.5` and satisfy `shiftReady()` early.
- Acceptance: accepted saves use positive integer quotas and integer nonnegative `shiftProcessed`; fractional progress must not enter gameplay or rewards.
- Change: require integer quota and integer nonnegative shift progress in `validSave()`.
- Test: fresh headless Chrome created a run, changed progress to `7.5`, then real reload observed `continueVisible:false`, menu visible, game hidden, save untouched for replacement, and `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, or responsive weakness; do not add work without a falsifiable failure.

## Cycle 69 — close the final-shift reward edge

- Issue: a malformed `phase:"reward", shift:8` save could load; selecting its reward incremented to shift 9 and dereferenced missing `SHIFT_DATA[8]`.
- Acceptance: final-shift reward saves are rejected, and the defensive reward handler cannot throw if such state is reached; ordinary shift-7 reward selection must still enter shift 8 normally.
- Change: require reward saves to have `shift < MAX_SHIFTS` and guard `chooseReward()` with a terminal `victory()` path at the final shift.
- Test: fresh headless Chrome malformed shift-8 reward produced `Continue:false`, menu visible, game hidden, no errors. A real shift-7 reward loaded with a visible reward button; real repair click produced `phase:"shift"`, `shift:8`, visible game, hidden modal, and `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, or responsive weakness; do not add work without a falsifiable failure.

## Cycle 70 — close the advance card on the final shift

- Issue: `Аванс` granted +5 credits on shift 8 even though its `quotaPlus:2` downside had no next shift to affect.
- Acceptance: on shift 8 the card is unavailable and state-neutral; on shifts 1–7 it remains enabled and applies +5 credits plus exactly two next-shift quota points.
- Change: reject final-shift advance targets in `canPlayCard()` and make `renderHand()` reflect all target guards for disabled/ARIA state.
- Test: fresh headless Chrome real shift-8 card showed `disabled:true`, `aria-disabled:true`; real click preserved credits `16`, hand, and `quotaPlus:0`. Real shift-7 card showed enabled state; real click produced credits `21` and `quotaPlus:2`, with `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, or responsive weakness; do not add work without a falsifiable failure.

## Cycle 71 — reject empty parcel IDs

- Issue: empty or whitespace parcel IDs passed `validParcel()` but `findParcel('')` intentionally returned no target, leaving a visible parcel unselectable and all actions ineffective.
- Acceptance: malformed IDs must not enter gameplay; every accepted rendered parcel needs a non-empty identifier resolvable by selection.
- Change: require a non-empty trimmed parcel ID in `validParcel()` while preserving existing unique-ID validation.
- Test: fresh headless Chrome created a run, changed one parcel ID to three spaces, then real reload observed `continueVisible:false`, menu visible, game hidden, and `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, or responsive weakness; do not add work without a falsifiable failure.

## Cycle 72 — enforce integrity bounds in saves

- Issue: a save with `integrity:999` and `maxIntegrity:18` passed validation, rendered `999 / 18`, and let the run absorb damage far beyond the intended defeat threshold.
- Acceptance: accepted saves have positive integer `maxIntegrity` and integer integrity within `0..maxIntegrity`; out-of-range saves never enter gameplay.
- Change: enforce integrity bounds in the scalar save validation.
- Test: fresh headless Chrome created a run, changed integrity to `999` with max `18`, then real reload observed `continueVisible:false`, menu visible, game hidden, and `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, or responsive weakness; do not add work without a falsifiable failure.

## Cycle 73 — enforce card inventory accounting

- Issue: save validation checked that card IDs were known but allowed a card to exist in hand without a matching copy in deck, enabling unearned playable resources after reload.
- Acceptance: the multiset of `hand + draw + discard` must equal the deck multiset; an out-of-inventory hand card must not enter gameplay.
- Change: added multiset accounting to `validSave()` while preserving duplicate-card counts and normal draw/discard behavior.
- Test: fresh headless Chrome created a run, put `advance` in hand while removing it from deck, then real reload observed `continueVisible:false`, menu visible, game hidden, and `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, or responsive weakness; do not add work without a falsifiable failure.

## Cycle 75 — make modal dialogs keyboard-safe

- Issue: Rules, pause, journal, artifacts, rewards, tutorial, victory, and defeat overlays had no dialog semantics or focus management; keyboard focus could remain behind the overlay and Tab could reach underlying controls.
- Acceptance: every modal exposes `role="dialog"`, `aria-modal="true"`, and an accessible heading/label; opening focuses a modal control, Tab/Shift+Tab stays inside, and Escape closes dismissible modals while restoring the invoking control.
- Change: added modal dialog attributes, focusable-control discovery, initial focus, Tab trapping, Escape handling, `aria-hidden` state, and focus restoration without changing reward/pause actions.
- Test: fresh isolated-origin headless Chrome used real CDP mouse clicks for New Run, Rules, and Pause plus real keyboard Escape/Tab events. Tutorial/Rules/Pause opened with dialog semantics and focus inside; Rules Tab stayed inside; two Pause Tab presses cycled resume → abandon → resume; Escape restored focus to `open-rules-top` and `pause-btn`; `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 76 — preserve over-quota audit progress

- Issue: shift 6 intentionally allows processing beyond the numeric quota to satisfy missing route requirements, but `validSave()` only treated `shiftProcessed === quota` as an audit exception; the first extra route made the autosave unloadable.
- Acceptance: a shift-6 save with `shiftProcessed >= quota`, valid route counters, and an incomplete mixed-route audit remains reloadable with the same progress; ordinary completed non-audit shift saves remain rejected.
- Change: widened the audit exception boundary from equality to `>=`, without relaxing route-counter or ordinary quota validation.
- Test: isolated Chrome real scenario seeded shift 6 at `12 / 12` with `forward:12, archive:0, contain:0`, performed the missing archive sort, and observed autosave `13 / 12` with `forward:12, archive:1, contain:0`; after real reload → Continue, game restored shift 6 with the same counters and `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 77 — bound pending premium effects

- Issue: a malformed save with `nextBonus:999` passed validation and could grant the documented `+2` premium on hundreds of future successful sorts.
- Acceptance: `nextBonus` is an integer in `0..2`; pending boolean effects are actual booleans; `nextBonus:999` cannot expose Continue, while a legitimate value of `2` survives reload and decrements to `1` after one correct success.
- Change: added pending-effect validation for `nextBonus`, `nextDouble`, `nextClip`, `nextStamp`, `nextRubber`, and `shield`.
- Test: isolated Chrome rejected the malformed save (`Continue:false`, menu visible, game hidden), accepted the control value `2`, and a real Continue plus archive sort saved `nextBonus:1`; `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 78 — keep repair rewards reloadable

- Issue: a malformed reward amount `0.5` passed validation; choosing it wrote fractional integrity, and the next reload rejected the run because integrity is integer-only.
- Acceptance: repair rewards must use the documented integer amount `5`; fractional rewards cannot expose Continue, while a valid repair leaves integer integrity and remains reloadable.
- Change: tightened reward validation to require integer `repair.amount === 5`.
- Test: isolated Chrome rejected the fractional reward save; a real Continue and repair click on the valid reward moved to shift 8 with integrity `15`, then reload kept Continue available with integer integrity `15`; `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 79 — bound parcel deadlines

- Issue: a malformed parcel with `life:999` and `maxLife:3` passed save validation and could avoid expiry for hundreds of turns.
- Acceptance: active parcel deadlines are integer values in `1..maxLife+2`; the malformed deadline cannot expose Continue, while the legal `maxLife+2` extension remains reloadable.
- Change: tightened `validParcel()` to require integer `life`/`maxLife` and cap life at the supported two-point extension.
- Test: isolated Chrome rejected `life:999`; a control parcel with `life:5`, `maxLife:3` was accepted after reload; `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 80 — bound parcel values

- Issue: a malformed parcel with `value:999` passed validation and could inject 999 credits on a correct sort.
- Acceptance: parcel values are positive integers in the supported `1..11` range; value `999` cannot expose Continue, while legal value `11` remains playable and awards exactly 11 base credits.
- Change: tightened `validParcel()` to enforce the generated value range, preserving legal duplicate/label values.
- Test: isolated Chrome rejected `value:999`; a real Continue and archive click on a seeded value-11 parcel changed credits `16 → 27`, progress `0 → 1`, and kept the game visible with `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 81 — bound conveyor freeze duration

- Issue: a malformed save with `frozen:999` passed validation and could suppress expiry, movement, and replenishment for hundreds of turns.
- Acceptance: `frozen` is an integer in `0..1`; `999` cannot expose Continue, while legal `1` freezes exactly one End Turn and the next End Turn resumes conveyor progression.
- Change: tightened counter validation for integer `turn` and `frozen <= 1`.
- Test: isolated Chrome rejected `frozen:999`; a real Continue with `frozen:1` produced after first End Turn `frozen:0`, turn `2`, unchanged life `3`, then after the next End Turn turn `3`, life `4` from replenishment, game visible, and `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 82 — make journal clearing touch-accessible

- Issue: the desktop journal clear control was unnamed and only `20×20px`; on mobile the journal rail is hidden, so there was no clear action in the contextual journal window.
- Acceptance: the control exposes `aria-label="Очистить журнал"`, has a 44px mobile CSS hit area, and the mobile journal modal exposes the same clear action; activation clears and persists the journal.
- Change: named the rail button, enlarged its mobile target, and added an accessible «Очистить журнал» action to `showLog()` with persistence and modal refresh.
- Test: isolated Chrome real clear click emptied the desktop journal and survived reload. At 390×844, real context-log opening showed the modal clear action; real clear emptied stored log while keeping the modal open; `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 83 — bound next-shift quota modifiers

- Issue: a malformed `shiftFlags.quotaPlus:0.5` passed validation and could create a fractional next quota, which the autosave then rejected after the reward transition.
- Acceptance: `quotaPlus` is an integer in `0..2` and `drawPenalty` an integer in `0..1`; fractional modifiers cannot expose Continue, while `quotaPlus:2` produces an integer quota and remains reloadable.
- Change: tightened shift-flag validation for both bounded numeric modifiers.
- Test: isolated Chrome rejected `quotaPlus:0.5`; a real reward Continue/click with `quotaPlus:2` transitioned to shift 2 at quota `10`, reset the modifier to `0`, and remained Continue-visible after reload with `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 84 — make mobile Rules accessible

- Issue: the mobile `?` Rules button had no accessible name and a 20px target, making it poor for touch and screen readers.
- Acceptance: the control exposes «Открыть справочник», measures 44×44px at 390px width, and opens the Rules dialog through both touch and Enter while moving focus into the dialog.
- Change: added aria label/title, mobile 44px sizing, and explicit Enter activation for Rules buttons.
- Test: isolated 390×844 Chrome measured aria label and 44×44px rect; real touch click opened a dialog with focus inside, and real keyboard Enter reopened it with focus inside; `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 85 — remove one deck copy per revision

- Issue: Deck Revision used `filter(cardId !== id)` across every pool, deleting all duplicate copies for one 6-credit purchase.
- Acceptance: selecting a duplicated card removes exactly one deck occurrence and one physical copy from hand/draw/discard, leaves the duplicate playable, preserves the inventory multiset, and remains reloadable.
- Change: remove the first matching physical copy from its current pool and the matching single entry from `state.deck`.
- Test: isolated Chrome seeded two `memo` copies, opened reward shop and Deck Revision with real clicks, then observed credits `16 → 10`, deck memo count `2 → 1`, pool memo count `2 → 1`, inventory equality true, and Continue still visible after reload; `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 86 — bound saved credits

- Issue: malformed saves with fractional or negative credits passed validation; shop operations could preserve the corrupted economy.
- Acceptance: credits are non-negative integers; `6.5` and `-1` cannot expose Continue, while ordinary integer credits remain reloadable.
- Change: added integer and lower-bound checks for saved credits in the counter contract.
- Test: isolated Chrome rejected both `credits:6.5` and `credits:-1` (menu visible, game hidden), while `credits:6` remained Continue-visible; `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 87 — bound saved quotas

- Issue: a positive outlier `quota:999999` passed validation and could softlock a run waiting for an unreachable completion count.
- Acceptance: saved quotas stay within the current shift’s configured base through base+2; the outlier cannot expose Continue, while a legal shift-1 quota `10` remains reloadable.
- Change: added shift-aware quota bounds to `validSave()` using `SHIFT_DATA` and the existing maximum Advance modifier.
- Test: isolated Chrome rejected `quota:999999`; a real Continue on legal `quota:10` restored the game with quota `10` and `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 88 — make mobile Pause accessible

- Issue: mobile Pause was announced only as `Ⅱ` and shrank to 30×30px at 390×700, making a primary control hard to discover and tap.
- Acceptance: the control exposes `Пауза (Esc)`, measures at least 44×44px, and toggles the pause modal from touch, Enter, and Space without browser errors.
- Change: added aria label, raised the low-height mobile target to 44×44px, and added explicit Enter/Space activation for the pause button.
- Test: isolated 390×700 Chrome measured the 44×44px control and aria label; real touch opened the pause modal, then real Enter and Space each reopened it with focus inside; `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 89 — neutralize journal control injection

- Issue: arbitrary saved journal text was rendered with `innerHTML`, so a crafted message could create a `data-action="emergency"` button and bypass card/energy/front-slot rules through the global click handler.
- Acceptance: journal messages render as text in both rail and modal; crafted markup creates no controls and cannot change progress, energy, integrity, or cards; sorting handlers accept only controls in their intended containers.
- Change: added HTML escaping for journal messages and scoped parcel/card/sort/quick-sort delegation to conveyors, hand, action dock, and inspector respectively.
- Test: isolated Chrome real Continue on a crafted journal showed escaped literal markup, no event-log action button, modal action count `0`, unchanged progress `0`, energy `3`, integrity `18`, and `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 90 — escape parcel text and quick-sort controls

- Issue: malformed parcel `text` could close the inspector text node and inject `data-quick-sort="emergency"`; parcel name/glyph were also raw HTML sinks.
- Acceptance: parcel text, name, glyph, IDs, and labels render escaped; crafted markup creates no extra inspector control, and only generated `forward/archive/contain` quick-sorts are accepted.
- Change: escaped parcel/inspector text and attributes, sanitized numeric tilt, scoped quick-sort delegation, and rejected non-route destinations in `sortSelected()`.
- Test: isolated Chrome real Continue and parcel selection rendered all payloads as escaped text, showed exactly one legitimate inspect button, no emergency quick-sort, unchanged progress `0`/energy `3`, and `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 91 — keep combo rewards integral

- Issue: malformed `combo:1.5` passed validation; the next correct sort added a fractional combo bonus to credits and made the resulting autosave unloadable.
- Acceptance: saved combo values are nonnegative integers; fractional combo saves cannot expose Continue, while a legal combo remains integer through a successful sort and reload.
- Change: tightened counter validation for integer, nonnegative combo values.
- Test: isolated Chrome rejected `combo:1.5`; a real Continue with combo `1` and archive sort produced combo `2`, credits `16 → 21` as an integer, progress `1`, and remained Continue-visible after reload with `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 92 — enforce safe parcel route contracts

- Issue: a malformed safe `ordinary` parcel with `dest:"contain"` passed validation and could count as a successful isolation.
- Acceptance: non-dangerous parcels cannot use the contain route; valid dangerous parcels such as `breathing → contain` remain reloadable.
- Change: made parcel danger match its canonical type and required contain destinations to be dangerous.
- Test: isolated Chrome rejected the safe-contain save; a real Continue on a dangerous breathing parcel restored the game with `dest:"contain"` and `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 93 — bound artifact inventories

- Issue: malformed saves accepted 10,000 duplicate `union` artifacts, producing impossible counts and potentially overwhelming artifact rendering/modal UI.
- Acceptance: artifact saves contain only known unique IDs and never exceed the catalog size; oversized/duplicate collections cannot expose Continue, while normal collections reload unchanged.
- Change: added uniqueness and catalog-length validation for `artifacts`.
- Test: isolated Chrome rejected 10,000 duplicate artifacts; a real Continue on the normal `['union']` collection restored the game with artifact count `1` and `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 94 — keep energy integral

- Issue: malformed `energy:1.5` passed validation, displayed fractional energy, and could persist fractional card resources after spending.
- Acceptance: energy and maxEnergy are integers, `0 <= energy <= maxEnergy`, and maxEnergy stays within `3..5`; fractional energy cannot expose Continue while legal `5/5` remains reloadable.
- Change: tightened scalar save validation for integer energy bounds and supported maxEnergy range.
- Test: isolated Chrome rejected `energy:1.5`; a control save with `energy:5,maxEnergy:5` remained Continue-visible; `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 95 — keep processing counters integral

- Issue: fractional `processed`/`totalProcessed` values passed validation and could permanently prevent the Machine artifact’s `totalProcessed % 3` trigger.
- Acceptance: both counters are nonnegative integers; fractional saves cannot expose Continue, while legal counters trigger Machine on the next third success.
- Change: tightened counter validation for integer nonnegative `processed` and `totalProcessed`.
- Test: isolated Chrome rejected `2.5` counters; a real Continue with Machine and counters at `2` processed one archive parcel to `3`, logged the Machine effect, kept the game visible, and produced `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 96 — bound reward choice counts

- Issue: a reward save with 10,000 valid repair choices passed validation and could overwhelm the reward modal renderer.
- Acceptance: reward saves contain 1–3 valid choices; oversized arrays cannot expose Continue, while normal one-choice rewards remain reloadable.
- Change: capped `rewardChoices` validation at the generator’s maximum of three entries.
- Test: isolated Chrome rejected 10,000 choices and accepted a normal one-choice repair reward; `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 97 — keep card-count triggers integral

- Issue: fractional `cardCountThisTurn` passed validation and could skip the Mug artifact’s exact-three-card trigger.
- Acceptance: the counter is a nonnegative integer; fractional saves cannot expose Continue, while legal value `2` plus one card play triggers Mug’s draw effect.
- Change: tightened counter validation for integer nonnegative `cardCountThisTurn`.
- Test: isolated Chrome rejected `cardCountThisTurn:2.5`; a real Continue with Mug at count `2` and memo card play reached count `3` and showed the Mug toast (`три карты — две сверху`), with the game visible and `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 98 — validate Link pair integrity

- Issue: forged `linked:true` state granted Link’s +2-credit bonus without a card, and processing a valid linked parcel could leave an orphaned reverse reference.
- Acceptance: accepted links are symmetric adjacent parcel IDs; orphaned links cannot expose Continue; a valid pair grants exactly +2 once, clears the remaining parcel’s link when one side is processed, and remains reloadable.
- Change: added save-time symmetric-adjacency validation, runtime linked-bonus verification, and reciprocal-link cleanup on processing.
- Test: isolated Chrome rejected orphaned `linked:true`; a real symmetric link with value `7` produced credits `16 → 25` (`+7 +2`), progress `1`, no remaining linked reference, and Continue remained available after reload; `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 99 — unclip tablet board flow

- Issue: at 681–1020px the compact-height rule forced the fixed desk layout back to viewport height after the tablet reflow, leaving no document-sized fallback for shorter tablet viewports.
- Acceptance: at 900×768 and 820×700 the actual board, action dock, and hand are reachable without clipping or overlap; the shorter viewport may scroll, keyboard focus reaches Pause, and the browser reports no uncaught errors.
- Change: restored automatic desk-layout height after the compact-height media rule and kept tablet body/game overflow scrollable.
- Test: isolated Chrome real run at 900×768 reported `scrollHeight=clientHeight=768`, board bottom `705.28`, hand bottom `705.28`, action bottom `597.28`; 820×700 reported `scrollHeight=750`, `clientHeight=700`, `maxScrollY=50`, and after scrolling hand bottom `655.28`, action bottom `547.28`; Pause focus succeeded at both sizes, screenshots `cycle99-900x768.png` and `cycle99-820x700.png` were inspected, `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 100 — enforce contamination routing

- Issue: the rulebook says «Опасное или заражённое → изоляция», but route validation compared only `p.dest`; a contaminated ordinary parcel could be forwarded or archived without a routing error.
- Acceptance: contaminated parcels visibly and accessibly require `ИЗОЛИРОВАТЬ`, quick sort targets `contain`, wrong forward/archive attempts incur the normal integrity penalty without quota progress, and containment succeeds without damage; clean routes remain unchanged.
- Change: added one `requiredDestination()` rule used by sorting validation, parcel labels/ARIA, inspector route text, and quick-sort targeting; synchronized the full справочник copy with the new contamination rule.
- Test: isolated Chrome opened the справочник and confirmed both contamination statements; then mutated a normal parcel to `contamination:1`; UI reported parcel/inspector route `ИЗОЛИРОВАТЬ` and quick target `contain`; real forward click produced integrity `18 → 16`, progress `0`; real contain click produced integrity `18`, progress `1`, parcel removed, game visible, `browserErrors:[]`. `node --check app.js` and QA script also passed.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 101 — bound saved contamination

- Issue: `validParcel()` did not validate `contamination`, so malformed saves could persist negative, fractional, or unbounded infection values and distort routing, rewards, and spread behavior after reload.
- Acceptance: saved contamination is an integer in the generated/derived range `0..3`; values outside that range cannot expose Continue, while legal `3` survives reload and can continue into the game unchanged.
- Change: added integer and `0..3` bounds to parcel save validation.
- Test: isolated Chrome rejected `-1`, `1.5`, `4`, and `10000` after reload (`continueVisible:false`, menu visible); legal `3` kept Continue visible, then real Continue opened the game with `contamination:3`; `browserErrors:[]`, `node --check app.js` passed.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 102 — escape saved parcel names in toasts

- Issue: a valid saved `parcel.name` was interpolated into the inspection toast as HTML, allowing a payload to create an actionable `[data-new-run]` button and overwrite the current run.
- Acceptance: after reload and Continue, inspecting a parcel with HTML-like name content produces literal escaped text only; no toast button is created, profile run count is unchanged, the game remains visible, and ordinary bold toast markup still renders.
- Change: escaped parcel names in both inspection paths (card and inspector event handler) and in expiry notifications before passing them to the intentionally rich-text toast renderer.
- Test: isolated Chrome loaded `</strong><button data-new-run>ПЕРЕЗАПУСК</button><strong>` through a valid save, continued, and clicked the real inspector «осмотреть» control; `runs` stayed `1`, `gameVisible:true`, `toastButtons:0`, toast HTML contained `&lt;button...`, saved payload remained literal, and `browserErrors:[]`; `node --check app.js` passed.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 103 — bound saved event logs

- Issue: saves accepted event logs of arbitrary size and `loadSave()` rendered the entire array, despite gameplay retaining only seven entries; a bloated save could stall Continue and the desk renderer.
- Acceptance: saved logs contain at most seven entries with bounded text and boolean flags; oversized logs cannot expose Continue, while seven normal entries reload and render exactly seven lines.
- Change: added save validation for log array size, message length, and `bad` flag shape, matching the runtime log contract.
- Test: isolated Chrome rejected a 10,000-entry log after reload (`continueVisible:false`); a seven-entry log remained Continue-visible, real Continue opened the game and rendered `7` log lines, `browserErrors:[]`, and `node --check app.js` passed.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 104 — bound saved parcel text

- Issue: save validation allowed arbitrarily large parcel IDs, names, and descriptions; even after HTML escaping, a hostile or corrupt save could inflate board/inspector DOM and stall Continue.
- Acceptance: parcel `id`, `name`, and `text` stay within generator-compatible limits (`80`, `120`, and `500` characters); oversized fields cannot expose Continue, while normal text reloads unchanged.
- Change: added length limits for parcel ID, name, glyph, and description in `validParcel()`.
- Test: isolated Chrome rejected a save with 10,000-character name/text and 1,000-character ID; a normal save continued successfully with `name:"Нормальное имя"`, game visible, and `browserErrors:[]`; `node --check app.js` passed.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 105 — validate saved stability

- Issue: `stability` was absent from parcel save validation and was interpolated into the inspector HTML, so a crafted but otherwise valid save could create an actionable control and restart the run.
- Acceptance: stability is an integer in the generator range `1..3`; invalid/HTML-like values cannot expose Continue, legal values reload, and the inspector/toast paths contain no save-created `[data-new-run]` controls.
- Change: added stability bounds to `validParcel()`.
- Test: isolated Chrome rejected HTML-like stability after reload; legal `3` remained Continue-visible, continued into the game, and inspector checks reported `buttons:0`, `toastButtons:0`, persisted stability `3`, and `browserErrors:[]`; `node --check app.js` passed.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 106 — bound saved deck size

- Issue: save validation accepted arbitrarily large card decks if their hand/draw/discard multiset matched, although gameplay starts with 10 cards, removes down to 5, and can add at most one per shift.
- Acceptance: a saved deck remains within the reachable `5..18` range; oversized valid-card arrays cannot expose Continue, while the normal starter deck reloads and continues unchanged.
- Change: added deck-size validation using the starter deck and maximum-shift bounds.
- Test: isolated Chrome rejected a save containing 10,000 valid `memo` cards; the normal deck remained Continue-visible, real Continue opened the game with `deck:10`, and `browserErrors:[]`; `node --check app.js` passed.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 107 — align desk rule wording

- Issue: the compact desk rule said «Опасное или нестабильное → изоляция», but no separate unstable route exists; the actual mechanic and full справочник require isolation for dangerous or contaminated parcels.
- Acceptance: the in-game rule panel names the same contamination rule as the inspector and full справочник, with no stale «нестабильное» wording.
- Change: replaced the stale desk rule phrase with «Опасное или заражённое → изоляция».
- Test: real Chrome opened a fresh party and reported the rendered rules text containing `Опасное или заражённое` and not `нестабильное`; `browserErrors:[]`, `node --check app.js` passed.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 108 — reverify victory and defeat gates

- Issue: after the routing, save-validation, and render-safety changes, both terminal outcomes still needed real browser verification; a syntax check cannot establish that victory and defeat remain reachable or that wins are not miscounted.
- Acceptance: a final-shift quota completion reaches the victory modal, increments wins once, and clears the save; a zero-integrity routing error reaches defeat without awarding a win and also clears the save.
- Change: no gameplay code change; added a seeded browser quality-gate run covering both terminal paths.
- Test: isolated Chrome real clicks produced victory `ДЕПАРТАМЕНТ ВЫЖИЛ`, `wins:1`, `savePresent:false`; a separate integrity-2 wrong-route run produced defeat `СМЕНА ПРЕРВАНА`, `wins:0`, `savePresent:false`; `browserErrors:[]`, `node --check app.js` passed.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 109 — restore two-card draw effects

- Issue: `Терминология` and `Кружка дежурного` used `handLimit=5` as a hard cap, so their promised two-card draws could produce only one or no extra choice even though the physical hand supports six cards.
- Acceptance: with normal hand target `5`, Terminology draws two cards into a six-card hand; Mug’s third-card trigger adds two cards up to six; with overtime target `4`, neither effect exceeds four and remaining cards stay in draw.
- Change: separated the normal refill target from the temporary physical hand cap in `takeCardsIntoHand()`; normal turns cap at `MAX_HAND=6`, reduced targets such as overtime remain hard caps.
- Test: real Chrome clicks produced Terminology `hand 5→6`, draw `5→3`; Mug after three cards `hand:6`, draw `1`, `cardCountThisTurn:3`; overtime draw stayed `hand:4`, `handLimit:4`, draw `5`; `browserErrors:[]`, `node --check app.js` passed.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 110 — complete reward multiplier synergies

- Issue: `Копирка` doubled reward before later additive bonuses, so an archive with `Канцелярская копирка` paid `(5×2)+4=14` instead of doubling the visible successful-sort reward `(5+4)×2=18`.
- Acceptance: the multiplier applies after success bonuses such as archive `+4` and linked-pair `+2`, consumes itself once, and leaves the successful sort/progress intact; emergency processing remains excluded.
- Change: moved `nextDouble` application after the archive-stamp and valid-link additive reward components.
- Test: real Chrome armed Copy and Stamp, archived a value-5 dead letter, and observed credits `16→34` (`+18`), progress `1`, both effects false afterward, game visible, `browserErrors:[]`; `node --check app.js` passed.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 111 — stop same-turn memo recycling

- Issue: in a legal five-card deck with an empty draw pile, the zero-cost `Служебная записка` immediately recycled itself from discard during the same `drawToFive()` call, enabling unlimited `+2` credits without ending the turn.
- Acceptance: the played card cannot return during the same turn; one memo click changes credits by exactly `+2` and leaves the card out of hand, while the discard becomes recyclable on the next turn.
- Change: `drawToFive()` temporarily withholds the just-played card while recycling discard; `endTurn()` clears that guard before the next hand is drawn.
- Test: real Chrome started with a legal 5-card deck and empty draw, clicked memo once (`credits:16→18`, hand `5→4`, discard `1`, memo absent), then clicked End Turn and saw a new hand of `5` with memo available on turn `2`; `browserErrors:[]`, `node --check app.js` passed.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 112 — reject duplicate saved cards

- Issue: although normal rewards never add an existing card ID, save validation allowed duplicate deck IDs; combined with the memo anti-recycling guard, duplicate `memo` cards could still recreate an unearned credit engine.
- Acceptance: a deck contains unique known card IDs within the reachable size range; a duplicate-card save cannot expose Continue, while the unique starter deck remains reloadable.
- Change: added deck uniqueness to `deckSizeOk()`.
- Test: isolated Chrome rejected a legal-shaped ten-card deck containing ten duplicate `memo` IDs; the unique baseline deck remained Continue-visible, `browserErrors:[]`, and `node --check app.js` passed.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 113 — disable archive card on infection

- Issue: `Запрос в архив` promised an archive route for a safe parcel but accepted contaminated targets, consumed energy, and only changed an underlying route that the contamination rule still overrode to isolation.
- Acceptance: contaminated targets are visibly disabled for the archive-request card; clicking it does not consume energy or the card and explains that no valid target exists, while the inspector continues to show `ИЗОЛИРОВАТЬ`.
- Change: tightened `canPlayCard('archiveRequest')` to reject dangerous or contaminated parcels; `form` remains the explicit cleanup/retarget path.
- Test: real Chrome fixture with contamination `1` reported `aria-disabled:true`, inspector route `ИЗОЛИРОВАТЬ`; real card click left energy `3`, card in hand, contamination `1`, and showed `У этой карты сейчас нет допустимой цели.`, with `browserErrors:[]`; `node --check app.js` passed.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 114 — block all same-turn draw recycling

- Issue: the Memo anti-loop only guarded `drawToFive()` by the last card; `Терминология` used `takeCards()`, which could recycle earlier cards from the same turn and reopen the `Терминология → Memo` credit loop.
- Acceptance: draw effects cannot return any card played during the current turn; after playing Terminology then Memo in a five-card/empty-draw fixture, both remain out of hand until End Turn, while the next turn recycles them normally.
- Change: added persisted `playedThisTurn` tracking, validated its card IDs, and made the shared discard recycler hold the entire current-turn set; End Turn/start-shift reset it.
- Test: real Chrome showed after Terminology `hand:4`, `draw:0`, `drawInHand:false`; after Memo credits `16→18`, `hand:3`, both played cards absent, `played:['draw','memo']`; after End Turn hand returned to `5`, both cards returned, `played:[]`, turn `2`; `browserErrors:[]`, `node --check app.js` passed.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 115 — keep extended mid-turn saves reloadable

- Issue: the new current-turn draw guard initially reused the six-card hand cap as its save limit, but draw/Mug effects can legally allow more than six cards to be played over one turn even though only six are held simultaneously.
- Acceptance: a legal mid-turn save with seven unique played card IDs remains Continue-visible and reloads with the full played set; duplicates or cards outside the deck remain invalid.
- Change: widened `playedThisTurn` validation to the current unique deck size and required unique IDs that belong to the deck.
- Test: isolated Chrome loaded a mid-turn fixture with seven played cards; Continue stayed visible, real Continue opened the game with `played:7` and `cardCount:7`, `browserErrors:[]`, and `node --check app.js` passed.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 117 — improve parcel metadata readability

- Issue: the actual board screenshots still rendered parcel route/deadline metadata at 8px, making the most important sorting confirmation materially smaller than parcel names.
- Acceptance: route and deadline metadata render at 9px at desktop/tablet sizes, while the board, hand, and action dock remain fully visible without new page scrolling or clipping at 1366×768 and 900×768.
- Change: added a readability override for `.parcel-destination` and `.parcel-foot` at the non-mobile desk scale; existing mobile compact overrides remain in force.
- Test: isolated Chrome screenshots `cycle117-1366x768.png` and `cycle117-900x768.png` were inspected; both reported route/foot `9px`, `scrollHeight=clientHeight=768`, desktop hand bottom `758`, tablet hand bottom `705.28`, action bottoms `650`/`597.28`, and `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 118 — fit short tablet hand in viewport

- Issue: the independent visual audit reproduced the hand extending below the first viewport at 820×700; the compact-height rule gave cards a 135px minimum while the hand wrapper was only 102px, forcing an opaque 50px scroll path.
- Acceptance: at 820×700 and scrollTop `0`, the page has no vertical scrollbar, every card and full description is inside the viewport, and 900×768/1366×768 retain their no-clipping layout.
- Change: added a short-tablet media rule that tightens hand/card typography and padding, sets an 84px compact hand, and removes only redundant tablet bottom padding; desktop and ordinary tablet rules are unchanged.
- Test: real Chrome Cycle 99 reports 820×700 `scrollHeight=clientHeight=700`, `scrollY=0`, hand bottom `687.28`, action bottom `597.28`; detailed bounds put every card bottom at `699.28` and description bottom at `694.28`; 900×768 remains `scrollHeight=clientHeight=768`, and `browserErrors:[]`. Screenshot `cycle99-820x700.png` was inspected with all card descriptions visible.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 119 — reject malformed parcel boolean flags

- Issue: save validation checked parcel identity and numeric ranges but accepted non-boolean values in derived flags, allowing malformed or adversarial parcel state to reach gameplay after reload.
- Acceptance: replacing any parcel `anomaly`, `temporal`, `secret`, `revealed`, `shield`, or `suppressed` value with a non-boolean must hide Continue and keep the menu active; an untouched legal save must remain Continue-visible and loadable.
- Change: `validParcel()` now requires all six parcel flags to be booleans before a save can be loaded.
- Test: isolated real Chrome reloaded six corrupted saves; each returned `continueVisible:false`, `menuVisible:true`; the restored legal save returned `continueVisible:true`, `menuVisible:true`; `browserErrors:[]`, and `node --check app.js` passed.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 120 — restore readable short-tablet cards without overflow

- Issue: the Cycle 118 short-tablet fit reduced card names to 8px and descriptions to 7px/1.05 line-height; an independent visual review found the mechanics effectively unreadable at 820×700 even though the cards fit.
- Acceptance: at 820×700 every visible card name and description computes to at least 10px with at least 1.2 line-height, full description text remains visible, and the page has no vertical scrolling; 900×768 must remain unchanged and error-free.
- Change: used the compact slot more deliberately: hide only the secondary hand header, give cards a 97px slot, restore 10px names/descriptions and 1.2 line-height, and retain the existing 17px icon.
- Test: real Chrome screenshots `cycle99-820x700.png` and `cycle99-900x768.png` were inspected; 820×700 reports `scrollHeight=clientHeight=700`, `scrollY=0`, hand/card bottom `700.281`, every description bottom `694.281`, and 900×768 remains non-scrollable with hand bottom `705.281`; `browserErrors:[]`.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 121 — make Stamp’s combo effect real

- Issue: an independent gameplay audit found `Канцелярская копирка` advertised “+4 кредита и увеличивает серию”, but the implementation only added +4 and advanced `combo` exactly like an unarmed archive.
- Acceptance: a valid front archive with `nextStamp=true` must consume the effect, add the documented +4 to the normal reward, and advance `combo` by two steps; the same fixture with `nextStamp=false` must advance by one.
- Change: `processParcel()` now records a non-emergency stamped archive and increments the series by 2 only for that success; other routes and ordinary successes remain at +1.
- Test: real Chrome Continue + archive clicks on the same legal fixture produced stamped `{credits:10, combo:2, nextStamp:false, processed:1}` versus control `{credits:6, combo:1, nextStamp:false, processed:1}`; the 4-credit difference matched the Stamp bonus, `browserErrors:[]`, `node --check app.js` passed. Victory/defeat regression smoke also passed with the expected headings and no residual save.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 122 — preserve saves after linked parcel expiry

- Issue: when one of two adjacent linked parcels expired, the remaining parcel kept a pointer to the removed ID; the next autosave was structurally invalid, so real reload hid Continue and stranded the run.
- Acceptance: after one linked parcel expires, the surviving parcel must be unlinked before autosave and Continue must remain available after reload; a valid adjacent reciprocal link must survive an End Turn unchanged.
- Change: added `normalizeLinks()` to `saveState()`: it clears only missing, non-reciprocal, non-adjacent, or cross-lane links before persistence.
- Test: pre-fix real Chrome End Turn left `linked:["p-2"]` and after reload `continueVisible:false`; post-fix gave `linked:[]`, `continueVisible:true`, `corrupt:false`. A separate valid-pair run preserved `linked:2` and Continue; Copy+Stamp and full draw-recycling regressions remained green, with `browserErrors:[]` and `node --check app.js` passing.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 124 — restore critical resources on tablet screens

- Issue: an independent visual audit found quota, credits, and integrity hidden at 900×768 and 820×700 because the top stats were removed below 1020px and the side rails were not visible; players could not make risk/reward decisions from the board view.
- Acceptance: at both tablet sizes, labeled quota/credits/integrity values must have rendered rectangles fully inside the first viewport and visibly update after a successful sort and an integrity-losing mistake, without reintroducing page scrolling.
- Change: added a compact resource strip to the contextual board row, synchronized with the existing authoritative HUD values; it remains hidden at desktop where the full top stats are visible.
- Test: real Chrome reports all three tablet resource rects at `top:115`, `bottom:126`, with 900×768 and 820×700 both `scrollHeight=clientHeight` (`768`/`700`). Real clicks changed integrity `18 / 18 → 16 / 18` on a wrong route and quota/credits on a correct route; `browserErrors:[]`, `node --check app.js` passed. Screenshot `cycle124-820x700.png` was inspected.
- Next target: fix the next highest-impact gameplay weakness: `Запрос в архив` can currently consume itself on an already-archived safe parcel without changing state.

## Cycle 125 — disable no-op archive requests

- Issue: `Запрос в архив` could be played on a revealed safe parcel already routed to archive; it consumed energy and left the card in discard without changing the parcel or progression.
- Acceptance: that no-op target must render disabled and a real click must leave energy, hand, discard, and parcel state unchanged; a safe forward parcel must remain playable and retarget/reveal through the normal 1-energy effect.
- Change: `canPlayCard('archiveRequest')` now rejects only the revealed-already-archive case in addition to its existing dangerous/contaminated restrictions, preserving hidden archive parcels as a possible information-bearing target.
- Test: real Chrome Continue + card clicks produced blocked `{disabled:true, energy:3, hand:['archiveRequest'], discard:[], dest:'archive'}` before and identical state after; the forward control produced `energy:2`, `discard:['archiveRequest']`, `dest:'archive'`, `revealed:true`; `browserErrors:[]`, `node --check app.js` passed.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 126 — remove dead Advance rewards before the final shift

- Issue: the reward pool could offer `Аванс` after shift 7, immediately before shift 8; its only effect increases the next quota, so the selected card became permanently disabled/useless in the final shift.
- Acceptance: the shift-7 reward modal must never include `advance`; the shift-6 reward modal must still be able to offer it when a next quota exists.
- Change: `createRewards()` now excludes `advance` only when `state.shift >= MAX_SHIFTS - 1`, leaving all earlier reward pools unchanged.
- Test: before the fix, real Chrome seed `1277` produced reward choices `[advance, blackMarket, repair]` after shift 7. After the fix, 20 seeded shift-7 reward runs produced zero `advance` offers; a shift-6 run with a valid mixed-route audit produced `[advance, blackMarket, recursive]`. `node --check app.js` passed and browser errors were absent.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.

## Cycle 127 — stop front expiry from deleting the next parcel

- Issue: after the front parcel expired, the conveyor filtered it out and then unconditionally shifted the newly exposed front parcel too, silently deleting a second case without processing or incrementing `expired`.
- Acceptance: if the front case expires, the former second case must remain first and only one expiry must be counted; ordinary turns without expiry must retain the existing one-slot conveyor shift.
- Change: `endTurn()` records whether the original front ID expired and suppresses the additional `lane.shift()` only for that case; rescued front parcels and non-front expiries remain handled by the existing rules.
- Test: real Chrome produced expired-run IDs `p-2,p-3,p-4,p-13` from `p-1,p-2,p-3,p-4`, with `expired:1` and Continue visible. Ordinary control produced the same one-slot shift with `expired:0`; victory/defeat smoke passed, `browserErrors:[]`, and `node --check app.js` passed.
- Next target: continue the independent audit for another concrete save, card/effect, progression, responsive, or accessibility weakness; do not add work without a falsifiable failure.
