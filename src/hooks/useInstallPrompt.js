import { useCallback, useEffect, useState } from 'react';

const DISMISSED_KEY = 'nmpa-install-prompt-dismissed';

function readDismissed() {
  try {
    return window.localStorage.getItem(DISMISSED_KEY) === '1';
  } catch {
    return false;
  }
}

// Wraps the browser's `beforeinstallprompt` event (Chrome/Edge/Android) in
// a small, component-friendly hook. Two things this deliberately does NOT
// do: it doesn't fabricate an "install available" state on browsers that
// never fire the event (iOS Safari never does -- there's no programmatic
// install prompt there, only the manual Share -> Add to Home Screen flow),
// and it doesn't nag someone who already dismissed it once this session
// (persisted in localStorage, same low-friction pattern as this app's
// theme/language preference storage).
export function useInstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(readDismissed);

  useEffect(() => {
    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredEvent(event);
    };
    const onInstalled = () => {
      setIsInstalled(true);
      setDeferredEvent(null);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);

    // Already running as an installed app (standalone display mode) --
    // never show the prompt in that case either.
    try {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    } catch {
      // matchMedia unsupported -- fall back to just not knowing, which is
      // the same as "not installed" for prompting purposes.
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredEvent) return false;
    deferredEvent.prompt();
    const { outcome } = await deferredEvent.userChoice;
    setDeferredEvent(null);
    return outcome === 'accepted';
  }, [deferredEvent]);

  const dismiss = useCallback(() => {
    setIsDismissed(true);
    try {
      window.localStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      // Non-fatal -- worst case the prompt reappears next session.
    }
  }, []);

  const canPrompt = Boolean(deferredEvent) && !isInstalled && !isDismissed;

  return { canPrompt, isInstalled, promptInstall, dismiss };
}
