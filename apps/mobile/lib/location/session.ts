let skippedThisSession = false;

export function markLocationSkippedThisSession(): void {
  skippedThisSession = true;
}

export function wasLocationSkippedThisSession(): boolean {
  return skippedThisSession;
}

export function resetLocationSkipForDev(): void {
  skippedThisSession = false;
}
