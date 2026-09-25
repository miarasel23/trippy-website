'use client';

// Immediately silence non-error console noise in the browser as requested
if (typeof window !== 'undefined') {
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
  console.warn = () => {};
  // Real errors (console.error) remain fully enabled and will be clearly visible
}

export function ConsoleFilter() {
  return null;
}
