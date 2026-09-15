# Field Bend — layout from the PI

Mobile-first calculator for **circular field bends** on steel line pipe. Primary job: tell you **where to start the bend** between two straight sections, measuring back from the PI (point of intersection).

## Hero formula

**T = R · tan(Δ/2)**

Tangent distance from the PI back along each pipe to BC (beginning of curve / start of bend) and EC (end of curve). Same T on incoming and outgoing for a circular bend.

Also computed:

- Pull / developed arc **L = R · Δ_rad**
- Chord **C = 2 R · sin(Δ/2)**
- External **E = R · (1/cos(Δ/2) − 1)** (PI to midpoint of arc)
- Ahead / offset projections

## Defaults

- NPS 24" · WT 0.500" · CLR 18D · Δ 15°

## Stack

Vite + React + TypeScript. Base path: `/Bending/`.

```bash
npm install
npm run dev
npm run build
```

Planning / reference only — check the bending spec.
