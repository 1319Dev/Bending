import { useMemo, useState } from 'react';
import {
  PIPE_SIZES,
  CLR_PRESETS,
  getWallThickness,
  type Schedule,
  type ClrPresetId,
} from './data/pipeData';
import { calculateBend } from './utils/calculations';
import {
  type UnitSystem,
  fromInches,
  toInches,
  unitLabel,
  formatLength,
} from './utils/units';
import { BendDiagram } from './components/BendDiagram';
import './App.css';

const DEFAULT_NPS = '4';

function App() {
  const [units, setUnits] = useState<UnitSystem>('in');
  const [nps, setNps] = useState(DEFAULT_NPS);
  const [schedule, setSchedule] = useState<Schedule>('40');
  const [angleDeg, setAngleDeg] = useState(90);
  const [clrPreset, setClrPreset] = useState<ClrPresetId>('1.5D');
  const [customClrDisplay, setCustomClrDisplay] = useState('');
  const [tangentInDisplay, setTangentInDisplay] = useState('0');
  const [tangentOutDisplay, setTangentOutDisplay] = useState('0');

  const pipe = useMemo(
    () => PIPE_SIZES.find((p) => p.nps === nps) ?? PIPE_SIZES[0],
    [nps],
  );

  const wallIn = getWallThickness(pipe, schedule);
  const odIn = pipe.odIn;

  const preset = CLR_PRESETS.find((p) => p.id === clrPreset)!;
  const clrIn = useMemo(() => {
    if (preset.multiplier != null) {
      return preset.multiplier * odIn;
    }
    const parsed = parseFloat(customClrDisplay);
    return Number.isFinite(parsed) && parsed > 0 ? toInches(parsed, units) : odIn * 1.5;
  }, [preset, odIn, customClrDisplay, units]);

  const tangentInIn = useMemo(() => {
    const v = parseFloat(tangentInDisplay);
    return Number.isFinite(v) && v >= 0 ? toInches(v, units) : 0;
  }, [tangentInDisplay, units]);

  const tangentOutIn = useMemo(() => {
    const v = parseFloat(tangentOutDisplay);
    return Number.isFinite(v) && v >= 0 ? toInches(v, units) : 0;
  }, [tangentOutDisplay, units]);

  const results = useMemo(
    () =>
      calculateBend({
        clrIn,
        angleDeg: Number.isFinite(angleDeg) ? Math.max(0.001, Math.min(360, angleDeg)) : 90,
        odIn,
        wallIn,
        tangentInIn,
        tangentOutIn,
      }),
    [clrIn, angleDeg, odIn, wallIn, tangentInIn, tangentOutIn],
  );

  const u = unitLabel(units);

  function switchUnits(next: UnitSystem) {
    if (next === units) return;
    // Convert custom CLR and tangents currently displayed
    const convertField = (val: string) => {
      const n = parseFloat(val);
      if (!Number.isFinite(n)) return val;
      const inches = toInches(n, units);
      return fromInches(inches, next).toFixed(next === 'mm' ? 1 : 3);
    };
    setCustomClrDisplay((v) => (v === '' ? v : convertField(v)));
    setTangentInDisplay((v) => convertField(v));
    setTangentOutDisplay((v) => convertField(v));
    setUnits(next);
  }

  const ResultRow = ({
    label,
    hint,
    valueIn,
    emphasize,
  }: {
    label: string;
    hint?: string;
    valueIn: number;
    emphasize?: boolean;
  }) => (
    <div className={`result-row ${emphasize ? 'emphasize' : ''}`}>
      <div className="result-label">
        <span>{label}</span>
        {hint && <span className="hint">{hint}</span>}
      </div>
      <div className="result-value">
        <span className="mono">{formatLength(valueIn, units)}</span>
        <span className="unit">{u}</span>
      </div>
    </div>
  );

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="brand-mark" aria-hidden>
            ⌒
          </div>
          <div>
            <h1>Pipeline Bend Calculator</h1>
            <p className="tagline">
              Circular bend developed lengths, takeoffs &amp; CLR for process piping
            </p>
          </div>
        </div>
        <div className="unit-toggle" role="group" aria-label="Units">
          <button
            type="button"
            className={units === 'in' ? 'active' : ''}
            onClick={() => switchUnits('in')}
          >
            inches
          </button>
          <button
            type="button"
            className={units === 'mm' ? 'active' : ''}
            onClick={() => switchUnits('mm')}
          >
            mm
          </button>
        </div>
      </header>

      <main className="layout">
        <section className="panel inputs">
          <h2>Pipe</h2>

          <label className="field">
            <span className="field-label">
              Nominal size (NPS / DN)
              <span className="hint">ASME B36.10M outside diameters</span>
            </span>
            <select value={nps} onChange={(e) => setNps(e.target.value)}>
              {PIPE_SIZES.map((p) => (
                <option key={p.nps} value={p.nps}>
                  NPS {p.nps}&quot; · DN {p.dn} · OD {formatLength(p.odIn, units)} {u}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Schedule</span>
            <div className="segmented">
              <button
                type="button"
                className={schedule === '40' ? 'active' : ''}
                onClick={() => setSchedule('40')}
              >
                Sch 40
              </button>
              <button
                type="button"
                className={schedule === '80' ? 'active' : ''}
                onClick={() => setSchedule('80')}
              >
                Sch 80
              </button>
            </div>
          </label>

          <div className="pipe-dims">
            <div>
              <span className="dim-label">OD</span>
              <span className="mono">
                {formatLength(odIn, units)} {u}
              </span>
            </div>
            <div>
              <span className="dim-label">Wall</span>
              <span className="mono">
                {formatLength(wallIn, units)} {u}
              </span>
            </div>
            <div>
              <span className="dim-label">ID</span>
              <span className="mono">
                {formatLength(results.idIn, units)} {u}
              </span>
            </div>
          </div>

          <h2>Bend</h2>

          <label className="field">
            <span className="field-label">
              Bend angle
              <span className="hint">Degrees in one plane (default 90°)</span>
            </span>
            <div className="input-with-suffix">
              <input
                type="number"
                min={0.1}
                max={360}
                step={0.1}
                value={angleDeg}
                onChange={(e) => setAngleDeg(parseFloat(e.target.value) || 0)}
              />
              <span>°</span>
            </div>
          </label>

          <label className="field">
            <span className="field-label">
              Centerline radius (CLR)
              <span className="hint">
                Radius to pipe centerline. 1.5D = long-radius elbow (ASME B16.9)
              </span>
            </span>
            <div className="segmented wrap">
              {CLR_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={clrPreset === p.id ? 'active' : ''}
                  onClick={() => {
                    setClrPreset(p.id);
                    if (p.multiplier != null) {
                      setCustomClrDisplay(
                        fromInches(p.multiplier * odIn, units).toFixed(
                          units === 'mm' ? 1 : 3,
                        ),
                      );
                    }
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </label>

          {clrPreset === 'custom' && (
            <label className="field">
              <span className="field-label">Custom CLR ({u})</span>
              <div className="input-with-suffix">
                <input
                  type="number"
                  min={0.01}
                  step={units === 'mm' ? 1 : 0.1}
                  value={customClrDisplay}
                  onChange={(e) => setCustomClrDisplay(e.target.value)}
                  placeholder={`e.g. ${fromInches(odIn * 1.5, units).toFixed(units === 'mm' ? 1 : 3)}`}
                />
                <span>{u}</span>
              </div>
            </label>
          )}

          <div className="clr-readout">
            Effective CLR:{' '}
            <strong className="mono">
              {formatLength(clrIn, units)} {u}
            </strong>
            {preset.multiplier != null && (
              <span className="muted"> ({preset.multiplier} × OD)</span>
            )}
          </div>

          <h2>Tangents (optional)</h2>
          <p className="section-note">
            Straight lengths before / after the bend. Included in total developed length;
            not part of the arc.
          </p>

          <div className="tangent-row">
            <label className="field">
              <span className="field-label">Inlet tangent ({u})</span>
              <input
                type="number"
                min={0}
                step={units === 'mm' ? 1 : 0.1}
                value={tangentInDisplay}
                onChange={(e) => setTangentInDisplay(e.target.value)}
              />
            </label>
            <label className="field">
              <span className="field-label">Outlet tangent ({u})</span>
              <input
                type="number"
                min={0}
                step={units === 'mm' ? 1 : 0.1}
                value={tangentOutDisplay}
                onChange={(e) => setTangentOutDisplay(e.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="panel outputs">
          <h2>Results</h2>
          <p className="section-note">
            Live values update as inputs change. Geometry assumes a circular arc in a single
            plane.
          </p>

          <div className="results-card">
            <ResultRow
              label="Centerline arc length"
              hint="Developed bend = R × θ (radians)"
              valueIn={results.arcLengthIn}
              emphasize
            />
            <ResultRow
              label="Total developed length"
              hint="Arc + inlet + outlet tangents"
              valueIn={results.totalDevelopedIn}
              emphasize
            />
            <ResultRow
              label="Horizontal projection (L)"
              hint="R × sin(θ)"
              valueIn={results.horizontalProjectionIn}
            />
            <ResultRow
              label="Vertical projection (H)"
              hint="R × (1 − cos(θ))"
              valueIn={results.verticalProjectionIn}
            />
            <ResultRow
              label="Outer arc length"
              hint="(R + OD/2) × θ"
              valueIn={results.outerArcIn}
            />
            <ResultRow
              label="Inner arc length"
              hint="(R − OD/2) × θ"
              valueIn={results.innerArcIn}
            />
          </div>

          <div className="diagram-wrap">
            <BendDiagram
              results={results}
              angleDeg={Math.min(Math.max(angleDeg, 1), 270)}
              tangentIn={tangentInIn}
              tangentOut={tangentOutIn}
            />
          </div>

          <div className="disclaimer">
            For planning and reference only. Confirm dimensions with fabricators and applicable
            codes (ASME B16.9 / B31.x) before cutting or bending.
          </div>
        </section>
      </main>

      <footer className="footer">
        <span>Pipe data: ASME B36.10M · Sch 40 / Sch 80</span>
        <span>CLR presets relative to pipe OD</span>
      </footer>
    </div>
  );
}

export default App;
