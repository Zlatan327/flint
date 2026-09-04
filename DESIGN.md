# DESIGN.md — FLINT Design System Specification

> High-agency, anti-slop design system for **FLINT** (*Autonomous Agent Gig Protocol & Performance Markets on Solana*).
> Conforms to [Awesome DESIGN.md](https://github.com/voltagent/awesome-design-md), [Taste Skill](https://www.tasteskill.dev), and [Impeccable](https://impeccable.style) standards.

---

## 1. Aesthetic Thesis & Philosophy

Flint is an institutional-grade protocol interface bridging autonomous AI agents, high-speed execution rollups, and prediction markets. 

- **Primary Persona:** Protocol engineers, DAO operators, algorithmic prediction quants, and high-velocity builders.
- **Visual Stance:** Stark, cinematic, data-dense, tactile. No generic AI SaaS clichés (no floating gradient blobs, no oversized cartoonish cards, no purple-neon glow soup).
- **Core Principle:** Form strictly amplifies telemetry. Data is readable at a glance with zero cognitive friction.

---

## 2. Color Palette & Surfaces (The Plinth System)

The UI uses a layered **Plinth architecture** — dark physical surfaces stacked with hairline borders to convey depth without heavy blurry drop-shadows.

### Dark Foundation (Primary)
| Token | Hex / Value | Role |
|---|---|---|
| `--bg-void` | `#070707` | Lowest canvas layer |
| `--surface-base` | `#0E0E0E` | Main container / shell |
| `--surface-raised` | `#151515` | Interactive cards, modal plinths |
| `--surface-overlay` | `#1D1D1D` | Dropdowns, popovers, active highlights |
| `--border-subtle` | `rgba(255, 255, 255, 0.07)` | Hairline dividers and outer bounds |
| `--border-strong` | `rgba(255, 255, 255, 0.14)` | Hover states, active focus bounds |

### Accent Sparks (High Precision)
| Token | Hex / Value | Semantic Role |
|---|---|---|
| `--spark-amber` | `#FF6B00` | Flint Ignition / Solana Blitz signature accent |
| `--spark-amber-muted` | `rgba(255, 107, 0, 0.12)` | Pill backgrounds, badge highlights |
| `--rollup-emerald` | `#10B981` | Ephemeral Rollup live state (<10ms block latency) |
| `--rollup-emerald-muted` | `rgba(16, 185, 129, 0.12)` | ER active indicators |
| `--solana-purple` | `#9945FF` | L1 base layer settlement references |
| `--text-primary` | `#F5F5F5` | 100% white-equivalent high-contrast copy |
| `--text-secondary` | `#A1A1AA` | Body copy, descriptive metadata |
| `--text-muted` | `#71717A` | Labels, timestamps, subtle annotations |

---

## 3. Typography & Numerics

### Font Stacks
- **Interface & Headlines:** `Geist Sans`, `-apple-system`, `BlinkMacSystemFont`, `Inter`, `sans-serif`
- **Monospace & Telemetry:** `IBM Plex Mono`, `Geist Mono`, `monospace`
  - **Rule:** ALL numeric amounts, currency values (SOL/USDC), prediction market odds, block latencies, and wallet addresses MUST be set in monospace with `font-feature-settings: 'tnum' 1, 'zero' 1` (tabular numbers).

### Hierarchy Scale
| Level | Font Size | Line Height | Tracking | Weight | Target |
|---|---|---|---|---|---|
| `display-1` | `44px` / `56px` | `1.0` | `-0.03em` | `700` | Hero Title |
| `h1` | `28px` / `34px` | `1.15` | `-0.025em` | `600` | View Headers |
| `h2` | `20px` / `26px` | `1.2` | `-0.02em` | `600` | Card Titles |
| `h3` | `15px` / `20px` | `1.3` | `-0.01em` | `500` | Section Labels |
| `body` | `14px` | `1.5` | `0` | `400` | Standard copy |
| `mono-sm` | `12px` | `1.4` | `0.02em` | `500` | Odds, latencies, hashes |

---

## 4. Impeccable Anti-Slop Directives

1. **Zero Gradient Soup:** Never apply arbitrary 3-color radial gradients across large backgrounds. Use subtle, intentional edge lighting with high falloff.
2. **No Status Chip Clutter:** Avoid scattering 5 brightly colored pill tags on every card. Group status into a single unified telemetry row with a discrete status dot.
3. **No Decorative Cards inside Cards:** If data belongs to an item, use borders, rules, or whitespace — don't nest 4 layers of rounded cards.
4. **Micro-Sheen Polish:** Interactive buttons and pills feature a subtle linear highlight (`inset 0 1px 0 rgba(255,255,255,0.12)`) to give tactile glass-like weight.
5. **Fast Easing Curves:** Animations must feel snappy (`cubic-bezier(0.16, 1, 0.3, 1)` with durations between `150ms` and `280ms`). No sluggish transitions.

---

## 5. Procedural 3D Asset Guidelines (img2three.js Philosophy)

- Avoid heavy external `.gltf` or `.obj` network downloads.
- Reconstruct kinetic and state-based graphics procedurally in code using Three.js:
  - **The Rollup Reactor:** Interactive particle-based orb responding to state delegation.
  - **The Holographic SBT Passport:** A floating, dynamic iridescent badge rendering on-chain reputation scores in real time.
