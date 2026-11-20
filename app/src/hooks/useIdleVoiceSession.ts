// Idle voice-session auto-close. After VOICE_IDLE_MS with no speech,
// typed send, listen, or spoken reply, the session is closed: the mic
// and playback stop, chat history is kept, and onIdle is called.

export const VOICE_IDLE_MS = 120_000;

export interface IdleVoiceController {
  /** Start (or restart) the idle clock. Call when a voice session begins. */
  arm: () => void;
  /** Push the deadline out. Call on speech, listen, speak, or send. */
  ping: () => void;
  /** Stop the clock without firing onIdle. Call on unmount or manual end. */
  disarm: () => void;
  isArmed: () => boolean;
}

export function createIdleVoiceController(
  onIdle: () => void,
  idleMs: number = VOICE_IDLE_MS,
): IdleVoiceController {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let armed = false;

  const clear = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const ping = () => {
    if (!armed) return;
    clear();
    timer = setTimeout(() => {
      armed = false;
      timer = null;
      onIdle();
    }, idleMs);
  };

  return {
    arm: () => {
      armed = true;
      ping();
    },
    ping,
    disarm: () => {
      armed = false;
      clear();
    },
    isArmed: () => armed,
  };
}
