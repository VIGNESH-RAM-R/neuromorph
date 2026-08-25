/**
 * Environment helpers shared across Neuromorph modules: local-storage
 * availability checks and basic, non-identifying device metadata (useful
 * for longitudinal comparisons, since input latency varies by device).
 */

export function isBrowserStorageAvailable() {
  try {
    const testKey = '__neuromorph_storage_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function getBrowserName(ua = '') {
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Chrome';
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
  return 'Unknown';
}

/** Coarse OS family from the user agent — reaction-time comparisons across
 * modules can be confounded by platform-level input latency, so this is
 * recorded (never used to change scoring). */
function getOperatingSystem(ua = '') {
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac OS X') && !ua.includes('like Mac OS X')) return 'macOS';
  if (ua.includes('Android')) return 'Android';
  if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
  if (ua.includes('Linux')) return 'Linux';
  return 'Unknown';
}

export function getDeviceInfo() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { screenWidth: null, screenHeight: null, deviceType: 'unknown', browser: 'unknown', os: 'unknown' };
  }
  const isTouch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  const isNarrow = window.innerWidth <= 900;
  let deviceType = 'desktop';
  if (isTouch && isNarrow) deviceType = 'mobile-or-tablet';
  else if (isTouch) deviceType = 'touch-device';

  return {
    screenWidth: window.screen?.width ?? null,
    screenHeight: window.screen?.height ?? null,
    deviceType,
    browser: getBrowserName(navigator.userAgent),
    os: getOperatingSystem(navigator.userAgent),
  };
}
