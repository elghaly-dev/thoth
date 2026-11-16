import { createIdleVoiceController, VOICE_IDLE_MS } from '../src/hooks/useIdleVoiceSession.ts';

function assert(cond: unknown, msg: string): void {
  if (!cond) {
    console.error(`idle-session: FAIL -- ${msg}`);
    process.exit(1);
  }
}

async function wait(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

assert(VOICE_IDLE_MS === 120_000, 'idle window must stay at 120 seconds');

const fired = { n: 0 };
const ctrl = createIdleVoiceController(() => {
  fired.n += 1;
}, 80);

assert(!ctrl.isArmed(), 'starts disarmed');
ctrl.ping();
await wait(120);
assert(fired.n === 0, 'ping while disarmed must not fire');

ctrl.arm();
assert(ctrl.isArmed(), 'arm turns the clock on');
await wait(40);
ctrl.ping();
await wait(40);
assert(fired.n === 0, 'ping must push the deadline out');
await wait(60);
assert(fired.n === 1, 'onIdle fires once after silence');
assert(!ctrl.isArmed(), 'controller disarms after onIdle');

fired.n = 0;
ctrl.arm();
ctrl.disarm();
await wait(120);
assert(fired.n === 0, 'disarm must cancel a pending idle close');

console.log('idle-session: PASS');
