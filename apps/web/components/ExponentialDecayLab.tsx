"use client";

import { useMemo, useRef, useState } from "react";

const WIDTH = 720;
const HEIGHT = 300;
const PAD = 38;

export function ExponentialDecayLab() {
  const [initial, setInitial] = useState(1);
  const [tau, setTau] = useState(0.8);
  const [duration, setDuration] = useState(4);
  const [muted, setMuted] = useState(false);
  const audioContext = useRef<AudioContext | null>(null);

  const points = useMemo(() => {
    return Array.from({ length: 121 }, (_, index) => {
      const time = (index / 120) * duration;
      const value = initial * Math.exp(-time / tau);
      const x = PAD + (time / duration) * (WIDTH - PAD * 2);
      const y = HEIGHT - PAD - (value / 2) * (HEIGHT - PAD * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
  }, [duration, initial, tau]);

  const tauX = PAD + (Math.min(tau, duration) / duration) * (WIDTH - PAD * 2);
  const tauValue = initial / Math.E;
  const tauY = HEIGHT - PAD - (tauValue / 2) * (HEIGHT - PAD * 2);

  function playEnvelope() {
    if (muted) return;
    const context = audioContext.current ?? new AudioContext();
    audioContext.current = context;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    oscillator.type = "sine";
    oscillator.frequency.value = 220;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(
      Math.max(0.02, initial * 0.12),
      now + 0.02,
    );
    gain.gain.setTargetAtTime(0.0001, now + 0.02, tau);
    gain.connect(context.destination);
    oscillator.connect(gain);
    oscillator.start(now);
    oscillator.stop(now + Math.min(duration, 5));
  }

  return (
    <div className="lab-card">
      <div className="lab-toolbar">
        <div className="lab-status">
          <span className="live-dot" />
          EXPONENCIÁLIS MODELL
        </div>
        <div className="audio-controls">
          <button type="button" onClick={playEnvelope} disabled={muted}>
            ▶ Hang lejátszása
          </button>
          <button
            type="button"
            onClick={() => setMuted((value) => !value)}
            aria-pressed={muted}
          >
            {muted ? "Hang bekapcsolása" : "Némítás"}
          </button>
        </div>
      </div>
      <svg
        className="decay-chart"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Exponenciális lecsengés ${initial} kezdeti értékkel és ${tau} másodperces időállandóval`}
      >
        {[0, 1, 2, 3, 4].map((line) => {
          const x = PAD + (line / 4) * (WIDTH - PAD * 2);
          const y = PAD + (line / 4) * (HEIGHT - PAD * 2);
          return (
            <g key={line}>
              <line x1={x} y1={PAD} x2={x} y2={HEIGHT - PAD} />
              <line x1={PAD} y1={y} x2={WIDTH - PAD} y2={y} />
            </g>
          );
        })}
        <line
          className="tau-marker"
          x1={tauX}
          y1={tauY}
          x2={tauX}
          y2={HEIGHT - PAD}
        />
        <polyline points={points} />
        <circle className="tau-point" cx={tauX} cy={tauY} r="7" />
        <text x={Math.min(tauX + 10, WIDTH - 150)} y={tauY - 10}>
          τ = {tau.toFixed(1)} s · {tauValue.toFixed(3)}
        </text>
        <text className="axis-label" x={WIDTH - 58} y={HEIGHT - 12}>
          idő (s)
        </text>
        <text className="axis-label" x={10} y={20}>
          A(t)
        </text>
      </svg>
      <div className="lab-controls">
        <label>
          <span>
            Kezdeti amplitúdó <output>{initial.toFixed(1)}</output>
          </span>
          <input
            type="range"
            min="0.2"
            max="2"
            step="0.1"
            value={initial}
            onChange={(event) => setInitial(Number(event.target.value))}
          />
        </label>
        <label>
          <span>
            Időállandó τ <output>{tau.toFixed(1)} s</output>
          </span>
          <input
            type="range"
            min="0.1"
            max="2.5"
            step="0.1"
            value={tau}
            onChange={(event) => setTau(Number(event.target.value))}
          />
        </label>
        <label>
          <span>
            Időtartam <output>{duration.toFixed(0)} s</output>
          </span>
          <input
            type="range"
            min="2"
            max="8"
            step="1"
            value={duration}
            onChange={(event) => setDuration(Number(event.target.value))}
          />
        </label>
      </div>
      <p className="lab-caption">
        Egy időállandó után mindig a kezdeti érték 36,8%-a marad — függetlenül
        A₀ nagyságától.
      </p>
    </div>
  );
}
