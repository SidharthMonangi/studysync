export function remainingSeconds(deadline, now) { return Math.max(0, Math.ceil((deadline - now) / 1000)) }
export function durationFor(mode, settings) { return Math.max(1, Number(settings[mode]) || 25) * 60 }
