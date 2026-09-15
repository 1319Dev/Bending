**Live app:** https://1319dev.github.io/Bending/

# Pipeline Bend Calculator

A self-contained engineering calculator for **circular pipe bends** used in pipeline and process piping. Select NPS / DN size and schedule, set bend angle and centerline radius (CLR), optionally add tangents, and get live developed lengths and takeoffs.

## Run locally

```bash
npm install
npm run dev
```

Then open the URL shown in the terminal (typically `http://localhost:5173`).

### Production build

```bash
npm install
npm run build
npm run preview   # optional: serve the dist/ folder
```

## Features

- **Pipe sizes** — NPS ½″ through 24″ with DN, OD, and Schedule 40 / 80 wall thickness (ASME B36.10M)
- **CLR presets** — 1.5D (long-radius elbow), 3D, 5D, or custom radius
- **Bend angle** — any angle in degrees (default 90°)
- **Optional tangents** — straight lengths before/after the arc
- **Live outputs** — centerline arc, total developed length, horizontal/vertical projections, outer/inner arcs, OD / ID / wall
- **Units** — inches or millimetres

## Formula assumptions

All lengths are computed for a **circular arc in a single plane**, with radius **R** measured to the **pipe centerline** (CLR).

| Quantity | Formula |
| --- | --- |
| Angle (radians) | θ_rad = θ° × π / 180 |
| Centerline arc (developed bend) | L_arc = R × θ_rad |
| Total developed length | L_total = L_arc + tangent_in + tangent_out |
| Horizontal projection (takeoff) | L = R × sin(θ) |
| Vertical projection (rise) | H = R × (1 − cos(θ)) |
| Outer arc | (R + OD/2) × θ_rad |
| Inner arc | (R − OD/2) × θ_rad |
| Inside diameter | ID = OD − 2 × wall |

For a **90°** bend: L = H = R.

**CLR presets** multiply the selected pipe **outside diameter** (e.g. 1.5D long-radius per common ASME B16.9 practice). Custom CLR is entered directly in the active unit system.

Pipe OD and Schedule 40 / 80 wall thicknesses follow published **ASME B36.10M** values (carbon steel). This tool does not apply corrosion allowance, mill tolerance, or ovality corrections.

## Disclaimer

**For planning and reference only.** Fabricators and engineers should verify all dimensions against project specifications, applicable codes (e.g. ASME B16.9, B31.1 / B31.3), and actual material certificates before cutting, bending, or welding.

## Tech

- Vite + React + TypeScript
- No backend; all calculation runs in the browser
- Pipe data lives in `src/data/pipeData.ts`

## License

Use freely for engineering reference and education.
