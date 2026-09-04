# FLINT Design Direction

## Three stylistic approaches

### Approach 01 — Black Ledger
**Very Brief Intro:** An austere institutional terminal language: near-black plinths, amber action markers, and compact evidence-led information blocks. It feels like a serious clearing venue for autonomous labor rather than a consumer app.

**Probability:** 0.03

### Approach 02 — Signal Archive
**Very Brief Intro:** A monochrome research-console aesthetic with off-white surfaces, cobalt annotations, and generous editorial whitespace. It frames the protocol as a public observatory and technical archive.

**Probability:** 0.08

### Approach 03 — Copper Relay
**Very Brief Intro:** A warm industrial systems language using charcoal, oxidized copper, and restrained grid interruptions. It emphasizes machine provenance and hard-won trust without resorting to neon futurism.

**Probability:** 0.06

## Selected Approach — Black Ledger

### Design Movement
Contemporary Swiss International Typographic Style filtered through institutional market terminals and systems engineering documentation. The visual grammar is precise, asymmetric, and information-forward, with hierarchy coming from scale, spacing, and rules rather than decorative effects.

### Core Principles
1. **Evidence before spectacle:** every accent, chart, and status color must clarify a decision or state.
2. **Plinths create depth:** stacked dark surfaces and hairline borders replace soft shadows and ornamental gradients.
3. **Dense but breathable:** compact data rows are balanced by deliberate outer margins and sectional pauses.
4. **Machine-readable first:** data uses IBM Plex Mono, tabular figures, explicit labels, and predictable alignment.

### Color Philosophy
The #070707 base is the protocol floor; #0E0E0E cards are raised ledger plinths. White is reserved for primary facts and navigation. Amber #FF6B00 signals user action, market attention, and economic motion. Emerald #10B981 is reserved for verifiable live rollup state. Muted steel neutrals establish a quiet hierarchy. No gradients, glow, or decorative color noise are permitted.

### Layout Paradigm
A persistent top instrument bar anchors the system. The main canvas uses an asymmetric 12-column field: a broad market surface, a narrow telemetry rail, and a lower row for the scout terminal and SBT reactor. Sections are connected by ruled edges and labeled gutters, not by a uniform set of floating cards. On mobile the field collapses to a single reading order with the highest-signal state blocks first.

### Signature Elements
1. **Orange datum rail:** a two-pixel amber rule marks active market or execution focus.
2. **Instrument labels:** uppercase mono micro-labels with section codes such as `MKT / 004` and `ROLLUP / LIVE`.
3. **Hard telemetry rows:** each metric is a ruled line with a source tag, value, and verification mark.

### Interaction Philosophy
Interactions feel like operating a serious instrument. Hover exposes a precise edge state; active buttons depress slightly; tabs switch instantly; live data pulses only in the emerald status dot. Controls reveal what will change and never rely on surprise animation or decorative hover glow.

### Animation
Use opacity and transform only. Initial modules enter with a 180ms upward settle and 40ms stagger, but only when reduced motion is not requested. Status dots may pulse at a restrained 2.4s cadence. Market quote changes use a short color transition. No looping scene animation should compete with data reading; the 3D reactor may rotate slowly at low contrast as a secondary instrument.

### Typography System
Geist Sans is used for headings, navigation, and short explanatory copy with a tight, assertive hierarchy. IBM Plex Mono is used for metrics, timestamps, wallet addresses, telemetry labels, status codes, and numerical values; apply `font-variant-numeric: tabular-nums`. Headings are compact and mostly sentence case; metadata is uppercase with increased tracking.

### Brand Essence
FLINT is the settlement layer for autonomous labor markets, built for operators who need to price, verify, and observe machine-delivered work without losing the audit trail. Personality: **forensic, exacting, unsentimental**.

### Brand Voice
Headlines are short and declarative. CTAs describe the operator's next move. Microcopy names provenance and state instead of using generic reassurance.

Example lines:
- **Headline:** `PRICE THE WORK. WATCH THE DELIVERY.`
- **CTA:** `OPEN MARKET / 004`

### Wordmark & Logo
The mark is a compact angular flint shard: two offset black planes cut by one amber diagonal datum, suggesting ignition and a signed ledger entry. The wordmark is a custom-spaced `FLINT` in Geist Sans with the `I` reduced to a measured amber rule. The symbol should remain text-free so it works as a favicon and status glyph.

### Signature Brand Color
**Flint Amber — #FF6B00.** It is hot enough to read as a decisive action marker, but used only as a narrow instrument signal against black plinths.

## Implementation Contract

- Dark mode only; never expose a light theme toggle.
- Use #070707 for the application floor and #0E0E0E for cards.
- Use `rgba(255,255,255,0.07)` hairlines and no soft drop shadows.
- Use Geist Sans for UI copy and IBM Plex Mono for all telemetry and numerals.
- Keep amber and emerald sparse and semantic.
- Preserve and mount `RollupReactor.tsx` and `HolographicSBT.tsx` under `client/src/components/three/`.
- Avoid purple, blurred gradients, excessive rounding, generic SaaS hero copy, and centered-only composition.
