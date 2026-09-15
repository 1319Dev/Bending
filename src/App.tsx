import { useMemo, useState } from 'react';
import {
  PIPE_SIZES,
  EXTRA_PIPE_SIZES,
  ALL_PIPE_SIZES,
  COMMON_WALL_THICKNESSES,
  CLR_PRESETS,
  ANGLE_PRESETS,
  DEFAULT_NPS,
  DEFAULT_WT,
  DEFAULT_ANGLE,
  DEFAULT_CLR,
  type ClrPresetId,
} from './data/pipeData';
import { calculateBend } from './utils/calculations';
import {
  type UnitSystem,
  fromInches,
  toInches,
  formatLength,
  formatDecimalFeet,
  formatInches,
  formatWt,
} from './utils/units';
import { BendDiagram } from './components/BendDiagram';
import './App.css';

function App() {
  const [units, setUnits] = useState<UnitSystem>('ft-in');
  const [nps, setNps] = useState(DEFAULT_NPS);
  const [showMoreSizes, setShowMoreSizes] = useState(false);

  const [wtMode, setWtMode] = useState<'chip' | 'custom'>('chip');
  const [wtChip, setWtChip] = useState(DEFAULT_WT);
  const [customWtDisplay, setCustomWtDisplay] = useState('');

  const [angleDeg, setAngleDeg] = useState(DEFAULT_ANGLE);
  const [clrPreset, setClrPreset] = useState<ClrPresetId>(DEFAULT_CLR);
  const [customClrDisplay, setCustomClrDisplay] = useState('');

  // Optional: incoming joint length (collapsed by default)
  const [showJoint, setShowJoint] = useState(false);
  const [jointLengthDisplay, setJointLengthDisplay] = useState('');

  const pipe = useMemo(
    () => ALL_PIPE_SIZES.find((p) => p.nps === nps) ?? PIPE_SIZES.find((p) => p.nps === '24')!,
    [nps],
  );
  const odIn = pipe.odIn;

  const wallIn = useMemo(() => {
    if (wtMode === 'chip') return wtChip;
    const parsed = parseFloat(customWtDisplay);
    if (!Number.isFinite(parsed) || parsed <= 0) return wtChip;
    if (units === 'mm') return toInches(parsed, 'mm');
    return parsed;
  }, [wtMode, wtChip, customWtDisplay, units]);

  const preset = CLR_PRESETS.find((p) => p.id === clrPreset)!;
  const clrIn = useMemo(() => {
    if (preset.multiplier != null) return preset.multiplier * odIn;
    const parsed = parseFloat(customClrDisplay);
    return Number.isFinite(parsed) && parsed > 0
      ? toInches(parsed, units === 'ft-in' ? 'ft-in' : units)
      : odIn * 18;
  }, [preset, odIn, customClrDisplay, units]);

  const jointLengthIn = useMemo(() => {
    const v = parseFloat(jointLengthDisplay);
    return Number.isFinite(v) && v > 0 ? toInches(v, units === 'ft-in' ? 'ft-in' : units) : 0;
  }, [jointLengthDisplay, units]);

  const safeAngle = Number.isFinite(angleDeg) ? Math.max(0.001, Math.min(360, angleDeg)) : DEFAULT_ANGLE;

  const results = useMemo(
    () =>
      calculateBend({
        clrIn,
        angleDeg: safeAngle,
        odIn,
        wallIn,
        tangentInIn: 0,
        tangentOutIn: 0,
      }),
    [clrIn, safeAngle, odIn, wallIn],
  );

  const T = results.tangentDistanceIn;
  const tighterThan18D = results.clrMultiple > 0 && results.clrMultiple < 18 - 1e-9;

  const startFromWeld = jointLengthIn > 0 ? jointLengthIn - T : null;
  const bendStartsOnPrevious = startFromWeld != null && startFromWeld < 0;

  function switchUnits(next: UnitSystem) {
    if (next === units) return;
    const convertField = (val: string, asLength: boolean) => {
      const n = parseFloat(val);
      if (!Number.isFinite(n)) return val;
      if (!asLength) {
        const inches = units === 'mm' ? toInches(n, 'mm') : n;
        if (next === 'mm') return fromInches(inches, 'mm').toFixed(1);
        return inches.toFixed(3);
      }
      const inches = toInches(n, units === 'ft-in' ? 'ft-in' : units);
      if (next === 'mm') return fromInches(inches, 'mm').toFixed(1);
      if (next === 'ft-in') return fromInches(inches, 'ft-in').toFixed(3);
      return inches.toFixed(3);
    };
    setCustomClrDisplay((v) => (v === '' ? v : convertField(v, true)));
    setJointLengthDisplay((v) => (v === '' ? v : convertField(v, true)));
    setCustomWtDisplay((v) => (v === '' ? v : convertField(v, false)));
    setUnits(next);
  }

  function bumpAngle(delta: number) {
    setAngleDeg((a) => {
      const next = Math.round((a + delta) * 1000) / 1000;
      return Math.max(0.1, Math.min(360, next));
    });
  }

  function selectWtChip(wt: number) {
    setWtMode('chip');
    setWtChip(wt);
  }

  function enableCustomWt() {
    setWtMode('custom');
    if (customWtDisplay === '') {
      setCustomWtDisplay(
        units === 'mm' ? fromInches(wtChip, 'mm').toFixed(1) : wtChip.toFixed(3),
      );
    }
  }

  const wtUnitHint = units === 'mm' ? 'mm' : 'in';

  function displayLen(valueIn: number): string {
    return formatLength(valueIn, units);
  }

  function secondaryLen(valueIn: number): string {
    if (units === 'ft-in') return `${formatDecimalFeet(valueIn)} · ${formatInches(valueIn)}`;
    if (units === 'in') return formatDecimalFeet(valueIn);
    return formatInches(valueIn);
  }

  const sizeList = showMoreSizes ? [...PIPE_SIZES, ...EXTRA_PIPE_SIZES] : PIPE_SIZES;

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-title">
          <h1>Field Bend</h1>
          <p>Layout from the PI · cold bends</p>
        </div>
        <div className="unit-toggle" role="group" aria-label="Units">
          <button type="button" className={units === 'ft-in' ? 'active' : ''} onClick={() => switchUnits('ft-in')}>
            ft-in
          </button>
          <button type="button" className={units === 'in' ? 'active' : ''} onClick={() => switchUnits('in')}>
            in
          </button>
          <button type="button" className={units === 'mm' ? 'active' : ''} onClick={() => switchUnits('mm')}>
            mm
          </button>
        </div>
      </header>

      {/* HERO: Start of bend — T from PI */}
      <section className="hero" aria-live="polite">
        <div className="hero-label">Start of bend — measure this back from the PI on the incoming pipe</div>
        <div className="hero-value">{displayLen(T)}</div>
        <div className="hero-sub">
          T = R · tan(Δ/2) · {secondaryLen(T)}
        </div>
        {tighterThan18D && (
          <div className="warn-banner" role="alert">
            CLR tighter than 18D — check the bending spec / B31.4 / B31.8 before bending.
          </div>
        )}
      </section>

      <main className="stack">
        {/* PIPE SIZE */}
        <section className="block">
          <h2>Pipe size (NPS)</h2>
          <div className="chip-grid size-grid">
            {sizeList.map((p) => (
              <button
                key={p.nps}
                type="button"
                className={`chip ${nps === p.nps ? 'active' : ''}`}
                onClick={() => setNps(p.nps)}
              >
                {p.nps}"
              </button>
            ))}
          </div>
          <button
            type="button"
            className="linkish"
            onClick={() => setShowMoreSizes((s) => !s)}
          >
            {showMoreSizes ? 'Fewer sizes' : 'More sizes'}
          </button>
        </section>

        {/* WALL THICKNESS */}
        <section className="block">
          <h2>Wall thickness (WT)</h2>
          <p className="block-note">Specified WT on the joint — not Schedule 40/80.</p>
          <div className="chip-grid wt-grid">
            {COMMON_WALL_THICKNESSES.map((wt) => (
              <button
                key={wt}
                type="button"
                className={`chip ${wtMode === 'chip' && wtChip === wt ? 'active' : ''}`}
                onClick={() => selectWtChip(wt)}
              >
                {formatWt(wt)}
              </button>
            ))}
            <button
              type="button"
              className={`chip ${wtMode === 'custom' ? 'active' : ''}`}
              onClick={enableCustomWt}
            >
              Custom
            </button>
          </div>
          {wtMode === 'custom' && (
            <label className="field">
              <span className="field-label">Custom WT ({wtUnitHint})</span>
              <input
                type="number"
                inputMode="decimal"
                min={0.01}
                step={units === 'mm' ? 0.1 : 0.001}
                value={customWtDisplay}
                onChange={(e) => setCustomWtDisplay(e.target.value)}
                placeholder={units === 'mm' ? 'e.g. 12.7' : 'e.g. 0.469'}
              />
            </label>
          )}
          <div className="dims-row">
            <div>
              <span className="dim-k">OD</span>
              <span className="dim-v">{displayLen(odIn)}</span>
            </div>
            <div>
              <span className="dim-k">WT</span>
              <span className="dim-v">{formatLength(wallIn, units === 'mm' ? 'mm' : 'in')}</span>
            </div>
            <div>
              <span className="dim-k">ID</span>
              <span className="dim-v">{displayLen(results.idIn)}</span>
            </div>
          </div>
        </section>

        {/* CLR */}
        <section className="block">
          <h2>Centerline radius (CLR)</h2>
          <p className="block-note">18D is a common B31.4 / B31.8 cold-field-bend minimum — not a substitute for the job spec.</p>
          <div className="chip-grid clr-grid">
            {CLR_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`chip ${clrPreset === p.id ? 'active' : ''}`}
                onClick={() => {
                  setClrPreset(p.id);
                  if (p.multiplier != null) {
                    const inches = p.multiplier * odIn;
                    if (units === 'mm') setCustomClrDisplay(fromInches(inches, 'mm').toFixed(1));
                    else if (units === 'ft-in') setCustomClrDisplay(fromInches(inches, 'ft-in').toFixed(3));
                    else setCustomClrDisplay(inches.toFixed(3));
                  }
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
          {clrPreset === 'custom' && (
            <label className="field">
              <span className="field-label">
                Custom CLR ({units === 'ft-in' ? 'ft' : units === 'mm' ? 'mm' : 'in'})
              </span>
              <input
                type="number"
                inputMode="decimal"
                min={0.01}
                step={units === 'mm' ? 1 : 0.1}
                value={customClrDisplay}
                onChange={(e) => setCustomClrDisplay(e.target.value)}
                placeholder={
                  units === 'mm'
                    ? fromInches(odIn * 18, 'mm').toFixed(0)
                    : units === 'ft-in'
                      ? fromInches(odIn * 18, 'ft-in').toFixed(2)
                      : (odIn * 18).toFixed(1)
                }
              />
            </label>
          )}
          <div className="clr-readout">
            <span>
              CLR <strong>{displayLen(clrIn)}</strong>
            </span>
            <span className="clr-xd">{results.clrMultiple.toFixed(1)}D</span>
          </div>
        </section>

        {/* ANGLE */}
        <section className="block">
          <h2>Deflection angle (Δ)</h2>
          <div className="angle-stepper">
            <button type="button" className="step-btn" onClick={() => bumpAngle(-1)} aria-label="Minus 1 degree">
              −1
            </button>
            <button type="button" className="step-btn" onClick={() => bumpAngle(-0.5)} aria-label="Minus 0.5 degree">
              −0.5
            </button>
            <div className="angle-input-wrap">
              <input
                type="number"
                inputMode="decimal"
                min={0.1}
                max={360}
                step={0.1}
                value={angleDeg}
                onChange={(e) => setAngleDeg(parseFloat(e.target.value) || 0)}
                aria-label="Deflection angle degrees"
              />
              <span>°</span>
            </div>
            <button type="button" className="step-btn" onClick={() => bumpAngle(0.5)} aria-label="Plus 0.5 degree">
              +0.5
            </button>
            <button type="button" className="step-btn" onClick={() => bumpAngle(1)} aria-label="Plus 1 degree">
              +1
            </button>
          </div>
          <div className="chip-grid angle-grid">
            {ANGLE_PRESETS.map((a) => (
              <button
                key={a}
                type="button"
                className={`chip ${angleDeg === a ? 'active' : ''}`}
                onClick={() => setAngleDeg(a)}
              >
                {a}°
              </button>
            ))}
          </div>
        </section>

        {/* LAYOUT RESULTS — between two sections from the PI */}
        <section className="block results-block">
          <h2>Layout from the PI</h2>
          <p className="block-note">
            Incoming and outgoing straights meet at the PI if extended. Measure T back from the PI along each pipe to mark BC and EC.
          </p>
          <div className="result-list">
            <div className="result-item result-hero-row">
              <div className="ri-label">
                <span>Start of bend (BC)</span>
                <span className="ri-hint">Measure T back from the PI on the incoming pipe</span>
              </div>
              <div className="ri-val">
                <strong>{displayLen(T)}</strong>
                <span className="ri-sec">{secondaryLen(T)}</span>
              </div>
            </div>
            <div className="result-item result-hero-row">
              <div className="ri-label">
                <span>End of bend (EC)</span>
                <span className="ri-hint">Same distance from the PI on the outgoing pipe</span>
              </div>
              <div className="ri-val">
                <strong>{displayLen(T)}</strong>
                <span className="ri-sec">{secondaryLen(T)}</span>
              </div>
            </div>
            <div className="result-item">
              <div className="ri-label">
                <span>Pull / developed arc</span>
                <span className="ri-hint">L = R · Δ_rad</span>
              </div>
              <div className="ri-val">
                <strong>{displayLen(results.arcLengthIn)}</strong>
                <span className="ri-sec">{secondaryLen(results.arcLengthIn)}</span>
              </div>
            </div>
            <div className="result-item">
              <div className="ri-label">
                <span>Chord</span>
                <span className="ri-hint">C = 2 R · sin(Δ/2)</span>
              </div>
              <div className="ri-val">
                <strong>{displayLen(results.chordLengthIn)}</strong>
                <span className="ri-sec">{secondaryLen(results.chordLengthIn)}</span>
              </div>
            </div>
            <div className="result-item">
              <div className="ri-label">
                <span>External (PI to curve)</span>
                <span className="ri-hint">E = R · (1/cos(Δ/2) − 1)</span>
              </div>
              <div className="ri-val">
                <strong>{displayLen(results.externalIn)}</strong>
                <span className="ri-sec">{secondaryLen(results.externalIn)}</span>
              </div>
            </div>
            <div className="result-item">
              <div className="ri-label">
                <span>CLR</span>
                <span className="ri-hint">{results.clrMultiple.toFixed(1)} × OD</span>
              </div>
              <div className="ri-val">
                <strong>{displayLen(clrIn)}</strong>
                <span className="ri-sec">{secondaryLen(clrIn)}</span>
              </div>
            </div>
            <div className="result-item">
              <div className="ri-label">
                <span>Ahead (tangent projection)</span>
                <span className="ri-hint">R · sin Δ</span>
              </div>
              <div className="ri-val">
                <strong>{displayLen(results.horizontalProjectionIn)}</strong>
                <span className="ri-sec">{secondaryLen(results.horizontalProjectionIn)}</span>
              </div>
            </div>
            <div className="result-item">
              <div className="ri-label">
                <span>Offset (rise)</span>
                <span className="ri-hint">R · (1 − cos Δ)</span>
              </div>
              <div className="ri-val">
                <strong>{displayLen(results.verticalProjectionIn)}</strong>
                <span className="ri-sec">{secondaryLen(results.verticalProjectionIn)}</span>
              </div>
            </div>
          </div>

          <div className="diagram-wrap">
            <BendDiagram angleDeg={Math.min(Math.max(safeAngle, 1), 180)} />
          </div>
        </section>

        {/* Optional: incoming joint length */}
        <section className="block secondary">
          <button
            type="button"
            className="collapse-toggle"
            onClick={() => setShowJoint((s) => !s)}
            aria-expanded={showJoint}
          >
            <span>Incoming joint length (optional)</span>
            <span className="chev">{showJoint ? '▾' : '▸'}</span>
          </button>
          {showJoint && (
            <div className="tangent-fields">
              <p className="block-note">
                If you know the joint length to the PI (or to the near weld), see where the bend starts on that joint.
              </p>
              <label className="field">
                <span className="field-label">
                  Joint length to PI ({units === 'ft-in' ? 'ft' : units === 'mm' ? 'mm' : 'in'})
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={units === 'mm' ? 1 : 0.1}
                  value={jointLengthDisplay}
                  onChange={(e) => setJointLengthDisplay(e.target.value)}
                  placeholder={units === 'ft-in' ? 'e.g. 40' : units === 'mm' ? 'e.g. 12000' : 'e.g. 480'}
                />
              </label>
              {startFromWeld != null && (
                <div className="result-list" style={{ marginTop: '0.75rem' }}>
                  <div className="result-item">
                    <div className="ri-label">
                      <span>Start of bend from near end / weld</span>
                      <span className="ri-hint">joint length − T</span>
                    </div>
                    <div className="ri-val">
                      <strong>{displayLen(Math.abs(startFromWeld))}</strong>
                      <span className="ri-sec">
                        {bendStartsOnPrevious
                          ? 'beyond near end'
                          : secondaryLen(startFromWeld)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {bendStartsOnPrevious && (
                <div className="warn-banner" role="alert" style={{ marginTop: '0.65rem' }}>
                  T is longer than the joint — the bend starts on the previous joint
                  ({displayLen(Math.abs(startFromWeld!))} past the near weld).
                </div>
              )}
            </div>
          )}
        </section>

        <p className="disclaimer">
          Planning / reference only. Check the bending spec, machine charts, and applicable
          code (B31.4 / B31.8). Confirm CLR and ovality limits before cold bending.
        </p>
      </main>
    </div>
  );
}

export default App;
