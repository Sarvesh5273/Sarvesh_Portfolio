import type { ActId } from '@/content/types';

/**
 * Ambient sound, one bed per world, synthesised in the browser so the page
 * carries no audio files. Off by default; the AudioContext is only created
 * from the toggle's click handler, which is the gesture browsers require.
 *
 *   unwritten    wind through nothing: slow, filtered noise
 *   kingdom      a low stone drone with a dripping vault
 *   longAfter    glass partials, faintly detuned, shimmering
 *   presentRoom  room tone: a quiet, warm hush
 *   prologue/coda silence
 */

type Bed = { gain: GainNode; stop: () => void };

const BED_LEVEL: Record<ActId, number> = {
  prologue: 0,
  unwritten: 0.5,
  kingdom: 0.6,
  longAfter: 0.35,
  presentRoom: 0.22,
  coda: 0,
};

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let current: { act: ActId; bed: Bed } | null = null;
let enabled = false;
const listeners = new Set<() => void>();

function noiseBuffer(ac: AudioContext, seconds = 4, brown = false) {
  const buffer = ac.createBuffer(1, ac.sampleRate * seconds, ac.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    } else {
      data[i] = white;
    }
  }
  return buffer;
}

function noiseSource(ac: AudioContext, brown = false) {
  const src = ac.createBufferSource();
  src.buffer = noiseBuffer(ac, 4, brown);
  src.loop = true;
  return src;
}

function lfo(ac: AudioContext, hz: number, depth: number, target: AudioParam) {
  const osc = ac.createOscillator();
  osc.frequency.value = hz;
  const g = ac.createGain();
  g.gain.value = depth;
  osc.connect(g).connect(target);
  osc.start();
  return osc;
}

function makeBed(ac: AudioContext, act: ActId): Bed {
  const out = ac.createGain();
  out.gain.value = 0;
  const stops: (() => void)[] = [];

  if (act === 'unwritten') {
    const src = noiseSource(ac);
    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 420;
    filter.Q.value = 0.7;
    const l1 = lfo(ac, 0.05, 260, filter.frequency);
    const l2 = lfo(ac, 0.11, 0.12, out.gain);
    src.connect(filter).connect(out);
    src.start();
    stops.push(() => {
      src.stop();
      l1.stop();
      l2.stop();
    });
  } else if (act === 'kingdom') {
    const drone = ac.createOscillator();
    drone.type = 'sawtooth';
    drone.frequency.value = 55;
    const droneFilter = ac.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = 140;
    const droneGain = ac.createGain();
    droneGain.gain.value = 0.35;
    const l1 = lfo(ac, 0.07, 40, droneFilter.frequency);
    drone.connect(droneFilter).connect(droneGain).connect(out);
    drone.start();
    // the vault: noise rumble
    const rumble = noiseSource(ac, true);
    const rumbleFilter = ac.createBiquadFilter();
    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.value = 180;
    const rumbleGain = ac.createGain();
    rumbleGain.gain.value = 0.5;
    rumble.connect(rumbleFilter).connect(rumbleGain).connect(out);
    rumble.start();
    // drips
    let alive = true;
    const drip = () => {
      if (!alive) return;
      const t = ac.currentTime;
      const o = ac.createOscillator();
      o.frequency.setValueAtTime(1400 + Math.random() * 900, t);
      o.frequency.exponentialRampToValueAtTime(600, t + 0.12);
      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + 0.55);
      window.setTimeout(drip, 2500 + Math.random() * 6000);
    };
    window.setTimeout(drip, 1500);
    stops.push(() => {
      alive = false;
      drone.stop();
      rumble.stop();
      l1.stop();
    });
  } else if (act === 'longAfter') {
    const partials = [220, 329.6, 440, 554.4, 659.3];
    const oscs = partials.map((f, i) => {
      const o = ac.createOscillator();
      o.type = 'sine';
      o.frequency.value = f * (1 + (i % 2 ? 0.0015 : -0.001));
      const g = ac.createGain();
      g.gain.value = 0.05 / (i + 1);
      const l = lfo(ac, 0.03 + i * 0.017, 0.03 / (i + 1), g.gain);
      o.connect(g).connect(out);
      o.start();
      return () => {
        o.stop();
        l.stop();
      };
    });
    const air = noiseSource(ac);
    const airFilter = ac.createBiquadFilter();
    airFilter.type = 'highpass';
    airFilter.frequency.value = 5000;
    const airGain = ac.createGain();
    airGain.gain.value = 0.03;
    air.connect(airFilter).connect(airGain).connect(out);
    air.start();
    stops.push(() => {
      oscs.forEach((s) => s());
      air.stop();
    });
  } else if (act === 'presentRoom') {
    const src = noiseSource(ac, true);
    const filter = ac.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 320;
    const hum = ac.createOscillator();
    hum.frequency.value = 100;
    const humGain = ac.createGain();
    humGain.gain.value = 0.02;
    src.connect(filter).connect(out);
    hum.connect(humGain).connect(out);
    src.start();
    hum.start();
    stops.push(() => {
      src.stop();
      hum.stop();
    });
  }

  out.connect(master!);
  return { gain: out, stop: () => stops.forEach((s) => s()) };
}

function crossfadeTo(act: ActId) {
  if (!ctx || !master) return;
  if (current?.act === act) return;
  const t = ctx.currentTime;
  const FADE = 2.4;
  if (current) {
    const old = current;
    old.bed.gain.gain.cancelScheduledValues(t);
    old.bed.gain.gain.setValueAtTime(old.bed.gain.gain.value, t);
    old.bed.gain.gain.linearRampToValueAtTime(0, t + FADE);
    window.setTimeout(() => {
      old.bed.stop();
      old.bed.gain.disconnect();
    }, FADE * 1000 + 100);
    current = null;
  }
  if (BED_LEVEL[act] > 0) {
    const bed = makeBed(ctx, act);
    bed.gain.gain.setValueAtTime(0, t);
    bed.gain.gain.linearRampToValueAtTime(BED_LEVEL[act], t + FADE);
    current = { act, bed };
  }
}

let lastAct: ActId = 'prologue';

/** Called whenever the active act changes; only audible once enabled. */
export function setAmbientWorld(act: ActId) {
  lastAct = act;
  if (enabled) crossfadeTo(act);
}

export function isAmbientEnabled() {
  return enabled;
}

/** Must be called from a user gesture the first time. */
export async function setAmbientEnabled(on: boolean) {
  if (on === enabled) return;
  enabled = on;
  if (on) {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) {
        enabled = false;
        listeners.forEach((l) => l());
        return;
      }
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.6;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') await ctx.resume();
    crossfadeTo(lastAct);
  } else if (ctx) {
    const t = ctx.currentTime;
    if (current) {
      const old = current;
      old.bed.gain.gain.cancelScheduledValues(t);
      old.bed.gain.gain.setValueAtTime(old.bed.gain.gain.value, t);
      old.bed.gain.gain.linearRampToValueAtTime(0, t + 0.8);
      window.setTimeout(() => {
        old.bed.stop();
        old.bed.gain.disconnect();
      }, 900);
      current = null;
    }
  }
  listeners.forEach((l) => l());
}

export function subscribeAmbient(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
