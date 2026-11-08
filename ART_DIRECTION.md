# Dead Letter Office — Telegraph Nocturne

**Phase 2 direction — Docket Registry vertical slice**

Telegraph Nocturne is now treated as a supernatural transmission room rather than a dark theme. The player is assembling a dossier whose evidence must close an electrical and bureaucratic circuit before it can be filed.

## Product mechanism

Choose parcels → investigate → assemble a case → discover a connection → select a filing terminal → transmit the case.

## First viewport

The Docket Registry is arranged as three linked stations:

1. **Incoming signal** — a physical paper tape of available parcels.
2. **Relay dossier** — the dominant central machine with evidence contacts, case state, discovered synergies, expected reward, and filing cost.
3. **Receiving terminals** — three distinct filing destinations that preview compatibility, risk, and consequence before commitment.

The case is the brightest and largest object. The queue is evidence, not the hero. Cards sit below the machine as interventions and are visually quieter than the current case state.

## Material language

- blackened relay housing and warm metal edges;
- cream paper slips with imperfect registration;
- copper signal wire and red-orange anomaly current;
- pale green confirmation current when a synergy closes the circuit;
- stamped output and mechanical motion only at meaningful state changes.

## Typography

`Chakra Petch` carries machine headings and case state. `IBM Plex Mono` remains for codes, costs, measurements, and short operational labels. Important interaction text is at least 12–14px at desktop scale; 8px text is not used for decisions.

## Interaction grammar

- Adding a parcel illuminates its contact and places it in a physical dossier slot.
- Investigating a parcel changes the relay from `НУЖЕН ОСМОТР` to an actionable state.
- A discovered synergy turns the broken signal line pale green and names the connection.
- Selecting a terminal reveals its cost, compatibility, and risk before filing.
- `ОФОРМИТЬ ДЕЛО` commits the dossier; `ЗАВЕРШИТЬ ХОД` advances time. They are separate controls with separate visual roles.
- One restrained signal pulse is the signature motion. Reduced-motion mode removes the pulse without removing state feedback.

## Constraints

- Preserve all game logic, saves, state, balance, and existing handlers.
- Keep the legacy sorter and the A/C visual variants recoverable.
- Do not use atmospheric noise, labels, or grids where they do not communicate a material or state.
- Keep the primary flow readable on 1920×1080, 1366×768, and 820×700.
